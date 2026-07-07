import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

async function run() {
  const hotspots = [
    {
      category: 'unpicked_waste',
      center: { lat: 23.0225, lng: 72.5714 }, // Central
      count: 3,
      severityScore: 85,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      recentReports: [],
    },
    {
      category: 'industrial_smoke',
      center: { lat: 22.9952, lng: 72.6604 }, // Near Vishwakarma Engineering College (approx from screenshot lat/lng)
      count: 5,
      severityScore: 92,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      recentReports: [],
    },
    {
      category: 'construction_dust',
      center: { lat: 23.0525, lng: 72.5314 }, // Northwest
      count: 2,
      severityScore: 65,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      recentReports: [],
    }
  ];

  for (const h of hotspots) {
    await db.collection('hotspots').add(h);
  }
  
  console.log("Ahmedabad dummy hotspots created!");
}

run().then(() => process.exit(0)).catch(console.error);
