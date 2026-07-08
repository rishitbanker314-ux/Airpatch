const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'airpatch-b750a' });

async function checkHotspot() {
  const db = admin.firestore();
  
  // Check the most recently updated hotspot
  const hotspots = await db.collection('hotspots').where('status', '==', 'active').get();
  
  let newest = null;
  let newestDate = new Date(0);
  
  hotspots.forEach(h => {
    const d = h.data();
    const updated = d.updatedAt?.toDate ? d.updatedAt.toDate() : new Date(0);
    if (updated > newestDate) {
      newestDate = updated;
      newest = { id: h.id, ...d };
    }
  });

  if (newest) {
    console.log('Most recently updated hotspot:');
    console.log(JSON.stringify(newest, null, 2));
  }
  
  // Also check: are there any hotspots missing latestReportAt?
  let missingCount = 0;
  hotspots.forEach(h => {
    const d = h.data();
    if (!d.latestReportAt) {
      missingCount++;
      console.log(`\nMISSING latestReportAt: ${h.id} (category=${d.category})`);
    }
  });
  console.log(`\nHotspots missing latestReportAt: ${missingCount}/${hotspots.size}`);
}

checkHotspot().catch(console.error);
