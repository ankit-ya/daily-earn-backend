const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.header('x-auth-token');
    console.log('Token from request headers:', token); // Log token

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded); // Log decoded token
        req.user = decoded; // Attach user data to the request
        next();
    } catch (err) {
        console.log('Token verification failed:', err.message); // Log error message
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

const adminMiddleware = (req, res, next) => {
    console.log('Admin check:', req.user); // Log the user object
    if (req.user && req.user.isAdmin) {
        console.log('Admin access granted');
        console.log('Decoded token:', req.user); // Add this to authMiddleware

        next();
    } else {
        console.log('Admin access denied');
        return res.status(403).json({ msg: 'Admin access required' });
    }
};

module.exports = { authMiddleware, adminMiddleware };
