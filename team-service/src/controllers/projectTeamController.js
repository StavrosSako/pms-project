import ProjectTeam from '../models/ProjectTeam.js';
import { sendToAll } from '../realtime/notificationHub.js';

const normalizeUserId = (value) => (value === undefined || value === null ? '' : `${value}`);

const dedupeMembers = (members) => {
  const seen = new Set();
  const result = [];
  for (const m of members || []) {
    const id = normalizeUserId(m?.userId);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    result.push({
      userId: id,
      role: m?.role || 'TEAM_MEMBER',
      joinedAt: m?.joinedAt || new Date()
    });
  }
  return result;
};

export const getAllProjectTeams = async (req, res) => {
  try {
    const teams = await ProjectTeam.find().sort({ createdAt: -1 });
    res.json(teams);
  } catch (error) {
    console.error('Error fetching project teams:', error);
    res.status(500).json({ message: 'Server error fetching teams' });
  }
};

export const getMyProjectTeams = async (req, res) => {
  try {
    const userId = `${req.user?.id || ''}`;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const teams = await ProjectTeam.find({ 'members.userId': userId }).sort({ createdAt: -1 });
    res.json(teams);
  } catch (error) {
    console.error('Error fetching my project teams:', error);
    res.status(500).json({ message: 'Server error fetching teams' });
  }
};

export const getProjectTeamById = async (req, res) => {
  try {
    const team = await ProjectTeam.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const isAdmin = req.user?.role === 'ADMIN';
    const userId = `${req.user?.id || ''}`;
    const isMember = !!userId && (team.members || []).some(m => `${m?.userId}` === userId);
    if (!isAdmin && !isMember) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    res.json(team);
  } catch (error) {
    console.error('Error fetching project team:', error);
    res.status(500).json({ message: 'Server error fetching team' });
  }
};

export const createProjectTeam = async (req, res) => {
  try {
    const { name, description, projectId, leaderId, memberIds } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Team name is required' });
    }

    const leader = normalizeUserId(leaderId);

    const memberList = [];

    if (leader) {
      memberList.push({ userId: leader, role: 'TEAM_LEADER', joinedAt: new Date() });
    }

    for (const id of memberIds || []) {
      const normalized = normalizeUserId(id);
      if (!normalized || normalized === leader) continue;
      memberList.push({ userId: normalized, role: 'TEAM_MEMBER', joinedAt: new Date() });
    }

    const members = dedupeMembers(memberList);

    if (!members.length) {
      return res.status(400).json({ message: 'At least one member is required' });
    }

    const hasLeader = members.some(m => m.role === 'TEAM_LEADER');
    if (!hasLeader) {
      return res.status(400).json({ message: 'A team leader is required' });
    }

    const team = new ProjectTeam({
      name,
      description: description || '',
      createdBy: req.user.id,
      members
    });

    if (projectId) team.projectId = projectId;

    await team.save();

    sendToAll('project_team_created', {
      team: team?.toObject?.() || team,
      teamId: team._id?.toString?.() || team.id
    });
    res.status(201).json(team);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'Project is already assigned to another team' });
    }
    console.error('Error creating project team:', error);
    res.status(500).json({ message: 'Server error creating team' });
  }
};

export const updateProjectTeam = async (req, res) => {
  try {
    const { name, description, projectId } = req.body;

    const team = await ProjectTeam.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (name) team.name = name;
    if (description !== undefined) team.description = description;
    if (projectId !== undefined) team.projectId = projectId || undefined;

    await team.save();
    sendToAll('project_team_updated', {
      team: team?.toObject?.() || team,
      teamId: team._id?.toString?.() || team.id
    });
    res.json(team);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'Project is already assigned to another team' });
    }
    console.error('Error updating project team:', error);
    res.status(500).json({ message: 'Server error updating team' });
  }
};

export const deleteProjectTeam = async (req, res) => {
  try {
    const team = await ProjectTeam.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const teamId = team._id?.toString?.() || team.id || req.params.id;
    await ProjectTeam.findByIdAndDelete(req.params.id);

    sendToAll('project_team_deleted', { teamId });
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting project team:', error);
    res.status(500).json({ message: 'Server error deleting team' });
  }
};

export const getProjectTeamMembers = async (req, res) => {
  try {
    const team = await ProjectTeam.findById(req.params.id).select('members');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json(team.members);
  } catch (error) {
    console.error('Error fetching project team members:', error);
    res.status(500).json({ message: 'Server error fetching team members' });
  }
};

export const addProjectTeamMember = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const team = await ProjectTeam.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const normalized = normalizeUserId(userId);

    if (team.members.some(m => normalizeUserId(m.userId) === normalized)) {
      return res.status(400).json({ message: 'User is already a member of this team' });
    }

    team.members.push({ userId: normalized, role: 'TEAM_MEMBER', joinedAt: new Date() });
    await team.save();

    sendToAll('project_team_updated', {
      team: team?.toObject?.() || team,
      teamId: team._id?.toString?.() || team.id
    });

    res.json(team);
  } catch (error) {
    console.error('Error adding project team member:', error);
    res.status(500).json({ message: 'Server error adding member' });
  }
};

export const removeProjectTeamMember = async (req, res) => {
  try {
    const team = await ProjectTeam.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const targetId = normalizeUserId(req.params.userId);

    const beforeCount = team.members.length;
    team.members = team.members.filter(m => normalizeUserId(m.userId) !== targetId);

    if (team.members.length === beforeCount) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const hasLeader = team.members.some(m => m.role === 'TEAM_LEADER');
    if (!hasLeader) {
      return res.status(400).json({ message: 'Cannot remove the only team leader' });
    }

    await team.save();

    sendToAll('project_team_updated', {
      team: team?.toObject?.() || team,
      teamId: team._id?.toString?.() || team.id
    });
    res.json(team);
  } catch (error) {
    console.error('Error removing project team member:', error);
    res.status(500).json({ message: 'Server error removing member' });
  }
};

export const setProjectTeamLeader = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const team = await ProjectTeam.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const normalized = normalizeUserId(userId);

    const exists = (team.members || []).some(m => normalizeUserId(m.userId) === normalized);
    if (!exists) {
      team.members.push({ userId: normalized, role: 'TEAM_MEMBER', joinedAt: new Date() });
    }

    team.members = (team.members || []).map(m => ({
      ...m.toObject(),
      role: normalizeUserId(m.userId) === normalized ? 'TEAM_LEADER' : 'TEAM_MEMBER'
    }));

    await team.save();

    sendToAll('project_team_updated', {
      team: team?.toObject?.() || team,
      teamId: team._id?.toString?.() || team.id
    });
    res.json(team);
  } catch (error) {
    console.error('Error setting project team leader:', error);
    res.status(500).json({ message: 'Server error setting team leader' });
  }
};
