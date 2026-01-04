import { useEffect, useState } from 'react';
import { teamService } from '../api/teamService';

export const useMyTeams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await teamService.getMyProjectTeams();
        setTeams(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load teams');
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  return { teams, loading, error };
};
