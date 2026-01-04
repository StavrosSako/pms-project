import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import TaskCard from './TaskCard';
import { Plus, Loader2 } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { useModal } from '../hooks/useModal';
import CreateTaskModal from './CreateTaskModal';
import EditTaskModal from './EditTaskModal';
import { subscribeSse } from '../api/sseClient';
import { useProjects } from '../hooks/useProjects';
import { useAuth } from '../hooks/useAuth';
import { useTeam } from '../hooks/useTeam';
import { useMyTeams } from '../hooks/useMyTeams';

export default function KanbanBoard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const { projects } = useProjects();
  const { members } = useTeam();
  const { teams: myTeams } = useMyTeams();
  const [selectedProjectId, setSelectedProjectId] = useState('all');

  const taskFilters = selectedProjectId === 'all' ? {} : { teamId: selectedProjectId };

  const { tasks, loading, error, createTask, updateTask, updateTaskStatus, deleteTask, refetch } = useTasks(taskFilters);
  const { openModal } = useModal();

  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const getTaskId = (task) => task?.id || task?._id;

  const getProjectId = (project) => project?.id || project?._id;
  const myProjectIds = useMemo(() => {
    const set = new Set();
    for (const t of myTeams || []) {
      const pid = `${t?.projectId || ''}`;
      if (pid) set.add(pid);
    }
    return set;
  }, [myTeams]);

  const visibleProjects = isAdmin ? (projects || []) : (projects || []).filter(p => myProjectIds.has(`${getProjectId(p)}`));
  const allowedProjectIds = new Set(visibleProjects.map(p => `${getProjectId(p)}`));

  const canCreateForProject = useMemo(() => {
    const pid = `${selectedProjectId || ''}`;
    if (!pid || pid === 'all') return false;
    if (isAdmin) return true;
    const uid = `${user?.id || ''}`;
    const team = (myTeams || []).find(t => `${t?.projectId || ''}` === pid);
    if (!team) return false;
    return (team?.members || []).some(m => `${m?.userId}` === uid && m?.role === 'TEAM_LEADER');
  }, [isAdmin, myTeams, selectedProjectId, user]);

  const usersById = useMemo(() => {
    const map = new Map();
    for (const u of members || []) {
      const id = `${u?.id || u?._id || ''}`;
      if (id) map.set(id, u);
    }
    return map;
  }, [members]);

  const displayTasks = isAdmin
    ? (tasks || [])
    : (tasks || []).filter(t => allowedProjectIds.has(`${t?.teamId}`));

  const getTasksByStatus = (list) => {
    const grouped = {
      TODO: [],
      IN_PROGRESS: [],
      DONE: []
    };

    (list || []).forEach(task => {
      const status = task.status?.toUpperCase?.() || 'TODO';
      if (grouped[status]) grouped[status].push(task);
      else grouped.TODO.push(task);
    });

    return grouped;
  };

  const tasksByStatus = getTasksByStatus(displayTasks);

  const columns = [
    {
      id: 'TODO',
      title: 'To Do',
      tasks: tasksByStatus['TODO'] || []
    },
    {
      id: 'IN_PROGRESS',
      title: 'In Progress',
      tasks: tasksByStatus['IN_PROGRESS'] || []
    },
    {
      id: 'DONE',
      title: 'Done',
      tasks: tasksByStatus['DONE'] || []
    }
  ];

  const handleAddTask = (status) => {
    if (!canCreateForProject) {
      if (`${selectedProjectId}` === 'all') {
        window.alert('Select a project first to create tasks.');
      } else {
        window.alert('Only the team leader of the assigned team can create tasks for this project.');
      }
      return;
    }
    openModal('createTask', {
      title: 'Create New Task',
      initialStatus: status,
      initialTeamId: selectedProjectId === 'all' ? '' : selectedProjectId
    });
  };

  const handleTaskDrop = async (taskId, newStatus) => {
    if (!taskId || !newStatus) return;
    await updateTaskStatus(taskId, newStatus);
  };

  const handleEditTask = (task) => {
    openModal('editTask', { title: 'Edit Task', task });
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    let scheduled = null;
    const scheduleRefetch = () => {
      if (scheduled) return;
      scheduled = setTimeout(async () => {
        scheduled = null;
        await refetch();
      }, 200);
    };

    const unsubscribe = subscribeSse({
      url: 'http://localhost:8083/api/notifications/stream',
      token,
      onEvent: (evt) => {
        if (
          evt.event === 'task_created' ||
          evt.event === 'task_updated' ||
          evt.event === 'task_status_changed' ||
          evt.event === 'task_deleted'
        ) {
          scheduleRefetch();
        }
      },
      onError: () => {
        // Keep silent
      }
    });

    return () => {
      if (scheduled) clearTimeout(scheduled);
      unsubscribe?.();
    };
  }, [refetch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-center">
        Error loading tasks: {error}
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          Project
        </div>
        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="px-3 py-2 text-sm bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-gray-700 dark:text-gray-300"
        >
          <option value="all">{isAdmin ? 'All projects' : 'All my projects'}</option>
          {visibleProjects.map(p => {
            const id = getProjectId(p);
            return (
              <option key={id} value={id}>
                {p.name || p.title}
              </option>
            );
          })}
        </select>
      </div>

      <div className="flex h-full gap-6 overflow-x-auto pb-4">
        {columns.map((col) => (
        <div
          key={col.id}
          className={`min-w-[300px] flex flex-col h-full rounded-2xl transition-colors ${
            dragOverColumn === col.id ? 'bg-primary/5' : 'bg-transparent'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverColumn(col.id);
          }}
          onDragLeave={() => {
            setDragOverColumn((prev) => (prev === col.id ? null : prev));
          }}
          onDrop={async (e) => {
            e.preventDefault();
            const droppedId = e.dataTransfer.getData('text/taskId') || draggedTaskId;
            setDragOverColumn(null);
            setDraggedTaskId(null);
            await handleTaskDrop(droppedId, col.id);
          }}
        >
          
          {/* Column Header */}
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-700 dark:text-gray-200">{col.title}</h3>
              <span className="bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400 text-xs px-2 py-0.5 rounded-full">
                {col.tasks.length}
              </span>
            </div>
            <div className="flex gap-1">
              <button 
                onClick={() => handleAddTask(col.id)}
                disabled={!canCreateForProject}
                className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded text-gray-500"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Cards Container */}
          <motion.div layout className="flex-1">
            {col.tasks.map(task => (
              <motion.div key={getTaskId(task)} layout>
                <TaskCard
                  task={task}
                  onEdit={handleEditTask}
                  usersById={usersById}
                  onDragStart={(e, id) => {
                    setDraggedTaskId(id);
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/taskId', id);
                  }}
                />
              </motion.div>
            ))}
            
            {/* "Add Task" Ghost Button */}
            <button 
              onClick={() => handleAddTask(col.id)}
              disabled={!canCreateForProject}
              className={`w-full py-2 flex items-center justify-center gap-2 rounded-xl border border-transparent border-dashed transition-all text-sm ${
                canCreateForProject
                  ? 'text-gray-400 hover:text-primary hover:bg-primary/5 hover:border-primary/20'
                  : 'text-gray-500/50 cursor-not-allowed'
              }`}
            >
              <Plus size={16} />
              <span>Add Task</span>
            </button>
          </motion.div>

        </div>
      ))}
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal createTask={createTask} />

      {/* Edit Task Modal */}
      <EditTaskModal updateTask={updateTask} deleteTask={deleteTask} />
    </>
  );
}