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
        const { wasteType, confidence, weightKg, carbonSavedOverride } = req.body;

        if (!wasteType || confidence == null || weightKg == null) {
            return res.status(400).json({ message: 'Missing required scan fields' });
        }

        // Use Flask's material-aware carbon value if the frontend sent one,
        // otherwise fall back to the flat category rate.
        let carbonSaved;
        if (carbonSavedOverride != null && !isNaN(carbonSavedOverride)) {
            carbonSaved = parseFloat(carbonSavedOverride);
        } else {
            const rate = carbonRates[wasteType] || 0;
            carbonSaved = weightKg * rate;
        }

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
        // NOTE: We deliberately avoid .orderBy() here because combining
        // .where('userId') + .orderBy('createdAt') requires a Firestore
        // composite index that may not exist. Sorting is done in JS instead.
        const snapshot = await db.collection('scans')
            .where('userId', '==', req.user.id)
            .get();

        const scans = [];
        snapshot.forEach(doc => scans.push({ id: doc.id, ...doc.data() }));

        // Sort newest-first in JavaScript (no index needed)
        scans.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

        res.status(200).json(scans);
    } catch (error) {
        console.error('Fetch My Scans Error:', error);
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
