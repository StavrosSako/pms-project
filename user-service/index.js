import express, { json } from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes.js'; // Import your organized routes

dotenv.config();

const app = express();
app.use(json());

// Use the routes we just created
app.use('/users', userRoutes); 

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});