import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import KanbanBoard from '../components/KanbanBoard';
import { Plus, TrendingUp, FolderOpen, CheckCircle2, Clock } from 'lucide-react';

export default function Dashboard() {
  return (
    <DashboardLayout>
      
      {/* 1. Header  */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">Overview</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Here is what's happening in your orbit today.</p>
        </div>
      </div>

      {/* 2. STATS CARDS: */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Active Projects", value: "12", sub: "+2 this week", icon: <FolderOpen size={20} />, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Pending Tasks", value: "8", sub: "4 high priority", icon: <Clock size={20} />, color: "text-orange-500", bg: "bg-orange-500/10" },
          { label: "Completed", value: "24", sub: "12% increase", icon: <CheckCircle2 size={20} />, color: "text-emerald-500", bg: "bg-emerald-500/10" }
        ].map((stat, i) => (
          <div key={i} className="group relative p-4 rounded-xl border transition-all duration-300
            bg-white/60 border-white/60 shadow-sm hover:shadow-md hover:-translate-y-1
            dark:bg-[#1e293b]/40 dark:border-white/5 dark:hover:bg-[#1e293b]/60 dark:hover:border-white/10 backdrop-blur-sm">
            
            <div className="flex justify-between items-start mb-2">
              {/* Icon Box */}
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
            
            {/* Value & Label  */}
            <div className="flex flex-col">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white leading-none mb-1">{stat.value}</h3>
              <div className="flex items-center gap-2">
                 <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
                 <span className="text-[10px] text-gray-400 dark:text-gray-500">• {stat.sub}</span>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* 3. Kanban Board Area */}
      <div className="flex-1 min-h-0">
        <KanbanBoard />
      </div>

    </DashboardLayout>
  );
}