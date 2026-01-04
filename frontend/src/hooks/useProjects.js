import { useState, useEffect } from 'react';
import { teamService } from '../api/teamService';
import { subscribeSse } from '../api/sseClient';

export const useProjects = (filters = {}) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getProjectId = (project) => project?.id || project?._id;

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await teamService.getAllProjects();
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const upsert = (incoming) => {
      const id = `${getProjectId(incoming) || ''}`;
      if (!id) return;
      setProjects(prev => {
        const idx = (prev || []).findIndex(p => `${getProjectId(p) || ''}` === id);
        if (idx === -1) return [...(prev || []), incoming];
        const next = [...prev];
        next[idx] = incoming;
        return next;
      });
    };

    const remove = (projectId) => {
      const id = `${projectId || ''}`;
      if (!id) return;
      setProjects(prev => (prev || []).filter(p => `${getProjectId(p) || ''}` !== id));
    };

    const unsubscribe = subscribeSse({
      url: 'http://localhost:8082/api/notifications/stream',
      token,
      onEvent: (evt) => {
        if (evt.event === 'project_created' || evt.event === 'project_updated') {
          if (evt.data?.project) upsert(evt.data.project);
          return;
        }
        if (evt.event === 'project_deleted') {
          remove(evt.data?.projectId);
        }
      },
      onError: () => {
        // Keep silent
      }
    });

    return () => unsubscribe?.();
  }, []);

  const createProject = async (projectData) => {
    try {
      const newProject = await teamService.createProject(projectData);
      const id = `${getProjectId(newProject) || ''}`;
      setProjects(prev => {
        if (!id) return [...(prev || []), newProject];
        const idx = (prev || []).findIndex(p => `${getProjectId(p) || ''}` === id);
        if (idx === -1) return [...(prev || []), newProject];
        const next = [...prev];
        next[idx] = newProject;
        return next;
      });
      return { success: true, data: newProject };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to create project' };
    }
  };

  const updateProject = async (projectId, projectData) => {
    try {
      const updated = await teamService.updateProject(projectId, projectData);
      setProjects(prev => prev.map(p => (`${getProjectId(p)}` === `${projectId}` ? updated : p)));
      return { success: true, data: updated };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to update project' };
    }
  };

  const deleteProject = async (projectId) => {
    try {
      await teamService.deleteProject(projectId);
      setProjects(prev => prev.filter(p => `${getProjectId(p)}` !== `${projectId}`));
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
        const data = await teamService.getAllProjects();
        setProjects(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };
};

