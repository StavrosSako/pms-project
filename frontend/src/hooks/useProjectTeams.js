import { useEffect, useState } from 'react';
import { teamService } from '../api/teamService';
import { subscribeSse } from '../api/sseClient';

export const useProjectTeams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getTeamId = (team) => team?.id || team?._id;
  const normalize = (v) => (v === undefined || v === null ? '' : `${v}`);

  const upsertTeam = (updated) => {
    const id = normalize(getTeamId(updated));
    if (!id) return;
    setTeams(prev => {
      const idx = prev.findIndex(t => normalize(getTeamId(t)) === id);
      if (idx === -1) return [...prev, updated];
      const next = [...prev];
      next[idx] = updated;
      return next;
    });
  };

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await teamService.getAllProjectTeams();
        setTeams(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load teams');
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const removeTeam = (teamId) => {
      const id = normalize(teamId);
      if (!id) return;
      setTeams(prev => (prev || []).filter(t => normalize(getTeamId(t)) !== id));
    };

    const unsubscribe = subscribeSse({
      url: 'http://localhost:8082/api/notifications/stream',
      token,
      onEvent: (evt) => {
        if (evt.event === 'project_team_created' || evt.event === 'project_team_updated') {
          if (evt.data?.team) upsertTeam(evt.data.team);
          return;
        }
        if (evt.event === 'project_team_deleted') {
          removeTeam(evt.data?.teamId);
        }
      },
      onError: () => {
        // Keep silent
      }
    });

    return () => unsubscribe?.();
  }, []);

  const createTeam = async (payload) => {
    try {
      const created = await teamService.createProjectTeam(payload);
      upsertTeam(created);
      return { success: true, data: created };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to create team' };
    }
  };

  const updateTeam = async (teamId, teamData, membership) => {
    const id = normalize(teamId);
    if (!id) return { success: false, error: 'Invalid team id' };

    try {
      let updated = await teamService.updateProjectTeam(id, teamData);
      upsertTeam(updated);

      if (membership) {
        const desiredLeader = normalize(membership.leaderId);
        const desiredMembersRaw = Array.isArray(membership.memberIds) ? membership.memberIds : [];
        const desiredMembers = Array.from(new Set(desiredMembersRaw.map(normalize).filter(Boolean)))
          .filter(uid => uid !== desiredLeader);

        let current = updated;
        if (!current?.members) {
          current = await teamService.getProjectTeamById(id);
        }

        const currentIds = (current?.members || []).map(m => normalize(m?.userId)).filter(Boolean);
        const currentLeader = (current?.members || []).find(m => m?.role === 'TEAM_LEADER');
        const currentLeaderId = normalize(currentLeader?.userId);

        if (desiredLeader && !currentIds.includes(desiredLeader)) {
          current = await teamService.addProjectTeamMember(id, desiredLeader);
          upsertTeam(current);
        }

        const currentMemberIds = currentIds.filter(uid => uid !== currentLeaderId);
        const existingIds = new Set([...currentMemberIds, currentLeaderId].filter(Boolean));

        const toAdd = desiredMembers.filter(uid => !existingIds.has(uid));
        const toRemove = currentMemberIds.filter(uid => uid !== desiredLeader && !desiredMembers.includes(uid));

        for (const uid of toAdd) {
          current = await teamService.addProjectTeamMember(id, uid);
          upsertTeam(current);
        }

        for (const uid of toRemove) {
          current = await teamService.removeProjectTeamMember(id, uid);
          upsertTeam(current);
        }

        if (desiredLeader && desiredLeader !== currentLeaderId) {
          current = await teamService.setProjectTeamLeader(id, desiredLeader);
          upsertTeam(current);
        }

        updated = current;
      }

      return { success: true, data: updated };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to update team' };
    }
  };

  const refetch = async () => {
    setLoading(true);
    try {
      const data = await teamService.getAllProjectTeams();
      setTeams(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const deleteTeam = async (teamId) => {
    try {
      await teamService.deleteProjectTeam(teamId);
      setTeams(prev => prev.filter(t => normalize(getTeamId(t)) !== normalize(teamId)));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to delete team' };
    }
  };

  return {
    teams,
    loading,
    error,
    createTeam,
    updateTeam,
    deleteTeam,
    refetch
  };
};
