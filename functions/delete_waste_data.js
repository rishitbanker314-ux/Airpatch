const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'airpatch-b750a', storageBucket: 'airpatch-b750a.firebasestorage.app' });

async function main() {
  const db = admin.firestore();
  const bucket = admin.storage().bucket();
  
  // Find all reports with category waste_burning_smoke
  const reportsSnapshot = await db.collection('reports').where('category', '==', 'waste_burning_smoke').get();
  
  console.log(`Found ${reportsSnapshot.size} reports to delete.`);
  
  for (const doc of reportsSnapshot.docs) {
    const data = doc.data();
    console.log(`Deleting report ${doc.id}...`);
    
    // Delete image from storage
    if (data.imagePath) {
      try {
        await bucket.file(data.imagePath).delete();
        console.log(` - Deleted image: ${data.imagePath}`);
      } catch (err) {
        if (err.code === 404) {
          console.log(` - Image ${data.imagePath} not found in storage, skipping.`);
        } else {
          console.error(` - Error deleting image:`, err.message);
        }
      }
    }
    
    // Delete document
    await doc.ref.delete();
    console.log(` - Deleted document.`);
  }
  
  // Also delete all hotspots with that category
  const hotspotsSnapshot = await db.collection('hotspots').where('category', '==', 'waste_burning_smoke').get();
  console.log(`Found ${hotspotsSnapshot.size} hotspots to delete.`);
  
  for (const doc of hotspotsSnapshot.docs) {
    await doc.ref.delete();
    console.log(` - Deleted hotspot ${doc.id}`);
  }
  
  console.log('Cleanup complete!');
}
main().catch(console.error);
