import React, { useState, useEffect } from 'react';
import { useModal } from '../hooks/useModal.jsx';
import { Modal } from '../components/Modal.jsx';
import { Loader2, Calendar, Users } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useTeam } from '../hooks/useTeam';
import ProjectSelect from '../components/ProjectSelect';
import { UserMultiSelect } from '../components/UserPicker';
import { useAuth } from '../hooks/useAuth';
import { useMyTeams } from '../hooks/useMyTeams';
import { teamService } from '../api/teamService';

const CreateTaskModal = ({ createTask }) => {
  const { modalProps, closeModal } = useModal();
  const initialStatus = modalProps.initialStatus || 'TODO';
  const initialTeamId = modalProps.initialTeamId || '';

  const { projects, loading: projectsLoading } = useProjects();
  const { members: allUsers, loading: usersLoading } = useTeam();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const { teams: myTeams, loading: myTeamsLoading } = useMyTeams();

  const [adminProjectTeams, setAdminProjectTeams] = useState([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(initialStatus);
  const [priority, setPriority] = useState('Medium');
  const [teamId, setTeamId] = useState('');
  const [assignees, setAssignees] = useState([]);
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isProjectLocked = !!initialTeamId;

  const getProjectId = (p) => p?.id || p?._id;
  const leaderProjectIds = React.useMemo(() => {
    if (isAdmin) return new Set();
    const set = new Set();
    const uid = `${user?.id || user?._id || ''}`;
    for (const t of myTeams || []) {
      const pid = `${t?.projectId || ''}`;
      if (!pid) continue;
      const isLeader = (t?.members || []).some(m => `${m?.userId}` === uid && m?.role === 'TEAM_LEADER');
      if (isLeader) set.add(pid);
    }
    return set;
  }, [isAdmin, myTeams, user]);

  const selectableProjects = React.useMemo(() => {
    if (isAdmin) return projects || [];
    return (projects || []).filter(p => leaderProjectIds.has(`${getProjectId(p)}`));
  }, [isAdmin, leaderProjectIds, projects]);

  useEffect(() => {
    if (!isAdmin) return;

    let mounted = true;
    const fetchTeams = async () => {
      try {
        const data = await teamService.getAllProjectTeams();
        if (!mounted) return;
        setAdminProjectTeams(Array.isArray(data) ? data : []);
      } catch (_) {
        if (!mounted) return;
        setAdminProjectTeams([]);
      }
    };

    fetchTeams();
    return () => {
      mounted = false;
    };
  }, [isAdmin]);

  const normalize = (v) => (v === undefined || v === null ? '' : `${v}`);
  const assignedTeamMemberIds = React.useMemo(() => {
    const pid = normalize(teamId);
    if (!pid) return [];

    if (!isAdmin && myTeamsLoading) return null;

    const team = isAdmin
      ? (adminProjectTeams || []).find(t => normalize(t?.projectId) === pid)
      : (myTeams || []).find(t => normalize(t?.projectId) === pid);

    const ids = (team?.members || []).map(m => normalize(m?.userId)).filter(Boolean);
    return Array.from(new Set(ids));
  }, [adminProjectTeams, isAdmin, myTeams, myTeamsLoading, teamId]);

  const eligibleUsers = React.useMemo(() => {
    if (!Array.isArray(assignedTeamMemberIds) || !assignedTeamMemberIds.length) return [];
    const allowed = new Set(assignedTeamMemberIds);
    return (allUsers || []).filter(u => allowed.has(normalize(u?.id || u?._id)));
  }, [allUsers, assignedTeamMemberIds]);

  useEffect(() => {
    if (!teamId) return;
    if (!Array.isArray(assignedTeamMemberIds)) return;
    if (assignedTeamMemberIds.length === 0) {
      setAssignees([]);
    } else {
      setAssignees(prev => (prev || []).filter(uid => assignedTeamMemberIds.includes(normalize(uid))));
    }
  }, [assignedTeamMemberIds, teamId]);

  useEffect(() => {
    setStatus(initialStatus);
    setTitle('');
    setDescription('');
    setPriority('Medium');
    setTeamId(initialTeamId);
    setAssignees([]);
    setDueDate('');
    setError(null);
  }, [initialStatus, initialTeamId, modalProps]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    if (!title.trim() || !teamId) {
      setError(isProjectLocked ? 'Task title is required.' : 'Task title and Project are required.');
      setLoading(false);
      return { success: false };
    }

    const taskData = {
      title,
      description,
      status,
      priority,
      teamId,
      dueDate: dueDate || null,
      assignees: assignees.map(userId => ({ userId }))
    };

    const result = await createTask(taskData);

    if (result.success) {
      setLoading(false);
      return { success: true };
    } else {
      setError(result.error || 'Failed to create task.');
    }
    setLoading(false);
    return { success: false };
  };

  const isLoading = loading || projectsLoading || usersLoading;
  const isTeamLoading = !!teamId && !isAdmin && myTeamsLoading;
  const hasNoAssignedTeam = !!teamId && Array.isArray(assignedTeamMemberIds) && assignedTeamMemberIds.length === 0;

  const priorityOptions = [
    { value: 'Low', color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' },
    { value: 'Medium', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    { value: 'High', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' }
  ];

  return (
    <Modal 
      id="createTask" 
      title={modalProps.title || "New Task"} 
      onConfirm={handleSubmit} 
      confirmText={isLoading ? <><Loader2 className="animate-spin mr-2" size={16} /> Creating...</> : "Create"} 
      showCancel={!isLoading}
      size="lg"
    >
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-3">
        {/* Task Title - Main Focus */}
        <input
          type="text"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-lg font-medium bg-transparent border-none outline-none placeholder-gray-400 dark:placeholder-gray-500 text-gray-800 dark:text-white"
          autoFocus
        />

        {!isProjectLocked && (
          <ProjectSelect
            projects={selectableProjects}
            value={teamId}
            onChange={setTeamId}
          />
        )}

        {/* Quick Options Row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Priority Pills */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-white/5 rounded-lg">
            {priorityOptions.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPriority(opt.value)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  priority === opt.value 
                    ? opt.color 
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                }`}
              >
                {opt.value}
              </button>
            ))}
          </div>

          {/* Due Date */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-white/5 rounded-lg">
            <Calendar size={14} className="text-gray-400" />
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="text-xs bg-transparent border-none outline-none text-gray-600 dark:text-gray-300"
            />
          </div>

        </div>

        <div className="space-y-3 pt-1">
          <textarea
            rows="2"
            placeholder="Add a description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 placeholder-gray-400 dark:placeholder-gray-500 text-gray-700 dark:text-gray-300 resize-none"
          />

          <div className="flex items-center gap-2">
            <Users size={14} className="text-gray-400" />
            <div className="flex-1">
              <UserMultiSelect
                users={eligibleUsers}
                values={assignees}
                onChange={setAssignees}
                disabled={isTeamLoading || hasNoAssignedTeam}
                placeholder={
                  isTeamLoading
                    ? 'Loading team...'
                    : hasNoAssignedTeam
                      ? 'No team assigned to this project'
                      : 'Assign users...'
                }
              />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="px-3 py-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg">
            {error}
          </div>
        )}
      </form>
    </Modal>
  );
};

export default CreateTaskModal;
