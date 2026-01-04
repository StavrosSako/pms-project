import { useState, useEffect } from 'react';
import { taskService } from '../api/taskService';

export const useTasks = (filters = {}) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getTaskId = (task) => task?.id || task?._id;

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await taskService.getAllTasks(filters);
        setTasks(data);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError(err.message);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [JSON.stringify(filters)]);

  const createTask = async (taskData) => {
    try {
      const newTask = await taskService.createTask(taskData);
      setTasks([...tasks, newTask]);
      return { success: true, data: newTask };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to create task' };
    }
  };

  const updateTask = async (taskId, taskData) => {
    try {
      const updated = await taskService.updateTask(taskId, taskData);
      setTasks(tasks.map(t => (getTaskId(t) === taskId ? updated : t)));
      return { success: true, data: updated };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to update task' };
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      const updated = await taskService.updateTaskStatus(taskId, status);
      setTasks(tasks.map(t => (getTaskId(t) === taskId ? updated : t)));
      return { success: true, data: updated };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to update task status' };
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(taskId);
      setTasks(tasks.filter(t => getTaskId(t) !== taskId));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to delete task' };
    }
  };

  // Group tasks by status for Kanban board
  const getTasksByStatus = () => {
    const grouped = {
      'TODO': [],
      'IN_PROGRESS': [],
      'DONE': []
    };

    tasks.forEach(task => {
      const status = task.status?.toUpperCase() || 'TODO';
      if (grouped[status]) {
        grouped[status].push(task);
      } else {
        grouped['TODO'].push(task);
      }
    });

    return grouped;
  };

  return { 
    tasks, 
    loading, 
    error, 
    createTask, 
    updateTask, 
    updateTaskStatus,
    deleteTask,
    getTasksByStatus,
    refetch: async () => {
      setLoading(true);
      try {
        const data = await taskService.getAllTasks(filters);
        setTasks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };
};

