import React from 'react';
import { MoreHorizontal, Calendar } from 'lucide-react';
import { userAvatarGradient, userInitials, userDisplay } from './UserPicker';

const getTaskId = (task) => task?.id || task?._id;

export default function TaskCard({ task, usersById, onEdit, onDragStart, canEdit = true }) {
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

  const resolveUser = (userId) => {
    const id = `${userId || ''}`;
    if (!id) return null;
    if (usersById && typeof usersById.get === 'function') {
      return usersById.get(id) || null;
    }
    return null;
  };

  const Avatar = ({ user, fallbackId, size = 22 }) => {
    const id = `${user?.id || user?._id || fallbackId || ''}`;
    const gradient = userAvatarGradient(id);
    const initials = user ? userInitials(user) : userInitials({ username: id });
    const title = user ? (userDisplay(user) || id) : id;

    return (
      <div
        className={`rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold shadow-sm border-2 border-white dark:border-[#1e293b]`}
        style={{ width: size, height: size }}
        title={title}
      >
        <span style={{ fontSize: Math.max(8, Math.floor(size / 2.7)) }}>{initials}</span>
      </div>
    );
  };

  const assigneeIds = Array.isArray(task?.assignees)
    ? task.assignees.map(a => (typeof a === 'string' ? a : a?.userId)).filter(Boolean)
    : [];

  return (
    <div
      className={`group relative p-4 mb-3 rounded-xl border transition-all duration-200 ${canEdit ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}
      bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-primary/30
      dark:bg-[#1e293b]/60 dark:border-white/5 dark:backdrop-blur-md dark:hover:border-white/20 dark:hover:bg-[#1e293b]/80`}
      draggable={!!canEdit}
      onDragStart={(e) => {
        if (!canEdit) return;
        const id = getTaskId(task);
        if (onDragStart) onDragStart(e, id);
      }}
    >
      
      {/* THE UPGRADE: Colored Priority Line on Left */}
      <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${getPriorityColor(task.priority)} opacity-0 group-hover:opacity-100 transition-opacity`}></div>

      {/* Header */}
      <div className="flex justify-between items-start mb-3 pl-2">
        <div className="flex items-center gap-2 min-w-0">
          {assigneeIds.length > 0 ? (
            <div className="flex -space-x-2">
              {assigneeIds.slice(0, 3).map((id, i) => (
                <Avatar key={`${id}-${i}`} user={resolveUser(id)} fallbackId={id} />
              ))}
            </div>
          ) : (
            <span className="text-xs text-gray-400">Unassigned</span>
          )}
          <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md ${getPriorityBadge(task.priority)}`}>
            {task.priority || 'Low'}
          </span>
        </div>

        <div className="relative">
          {canEdit && typeof onEdit === 'function' ? (
            <button
              type="button"
              onClick={() => {
                onEdit(task);
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
              title="Edit"
            >
              <MoreHorizontal size={16} />
            </button>
          ) : null}
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
      </div>
    </div>
  );
}