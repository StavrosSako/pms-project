import { useEffect, useState } from 'react';
import { teamService } from '../api/teamService';
import { subscribeSse } from '../api/sseClient';

export const useProjectCatalog = () => {
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
        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load projects');
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

  return { projects, loading, error };
};
