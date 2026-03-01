const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Point to the existing key file in the root directory
const serviceAccountPath = path.join(__dirname, '../../hackathon-firebasekey.json');

// Initialize Firebase Admin globally once
if (!admin.apps.length) {
    if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = require(serviceAccountPath);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("Firebase Admin Initialized successfully.");
    } else {
        console.warn("⚠️ ERROR: 'config/serviceAccountKey.json' not found!");
        console.warn("You must download your Service Account JSON from Firebase Console -> Project Settings -> Service Accounts -> Generate new private key");
        console.warn("Place it inside backend/config folder and name it exactly 'serviceAccountKey.json'.");
    }
}

// Ensure db acts as a single reference to Firestore
const db = admin.apps.length ? admin.firestore() : null;

module.exports = { admin, db };
