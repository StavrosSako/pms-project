import Team from '../models/Team.js';
import { sendToAll } from '../realtime/notificationHub.js';

// Get all teams
export const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find().sort({ createdAt: -1 });
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ message: 'Server error fetching teams' });
  }
};

// Get team by ID
export const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    res.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ message: 'Server error fetching team' });
  }
};

// Create new team
export const createTeam = async (req, res) => {
  try {
    const { name, description, status, dueDate } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Team name is required' });
    }

    const team = new Team({
      name,
      description: description || '',
      status: status || 'Active',
      createdBy: req.user.id,
      dueDate: dueDate ? new Date(dueDate) : null,
      members: [{
        userId: req.user.id,
        role: 'TEAM_LEADER',
        joinedAt: new Date()
      }]
    });

    await team.save();
    sendToAll('team_created', {
      team: team?.toObject?.() || team,
      teamId: team._id?.toString?.() || team.id
    });
    res.status(201).json(team);
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ message: 'Server error creating team' });
  }
};

// Update team
export const updateTeam = async (req, res) => {
  try {
    const { name, description, status, progress, dueDate } = req.body;
    
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is team leader or admin
    const isLeader = team.members.some(
      m => m.userId === req.user.id && m.role === 'TEAM_LEADER'
    );
    
    if (req.user.role !== 'ADMIN' && !isLeader) {
      return res.status(403).json({ message: 'Only team leaders or admins can update teams' });
    }

    if (name) team.name = name;
    if (description !== undefined) team.description = description;
    if (status) team.status = status;
    if (progress !== undefined) team.progress = progress;
    if (dueDate !== undefined) team.dueDate = dueDate ? new Date(dueDate) : null;

    await team.save();
    sendToAll('team_updated', {
      team: team?.toObject?.() || team,
      teamId: team._id?.toString?.() || team.id
    });
    res.json(team);
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ message: 'Server error updating team' });
  }
};

// Delete team
export const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Only admin or team creator can delete
    if (req.user.role !== 'ADMIN' && team.createdBy !== req.user.id) {
      return res.status(403).json({ message: 'Insufficient permissions to delete team' });
    }

    const teamId = team._id?.toString?.() || team.id || req.params.id;
    await Team.findByIdAndDelete(req.params.id);

    sendToAll('team_deleted', { teamId });
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ message: 'Server error deleting team' });
  }
};

// Get team members
export const getTeamMembers = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).select('members');
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // In a real app, you'd fetch user details from user-service
    // For now, we return the member IDs
    res.json(team.members);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ message: 'Server error fetching team members' });
  }
};

// Add member to team
export const addTeamMember = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is already a member
    if (team.members.some(m => m.userId === userId)) {
      return res.status(400).json({ message: 'User is already a member of this team' });
    }

    // Check permissions
    const isLeader = team.members.some(
      m => m.userId === req.user.id && m.role === 'TEAM_LEADER'
    );
    
    if (req.user.role !== 'ADMIN' && !isLeader) {
      return res.status(403).json({ message: 'Only team leaders or admins can add members' });
    }

    team.members.push({
      userId,
      role: 'TEAM_MEMBER',
      joinedAt: new Date()
    });

    await team.save();
    sendToAll('team_updated', {
      team: team?.toObject?.() || team,
      teamId: team._id?.toString?.() || team.id
    });
    res.json(team);
  } catch (error) {
    console.error('Error adding team member:', error);
    res.status(500).json({ message: 'Server error adding team member' });
  }
};

// Remove member from team
export const removeTeamMember = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check permissions
    const isLeader = team.members.some(
      m => m.userId === req.user.id && m.role === 'TEAM_LEADER'
    );
    
    if (req.user.role !== 'ADMIN' && !isLeader) {
      return res.status(403).json({ message: 'Only team leaders or admins can remove members' });
    }

    team.members = team.members.filter(m => m.userId !== req.params.userId);
    await team.save();

    sendToAll('team_updated', {
      team: team?.toObject?.() || team,
      teamId: team._id?.toString?.() || team.id
    });
    
    res.json({ message: 'Member removed successfully', team });
  } catch (error) {
    console.error('Error removing team member:', error);
    res.status(500).json({ message: 'Server error removing team member' });
  }
};

