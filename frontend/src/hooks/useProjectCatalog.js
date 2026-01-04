import { useEffect, useState } from 'react';
import { teamService } from '../api/teamService';

export const useProjectCatalog = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return { projects, loading, error };
};
