import React, { useMemo, useState } from 'react';
import { ChevronDown, Users } from 'lucide-react';
import { userAvatarGradient, userDisplay, userInitials } from './UserPicker';

const getTeamId = (team) => team?.id || team?._id;

const MemberTeamAccordion = ({ teams, usersById, projectsById }) => {
  const [openTeamIds, setOpenTeamIds] = useState(() => new Set());

  const toggle = (teamId) => {
    setOpenTeamIds(prev => {
      const next = new Set(prev);
      if (next.has(teamId)) next.delete(teamId);
      else next.add(teamId);
      return next;
    });
  };

  const normalizedTeams = useMemo(() => (teams || []).map(t => ({
    ...t,
    _idNorm: `${getTeamId(t)}`,
    members: Array.isArray(t?.members) ? t.members : []
  })).filter(t => !!t._idNorm), [teams]);

  const projectNameForTeam = (team) => {
    const pid = `${team?.projectId || ''}`;
    if (!pid) return '';
    if (projectsById && typeof projectsById.get === 'function') {
      const p = projectsById.get(pid);
      return p?.name || p?.title || 'Assigned project';
    }
    return 'Assigned project';
  };

  const resolveUser = (userId) => {
    const id = `${userId || ''}`;
    if (!id) return null;
    if (usersById && typeof usersById.get === 'function') {
      return usersById.get(id) || null;
    }
    return null;
  };

  const Avatar = ({ user, fallbackId }) => {
    if (!user) {
      const gradient = userAvatarGradient(`${fallbackId || ''}`);
      const initials = userInitials({ username: `${fallbackId || ''}` });
      return (
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold shadow-sm`}>
          <span className="text-xs">{initials}</span>
        </div>
      );
    }

    const gradient = userAvatarGradient(`${user?.id || user?._id || fallbackId || ''}`);
    const initials = userInitials(user);
    return (
      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold shadow-sm`}>
        <span className="text-xs">{initials}</span>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {normalizedTeams.map(team => {
        const isOpen = openTeamIds.has(team._idNorm);
        const leader = team.members.find(m => m?.role === 'TEAM_LEADER');
        const leaderResolved = resolveUser(leader?.userId);
        const leaderDisplay = leaderResolved ? userDisplay(leaderResolved) : (leader?.userId ? `${leader.userId}` : '—');
        const sortedMembers = [...team.members].sort((a, b) => {
          if (a.role === 'TEAM_LEADER') return -1;
          if (b.role === 'TEAM_LEADER') return 1;
          return `${a.userId}`.localeCompare(`${b.userId}`);
        });

        return (
          <div
            key={team._idNorm}
            className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl overflow-hidden"
          >
            <button
              type="button"
              onClick={() => toggle(team._idNorm)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/50 dark:hover:bg-white/5 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-400 text-white flex items-center justify-center shadow-sm">
                  <Users size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-800 dark:text-white truncate">{team.name}</h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                      {(team.members || []).length} members
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{team.description || 'No description'}</p>
                  {team?.projectId ? (
                    <div className="mt-2">
                      <span className="px-2 py-1 rounded-lg text-[11px] font-semibold border bg-primary/10 text-primary border-primary/20">
                        {projectNameForTeam(team)}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Members</div>
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">{team.members.length}</div>
                </div>

                <ChevronDown
                  size={18}
                  className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </div>
            </button>

            {isOpen && (
              <div className="px-5 pb-5">
                <div className="mt-2 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
                  <div className="grid grid-cols-12 px-4 py-2 bg-gray-50/80 dark:bg-white/5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                    <div className="col-span-7">Member</div>
                    <div className="col-span-5">Role</div>
                  </div>
                  {sortedMembers.map((m, idx) => (
                    (() => {
                      const resolved = resolveUser(m.userId);
                      const display = resolved ? userDisplay(resolved) : `${m.userId}`;
                      const secondary = resolved?.email || resolved?.username || '';
                      return (
                    <div
                      key={`${m.userId}-${idx}`}
                      className="grid grid-cols-12 px-4 py-3 text-sm border-t border-gray-200 dark:border-white/10"
                    >
                      <div className="col-span-7 flex items-center gap-3 min-w-0">
                        <Avatar user={resolved} fallbackId={m.userId} />
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-800 dark:text-white truncate">{display}</div>
                          {secondary ? (
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{secondary}</div>
                          ) : null}
                        </div>
                      </div>
                      <div className="col-span-5">
                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${m.role === 'TEAM_LEADER'
                          ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-300 border-yellow-200 dark:border-yellow-500/20'
                          : 'bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400 border-gray-200 dark:border-white/10'
                        }`}
                        >
                          {m.role === 'TEAM_LEADER' ? 'Leader' : 'Member'}
                        </span>
                      </div>
                    </div>
                      );
                    })()
                  ))}
                </div>

                {leader?.userId && (
                  <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    Team leader: <span className="font-semibold text-gray-700 dark:text-gray-200">{leaderDisplay}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MemberTeamAccordion;
