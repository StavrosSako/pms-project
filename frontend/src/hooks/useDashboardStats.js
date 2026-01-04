import { useState, useEffect } from 'react';
import { taskService } from '../api/taskService';
import { teamService } from '../api/teamService';

export const useDashboardStats = (userId) => {
  const [stats, setStats] = useState({
    activeProjects: 0,
    pendingTasks: 0,
    completedTasks: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard stats from task service
        const taskStats = await taskService.getDashboardStats(userId);
        
        // Fetch active projects count
        const projects = await teamService.getAllTeams();
        const activeProjects = projects.filter(p => 
          p.status === 'Active' || p.status === 'In Progress'
        ).length;

        setStats({
          activeProjects,
          pendingTasks: taskStats.pendingTasks || 0,
          completedTasks: taskStats.completedTasks || 0
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Keep default values on error
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [userId]);

  return { stats, loading };
};

