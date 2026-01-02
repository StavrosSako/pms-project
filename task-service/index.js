import express, {json} from "express"; 
import connectDB from "./db.js";
import dotenv from "dotenv";
import taskRoutes from './routes.js'

dotenv.config(); 
const app = express(); 
app.use(json()); 

//connect MongoDB
connectDB(); 

app.use('/tasks', taskRoutes); 

const PORT = process.env.PORT || 8083; 

app.listen(PORT, () => {
    console.log(`Task service is running on ${PORT}`);
})

