import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import initDb from './models/init.js';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { sendKeepAlive } from './realtime/notificationHub.js';


const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json());

// Initialize Database
initDb();

app.use('/api/users', userRoutes); 
app.use('/api/notifications', notificationRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});

setInterval(sendKeepAlive, 25000);