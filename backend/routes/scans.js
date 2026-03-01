const express = require('express');
const router = express.Router();
const { admin, db } = require('../config/firebase');
const { protect } = require('../middleware/authMiddleware');

const carbonRates = {
    'Biodegradable': 0.5,
    'Recyclable': 1.2,
    'Hazardous': 2.0,
    'E-Waste': 3.5
};

// POST /api/scans/save (Protected)
router.post('/save', protect, async (req, res) => {
    try {
        const { wasteType, confidence, weightKg } = req.body;

        if (!wasteType || confidence == null || weightKg == null) {
            return res.status(400).json({ message: 'Missing required scan fields' });
        }

        const rate = carbonRates[wasteType] || 0;
        const carbonSaved = weightKg * rate;

        const newScanRef = db.collection('scans').doc();

        const scanData = {
            userId: req.user.id,
            organization: req.user.organization,
            wasteType,
            confidence,
            weightKg,
            carbonSaved,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await newScanRef.set(scanData);

        res.status(201).json({ id: newScanRef.id, ...scanData });
    } catch (error) {
        console.error('Save Scan Error:', error);
        res.status(500).json({ message: 'Server error saving scan' });
    }
});

// GET /api/scans/my (Protected)
router.get('/my', protect, async (req, res) => {
    try {
        const snapshot = await db.collection('scans')
            .where('userId', '==', req.user.id)
            .orderBy('createdAt', 'desc')
            .get();

        const scans = [];
        snapshot.forEach(doc => {
            scans.push({ id: doc.id, ...doc.data() });
        });

        res.status(200).json(scans);
    } catch (error) {
        console.error('Fetch My Scans Error:', error);

        // Firestore complex queries require exact composite indexes, so if the orderby fails, we'll try without order
        if (error.message.includes('index')) {
            console.log("Automatically retrying scans query without sorting due to missing Firestore Index");
            try {
                const snapshotFallback = await db.collection('scans').where('userId', '==', req.user.id).get();
                const scans = [];
                snapshotFallback.forEach(doc => scans.push({ id: doc.id, ...doc.data() }));

                // Sort array natively
                scans.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
                return res.status(200).json(scans);
            } catch (e) { }
        }

        res.status(500).json({ message: 'Error fetching scans' });
    }
});

// GET /api/scans/my/stats (Protected)
router.get('/my/stats', protect, async (req, res) => {
    try {
        const snapshot = await db.collection('scans').where('userId', '==', req.user.id).get();

        let totalWeightKg = 0;
        let totalCarbonSaved = 0;
        const categoryBreakdown = { Biodegradable: 0, Recyclable: 0, Hazardous: 0, 'E-Waste': 0 };
        const scansLength = snapshot.empty ? 0 : snapshot.docs.length;

        snapshot.forEach(doc => {
            const scan = doc.data();
            totalWeightKg += scan.weightKg;
            totalCarbonSaved += scan.carbonSaved;
            if (categoryBreakdown[scan.wasteType] !== undefined) {
                categoryBreakdown[scan.wasteType] += 1;
            }
        });

        res.status(200).json({
            totalScans: scansLength,
            totalWeightKg,
            totalCarbonSaved,
            categoryBreakdown
        });
    } catch (error) {
        console.error('Fetch Scan Stats Error:', error);
        res.status(500).json({ message: 'Error fetching scan stats' });
    }
});

module.exports = router;
