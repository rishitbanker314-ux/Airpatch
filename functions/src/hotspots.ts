import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { HOTSPOT_RADIUS_METERS } from './config/constants';
import { calculateDistanceMeters } from './utils/geo';
import type { Report, Hotspot } from './shared/types';
import { calculateHotspotRisk } from './risk';

export const assignReportTrigger = functions.firestore
  .document('reports/{reportId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data() as Report;
    const after = change.after.data() as Report;
    const reportId = context.params.reportId;

    // Only process when AI verification completes
    if (before.aiStatus !== 'completed' && after.aiStatus === 'completed') {
      const hasValidLocation = after.location && typeof after.location.lat === 'number' && typeof after.location.lng === 'number';
      const supportedCategories = ['construction_dust', 'industrial_smoke', 'unpicked_waste', 'stagnant_water'];
      const hasSupportedCategory = supportedCategories.includes(after.category);
      const isPollution = after.aiVerification?.isPollutionEvent === true;
      const isNotNone = after.aiVerification?.predictedCategory !== 'none';
      
      if (hasValidLocation && hasSupportedCategory && isPollution && isNotNone && !after.hotspotId) {
        await assignReportToHotspot(reportId, after);
      }
    }
  });

export async function assignReportToHotspot(reportId: string, report: Report) {
  const db = admin.firestore();
  
  // Fetch all active hotspots for this category
  // For MVP, we do this without geohashing, assuming a manageable number of active hotspots.
  const hotspotsSnapshot = await db.collection('hotspots')
    .where('category', '==', report.category)
    .where('status', '==', 'active')
    .get();

  let closestHotspotId: string | null = null;
  let minDistance = HOTSPOT_RADIUS_METERS;

  hotspotsSnapshot.forEach(doc => {
    const hotspot = doc.data() as Hotspot;
    const dist = calculateDistanceMeters(
      report.location.lat,
      report.location.lng,
      hotspot.center.lat,
      hotspot.center.lng
    );

    if (dist <= minDistance) {
      minDistance = dist;
      closestHotspotId = doc.id;
    }
  });

  const now = FieldValue.serverTimestamp();

  if (closestHotspotId) {
    // Assign to existing hotspot
    await db.collection('reports').doc(reportId).update({
      hotspotId: closestHotspotId
    });
    await recomputeHotspotStats(closestHotspotId);
  } else {
    // Create new hotspot anchored to this report
    const newHotspotRef = db.collection('hotspots').doc();
    
    // Create bare-bones hotspot and let recomputeHotspotStats populate counts/severity
    await newHotspotRef.set({
      category: report.category,
      center: report.location,
      status: 'active',
      reportIds: [reportId],
      firstSeenAt: now,
      updatedAt: now,
    });

    await db.collection('reports').doc(reportId).update({
      hotspotId: newHotspotRef.id
    });
    
    await recomputeHotspotStats(newHotspotRef.id);
  }
}

export async function recomputeHotspotStats(hotspotId: string) {
  const db = admin.firestore();
  
  // Query all reports assigned to this hotspot
  const reportsSnapshot = await db.collection('reports')
    .where('hotspotId', '==', hotspotId)
    .get();

  let activeCount = 0;
  let totalCount = 0;
  let totalSeverity = 0;
  let severityCount = 0;
  let latestDate = new Date(0);
  const reportIds: string[] = [];

  reportsSnapshot.forEach(doc => {
    const r = doc.data() as Report;
    totalCount++;
    
    // Assuming 'resolved' or 'rejected' are inactive
    if (r.status === 'pending' || r.status === 'verified') {
      activeCount++;
    }

    if (r.aiVerification?.severity !== undefined) {
      totalSeverity += r.aiVerification.severity;
      severityCount++;
    }

    // Convert Firestore Timestamp to Date if necessary
    const reportDate = r.createdAt instanceof Timestamp 
      ? r.createdAt.toDate() 
      : new Date(r.createdAt as any);

    if (reportDate > latestDate) {
      latestDate = reportDate;
    }
    reportIds.push(doc.id);
  });

  const avgSeverity = severityCount > 0 ? Math.round(totalSeverity / severityCount) : 0;
  const status = activeCount === 0 ? 'resolved' : 'active';
  const latestReportAtTs = Timestamp.fromDate(latestDate);

  const hotspotRef = db.collection('hotspots').doc(hotspotId);
  const hotspotDoc = await hotspotRef.get();
  
  if (!hotspotDoc.exists) {
    return;
  }
  
  const currentHotspot = hotspotDoc.data() as Hotspot;
  
  // Create a merged version of the hotspot with new stats for the risk engine
  const updatedHotspotProps: Partial<Hotspot> = {
    reportIds,
    activeReportCount: activeCount,
    totalReportCount: totalCount,
    avgSeverity,
    status,
    latestReportAt: latestDate, // Pass Date object to risk engine
  };
  
  const mergedHotspot = { ...currentHotspot, ...updatedHotspotProps } as Hotspot;
  
  // Calculate risk summary
  // We need to pass the raw reports (with Context properly structured)
  const rawReports = reportsSnapshot.docs.map(d => d.data() as Report);
  const risk = calculateHotspotRisk(mergedHotspot, rawReports);

  await hotspotRef.update({
    reportIds,
    activeReportCount: activeCount,
    totalReportCount: totalCount,
    avgSeverity,
    status,
    risk,
    latestReportAt: latestReportAtTs,
    updatedAt: FieldValue.serverTimestamp()
  });
}

// Expose callable functions
export const getHotspots = functions.https.onCall(async (data, context) => {
  const db = admin.firestore();
  const snapshot = await db.collection('hotspots')
    .where('status', '==', 'active')
    .get();
    
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
});

export const getHotspotDetails = functions.https.onCall(async (data: { hotspotId: string }, context) => {
  if (!data.hotspotId) {
    throw new functions.https.HttpsError('invalid-argument', 'hotspotId is required');
  }

  const db = admin.firestore();
  const hotspotDoc = await db.collection('hotspots').doc(data.hotspotId).get();
  
  if (!hotspotDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Hotspot not found');
  }

  const reportsSnapshot = await db.collection('reports')
    .where('hotspotId', '==', data.hotspotId)
    .orderBy('createdAt', 'desc')
    .get();

  return {
    hotspot: { id: hotspotDoc.id, ...hotspotDoc.data() },
    reports: reportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  };
});
