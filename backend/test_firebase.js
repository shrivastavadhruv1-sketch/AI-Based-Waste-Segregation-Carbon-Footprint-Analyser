const { admin, db } = require('./config/firebase');
console.log("DB Loaded:", db !== null);

async function test() {
    try {
        const snapshot = await db.collection('users').where('email', '==', 'test@test.com').limit(1).get();
        console.log("Query Successful. Empty:", snapshot.empty);
    } catch (err) {
        console.error("Test Error:", err);
    }
}

test();
