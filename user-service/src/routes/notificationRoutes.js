import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { streamNotifications } from '../controllers/notificationController.js';

const router = express.Router();

router.get('/stream', authenticate, streamNotifications);

export default router;
