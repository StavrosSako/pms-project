import { Router } from "express";
import bcrypt from 'bcryptjs';
import connection from "./db.js";
import jwt from 'jsonwebtoken';


const router = Router();

router.post('/register', async (req, res) => {
  const { username, email, password, first_name, last_name } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // We attempt to insert, if username/email exists, MySQL will return an error
    const sql = `INSERT INTO users (username, email, password, first_name, last_name, role, status) 
                 VALUES (?, ?, ?, ?, ?, 'MEMBER', 0)`;
    
    connection.query(sql, [username, email, hashedPassword, first_name, last_name], (err, result) => {
      if (err) {
        // Error code ER_DUP_ENTRY is MySQL's way of saying 'this already exists'
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: "Username or Email already taken" });
        }
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: "User registered! Waiting for admin approval" });
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post('/login', (req, res) => {
    const { username, password } = req.body; 

    const sql = "SELECT * FROM users WHERE username = ?"; 
    connection.query(sql, [username], async (err, results) => {
        if (err) {
            return res.status(500).json({error: err.message});
        }
        if (results.length === 0) {
            return res.status(401).json({error: "Invalid credentials"}); 
        }

        const user = results[0];
        //checking if admin acctivated the account 
        if (user.status === 0 ) {
            return res.status(403).json({error: "Account not yet activated by Admin"}); 
        }

        //Verify password
        const isMatch = await bcrypt.compare(password, user.password); 
        if (!isMatch) {
            return res.status(401).json({error: "Invalid credentials"}); 
        
        }
        //Issue JWT Token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );
        res.json({message: "Login successful!", token}); 
    });
});


//Admin activation Router
router.put('/activate/:id', (req, res) => {
    const userId = req.params.id; 
    const sql = "UPDATE users SET status = 1 WHERE id = ?";

    connection.query(sql, [userId], (err, result) => {
        if (err) {
            return res.status(500).json({error: message }); 
        }
        res.json({message: "User activated succesfully!"}); 
    });
});

// Admin Route: View all users to see their IDs and status
router.get('/all', (req, res) => {
  const sql = "SELECT id, username, email, role, status FROM users";
  connection.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});


export default router;


