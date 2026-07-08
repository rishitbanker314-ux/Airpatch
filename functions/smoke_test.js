const admin = require('firebase-admin');

admin.initializeApp({
  projectId: 'airpatch-b750a'
});

async function smokeTest() {
  const db = admin.firestore();

  console.log('=== SMOKE TEST: Checking Firestore State ===\n');

  // 1. Check recent reports
  console.log('--- RECENT REPORTS (last 10) ---');
  const reports = await db.collection('reports').orderBy('createdAt', 'desc').limit(10).get();
  if (reports.empty) {
    console.log('  NO REPORTS FOUND!');
  } else {
    reports.forEach(r => {
      const d = r.data();
      const created = d.createdAt ? (d.createdAt.toDate ? d.createdAt.toDate().toISOString() : d.createdAt) : 'N/A';
      console.log(`  ${r.id}`);
      console.log(`    status=${d.status}, aiStatus=${d.aiStatus}, category=${d.category}`);
      console.log(`    hotspotId=${d.hotspotId || 'NONE'}, location=${JSON.stringify(d.location)}`);
      console.log(`    createdAt=${created}`);
      console.log();
    });
  }

  // 2. Check active hotspots
  console.log('\n--- ACTIVE HOTSPOTS ---');
  const hotspots = await db.collection('hotspots').where('status', '==', 'active').get();
  if (hotspots.empty) {
    console.log('  NO ACTIVE HOTSPOTS!');
  } else {
    console.log(`  Total active: ${hotspots.size}`);
    hotspots.forEach(h => {
      const d = h.data();
      const updated = d.updatedAt ? (d.updatedAt.toDate ? d.updatedAt.toDate().toISOString() : d.updatedAt) : 'N/A';
      console.log(`  ${h.id}: cat=${d.category}, reports=${d.activeReportCount}/${d.totalReportCount}, risk=${d.risk?.riskBand || 'N/A'}, updated=${updated}`);
    });
  }

  // 3. Check for orphaned reports (verified but no hotspotId)
  console.log('\n--- ORPHANED REPORTS (verified but no hotspotId) ---');
  const verifiedReports = await db.collection('reports').where('status', '==', 'verified').get();
  let orphanCount = 0;
  verifiedReports.forEach(r => {
    const d = r.data();
    if (!d.hotspotId) {
      orphanCount++;
      console.log(`  ORPHAN: ${r.id} (category=${d.category}, location=${JSON.stringify(d.location)})`);
    }
  });
  if (orphanCount === 0) {
    console.log('  None found (good!)');
  }

  // 4. Check for pending/stuck reports
  console.log('\n--- STUCK REPORTS (pending for > 5 min) ---');
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
  const pendingReports = await db.collection('reports').where('status', '==', 'pending').get();
  let stuckCount = 0;
  pendingReports.forEach(r => {
    const d = r.data();
    const created = d.createdAt?.toDate ? d.createdAt.toDate() : new Date(d.createdAt);
    if (created < fiveMinAgo) {
      stuckCount++;
      console.log(`  STUCK: ${r.id} (created=${created.toISOString()}, aiStatus=${d.aiStatus})`);
    }
  });
  if (stuckCount === 0) {
    console.log(`  None stuck (${pendingReports.size} total pending)`);
  }

  console.log('\n=== SMOKE TEST COMPLETE ===');
}

smokeTest().catch(console.error);
