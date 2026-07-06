const admin = require('firebase-admin');

// Initialize with default credentials
admin.initializeApp({
  projectId: "airpatch-b750a"
});

const db = admin.firestore();

async function runTest() {
  console.log("Creating test report in production...");
  const reportRef = await db.collection('reports').add({
    userId: 'smoke-tester',
    location: {
      latitude: 28.6139,
      longitude: 77.2090
    },
    status: 'pending',
    type: 'smoke',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    description: 'Automated smoke test report',
    imageUrl: 'https://example.com/test.jpg'
  });
  
  const reportId = reportRef.id;
  console.log(`Created report: ${reportId}`);
  
  console.log("Waiting for Cloud Functions to process the report (Gemini AI + Hotspot Clustering)...");
  
  // Wait up to 30 seconds for the report to be processed
  let processedReport = null;
  for (let i = 0; i < 15; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const doc = await reportRef.get();
    const data = doc.data();
    if (data.status === 'verified' || data.status === 'rejected') {
      processedReport = data;
      console.log(`Report processed! Status: ${data.status}`);
      break;
    }
  }
  
  if (!processedReport) {
    console.error("TIMEOUT: Cloud Function (onReportCreated) did not process the report in time. Check backend logs.");
    process.exit(1);
  }
  
  if (processedReport.status === 'verified') {
    if (!processedReport.hotspotId) {
       console.error("ERROR: Report verified but hotspotId is missing. assignReportTrigger failed.");
       process.exit(1);
    }
    console.log(`Successfully clustered into hotspot: ${processedReport.hotspotId}`);
    
    // Check hotspot
    const hotspotDoc = await db.collection('hotspots').doc(processedReport.hotspotId).get();
    if (hotspotDoc.exists) {
       console.log("Hotspot data:", hotspotDoc.data());
    } else {
       console.error("ERROR: Hotspot document does not exist!");
       process.exit(1);
    }
  }
  
  console.log("Smoke test completed successfully!");
  
  // Clean up
  console.log("Cleaning up test data...");
  await reportRef.delete();
  if (processedReport && processedReport.hotspotId) {
    // We shouldn't delete the hotspot entirely if it existed before, but for this test we'll leave it as is or decrement.
    // Since firestore rules block delete, we'll do it via admin SDK.
    const hotspotDoc = await db.collection('hotspots').doc(processedReport.hotspotId).get();
    if (hotspotDoc.exists && hotspotDoc.data().reportIds.length === 1) {
       await db.collection('hotspots').doc(processedReport.hotspotId).delete();
    }
  }
  process.exit(0);
}

runTest().catch(console.error);
