import express from 'express';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} from '../controllers/projectController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAllProjects);
router.get('/:id', getProjectById);

router.post('/', authorize('ADMIN'), createProject);
router.put('/:id', authorize('ADMIN'), updateProject);
router.delete('/:id', authorize('ADMIN'), deleteProject);

export default router;
