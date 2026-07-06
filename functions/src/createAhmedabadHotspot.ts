import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

async function run() {
  const hotspotData = {
    category: 'waste_burning_smoke',
    center: { lat: 23.0225, lng: 72.5714 },
    count: 1,
    severityScore: 75,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    recentReports: [],
  };

  await db.collection('hotspots').add(hotspotData);
  console.log("Ahmedabad hotspot created!");
}

run().then(() => process.exit(0)).catch(console.error);
