import { Router } from 'express';
import Task from './models/Task.js'; 
import { authenticate } from './middleware/auth.js';

const router = Router();

//create a task
router.post('/create', authenticate, async (req, res) => {
    try {
        const newTask = new Task(req.body); 
        const savedTask = await newTask.save(); 
        res.status(201).json(savedTask); 
    } catch (err) {
        res.status(500).json({ error: err.message}); 
    }
});

//Get tasks from a specific team 
router.get('/team/:teamId', async (req, res) => {
    try {
        const tasks = await Task.find({ teamId: req.params.teamId}); 
        res.json(tasks); 
    } catch (err) {
        res.status(500).json({ error: err.message}); 
    }
});

export default router; 