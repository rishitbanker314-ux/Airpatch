const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'airpatch-b750a' });

async function run() {
  const db = admin.firestore();
  
  const snapshot = await db.collection('hotspots').get();
  
  let deletedCount = 0;
  for (const doc of snapshot.docs) {
    await doc.ref.delete();
    console.log(`Deleted hotspot ${doc.id}`);
    deletedCount++;
  }
  
  console.log(`Successfully deleted all ${deletedCount} hotspots.`);
  process.exit(0);
}

run().catch(console.error);
