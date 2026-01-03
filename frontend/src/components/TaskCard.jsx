import React from 'react';
import { MoreHorizontal, Calendar } from 'lucide-react';

export default function TaskCard({ task }) {
  // Color helper
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-orange-500';
      case 'Medium': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  const getPriorityBadge = (priority) => {
     switch (priority) {
      case 'High': return 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-500/10';
      case 'Medium': return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-500/10';
    }
  }

  return (
    <div className="group relative p-4 mb-3 rounded-xl border transition-all duration-200 cursor-grab active:cursor-grabbing
      bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-primary/30
      dark:bg-[#1e293b]/60 dark:border-white/5 dark:backdrop-blur-md dark:hover:border-white/20 dark:hover:bg-[#1e293b]/80">
      
      {/* THE UPGRADE: Colored Priority Line on Left */}
      <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${getPriorityColor(task.priority)} opacity-0 group-hover:opacity-100 transition-opacity`}></div>

      {/* Header */}
      <div className="flex justify-between items-start mb-3 pl-2">
        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md ${getPriorityBadge(task.priority)}`}>
          {task.priority}
        </span>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Title */}
      <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-100 mb-3 pl-2 leading-relaxed">
        {task.title}
      </h4>

      {/* Footer */}
      <div className="flex items-center justify-between pl-2 mt-2 pt-3 border-t border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-1.5 text-gray-400 text-xs">
          <Calendar size={13} />
          <span>{task.date}</span>
        </div>
        
        {/* Avatars */}
        <div className="flex -space-x-2">
          {task.assignees.map((_, i) => (
             <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-[#1e293b] bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-[8px] text-gray-500 dark:text-gray-300 font-bold">
                {/* Placeholder initials since we don't have images yet */}
                U{i+1}
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}