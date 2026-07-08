const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // if it exists, or just initializeApp if emulator

// Check if we have credentials
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch(e) {
  // If no serviceAccountKey, let's see if default works (e.g. ADC)
  admin.initializeApp();
}

async function check() {
  const db = admin.firestore();
  console.log('Fetching recent reports...');
  const reports = await db.collection('reports').orderBy('createdAt', 'desc').limit(5).get();
  reports.forEach(r => {
    console.log(r.id, '=>', r.data().status, r.data().aiStatus, r.data().hotspotId, r.data().location);
  });
  
  console.log('\nFetching hotspots...');
  const hotspots = await db.collection('hotspots').orderBy('updatedAt', 'desc').limit(5).get();
  hotspots.forEach(h => {
    console.log(h.id, '=>', h.data().status, h.data().activeReportCount, h.data().center);
  });
}

check().catch(console.error);
