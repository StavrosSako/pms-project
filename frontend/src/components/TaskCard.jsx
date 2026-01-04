import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Calendar } from 'lucide-react';

const getTaskId = (task) => task?.id || task?._id;

export default function TaskCard({ task, onEdit, onDragStart }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!open) return;
      if (!menuRef.current) return;
      if (menuRef.current.contains(e.target)) return;
      setOpen(false);
    };

    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  // Color helper
  const getPriorityColor = (priority) => {
    const p = priority?.toUpperCase() || 'LOW';
    switch (p) {
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  const getPriorityBadge = (priority) => {
    const p = priority?.toUpperCase() || 'LOW';
    switch (p) {
      case 'HIGH': return 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-500/10';
      case 'MEDIUM': return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-500/10';
    }
  };

  return (
    <div
      className="group relative p-4 mb-3 rounded-xl border transition-all duration-200 cursor-grab active:cursor-grabbing
      bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-primary/30
      dark:bg-[#1e293b]/60 dark:border-white/5 dark:backdrop-blur-md dark:hover:border-white/20 dark:hover:bg-[#1e293b]/80"
      draggable
      onDragStart={(e) => {
        const id = getTaskId(task);
        if (onDragStart) onDragStart(e, id);
      }}
    >
      
      {/* THE UPGRADE: Colored Priority Line on Left */}
      <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${getPriorityColor(task.priority)} opacity-0 group-hover:opacity-100 transition-opacity`}></div>

      {/* Header */}
      <div className="flex justify-between items-start mb-3 pl-2">
              <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md ${getPriorityBadge(task.priority)}`}>
          {task.priority || 'Low'}
        </span>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
          >
            <MoreHorizontal size={16} />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-36 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f172a] shadow-lg overflow-hidden z-10">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  if (onEdit) onEdit(task);
                }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5"
              >
                Edit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-100 mb-3 pl-2 leading-relaxed">
        {task.title}
      </h4>

      {/* Footer */}
      <div className="flex items-center justify-between pl-2 mt-2 pt-3 border-t border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-1.5 text-gray-400 text-xs">
          <Calendar size={13} />
          <span>
            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 
             task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 
             task.date || 'No date'}
          </span>
        </div>
        
        {/* Avatars */}
        <div className="flex -space-x-2">
          {task.assignees && task.assignees.length > 0 ? (
            task.assignees.slice(0, 3).map((assignee, i) => (
              <div 
                key={i} 
                className="w-6 h-6 rounded-full border-2 border-white dark:border-[#1e293b] bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-[8px] text-gray-500 dark:text-gray-300 font-bold"
                title={assignee.username || assignee.name || 'Assignee'}
              >
                {assignee.username?.[0]?.toUpperCase() || assignee.name?.[0]?.toUpperCase() || 'U'}
              </div>
            ))
          ) : (
            <span className="text-xs text-gray-400">Unassigned</span>
          )}
        </div>
      </div>
    </div>
  );
}