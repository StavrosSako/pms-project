import { taskClient } from './client.js';

export const taskService = {
  // Tasks
  getAllTasks: async (filters = {}) => {
    try {
      const response = await taskClient.get('/api/tasks', { params: filters });
      return response.data;
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.response?.status >= 500) {
        console.warn('Task service not available, returning empty array');
        return [];
      }
      throw error;
    }
  },

  getTaskById: async (taskId) => {
    const response = await taskClient.get(`/api/tasks/${taskId}`);
    return response.data;
  },

  createTask: async (taskData) => {
    const response = await taskClient.post('/api/tasks', taskData);
    return response.data;
  },

  updateTask: async (taskId, taskData) => {
    const response = await taskClient.put(`/api/tasks/${taskId}`, taskData);
    return response.data;
  },

  deleteTask: async (taskId) => {
    const response = await taskClient.delete(`/api/tasks/${taskId}`);
    return response.data;
  },

  // Task status update
  updateTaskStatus: async (taskId, status) => {
    const response = await taskClient.patch(`/api/tasks/${taskId}/status`, { status });
    return response.data;
  },

  // Assign task to user
  assignTask: async (taskId, userId) => {
    const response = await taskClient.post(`/api/tasks/${taskId}/assign`, { userId });
    return response.data;
  },

  // Comments
  getTaskComments: async (taskId) => {
    try {
      const response = await taskClient.get(`/api/tasks/${taskId}/comments`);
      return response.data;
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.response?.status >= 500) {
        return [];
      }
      throw error;
    }
  },

  addComment: async (taskId, comment) => {
    const response = await taskClient.post(`/api/tasks/${taskId}/comments`, { comment });
    return response.data;
  },

  // Dashboard stats
  getDashboardStats: async (userId) => {
    try {
      const response = await taskClient.get(`/api/dashboard/stats`, { params: { userId } });
      return response.data;
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.response?.status >= 500) {
        // Return default stats if service unavailable
        return {
          activeProjects: 0,
          pendingTasks: 0,
          completedTasks: 0
        };
      }
      throw error;
    }
  }
};

