import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import teamRoutes from './routes/teamRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import projectTeamRoutes from './routes/projectTeamRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { sendKeepAlive } from './realtime/notificationHub.js';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/teams', teamRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/project-teams', projectTeamRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'team-service' });
});

const PORT = process.env.PORT || 8082;
app.listen(PORT, () => {
  console.log(`Team Service running on port ${PORT}`);
});

setInterval(sendKeepAlive, 25000);

