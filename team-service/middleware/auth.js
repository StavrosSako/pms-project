import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
    //fist wee need to get the toke from the request header
    const authHeader = req.headers['authorization']; 
    const token = authHeader && authHeader.split(' ')[1]; //format "Bearer <TOKEN>" 

    if (!token) {
        return res.status(401).json({ error: "Access Denied. No token provided!"}); 
    }

    try { 
        // second we are going to verify the token using the same secret key from User Service
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;  // add the user data (id, role) to the request object 
        next(); //move to the next function (the actual route)

    } catch (err) { 
        res.status(400).json({ error: "Invalid Token"});
    }
    
};