const admin = require('firebase-admin');

admin.initializeApp({
  projectId: "airpatch-b750a"
});

const db = admin.firestore();

async function seed() {
  console.log('Seeding dummy hotspots...');
  
  const hotspot1 = db.collection('hotspots').doc('dummy-hotspot-1');
  const report1 = db.collection('reports').doc('dummy-report-1');
  
  await report1.set({
    createdBy: 'anonymous',
    category: 'waste_burning_smoke',
    imageUrl: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9cce?q=80&w=1000',
    imagePath: 'dummy/path.jpg',
    location: {
      lat: 28.6139,
      lng: 77.2090,
      localityName: 'New Delhi Center'
    },
    status: 'verified',
    aiStatus: 'completed',
    contextStatus: 'completed',
    hotspotId: 'dummy-hotspot-1',
    aiVerification: {
      isPollutionEvent: true,
      predictedCategory: 'waste_burning_smoke',
      confidence: 0.95,
      severity: 4,
      reason: 'Visible thick black smoke from burning waste.'
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  await hotspot1.set({
    category: 'waste_burning_smoke',
    center: {
      lat: 28.6139,
      lng: 77.2090,
      localityName: 'New Delhi Center'
    },
    reportIds: ['dummy-report-1'],
    activeReportCount: 1,
    totalReportCount: 1,
    avgSeverity: 4,
    status: 'active',
    latestReportAt: admin.firestore.FieldValue.serverTimestamp(),
    firstSeenAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  console.log('Successfully seeded dummy hotspot and report in New Delhi!');
}

seed().then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1);
});
