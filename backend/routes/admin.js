const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly);

// GET /api/admin/users
router.get('/users', async (req, res) => {
    try {
        const snapshot = await db.collection('users')
            .where('organization', '==', req.user.organization)
            .get();

        const users = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            delete data.password; // Omit password
            users.push({ id: doc.id, ...data });
        });

        res.status(200).json(users);
    } catch (error) {
        console.error('Admin Fetch Users Error:', error);
        res.status(500).json({ message: 'Error fetching organization users' });
    }
});

// GET /api/admin/scans
router.get('/scans', async (req, res) => {
    try {
        // Fetch users map globally first to attach names to scans (since NoSQL prevents JOINS)
        const usersSnapshot = await db.collection('users').where('organization', '==', req.user.organization).get();
        const usersMap = {};
        usersSnapshot.forEach(doc => {
            const data = doc.data();
            usersMap[doc.id] = { name: data.name, email: data.email };
        });

        // Fetch Scans
        const scansSnapshot = await db.collection('scans').where('organization', '==', req.user.organization).get();
        const scans = [];

        scansSnapshot.forEach(doc => {
            const scanData = doc.data();
            // Attach nested user info to emulate mongoose populate/postgres join output structure
            scanData.userId = usersMap[scanData.userId] || { name: 'Unknown', email: 'Unknown' };
            scans.push({ id: doc.id, ...scanData });
        });

        // Sort descending by created manually as we don't have composite indexes yet
        scans.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

        res.status(200).json(scans);
    } catch (error) {
        console.error('Admin Fetch Scans Error:', error);
        res.status(500).json({ message: 'Error fetching organization scans' });
    }
});

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
    try {
        const org = req.user.organization;

        const usersSnapshot = await db.collection('users').where('organization', '==', org).get();
        const scansSnapshot = await db.collection('scans').where('organization', '==', org).get();

        const usersMap = {};
        usersSnapshot.forEach(doc => {
            usersMap[doc.id] = doc.data();
        });

        let totalWeightKg = 0;
        let totalCarbonSaved = 0;
        const categoryBreakdown = { Biodegradable: 0, Recyclable: 0, Hazardous: 0, 'E-Waste': 0 };

        const workerScanCount = {};

        const dailyScans = {};
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dayStr = d.toISOString().split('T')[0];
            dailyScans[dayStr] = 0;
        }

        scansSnapshot.forEach(doc => {
            const scan = doc.data();
            totalWeightKg += scan.weightKg;
            totalCarbonSaved += scan.carbonSaved;

            if (categoryBreakdown[scan.wasteType] !== undefined) {
                categoryBreakdown[scan.wasteType] += 1;
            }

            if (scan.createdAt && scan.createdAt.toDate) {
                const scanDay = scan.createdAt.toDate().toISOString().split('T')[0];
                if (dailyScans[scanDay] !== undefined) {
                    dailyScans[scanDay] += 1;
                }
            }

            const uId = scan.userId;
            workerScanCount[uId] = (workerScanCount[uId] || 0) + 1;
        });

        const topWorkerIds = Object.keys(workerScanCount).sort((a, b) => workerScanCount[b] - workerScanCount[a]).slice(0, 5);

        const topWorkers = topWorkerIds.map(id => ({
            name: usersMap[id] ? usersMap[id].name : 'Unknown User',
            email: usersMap[id] ? usersMap[id].email : 'N/A',
            scans: workerScanCount[id]
        }));

        res.status(200).json({
            totalUsers: usersSnapshot.size,
            totalScans: scansSnapshot.size,
            totalWeightKg,
            totalCarbonSaved,
            categoryBreakdown,
            dailyScans,
            topWorkers
        });
    } catch (error) {
        console.error('Admin Fetch Stats Error:', error);
        res.status(500).json({ message: 'Error fetching organization stats' });
    }
});

module.exports = router;
