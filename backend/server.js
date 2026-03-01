const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Important: Doing this requires config/firebase.js to run and initialize the Admin SDK globally immediately on startup!
require('./config/firebase');

const app = express();

// Middleware
app.use(express.json());
app.use(cors()); // Allow all origin requests

// Mount Routes
const authRoutes = require('./routes/auth');
const scanRoutes = require('./routes/scans');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/admin', adminRoutes);

// Test Health Route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', server: 'Node.js Backend with Firebase Firestore', time: new Date() });
});

// Server Startup
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Node server running on port ${PORT}`);
});
