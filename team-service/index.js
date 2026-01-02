import express, { json } from "express";
import connectDB from "./db.js";
import dotenv from  "dotenv";
import teamRoutes from './routes.js'

dotenv.config();
const app = express(); 
app.use(json()); 

//connect MongoDB
connectDB();

app.use('/teams', teamRoutes); 

const PORT = process.env.PORT || 8082;



app.listen(PORT, () => {
    console.log(`Team service is running on port ${PORT}`);
});