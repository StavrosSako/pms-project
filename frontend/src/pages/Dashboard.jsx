import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import KanbanBoard from '../components/KanbanBoard';
import { FolderOpen, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useProjects } from '../hooks/useProjects';
import { useMyTeams } from '../hooks/useMyTeams';
import ProjectSelect from '../components/ProjectSelect';
import { subscribeSse } from '../api/sseClient';

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
  const { projects, loading: projectsLoading } = useProjects();
  const { teams: myTeams, loading: myTeamsLoading } = useMyTeams();

  const isAdmin = user?.role === 'ADMIN';
  const getProjectId = (p) => p?.id || p?._id;

  const visibleProjects = useMemo(() => {
    if (isAdmin) return projects || [];
    const set = new Set();
    for (const t of myTeams || []) {
      const pid = `${t?.projectId || ''}`;
      if (pid) set.add(pid);
    }
    return (projects || []).filter(p => set.has(`${getProjectId(p)}`));
  }, [isAdmin, myTeams, projects]);

  const [selectedProjectId, setSelectedProjectId] = useState('');

  useEffect(() => {
    if (selectedProjectId) return;
    if (!visibleProjects || visibleProjects.length === 0) return;
    const first = getProjectId(visibleProjects[0]);
    if (first) setSelectedProjectId(first);
  }, [selectedProjectId, visibleProjects]);

  const { stats, loading: statsLoading, refetch: refetchStats } = useDashboardStats('', selectedProjectId);

  const displayName = toTitleCase(
    `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.username || 'User'
  );

  // Prepare stats cards data
  const statsCards = [
    { 
      label: "To Do", 
      value: stats.pendingTasks.toString(), 
      sub: "Open tasks", 
      icon: <FolderOpen size={20} />, 
      color: "text-blue-500", 
      bg: "bg-blue-500/10" 
    },
    { 
      label: "In Progress", 
      value: stats.inProgressTasks.toString(), 
      sub: "Work in progress", 
      icon: <Clock size={20} />, 
      color: "text-orange-500", 
      bg: "bg-orange-500/10" 
    },
    { 
      label: "Done", 
      value: stats.completedTasks.toString(), 
      sub: "Completed tasks", 
      icon: <CheckCircle2 size={20} />, 
      color: "text-emerald-500", 
      bg: "bg-emerald-500/10" 
    }
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    if (!selectedProjectId) return;

    let scheduled = null;
    const scheduleRefetch = () => {
      if (scheduled) return;
      scheduled = setTimeout(async () => {
        scheduled = null;
        await refetchStats();
      }, 200);
    };

    const unsubscribe = subscribeSse({
      url: 'http://localhost:8083/api/notifications/stream',
      token,
      onEvent: (evt) => {
        const teamId = `${evt.data?.teamId || ''}`;
        if (teamId && `${selectedProjectId}` !== teamId) return;

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
  }, [refetchStats, selectedProjectId]);

  const loading = userLoading || projectsLoading || myTeamsLoading;

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

      {/* Project selection (required) */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : visibleProjects.length === 0 ? (
        <div className="p-8 rounded-2xl border border-gray-200 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl text-center">
          <div className="text-lg font-semibold text-gray-800 dark:text-white">No projects assigned</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Assign a team to a project to start working with tasks.
          </div>
        </div>
      ) : (
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Project
          </div>
          <div className="w-full max-w-md">
            <ProjectSelect
              projects={visibleProjects}
              value={selectedProjectId}
              onChange={(id) => {
                if (!id) return;
                setSelectedProjectId(id);
              }}
              emptyTitle="Select a project"
              emptySubtitle="Choose a project to view tasks"
              clearable={false}
            />
          </div>
        </div>
      )}

      {/* 2. STATS CARDS - scoped to selected project */}
      {!loading && visibleProjects.length > 0 ? (
        statsLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="animate-spin text-primary" size={28} />
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
        )
      ) : null}

      {/* 3. Kanban Board Area */}
      {!loading && visibleProjects.length > 0 && selectedProjectId ? (
        <div className="flex-1 min-h-0">
          <KanbanBoard projectId={selectedProjectId} />
        </div>
      ) : null}

    </DashboardLayout>
  );
}