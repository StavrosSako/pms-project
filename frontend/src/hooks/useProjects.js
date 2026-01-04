import { useState, useEffect } from 'react';
import { teamService } from '../api/teamService';

export const useProjects = (filters = {}) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await teamService.getAllTeams();
        setProjects(data);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError(err.message);
        // Don't throw, just set empty array so UI can still render
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const createProject = async (projectData) => {
    try {
      const newProject = await teamService.createTeam(projectData);
      setProjects([...projects, newProject]);
      return { success: true, data: newProject };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to create project' };
    }
  };

  const updateProject = async (projectId, projectData) => {
    try {
      const updated = await teamService.updateTeam(projectId, projectData);
      setProjects(projects.map(p => p.id === projectId ? updated : p));
      return { success: true, data: updated };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to update project' };
    }
  };

  const deleteProject = async (projectId) => {
    try {
      await teamService.deleteTeam(projectId);
      setProjects(projects.filter(p => p.id !== projectId));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to delete project' };
    }
  };

  return { 
    projects, 
    loading, 
    error, 
    createProject, 
    updateProject, 
    deleteProject,
    refetch: async () => {
      setLoading(true);
      try {
        const data = await teamService.getAllTeams();
        setProjects(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };
};

