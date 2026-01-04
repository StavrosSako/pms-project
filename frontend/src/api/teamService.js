import { teamClient } from './client.js';

export const teamService = {
  getAllProjects: async () => {
    try {
      const response = await teamClient.get('/api/projects');
      return response.data;
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.response?.status >= 500) {
        console.warn('Team service not available, returning empty array');
        return [];
      }
      throw error;
    }
  },

  createProject: async (projectData) => {
    const response = await teamClient.post('/api/projects', projectData);
    return response.data;
  },

  updateProject: async (projectId, projectData) => {
    const response = await teamClient.put(`/api/projects/${projectId}`, projectData);
    return response.data;
  },

  deleteProject: async (projectId) => {
    const response = await teamClient.delete(`/api/projects/${projectId}`);
    return response.data;
  },

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

  getMyProjectTeams: async () => {
    const response = await teamClient.get('/api/project-teams/mine');
    return response.data;
  },

  getProjectTeamById: async (teamId) => {
    const response = await teamClient.get(`/api/project-teams/${teamId}`);
    return response.data;
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

  getAllProjectTeams: async () => {
    try {
      const response = await teamClient.get('/api/project-teams');
      return response.data;
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.response?.status >= 500) {
        console.warn('Team service not available, returning empty array');
        return [];
      }
      throw error;
    }
  },

  createProjectTeam: async (teamData) => {
    const response = await teamClient.post('/api/project-teams', teamData);
    return response.data;
  },

  updateProjectTeam: async (teamId, teamData) => {
    const response = await teamClient.put(`/api/project-teams/${teamId}`, teamData);
    return response.data;
  },

  setProjectTeamLeader: async (teamId, userId) => {
    const response = await teamClient.patch(`/api/project-teams/${teamId}/leader`, { userId });
    return response.data;
  },

  addProjectTeamMember: async (teamId, userId) => {
    const response = await teamClient.post(`/api/project-teams/${teamId}/members`, { userId });
    return response.data;
  },

  removeProjectTeamMember: async (teamId, userId) => {
    const response = await teamClient.delete(`/api/project-teams/${teamId}/members/${userId}`);
    return response.data;
  },

  deleteProjectTeam: async (teamId) => {
    const response = await teamClient.delete(`/api/project-teams/${teamId}`);
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

