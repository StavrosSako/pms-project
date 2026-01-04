import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Users } from 'lucide-react';
import { Modal } from '../components/Modal.jsx';
import { useModal } from '../hooks/useModal.jsx';
import { useTeam } from '../hooks/useTeam';
import { useProjectCatalog } from '../hooks/useProjectCatalog';
import ProjectSelect from '../components/ProjectSelect';
import { UserMultiSelect, UserSingleSelect } from '../components/UserPicker';

const getTeamId = (team) => team?.id || team?._id;
const getUserId = (user) => user?.id || user?._id;

const EditTeamModal = ({ updateTeam, deleteTeam }) => {
  const { modalProps, closeModal } = useModal();
  const team = modalProps.team;

  const { members: orbitMembers, loading: membersLoading } = useTeam();
  const { projects, loading: projectsLoading } = useProjectCatalog();

  const teamId = useMemo(() => getTeamId(team), [team]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [leaderId, setLeaderId] = useState('');
  const [memberIds, setMemberIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setName(team?.name || '');
    setDescription(team?.description || '');
    setProjectId(team?.projectId || '');

    const leader = (team?.members || []).find(m => m?.role === 'TEAM_LEADER');
    setLeaderId(leader?.userId || '');

    const members = (team?.members || [])
      .filter(m => m?.role !== 'TEAM_LEADER')
      .map(m => m?.userId)
      .filter(Boolean);

    setMemberIds(members);
    setError(null);
    setLoading(false);
  }, [team]);

  const handleSubmit = async () => {
    if (!teamId) return { success: false };

    setLoading(true);
    setError(null);

    if (!name.trim()) {
      setError('Team name is required.');
      setLoading(false);
      return { success: false };
    }

    if (!leaderId) {
      setError('Team leader is required.');
      setLoading(false);
      return { success: false };
    }

    const payload = {
      name,
      description,
      projectId: projectId || undefined
    };

    const result = await updateTeam(teamId, payload, { leaderId, memberIds });

    if (!result.success) {
      setError(result.error || 'Failed to update team.');
      setLoading(false);
      return { success: false };
    }

    setLoading(false);
    return { success: true };
  };

  const handleDelete = async () => {
    if (!teamId) return;

    const ok = window.confirm('Delete this team? This cannot be undone.');
    if (!ok) return;

    setLoading(true);
    setError(null);

    const result = await deleteTeam(teamId);

    if (!result.success) {
      setError(result.error || 'Failed to delete team.');
      setLoading(false);
      return;
    }

    setLoading(false);
    closeModal();
  };

  const isLoading = loading || membersLoading || projectsLoading;

  return (
    <Modal
      id="editTeam"
      title={modalProps.title || 'Edit Team'}
      onConfirm={handleSubmit}
      confirmText={isLoading ? <><Loader2 className="animate-spin mr-2" size={16} /> Saving...</> : 'Save'}
      showCancel={!isLoading}
      size="md"
    >
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
        <input
          type="text"
          placeholder="Team name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full text-lg font-medium bg-transparent border-none outline-none placeholder-gray-400 dark:placeholder-gray-500 text-gray-800 dark:text-white"
          autoFocus
        />

        <textarea
          rows="2"
          placeholder="Add a description (optional)..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 placeholder-gray-400 dark:placeholder-gray-500 text-gray-700 dark:text-gray-300 resize-none"
          disabled={isLoading}
        />

        <ProjectSelect
          projects={projects}
          value={projectId}
          onChange={setProjectId}
        />

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
            <Users size={14} />
            <span>Team leader</span>
          </div>
          <UserSingleSelect
            users={orbitMembers}
            value={leaderId}
            onChange={setLeaderId}
            placeholder="Select team leader..."
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
            <Users size={14} />
            <span>Members</span>
          </div>
          <UserMultiSelect
            users={(orbitMembers || []).filter(u => `${getUserId(u)}` !== `${leaderId}`)}
            values={memberIds}
            onChange={setMemberIds}
            placeholder="Select members..."
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-white/10">
          <button
            type="button"
            onClick={handleDelete}
            className="px-3 py-2 rounded-lg text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? 'Please wait…' : 'Delete team'}
          </button>

          <div className="text-xs text-gray-400">
            {teamId ? `ID: ${teamId}` : ''}
          </div>
        </div>

        {error && (
          <div className="px-3 py-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg">
            {error}
          </div>
        )}
      </form>
    </Modal>
  );
};

export default EditTeamModal;
