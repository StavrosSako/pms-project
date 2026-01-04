import { teamClient } from './client.js';

export const teamService = {
  // Teams/Projects
  getAllTeams: async () => {
    try {
      const response = await teamClient.get('/api/teams');
      return response.data;
    } catch (error) {
      // If service doesn't exist yet, return empty array
      if (error.code === 'ECONNREFUSED' || error.response?.status >= 500) {
        console.warn('Team service not available, returning empty array');
        return [];
      }
      throw error;
    }
  },

  getTeamById: async (teamId) => {
    const response = await teamClient.get(`/api/teams/${teamId}`);
    return response.data;
  },

  createTeam: async (teamData) => {
    const response = await teamClient.post('/api/teams', teamData);
    return response.data;
  },

  updateTeam: async (teamId, teamData) => {
    const response = await teamClient.put(`/api/teams/${teamId}`, teamData);
    return response.data;
  },

  deleteTeam: async (teamId) => {
    const response = await teamClient.delete(`/api/teams/${teamId}`);
    return response.data;
  },

  // Team members
  getTeamMembers: async (teamId) => {
    try {
      const response = await teamClient.get(`/api/teams/${teamId}/members`);
      return response.data;
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.response?.status >= 500) {
        console.warn('Team service not available');
        return [];
      }
      throw error;
    }
  },

  addMember: async (teamId, userId) => {
    const response = await teamClient.post(`/api/teams/${teamId}/members`, { userId });
    return response.data;
  },

  removeMember: async (teamId, userId) => {
    const response = await teamClient.delete(`/api/teams/${teamId}/members/${userId}`);
    return response.data;
  },

  // Note: getAllUsers should use userService, not teamService
  // This is kept for backward compatibility but should not be used
  getAllUsers: async () => {
    console.warn('getAllUsers should be called from userService, not teamService');
    return [];
  }
};

