import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { getHistoricalAirPollution } from './providers/openWeatherProvider';

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

export const getCityAqiTrend = functions.https.onCall(async (data, context) => {
  // Default to New Delhi coordinates
  const lat = data.lat || 28.6139;
  const lng = data.lng || 77.2090;
  const period = data.period || '24h';

  let days = 1;
  if (period === 'weekly') days = 7;
  else if (period === 'monthly') days = 30;

  const end = Math.floor(Date.now() / 1000);
  const start = end - days * 24 * 60 * 60;

  try {
    const history = await getHistoricalAirPollution(lat, lng, start, end);
    
    // We want 9 buckets
    const buckets = new Array(9).fill(0);
    const bucketDuration = (days * 24 * 60 * 60) / 9;
    
    if (history.list && Array.isArray(history.list)) {
      history.list.forEach((entry: any) => {
        const timeDiff = entry.dt - start;
        let bucketIndex = Math.floor(timeDiff / bucketDuration);
        if (bucketIndex >= 9) bucketIndex = 8;
        if (bucketIndex >= 0) {
          // OpenWeather AQI is 1-5. Store raw AQI, we map it later on frontend
          // But wait, it's better to map it right here!
          let usAqi = 0;
          const owAqi = entry.main.aqi || 0;
          if (owAqi === 1) usAqi = 30;
          else if (owAqi === 2) usAqi = 75;
          else if (owAqi === 3) usAqi = 125;
          else if (owAqi === 4) usAqi = 175;
          else if (owAqi === 5) usAqi = 250;
          else usAqi = owAqi; // fallback
          
          buckets[bucketIndex] = Math.max(buckets[bucketIndex], usAqi);
        }
      });
    }
    
    return { buckets };
  } catch (error) {
    console.error("Failed to fetch city AQI trend:", error);
    throw new functions.https.HttpsError('internal', 'Failed to fetch city AQI trend');
  }
});
