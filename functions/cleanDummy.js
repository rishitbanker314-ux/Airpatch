const admin = require('firebase-admin');

// Initialize Firebase Admin (uses GOOGLE_APPLICATION_CREDENTIALS or default config if run via firebase-tools or with proper env)
admin.initializeApp({
  projectId: 'airpatch-b750a'
});

async function run() {
  const db = admin.firestore();
  
  // The dummy hotspots were seeded with an empty reportIds array
  const snapshot = await db.collection('hotspots').where('reportIds', '==', []).get();
  
  console.log(`Found ${snapshot.size} dummy hotspots with empty reportIds.`);
  
  let deletedCount = 0;
  for (const doc of snapshot.docs) {
    // Just to be extra safe, double check that activeReportCount is set to a dummy value (like 5 or 3)
    const data = doc.data();
    if (data.activeReportCount > 0) {
      await doc.ref.delete();
      console.log(`Deleted dummy hotspot ${doc.id}`);
      deletedCount++;
    }
  }
  
  console.log(`Successfully deleted ${deletedCount} dummy hotspots.`);
  process.exit(0);
}

run().catch(console.error);
