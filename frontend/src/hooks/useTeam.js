import { useState, useEffect } from 'react';
import { teamService } from '../api/teamService';
import { userService } from '../api/userService';

export const useTeam = (teamId = null) => {
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // If teamId provided, fetch team members
        if (teamId) {
          const teamMembers = await teamService.getTeamMembers(teamId);
          setMembers(teamMembers);
          setAllUsers(teamMembers);
        } else {
          // For team directory page, get all users from user-service
          const users = await userService.getAllUsers();
          setMembers(users);
          setAllUsers(users);
        }
      } catch (err) {
        console.error('Error fetching team data:', err);
        setError(err.message);
        setMembers([]);
        setAllUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teamId]);

  const addMember = async (userId) => {
    if (!teamId) return { success: false, error: 'No team ID provided' };

    try {
      await teamService.addMember(teamId, userId);
      const updatedMembers = await teamService.getTeamMembers(teamId);
      setMembers(updatedMembers);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to add member' };
    }
  };

  const removeMember = async (userId) => {
    if (!teamId) return { success: false, error: 'No team ID provided' };

    try {
      await teamService.removeMember(teamId, userId);
      setMembers(members.filter(m => m.id !== userId));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to remove member' };
    }
  };

  return { 
    members, 
    allUsers,
    loading, 
    error, 
    addMember, 
    removeMember 
  };
};

