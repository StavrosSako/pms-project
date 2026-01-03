import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';

export default function Dashboard() {
  return (
    <DashboardLayout>
      
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Overview</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back to TUC Orbit.</p>
        </div>
        <button className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg shadow-lg shadow-primary/20 transition-all font-medium flex items-center gap-2">
          <span>+ New Project</span>
        </button>
      </div>

      {/* Stats Cards (Example Content) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: "Total Projects", value: "12", color: "bg-blue-500" },
          { label: "Pending Tasks", value: "8", color: "bg-accent" },
          { label: "Completed", value: "24", color: "bg-emerald-500" }
        ].map((stat, i) => (
          <div key={i} className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm dark:bg-white/5 dark:border-white/5 dark:backdrop-blur-sm transition-all hover:transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-500 dark:text-gray-400 font-medium">{stat.label}</span>
              <div className={`w-2 h-2 rounded-full ${stat.color}`}></div>
            </div>
            <h3 className="text-4xl font-bold dark:text-white">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Empty State / Kanban Placeholder */}
      <div className="h-96 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 flex items-center justify-center">
        <p className="text-gray-400 dark:text-gray-600">Project Workspace (Kanban) Loading...</p>
      </div>

    </DashboardLayout>
  );
}