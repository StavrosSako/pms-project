import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import KanbanBoard from '../components/KanbanBoard';
import { FolderOpen, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useDashboardStats } from '../hooks/useDashboardStats';

const toTitleCase = (value) => {
  if (!value) return '';
  return value
    .toString()
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
};

const formatRole = (role) => {
  if (!role) return '';
  return role
    .toString()
    .trim()
    .toLowerCase()
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

export default function Dashboard() {
  const { user, loading: userLoading } = useAuth();
  const { stats, loading: statsLoading } = useDashboardStats(user?.id);

  const displayName = toTitleCase(
    `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.username || 'User'
  );

  // Prepare stats cards data
  const statsCards = [
    { 
      label: "Active Projects", 
      value: stats.activeProjects.toString(), 
      sub: "Currently active", 
      icon: <FolderOpen size={20} />, 
      color: "text-blue-500", 
      bg: "bg-blue-500/10" 
    },
    { 
      label: "Pending Tasks", 
      value: stats.pendingTasks.toString(), 
      sub: "Awaiting completion", 
      icon: <Clock size={20} />, 
      color: "text-orange-500", 
      bg: "bg-orange-500/10" 
    },
    { 
      label: "Completed", 
      value: stats.completedTasks.toString(), 
      sub: "Tasks finished", 
      icon: <CheckCircle2 size={20} />, 
      color: "text-emerald-500", 
      bg: "bg-emerald-500/10" 
    }
  ];

  const loading = userLoading || statsLoading;

  return (
    <DashboardLayout>
      
      {/* 1. Header - Now Dynamic */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">
            Welcome back, {displayName}!
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Role: <span className="font-semibold text-blue-500">{formatRole(user?.role || 'MEMBER')}</span>
          </p>
        </div>
      </div>

      {/* 2. STATS CARDS - Now mapped from real data */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {statsCards.map((stat, i) => (
          <div key={i} className="group relative p-4 rounded-xl border transition-all duration-300
            bg-white/60 border-white/60 shadow-sm hover:shadow-md hover:-translate-y-1
            dark:bg-[#1e293b]/40 dark:border-white/5 dark:hover:bg-[#1e293b]/60 dark:hover:border-white/10 backdrop-blur-sm">
            
            <div className="flex justify-between items-start mb-2">
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
            
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
      )}

      {/* 3. Kanban Board Area */}
      <div className="flex-1 min-h-0">
        <KanbanBoard />
      </div>

    </DashboardLayout>
  );
}