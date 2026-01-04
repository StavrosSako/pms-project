import Task from '../models/Task.js';

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const { userId, teamId } = req.query;

    const filter = {};
    if (teamId) {
      filter.teamId = teamId;
    }
    if (userId) {
      // Get tasks assigned to user or created by user
      filter.$or = [
        { 'assignees.userId': userId },
        { createdBy: userId }
      ];
    }

    const tasks = await Task.find(filter);

    const stats = {
      pendingTasks: tasks.filter(t => t.status === 'TODO').length,
      inProgressTasks: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      completedTasks: tasks.filter(t => t.status === 'DONE').length,
      totalTasks: tasks.length
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error fetching dashboard stats' });
  }
};

