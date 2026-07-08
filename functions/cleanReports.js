const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'airpatch-b750a' });

async function run() {
  const db = admin.firestore();
  
  // Dummy reports were probably seeded with "seededBy: 'script'" or similar, 
  // or we can just delete reports that point to the dummy hotspots we just deleted.
  // Actually, wait, let's just delete reports that have no 'imagePath' or 'imageUrl', 
  // as real reports always have an image from the UI.
  const snapshot = await db.collection('reports').get();
  
  let deletedCount = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    // Real reports from the app always have an image. Dummy ones usually don't, 
    // or they have dummy IDs starting with R_
    if (doc.id.startsWith('R_')) {
      await doc.ref.delete();
      console.log(`Deleted dummy report ${doc.id}`);
      deletedCount++;
    }
  }
  
  console.log(`Successfully deleted ${deletedCount} dummy reports.`);
  process.exit(0);
}

run().catch(console.error);
