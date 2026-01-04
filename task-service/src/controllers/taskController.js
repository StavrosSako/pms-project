import Task from '../models/Task.js';
import { sendToAll, sendToUser } from '../realtime/notificationHub.js';

const TEAM_SERVICE_URL = process.env.TEAM_SERVICE_URL || 'http://team-service:8082';

const getBearerToken = (req) => {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return '';
  return auth.substring(7);
};

const fetchMyProjectTeams = async (token) => {
  const res = await fetch(`${TEAM_SERVICE_URL}/api/project-teams/mine`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    }
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const msg = text || `Failed to fetch teams (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  return Array.isArray(data) ? data : [];
};

const isLeaderForProject = (teams, userId, projectId) => {
  const pid = `${projectId || ''}`;
  const uid = `${userId || ''}`;
  if (!pid || !uid) return false;

  const team = (teams || []).find(t => `${t?.projectId || ''}` === pid);
  if (!team) return false;

  return (team?.members || []).some(m => `${m?.userId}` === uid && m?.role === 'TEAM_LEADER');
};

const requireLeaderOrAdmin = async (req, res, projectId) => {
  if (req.user?.role === 'ADMIN') return true;

  const token = getBearerToken(req);
  if (!token) {
    res.status(401).json({ message: 'Authentication required' });
    return false;
  }

  try {
    const teams = await fetchMyProjectTeams(token);
    const ok = isLeaderForProject(teams, req.user?.id, projectId);
    if (!ok) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return false;
    }
    return true;
  } catch (e) {
    if (e?.status === 401) {
      res.status(401).json({ message: 'Authentication required' });
      return false;
    }
    if (e?.status === 403) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return false;
    }
    res.status(503).json({ message: 'Unable to validate team leadership right now' });
    return false;
  }
};

// Get all tasks (with optional filters)
export const getAllTasks = async (req, res) => {
  try {
    const { teamId, status, userId } = req.query;
    const filter = {};

    if (teamId) filter.teamId = teamId;
    if (status) filter.status = status;
    if (userId) {
      filter.assignees = { $elemMatch: { userId } };
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Server error fetching tasks' });
  }
};

// Get task by ID
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ message: 'Server error fetching task' });
  }
};

// Create new task
export const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, teamId, dueDate, assignees } = req.body;
    
    if (!title || !teamId) {
      return res.status(400).json({ message: 'Title and teamId are required' });
    }

    if (req.user?.role !== 'ADMIN') {
      const token = getBearerToken(req);
      if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      try {
        const teams = await fetchMyProjectTeams(token);
        const ok = isLeaderForProject(teams, req.user?.id, teamId);
        if (!ok) {
          return res.status(403).json({ message: 'Only the team leader of the assigned team can create tasks for this project' });
        }
      } catch (e) {
        if (e?.status === 401) return res.status(401).json({ message: 'Authentication required' });
        if (e?.status === 403) return res.status(403).json({ message: 'Insufficient permissions' });
        return res.status(503).json({ message: 'Unable to validate team leadership right now' });
      }
    }

    const task = new Task({
      title,
      description: description || '',
      status: status || 'TODO',
      priority: priority || 'Medium',
      teamId,
      createdBy: req.user.id,
      dueDate: dueDate ? new Date(dueDate) : null,
      assignees: assignees || []
    });

    await task.save();

    sendToAll('task_created', {
      taskId: task._id?.toString?.() || task.id,
      teamId: task.teamId
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Server error creating task' });
  }
};

// Update task
export const updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignees } = req.body;
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const targetTeamId = req.body?.teamId || task.teamId;
    const allowed = await requireLeaderOrAdmin(req, res, targetTeamId);
    if (!allowed) return;

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;
    if (assignees !== undefined) task.assignees = assignees;

    await task.save();

    sendToAll('task_updated', {
      taskId: task._id?.toString?.() || task.id,
      teamId: task.teamId
    });

    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Server error updating task' });
  }
};

// Update task status
export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['TODO', 'IN_PROGRESS', 'DONE'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const allowed = await requireLeaderOrAdmin(req, res, task.teamId);
    if (!allowed) return;

    task.status = status;
    await task.save();

    sendToAll('task_status_changed', {
      taskId: task._id?.toString?.() || task.id,
      teamId: task.teamId,
      status: task.status
    });
    
    res.json(task);
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ message: 'Server error updating task status' });
  }
};

// Delete task
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const allowed = await requireLeaderOrAdmin(req, res, task.teamId);
    if (!allowed) return;

    const taskId = task._id?.toString?.() || task.id;
    const teamId = task.teamId;

    await Task.findByIdAndDelete(req.params.id);

    sendToAll('task_deleted', { taskId, teamId });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Server error deleting task' });
  }
};

// Assign task to user
export const assignTask = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is already assigned
    if (task.assignees.some(a => a.userId === userId)) {
      return res.status(400).json({ message: 'User is already assigned to this task' });
    }

    task.assignees.push({
      userId,
      assignedAt: new Date()
    });

    await task.save();

    const lastAssignee = task.assignees[task.assignees.length - 1];
    sendToUser(userId, 'task_assigned', {
      taskId: task._id?.toString?.() || task.id,
      title: task.title,
      status: task.status,
      teamId: task.teamId,
      assignedAt: lastAssignee?.assignedAt
    });

    sendToAll('task_updated', {
      taskId: task._id?.toString?.() || task.id,
      teamId: task.teamId
    });

    res.json(task);
  } catch (error) {
    console.error('Error assigning task:', error);
    res.status(500).json({ message: 'Server error assigning task' });
  }
};

// Get task comments
export const getTaskComments = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).select('comments');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task.comments);
  } catch (error) {
    console.error('Error fetching task comments:', error);
    res.status(500).json({ message: 'Server error fetching task comments' });
  }
};

// Add comment to task
export const addTaskComment = async (req, res) => {
  try {
    const { comment } = req.body;
    
    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.comments.push({
      userId: req.user.id,
      username: req.user.username || 'User',
      comment: comment.trim(),
      createdAt: new Date()
    });

    await task.save();
    res.json(task.comments[task.comments.length - 1]);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error adding comment' });
  }
};

