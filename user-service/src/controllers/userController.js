import db from '../config/db.js';
import bcrypt from 'bcryptjs'; 
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendToRole } from '../realtime/notificationHub.js';



//singup function 
export const signup = async (req, res) => {
    const { username, email, password, firstName, lastName, role } = req.body; 

    try {
        //checking first if the user already exists
        const [existingUser] = await db.query('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: "Username or Email already exists."}); 
        }

        //next we need to hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let userUid;
        for (let attempt = 0; attempt < 5; attempt++) {
            const candidate = crypto.randomInt(10000000, 99999999); // 8-digit
            const [existingUid] = await db.query('SELECT id FROM users WHERE user_uid = ?', [candidate]);
            if (!existingUid.length) {
                userUid = candidate;
                break;
            }
        }

        if (!userUid) {
            return res.status(500).json({ message: "Failed to generate UserID. Please try again." });
        }

        //inserting into MySQL (is_active defaults to fasle in the schema)
        const [result] = await db.query(
            'INSERT INTO users (user_uid, username, email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userUid, username, email, hashedPassword, firstName, lastName, role]
        );

        sendToRole('ADMIN', 'pending_created', {
            id: result.insertId,
            username,
            email,
            role
        });

        //Next we need to return the success message
        res.status(201).json({
            message: "Registration successful! Your account is pending admin activation!",
            userId: result.insertId,
            userUid
        }); 
    } catch (err) {
        console.log("Signup error:", err);
        res.status(500).json({ message: "Server error during Registration!"}); 

        
    }
};

export const login = async (req, res) => {
    console.log("Login request received for:", req.body.email); // Debug log
    const { email, password } = req.body;

    try {
        // 1. Find user
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];

        if (!user) {
            console.log("User not found");
            return res.status(401).json({ message: "Invalid email or password." });
        }

        // 2. Check Activation
        if (!user.is_active ) {
            console.log("User found but NOT active");
            return res.status(403).json({ message: "Account pending admin activation." });
        }

        // 3. Check Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("Password mismatch");
            return res.status(401).json({ message: "Invalid email or password." });
        }

        // 4. Create JWT
        // Note: Ensure JWT_SECRET exists in .env
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Backfill user_uid for existing accounts that were created before user_uid existed
        if (!user.user_uid) {
            let userUid;
            for (let attempt = 0; attempt < 5; attempt++) {
                const candidate = crypto.randomInt(10000000, 99999999); // 8-digit
                const [existingUid] = await db.query('SELECT id FROM users WHERE user_uid = ?', [candidate]);
                if (!existingUid.length) {
                    userUid = candidate;
                    break;
                }
            }

            if (userUid) {
                await db.query('UPDATE users SET user_uid = ? WHERE id = ?', [userUid, user.id]);
                user.user_uid = userUid;
            }
        }

        console.log("Login successful, token generated");
        res.json({
            token,
            user: {
                id: user.id,
                userUid: user.user_uid,
                username: user.username,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role
            }
        });

    } catch (err) {
        console.error("Detailed Login Error:", err); // This will tell us if 'jwt' or 'db' is undefined
        res.status(500).json({ message: "Server error during login." });
    }
};

// Get all users waiting for activation
export const getPendingUsers = async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, username, email, role, created_at FROM users WHERE is_active = 0'
        );
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Error fetching pending users" });
    }
};

// Activate a user
export const activateUser = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('UPDATE users SET is_active = 1 WHERE id = ?', [id]);
        sendToRole('ADMIN', 'pending_resolved', { id });
        res.json({ message: "User activated successfully!" });
    } catch (err) {
        res.status(500).json({ message: "Error activating user" });
    }
};

// Reject (delete) a pending user
export const rejectUser = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM users WHERE id = ? AND is_active = 0', [id]);

        if (!result?.affectedRows) {
            return res.status(404).json({ message: 'Pending user not found' });
        }

        sendToRole('ADMIN', 'pending_resolved', { id, action: 'rejected' });
        res.json({ message: 'User rejected successfully!' });
    } catch (err) {
        res.status(500).json({ message: 'Error rejecting user' });
    }
};

// Get all users (for admin/team management)
export const getAllUsers = async (req, res) => {
    try {
        // Only return active users for team directory
        const [users] = await db.query(
            'SELECT id, user_uid, username, email, first_name, last_name, role, is_active FROM users WHERE is_active = 1'
        );
        
        // Format the response to match expected structure
        const formattedUsers = users.map(user => ({
            id: user.id,
            userUid: user.user_uid,
            username: user.username,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
            role: user.role,
            isActive: user.is_active
        }));
        
        res.json(formattedUsers);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ message: "Error fetching users" });
    }
};

