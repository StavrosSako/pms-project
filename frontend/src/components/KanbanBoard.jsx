import React, { useState } from 'react';
import { motion } from 'framer-motion';
import TaskCard from './TaskCard';
import { Plus, Loader2 } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { useModal } from '../hooks/useModal';
import CreateTaskModal from './CreateTaskModal';
import EditTaskModal from './EditTaskModal';

export default function KanbanBoard() {
  const { tasks, loading, error, getTasksByStatus, createTask, updateTask, updateTaskStatus } = useTasks();
  const tasksByStatus = getTasksByStatus();
  const { openModal } = useModal();

  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const getTaskId = (task) => task?.id || task?._id;

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
    openModal('createTask', { title: 'Create New Task', initialStatus: status });
  };

  const handleTaskDrop = async (taskId, newStatus) => {
    if (!taskId || !newStatus) return;
    await updateTaskStatus(taskId, newStatus);
  };

  const handleEditTask = (task) => {
    openModal('editTask', { title: 'Edit Task', task });
  };

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
              className="w-full py-2 flex items-center justify-center gap-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl border border-transparent hover:border-primary/20 border-dashed transition-all text-sm"
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
      <EditTaskModal updateTask={updateTask} />
    </>
  );
}