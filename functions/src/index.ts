import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

admin.initializeApp();

export * from './triggers/reportTriggers';
export * from './hotspots';
export * from './resolution';

export const seedDummyHotspots = functions.https.onRequest(async (req, res) => {
  const db = admin.firestore();
  const dummyHotspots = [
    {
      category: 'unpicked_waste',
      center: { lat: 23.0300, lng: 72.5800 },
      status: 'active',
      reportIds: [],
      firstSeenAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      activeReportCount: 5,
      totalReportCount: 5,
      avgSeverity: 4,
      risk: { 
        riskScore: 75, 
        riskBand: 'high', 
        summary: 'Operational risk is high. Prioritize investigation.',
        drivers: ['High severity reports'] 
      },
      latestReportAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    {
      category: 'construction_dust',
      center: { lat: 23.0150, lng: 72.5600 },
      status: 'active',
      reportIds: [],
      firstSeenAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      activeReportCount: 3,
      totalReportCount: 3,
      avgSeverity: 3,
      risk: { 
        riskScore: 50, 
        riskBand: 'medium', 
        summary: 'Operational risk is medium. Monitor for escalation.',
        drivers: ['Moderate severity'] 
      },
      latestReportAt: admin.firestore.FieldValue.serverTimestamp(),
    }
  ];

  for (const h of dummyHotspots) {
    await db.collection('hotspots').add(h);
  }

  res.send('Dummy hotspots in Ahmedabad seeded successfully!');
});
