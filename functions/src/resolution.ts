import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import type { Resolution, Report } from '../../shared/types';
import { recomputeHotspotStats } from './hotspots';

export const submitResolution = functions.https.onCall(async (data: Partial<Resolution>, context) => {
  const { targetId, targetType, resolutionNote, imageMetadata, resolvedBy } = data;

  if (!targetId || !targetType) {
    throw new functions.https.HttpsError('invalid-argument', 'targetId and targetType are required');
  }

  const db = admin.firestore();
  const now = admin.firestore.FieldValue.serverTimestamp();

  // The caller might provide `resolvedBy` or we default it for MVP
  const finalResolvedBy = resolvedBy || 'authority_demo';

  if (targetType === 'report') {
    const reportRef = db.collection('reports').doc(targetId);
    const reportDoc = await reportRef.get();
    if (!reportDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Report not found');
    }

    await reportRef.update({
      status: 'resolved'
    });

    const reportData = reportDoc.data() as Report;
    if (reportData.hotspotId) {
      await recomputeHotspotStats(reportData.hotspotId);
    }
  } else if (targetType === 'hotspot') {
    const hotspotRef = db.collection('hotspots').doc(targetId);
    const hotspotDoc = await hotspotRef.get();
    if (!hotspotDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Hotspot not found');
    }

    // Resolve all active reports in this hotspot
    const reportsSnapshot = await db.collection('reports')
      .where('hotspotId', '==', targetId)
      .where('status', 'in', ['pending', 'verified'])
      .get();

    if (!reportsSnapshot.empty) {
      const batch = db.batch();
      reportsSnapshot.forEach(doc => {
        batch.update(doc.ref, { status: 'resolved' });
      });
      await batch.commit();
    }

    // Now recompute stats which will naturally resolve the hotspot
    await recomputeHotspotStats(targetId);
  } else {
    throw new functions.https.HttpsError('invalid-argument', 'targetType must be report or hotspot');
  }

  // Create resolution record
  const resolutionRef = db.collection('resolutions').doc();
  const resolutionData: any = {
    targetId,
    targetType,
    resolvedBy: finalResolvedBy,
    resolvedAt: now,
  };
  
  if (resolutionNote) resolutionData.resolutionNote = resolutionNote;
  if (imageMetadata) resolutionData.imageMetadata = imageMetadata;

  await resolutionRef.set(resolutionData);

  return { success: true, resolutionId: resolutionRef.id };
});
