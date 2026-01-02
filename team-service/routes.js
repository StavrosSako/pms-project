import {Router} from 'express'; 
import Team from './models/Team.js'; 
import { authenticate } from './middleware/auth.js';

const router = Router(); 

//Create a new team (only for authenticated users)
router.post('/create', authenticate, async (req, res) => {
    const { name, description, members } = req.body; 

    try {
        const newTeam = new Team({
            name,
            description,
            leaderId: req.user.id, //taken from the jwt token
            members: members || []
        });

        const savedTime = await newTeam.save(); 
        res.status(201).json(savedTime); 
    } catch (err) {
        res.status(500).json({ error: err.message}); 
    }
}); 

router.get('/all', async (req, res) => {
    try {
        const teams = await Team.find(); 
        res.json(teams); 
    } catch (err) {
        res.status(500).json({ error: err.message}); 
    }
});

//update a team e.g. add members. 

router.put('/update/:id', authenticate, async (req, res) => {
    try {
        const updatedTeam = await Team.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true} //returns the updated document
        );
        res.json(updatedTeam); 

    } catch (err) {
        res.status(500).json({ error: err.message}); 
    }
});



export default router; 