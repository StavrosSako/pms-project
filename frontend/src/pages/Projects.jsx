import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Search, Filter, MoreHorizontal, Calendar, Plus, LayoutGrid, List, Clock, CheckCircle2 } from 'lucide-react';

export default function Projects() {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filter, setFilter] = useState('All');

  // Dummy Data just to be able to see how everything looks 
  const projects = [
    { id: 1, name: "AI Research Model", client: "Data Science", team: [2,5], status: "Active", progress: 60, due: "Nov 25", desc: "Training the new LLM on university datasets." },

  ];

  // Helper: Status Colors
  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20';
      case 'In Progress': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20';
      case 'Completed': return 'bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400 border-gray-200 dark:border-white/10';
      default: return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/20';
    }
  };

  // Filter Logic
  const filteredProjects = filter === 'All' ? projects : projects.filter(p => p.status === filter);

  return (
    <DashboardLayout>
      
      {/* 1. Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Projects</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage and track your ongoing work.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* View Toggles */}
          <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl border border-gray-200 dark:border-white/10">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-white/10 text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-white/10 text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
            >
              <List size={18} />
            </button>
          </div>

          <button className="px-4 py-2 rounded-xl text-white text-sm font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent">
            <Plus size={18} />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* 2. Quick Filter Tabs */}
      <div className="flex items-center gap-4 mb-6 border-b border-gray-200 dark:border-white/10 pb-1">
        {['All', 'Active', 'In Progress', 'Completed'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`pb-3 text-sm font-medium transition-all relative ${
              filter === tab 
                ? 'text-primary dark:text-white' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            {tab}
            {filter === tab && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>
            )}
          </button>
        ))}
      </div>

      {/* 3. CONTENT AREA */}
      {viewMode === 'list' ? (
        
        /* LIST VIEW */
        <div className="w-full overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/10 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <th className="p-4 font-semibold">Project Name</th>
                  <th className="p-4 font-semibold">Team</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Progress</th>
                  <th className="p-4 font-semibold">Due Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="group hover:bg-white/50 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-gray-800 dark:text-white">{project.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{project.client}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex -space-x-2">
                        {project.team.map((m, i) => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-[#1e293b] bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-[10px] font-bold text-gray-500 dark:text-gray-300">M{m}</div>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusColor(project.status)}`}>{project.status}</span>
                    </td>
                    <td className="p-4 w-48">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${project.progress}%` }}></div>
                        </div>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar size={14} />
                        <span>{project.due}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"><MoreHorizontal size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      ) : (

        /* GRID VIEW   */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="group p-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${getStatusColor(project.status)}`}>
                  {project.status === 'Completed' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                </div>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><MoreHorizontal size={20} /></button>
              </div>

              {/* Title & Desc */}
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">{project.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{project.desc}</p>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-500 dark:text-gray-400">Progress</span>
                  <span className="font-medium text-gray-700 dark:text-gray-200">{project.progress}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                   <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-1000" style={{ width: `${project.progress}%` }}></div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-white/10">
                <div className="flex -space-x-2">
                  {project.team.map((m, i) => (
                    <div key={i} className="w-7 h-7 rounded-full border-2 border-white dark:border-[#1e293b] bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-[9px] font-bold text-gray-500 dark:text-gray-300">M{m}</div>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-full">
                  <Calendar size={12} />
                  <span>{project.due}</span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </DashboardLayout>
  );
}