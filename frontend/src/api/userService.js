import { userClient } from './client.js';

export const userService = {
  // Authentication
  login: async (email, password) => {
    const response = await userClient.post('/api/users/login', { email, password });
    return response.data;
  },

  signup: async (userData) => {
    const response = await userClient.post('/api/users/signup', userData);
    return response.data;
  },

  // User management (admin functions)
  getPendingUsers: async () => {
    const response = await userClient.get('/api/users/pending');
    return response.data;
  },

  activateUser: async (userId) => {
    const response = await userClient.patch(`/api/users/activate/${userId}`);
    return response.data;
  },

  // Get current user info
  getCurrentUser: async () => {
    // Get from localStorage or verify with backend
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  // Update user profile
  updateProfile: async (userId, profileData) => {
    const response = await userClient.put(`/api/users/${userId}`, profileData);
    return response.data;
  },

  // Get all active users (for team directory)
  getAllUsers: async () => {
    try {
      const response = await userClient.get('/api/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }
};

