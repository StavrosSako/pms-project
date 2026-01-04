import React, { useMemo, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import TeamMemberCard from '../components/TeamMemberCard';
import { Search, Filter, Loader2, Plus, LayoutGrid, List, Users, MoreHorizontal } from 'lucide-react';
import { useTeam } from '../hooks/useTeam';
import { useProjects } from '../hooks/useProjects';
import { useAuth } from '../hooks/useAuth';
import { useProjectTeams } from '../hooks/useProjectTeams';
import { useModal } from '../hooks/useModal';
import CreateTeamModal from '../components/CreateTeamModal';
import EditTeamModal from '../components/EditTeamModal';
import { useMyTeams } from '../hooks/useMyTeams';
import MemberTeamAccordion from '../components/MemberTeamAccordion';

export default function Team() {
  const [searchTerm, setSearchTerm] = useState('');
  const { members, loading, error } = useTeam();
  const { projects } = useProjects();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const { teams: myTeams, loading: myTeamsLoading, error: myTeamsError } = useMyTeams();

  const { teams, loading: teamsLoading, error: teamsError, createTeam, updateTeam, deleteTeam } = useProjectTeams();
  const { openModal } = useModal();

  const [viewMode, setViewMode] = useState('grid');

  const getProjectId = (project) => project?.id || project?._id;

  const filtered = (members || []).filter(m => 
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.studentId?.includes(searchTerm)
  );

  const enriched = isAdmin
    ? filtered.map(member => {
        const memberships = (projects || [])
          .map(p => {
            const projectMembers = p?.members || [];
            const entry = projectMembers.find(pm => `${pm?.userId}` === `${member?.id}`);
            if (!entry) return null;
            return {
              projectId: getProjectId(p),
              projectName: p?.name || p?.title || 'Untitled',
              teamRole: entry?.role || 'TEAM_MEMBER'
            };
          })
          .filter(Boolean);

        return {
          ...member,
          projectMemberships: memberships
        };
      })
    : filtered;

  const getTeamId = (team) => team?.id || team?._id;
  const filteredTeams = useMemo(() => {
    const q = (searchTerm || '').toLowerCase();
    return (teams || []).filter(t => {
      if (!q) return true;
      return (
        t?.name?.toLowerCase?.().includes(q) ||
        t?.description?.toLowerCase?.().includes(q)
      );
    });
  }, [teams, searchTerm]);

  const usersById = useMemo(() => {
    const map = new Map();
    for (const u of members || []) {
      const id = `${u?.id || u?._id || ''}`;
      if (id) map.set(id, u);
    }
    return map;
  }, [members]);

  const projectsById = useMemo(() => {
    const map = new Map();
    for (const p of projects || []) {
      const id = `${getProjectId(p)}`;
      if (id) map.set(id, p);
    }
    return map;
  }, [projects]);

  return (
    <DashboardLayout>
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Directory</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage permissions and view team details.</p>
        </div>

        <div className="flex w-full md:w-auto gap-2">
          {/* Search Input - FIXED DARK MODE */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder={isAdmin ? "Find team..." : "Find member..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-primary/20 transition-all
                bg-white border-gray-200 text-gray-800 placeholder-gray-400
                dark:bg-[#0f172a] dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
            />
          </div>
          
          {/* Filter Button */}
          <button className="p-2 rounded-xl border transition-colors
            bg-white border-gray-200 text-gray-600 hover:bg-gray-50
            dark:bg-[#0f172a] dark:border-gray-700 dark:text-gray-300 dark:hover:bg-[#1e293b]">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {isAdmin ? (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
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

            <button
              onClick={() => openModal('createTeam', { title: 'Create Team' })}
              className="px-4 py-2 rounded-xl text-white text-sm font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent"
            >
              <Plus size={18} />
              <span>New Team</span>
            </button>
          </div>

          {teamsLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : teamsError ? (
            <div className="p-4 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-center">
              Error loading teams: {teamsError}
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="p-8 rounded-xl bg-gray-50 dark:bg-white/5 text-center text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No teams match your search' : 'No teams found'}
            </div>
          ) : viewMode === 'list' ? (
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden bg-white/40 dark:bg-white/5 backdrop-blur-xl">
              <table className="w-full">
                <thead className="bg-gray-50/80 dark:bg-white/5">
                  <tr className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                    <th className="p-4">Team</th>
                    <th className="p-4">Project</th>
                    <th className="p-4">Members</th>
                    <th className="p-4">Leader</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeams.map(t => (
                    <tr key={getTeamId(t)} className="hover:bg-white/50 dark:hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-gray-800 dark:text-white">{t.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{t.description || '—'}</div>
                      </td>
                      <td className="p-4">
                        {t?.projectId ? (
                          <span className="px-2 py-1 rounded-lg text-xs font-semibold border bg-primary/10 text-primary border-primary/20">
                            {projectsById.get(`${t.projectId}`)?.name || 'Assigned'}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{(t.members || []).length}</td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{(t.members || []).find(m => m.role === 'TEAM_LEADER')?.userId || '—'}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => openModal('editTeam', { title: 'Edit Team', team: t })}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <MoreHorizontal size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTeams.map(t => (
                <div
                  key={getTeamId(t)}
                  className="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300
                    bg-white border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1
                    dark:bg-[#1e293b]/60 dark:backdrop-blur-md dark:border-white/5 dark:shadow-none"
                >
                  <div className="h-24 w-full bg-gradient-to-r from-indigo-500 to-blue-400 opacity-90 relative p-4 flex justify-between items-start">
                    <div className="w-16 h-16 rounded-full border-4 border-white/30 flex items-center justify-center shadow-lg backdrop-blur-sm
                      bg-white text-gray-900 dark:bg-[#0f172a] dark:text-white"
                    >
                      <Users size={22} />
                    </div>

                    <button
                      onClick={() => openModal('editTeam', { title: 'Edit Team', team: t })}
                      className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <MoreHorizontal size={20} />
                    </button>
                  </div>

                  <div className="px-4 py-4 flex-1 flex flex-col">
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white leading-tight">{t.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{t.description || 'No description'}</p>
                      {t?.projectId ? (
                        <div className="mt-2">
                          <span className="px-2 py-1 rounded-lg text-[11px] font-semibold border bg-primary/10 text-primary border-primary/20">
                            {projectsById.get(`${t.projectId}`)?.name || 'Assigned project'}
                          </span>
                        </div>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="p-2 rounded-lg bg-gray-50 border border-gray-100 dark:bg-white/5 dark:border-white/5">
                        <p className="text-[10px] uppercase text-gray-400 font-semibold tracking-wider">Members</p>
                        <p className="text-xs font-mono text-gray-600 dark:text-gray-300 mt-0.5 truncate">{(t.members || []).length}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-gray-50 border border-gray-100 dark:bg-white/5 dark:border-white/5">
                        <p className="text-[10px] uppercase text-gray-400 font-semibold tracking-wider">Leader</p>
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mt-0.5 truncate">
                          {(t.members || []).find(m => m.role === 'TEAM_LEADER')?.userId || '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <CreateTeamModal createTeam={createTeam} />
          <EditTeamModal updateTeam={updateTeam} deleteTeam={deleteTeam} />
        </>
      ) : (

        // Non-admin: show ONLY the member's own team(s), with collapsible member list
        myTeamsLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : myTeamsError ? (
          <div className="p-4 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-center">
            Error loading your team: {myTeamsError}
          </div>
        ) : (myTeams || []).length === 0 ? (
          <div className="p-8 rounded-xl bg-gray-50 dark:bg-white/5 text-center text-gray-500 dark:text-gray-400">
            You are not assigned to a team yet.
          </div>
        ) : (
          <MemberTeamAccordion teams={myTeams} usersById={usersById} projectsById={projectsById} />
        )
      )}

    </DashboardLayout>
  );
}