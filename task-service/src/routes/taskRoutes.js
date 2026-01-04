import express from 'express';
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  assignTask,
  getTaskComments,
  addTaskComment
} from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Task routes
router.get('/', getAllTasks);
router.get('/:id', getTaskById);
router.post('/', createTask);
router.put('/:id', updateTask);
router.patch('/:id/status', updateTaskStatus);
router.delete('/:id', deleteTask);

// Task assignment
router.post('/:id/assign', assignTask);

// Task comments
router.get('/:id/comments', getTaskComments);
router.post('/:id/comments', addTaskComment);

export default router;

