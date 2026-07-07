const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'airpatch-b750a' }); // Make sure project ID matches

async function main() {
  const db = admin.firestore();
  
  // Delete all hotspots (they are all dummy because the real ones never got created)
  const hotspotsSnapshot = await db.collection('hotspots').get();
  let count = 0;
  for (const doc of hotspotsSnapshot.docs) {
    if (doc.data().reportIds.length === 0) {
      await doc.ref.delete();
      count++;
    }
  }
  console.log(`Deleted ${count} dummy hotspots.`);
}
main();
