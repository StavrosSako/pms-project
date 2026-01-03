import React from 'react';
import TaskCard from './TaskCard';
import { Plus } from 'lucide-react';

export default function KanbanBoard() {
  // Dummy Data for Design Purpose
  const columns = [
    {
      id: 'todo',
      title: 'To Do',
      count: 3,
      tasks: [
        { id: 1, title: 'Design System Architecture', priority: 'High', date: 'Oct 24', assignees: [null] },
        { id: 2, title: 'Setup React Router', priority: 'Medium', date: 'Oct 25', assignees: [null, null] },
      ]
    }
  ];

  return (
    <div className="flex h-full gap-6 overflow-x-auto pb-4">
      {columns.map((col) => (
        <div key={col.id} className="min-w-[300px] flex flex-col h-full">
          
          {/* Column Header */}
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-700 dark:text-gray-200">{col.title}</h3>
              <span className="bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400 text-xs px-2 py-0.5 rounded-full">
                {col.count}
              </span>
            </div>
            <div className="flex gap-1">
              <button className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded text-gray-500">
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Cards Container */}
          <div className="flex-1">
            {col.tasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
            
            {/* "Add Task" Ghost Button */}
            <button className="w-full py-2 flex items-center justify-center gap-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl border border-transparent hover:border-primary/20 border-dashed transition-all text-sm">
              <Plus size={16} />
              <span>Add Task</span>
            </button>
          </div>

        </div>
      ))}
    </div>
  );
}