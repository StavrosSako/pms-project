import { useCallback, useEffect, useState } from 'react';
import { taskService } from '../api/taskService';

export const useDashboardStats = (userId, teamId) => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch dashboard stats from task service (filtered to selected project)
      const taskStats = await taskService.getDashboardStats(userId, teamId);

      setStats({
        totalTasks: taskStats.totalTasks || 0,
        pendingTasks: taskStats.pendingTasks || 0,
        inProgressTasks: taskStats.inProgressTasks || 0,
        completedTasks: taskStats.completedTasks || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Keep default values on error
    } finally {
      setLoading(false);
    }
  }, [teamId, userId]);

  useEffect(() => {
    if (teamId) {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [fetchStats, teamId]);

  return { stats, loading, refetch: fetchStats };
};

