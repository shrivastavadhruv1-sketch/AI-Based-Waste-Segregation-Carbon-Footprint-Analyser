const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { admin, db } = require('../config/firebase');

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        if (!db) return res.status(500).json({ message: 'Firebase credentials missing' });

        const { name, email, password, organization } = req.body;

        // Check if user exists
        const snapshot = await db.collection('users').where('email', '==', email).limit(1).get();
        if (!snapshot.empty) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new Document reference in Firestore
        const newUserRef = db.collection('users').doc();

        await newUserRef.set({
            name,
            email,
            password: hashedPassword,
            role: 'worker', // default
            organization,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(201).json({ message: 'Registered successfully' });
    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        if (!db) return res.status(500).json({ message: 'Firebase credentials missing' });

        const { email, password } = req.body;

        // Find the user by email
        const snapshot = await db.collection('users').where('email', '==', email).limit(1).get();
        if (snapshot.empty) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const userDoc = snapshot.docs[0];
        const user = userDoc.data();

        // Compare encrypted passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Determine payload
        const payload = {
            userId: userDoc.id,
            role: user.role,
            organization: user.organization
        };

        // Give JWT (valid for 7 days)
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({
            token,
            role: user.role,
            name: user.name,
            organization: user.organization
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

module.exports = router;
