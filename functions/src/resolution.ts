import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import type { Resolution } from '../../shared/types';
import { recomputeHotspotStats } from './hotspots';

export const submitResolution = functions.https.onCall(async (data: Partial<Resolution>, context) => {
  const { hotspotId, reportId, note, evidenceImageUrl, resolvedBy } = data;

  if (!hotspotId) {
    throw new functions.https.HttpsError('invalid-argument', 'hotspotId is required');
  }

  const db = admin.firestore();
  const now = admin.firestore.FieldValue.serverTimestamp();

  // The caller might provide `resolvedBy` or we default it for MVP
  const finalResolvedBy = resolvedBy || 'authority_demo';

  if (reportId) {
    const reportRef = db.collection('reports').doc(reportId);
    const reportDoc = await reportRef.get();
    if (!reportDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Report not found');
    }

    await reportRef.update({
      status: 'resolved',
      updatedAt: now,
    });

    await recomputeHotspotStats(hotspotId);
  } else {
    const hotspotRef = db.collection('hotspots').doc(hotspotId);
    const hotspotDoc = await hotspotRef.get();
    if (!hotspotDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Hotspot not found');
    }

    // Resolve all active reports in this hotspot
    const reportsSnapshot = await db.collection('reports')
      .where('hotspotId', '==', hotspotId)
      .where('status', 'in', ['pending', 'verified'])
      .get();

    if (!reportsSnapshot.empty) {
      const batch = db.batch();
      reportsSnapshot.forEach(doc => {
        batch.update(doc.ref, { status: 'resolved', updatedAt: now });
      });
      await batch.commit();
    }

    // Now recompute stats which will naturally resolve the hotspot
    await recomputeHotspotStats(hotspotId);
  }

  // Create resolution record
  const resolutionRef = db.collection('resolutions').doc();
  const resolutionData: any = {
    hotspotId,
    resolvedBy: finalResolvedBy,
    createdAt: now,
  };
  
  if (reportId) resolutionData.reportId = reportId;
  if (note) resolutionData.note = note;
  if (evidenceImageUrl) resolutionData.evidenceImageUrl = evidenceImageUrl;

  await resolutionRef.set(resolutionData);

  return { success: true, resolutionId: resolutionRef.id };
});
