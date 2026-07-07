const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'airpatch-b750a' }); // Make sure project ID matches

async function main() {
  const db = admin.firestore();
  
  // Get the most recent report
  const snapshot = await db.collection('reports').orderBy('createdAt', 'desc').limit(1).get();
  if (snapshot.empty) {
    console.log("No reports found.");
    return;
  }
  
  const report = snapshot.docs[0].data();
  console.log("LATEST REPORT:");
  console.log(JSON.stringify(report, null, 2));

  // Also check if any hotspots were created today
  const hotspotsSnapshot = await db.collection('hotspots').orderBy('createdAt', 'desc').limit(1).get().catch(() => null);
  if (hotspotsSnapshot && !hotspotsSnapshot.empty) {
     console.log("LATEST HOTSPOT:");
     console.log(JSON.stringify(hotspotsSnapshot.docs[0].data(), null, 2));
  } else {
     // try without order by createdAt since hotspots use firstSeenAt
     const hs = await db.collection('hotspots').orderBy('firstSeenAt', 'desc').limit(1).get().catch(e => {
        console.log("Error querying hotspots:", e.message);
     });
     if (hs && !hs.empty) {
        console.log("LATEST HOTSPOT:");
        console.log(JSON.stringify(hs.docs[0].data(), null, 2));
     }
  }
}
main();
