const admin = require('firebase-admin');

// Only initialize if not already initialized (to avoid errors if run multiple times in same process)
if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'airpatch-b750a' });
}

async function smokeTest() {
  const db = admin.firestore();
  const testUid = `smoke-test-user-${Date.now()}`;

  console.log('🧪 === SMOKE TEST: User Profile Stats ===\n');
  console.log(`👤 Using test user ID: ${testUid}`);

  // 1. Check initial stats (should be 0)
  const initialReports = await db.collection('reports').where('createdBy', '==', testUid).get();
  const initialResolutions = await db.collection('resolutions').where('resolvedBy', '==', testUid).get();
  
  console.log(`📊 Initial State:`);
  console.log(`   Reports uploaded: ${initialReports.size}`);
  console.log(`   Sources resolved: ${initialResolutions.size}`);

  // 2. Submit a report
  const reportRef = db.collection('reports').doc();
  const reportId = reportRef.id;

  await reportRef.set({
    id: reportId,
    createdBy: testUid,
    category: 'unpicked_waste',
    location: { lat: 28.6350, lng: 77.2250, localityName: 'Smoke Test - Connaught Place' },
    note: 'Smoke test report for profile stats',
    status: 'pending',
    aiStatus: 'pending',
    contextStatus: 'pending',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Garbage_dump_in_Manila.jpg/640px-Garbage_dump_in_Manila.jpg',
    imagePath: '',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`\n📝 Submitted report: ${reportId}`);
  console.log('⏳ Waiting for AI processing to assign hotspotId (approx 6-10s)...');

  let reportData = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 3000));
    const snap = await reportRef.get();
    reportData = snap.data();
    if (reportData.hotspotId) {
      console.log(`✅ AI processing complete. Assigned to hotspot: ${reportData.hotspotId}`);
      break;
    }
  }

  if (!reportData?.hotspotId) {
    console.error('❌ Failed to process report. Hotspot ID not assigned.');
    process.exit(1);
  }

  // 3. Verify reports count is now 1
  const afterReports = await db.collection('reports').where('createdBy', '==', testUid).get();
  console.log(`\n📊 State after report:`);
  console.log(`   Reports uploaded: ${afterReports.size}`);

  if (afterReports.size !== 1) {
    console.error('❌ Upload count did not update correctly!');
  }

  // 4. Submit a resolution for the same report/hotspot
  const resolutionRef = db.collection('resolutions').doc();
  const resolutionId = resolutionRef.id;
  
  await resolutionRef.set({
    hotspotId: reportData.hotspotId,
    reportId: reportId,
    resolvedBy: testUid,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // We also need to run the logic that happens in submitResolution frontend function:
  // Marking report as resolved and updating user points.
  // In the real app, the client does this directly. So we simulate client behavior here.
  
  await reportRef.update({
    status: 'resolved',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const hotspotRef = db.collection('hotspots').doc(reportData.hotspotId);
  await hotspotRef.update({
    status: 'resolved',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const userRef = db.collection('users').doc(testUid);
  await userRef.set({
    points: admin.firestore.FieldValue.increment(20)
  }, { merge: true });

  console.log(`\n✅ Submitted resolution: ${resolutionId} and updated user points.`);

  // 5. Verify final stats
  const finalReports = await db.collection('reports').where('createdBy', '==', testUid).get();
  const finalResolutions = await db.collection('resolutions').where('resolvedBy', '==', testUid).get();
  const finalUserSnap = await userRef.get();
  const points = finalUserSnap.data()?.points;

  // Simulate frontend verifiedCount logic:
  let verifiedCount = 0;
  finalReports.forEach(doc => {
    const data = doc.data();
    if (data.status === 'verified' || data.status === 'resolved') {
      verifiedCount++;
    }
  });
  verifiedCount += finalResolutions.size;

  console.log(`\n📊 Final State:`);
  console.log(`   Total Reports uploaded: ${finalReports.size}`);
  console.log(`   Sources resolved (verified reports + explicit resolutions): ${verifiedCount}`);
  console.log(`   User points: ${points}`);

  if (finalReports.size === 1 && verifiedCount === 2 && points === 20) {
    console.log(`\n✅ PASS: Profile stats are counting correctly!`);
  } else {
    console.error(`\n❌ FAIL: Stats mismatch! Expected Reports: 1, Resolved: 2, Points: 20`);
  }

  // Cleanup
  console.log(`\n🧹 Cleaning up test data...`);
  await reportRef.delete();
  await resolutionRef.delete();
  await userRef.delete();
  
  const hs = await hotspotRef.get();
  if (hs.exists && hs.data().totalReportCount <= 1) {
    await hotspotRef.delete();
  } else {
     // Revert hotspot status if it had other reports
     if(hs.exists) {
       await hotspotRef.update({ status: 'active' });
     }
  }

  console.log('🧪 === SMOKE TEST COMPLETE ===');
}

smokeTest().catch(console.error);
