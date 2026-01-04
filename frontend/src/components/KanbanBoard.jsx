import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import TaskCard from './TaskCard';
import { Plus, Loader2 } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { useModal } from '../hooks/useModal';
import CreateTaskModal from './CreateTaskModal';
import EditTaskModal from './EditTaskModal';
import { subscribeSse } from '../api/sseClient';
import { useAuth } from '../hooks/useAuth';
import { useTeam } from '../hooks/useTeam';
import { useMyTeams } from '../hooks/useMyTeams';
import { teamService } from '../api/teamService';

export default function KanbanBoard({ projectId }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const { members } = useTeam();
  const { teams: myTeams } = useMyTeams();

  const [adminProjectTeams, setAdminProjectTeams] = useState([]);

  const normalize = (v) => (v === undefined || v === null ? '' : `${v}`);

  const hasAssignedTeam = useMemo(() => {
    const pid = normalize(projectId);
    if (!pid) return false;

    if (isAdmin) {
      return (adminProjectTeams || []).some(t => normalize(t?.projectId) === pid);
    }

    return (myTeams || []).some(t => normalize(t?.projectId) === pid);
  }, [adminProjectTeams, isAdmin, myTeams, projectId]);

  const taskFilters = projectId
    ? { teamId: hasAssignedTeam ? projectId : '__no_assigned_team__' }
    : { teamId: '__no_project_selected__' };

  const { tasks, loading, error, createTask, updateTask, updateTaskStatus, deleteTask, refetch } = useTasks(
    taskFilters,
    { enabled: !!projectId }
  );
  const { openModal } = useModal();

  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const getTaskId = (task) => task?.id || task?._id;

  const canCreateForProject = useMemo(() => {
    const pid = `${projectId || ''}`;
    if (!pid) return false;
    if (!hasAssignedTeam) return false;
    if (isAdmin) return true;
    const uid = `${user?.id || user?._id || ''}`;
    const team = (myTeams || []).find(t => `${t?.projectId || ''}` === pid);
    if (!team) return false;
    return (team?.members || []).some(m => `${m?.userId}` === uid && m?.role === 'TEAM_LEADER');
  }, [hasAssignedTeam, isAdmin, myTeams, projectId, user]);

  const usersById = useMemo(() => {
    const map = new Map();
    for (const u of members || []) {
      const id = `${u?.id || u?._id || ''}`;
      if (id) map.set(id, u);
    }
    return map;
  }, [members]);

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

  const tasksByStatus = getTasksByStatus(tasks || []);

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
      if (!projectId) {
        window.alert('Select a project first to create tasks.');
      } else if (!hasAssignedTeam) {
        window.alert('This project has no team assigned. Assign a team to this project before creating tasks.');
      } else {
        window.alert('Only the team leader of the assigned team can create tasks for this project.');
      }
      return;
    }
    openModal('createTask', {
      title: 'Create New Task',
      initialStatus: status,
      initialTeamId: projectId
    });
  };

  const handleTaskDrop = async (taskId, newStatus) => {
    if (!canCreateForProject) return;
    if (!taskId || !newStatus) return;
    await updateTaskStatus(taskId, newStatus);
  };

  const handleEditTask = (task) => {
    if (!canCreateForProject) return;
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

  useEffect(() => {
    if (!isAdmin) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    let mounted = true;
    const getId = (t) => `${t?.id || t?._id || ''}`;

    const fetchTeams = async () => {
      try {
        const data = await teamService.getAllProjectTeams();
        if (!mounted) return;
        setAdminProjectTeams(Array.isArray(data) ? data : []);
      } catch (_) {
        if (!mounted) return;
        setAdminProjectTeams([]);
      }
    };

    fetchTeams();

    const unsubscribe = subscribeSse({
      url: 'http://localhost:8082/api/notifications/stream',
      token,
      onEvent: (evt) => {
        if (evt.event === 'project_team_created' || evt.event === 'project_team_updated') {
          const team = evt.data?.team;
          const id = getId(team);
          if (!id) return;
          setAdminProjectTeams(prev => {
            const list = prev || [];
            const idx = list.findIndex(x => getId(x) === id);
            if (idx === -1) return [...list, team];
            const next = [...list];
            next[idx] = team;
            return next;
          });
          return;
        }
        if (evt.event === 'project_team_deleted') {
          const id = `${evt.data?.teamId || ''}`;
          if (!id) return;
          setAdminProjectTeams(prev => (prev || []).filter(t => getId(t) !== id));
        }
      },
      onError: () => {
        // Keep silent
      }
    });

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, [isAdmin]);

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
                  canEdit={canCreateForProject}
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