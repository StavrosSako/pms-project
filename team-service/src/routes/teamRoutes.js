import express from 'express';
import {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  getTeamMembers,
  addTeamMember,
  removeTeamMember
} from '../controllers/teamController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Public team routes (authenticated users)
router.get('/', getAllTeams);
router.get('/:id', getTeamById);
router.post('/', createTeam);
router.put('/:id', updateTeam);
router.delete('/:id', deleteTeam);

// Team member routes
router.get('/:id/members', getTeamMembers);
router.post('/:id/members', addTeamMember);
router.delete('/:id/members/:userId', removeTeamMember);

export default router;

