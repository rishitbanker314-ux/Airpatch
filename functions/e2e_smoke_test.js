/**
 * E2E Smoke Test v2: Submit a report and wait for full processing
 */
const admin = require('firebase-admin');

admin.initializeApp({ projectId: 'airpatch-b750a' });

async function smokeTest() {
  const db = admin.firestore();

  console.log('🧪 === SMOKE TEST v2 ===\n');

  // Submit the test report
  const reportRef = db.collection('reports').doc();
  const reportId = reportRef.id;

  await reportRef.set({
    id: reportId,
    createdBy: 'smoke-test-agent',
    category: 'unpicked_waste',
    location: { lat: 28.6350, lng: 77.2250, localityName: 'Smoke Test - Connaught Place' },
    note: 'Smoke test by CI agent',
    status: 'pending',
    aiStatus: 'pending',
    contextStatus: 'pending',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Garbage_dump_in_Manila.jpg/640px-Garbage_dump_in_Manila.jpg',
    imagePath: '',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`📝 Submitted report: ${reportId}`);
  console.log('⏳ Waiting for full processing (AI + hotspot assignment)...\n');

  // Wait up to 120s, checking every 3s
  let reportData = null;
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 3000));
    const snap = await reportRef.get();
    reportData = snap.data();
    
    const elapsed = (i + 1) * 3;
    const hotspotId = reportData.hotspotId || 'NONE';
    console.log(`   [${elapsed}s] status=${reportData.status} aiStatus=${reportData.aiStatus} hotspotId=${hotspotId}`);
    
    // We need BOTH aiStatus completed AND hotspotId assigned
    if (reportData.hotspotId) {
      console.log('\n✅ Report fully processed and assigned to hotspot!');
      break;
    }
    
    // If aiStatus is completed but no hotspot after 30s more, it's stuck
    if (reportData.aiStatus === 'completed' && i > 15 && !reportData.hotspotId) {
      console.log('\n⚠️  aiStatus completed but no hotspot after 45s - assignReportTrigger may be broken');
      break;
    }
  }

  // Show final state
  console.log('\n📋 Final Report State:');
  console.log(JSON.stringify(reportData, null, 2));

  // If hotspot exists, show it
  if (reportData.hotspotId) {
    const hs = await db.collection('hotspots').doc(reportData.hotspotId).get();
    if (hs.exists) {
      const hd = hs.data();
      console.log(`\n🔥 Hotspot: status=${hd.status}, reports=${hd.activeReportCount}, risk=${hd.risk?.riskBand}`);
    }
  }

  // Cleanup
  console.log(`\n🧹 Cleaning up...`);
  await reportRef.delete();
  if (reportData.hotspotId) {
    const hs = await db.collection('hotspots').doc(reportData.hotspotId).get();
    if (hs.exists) {
      const hd = hs.data();
      if (hd.totalReportCount <= 1) {
        await db.collection('hotspots').doc(reportData.hotspotId).delete();
        console.log('   Deleted test hotspot');
      }
    }
  }
  console.log('\n🧪 === DONE ===');
}

smokeTest().catch(console.error);
