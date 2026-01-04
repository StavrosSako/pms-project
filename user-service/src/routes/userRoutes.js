import express from 'express'; 
import { signup, login, getPendingUsers, activateUser, rejectUser, getAllUsers} from '../controllers/userController.js';

const router = express.Router(); 


//public route for signing up.
router.post('/signup', signup); 
router.post('/login', login); 

// Protected routes (would normally use auth middleware, but for now accessible)
router.get('/pending', getPendingUsers);
router.patch('/activate/:id', activateUser);
router.delete('/pending/:id', rejectUser);
router.get('/', getAllUsers); // Get all active users


export default router;