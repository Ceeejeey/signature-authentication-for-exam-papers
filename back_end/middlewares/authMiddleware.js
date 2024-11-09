// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    
    const token = req.cookies.refreshToken;
    
    if (!token) {
        // return res.redirect('/signin'); // No token found, redirect to sign-in
        return res.status(401).json({ message: 'No token found. Please sign in.' });
    }
 
    jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
        if (err) {
            // If refresh token is invalid or expired, clear the cookie and redirect
            res.clearCookie('refreshToken');
            // return res.redirect('/signin');
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
 
        req.user = decoded;
        console.log('User info:', req.user);
        next(); // Proceed to the dashboard or next middleware
    });
};
 

module.exports = authenticateToken;