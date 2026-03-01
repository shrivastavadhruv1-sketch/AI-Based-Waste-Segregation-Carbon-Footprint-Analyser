const jwt = require('jsonwebtoken');
const { db } = require('../config/firebase');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (!db) {
                return res.status(500).json({ message: 'Firebase DB not initialized.' });
            }

            // Get user from Firestore using token ID
            const userDoc = await db.collection('users').doc(decoded.userId).get();

            if (!userDoc.exists) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            // Attach user data + id
            req.user = { id: userDoc.id, ...userDoc.data() };
            next();
        } catch (error) {
            console.error('Token verification failed:', error.message);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user && (req.user.role === 'org_admin' || req.user.role === 'super_admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, adminOnly };
