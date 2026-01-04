import express from 'express';
import {
  getAllProjectTeams,
  getMyProjectTeams,
  getProjectTeamById,
  createProjectTeam,
  updateProjectTeam,
  deleteProjectTeam,
  getProjectTeamMembers,
  addProjectTeamMember,
  removeProjectTeamMember,
  setProjectTeamLeader
} from '../controllers/projectTeamController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('ADMIN'), getAllProjectTeams);
router.get('/mine', getMyProjectTeams);
router.get('/:id', getProjectTeamById);

router.post('/', authorize('ADMIN'), createProjectTeam);
router.put('/:id', authorize('ADMIN'), updateProjectTeam);
router.delete('/:id', authorize('ADMIN'), deleteProjectTeam);

router.get('/:id/members', authorize('ADMIN'), getProjectTeamMembers);
router.post('/:id/members', authorize('ADMIN'), addProjectTeamMember);
router.delete('/:id/members/:userId', authorize('ADMIN'), removeProjectTeamMember);
router.patch('/:id/leader', authorize('ADMIN'), setProjectTeamLeader);

export default router;
