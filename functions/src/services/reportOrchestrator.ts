import * as admin from 'firebase-admin';
import { analyzeHotspotImage } from '../providers/geminiProvider';
import { getWeather, getAirPollution } from '../providers/openWeatherProvider';

export async function processReportCreated(reportId: string, data: any) {
  // Validate requirements
  const storagePath = data.imagePath || data.imageUrl; // Using imagePath is preferred for Admin SDK
  const location = data.location;
  
  if (!storagePath) {
    throw new Error('Report missing imagePath or imageUrl');
  }
  
  if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
    throw new Error('Report missing valid location data');
  }

  // Update status to started/pending
  const db = admin.firestore();
  const reportRef = db.collection('reports').doc(reportId);
  await reportRef.update({
    aiStatus: 'pending',
    contextStatus: 'pending',
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // Prepare promises
  // 1. Gemini (requires downloading image first)
  const geminiPromise = (async () => {
    try {
      // Determine if it's a full URL or a storage path. If it's a full URL, we extract the path or fetch it natively.
      // But for Airpatch we assume imagePath is a storage path (e.g. 'reports/xxx/image.jpg').
      // Let's just use the bucket to download it.
      let bucketName;
      let path = storagePath;
      
      // Basic safety if it's a gs:// URL
      if (storagePath.startsWith('gs://')) {
        const parts = storagePath.replace('gs://', '').split('/');
        bucketName = parts.shift();
        path = parts.join('/');
      }

      const defaultBucket = process.env.FIREBASE_STORAGE_BUCKET || 'airpatch-b750a.firebasestorage.app';
      const bucket = bucketName ? admin.storage().bucket(bucketName) : admin.storage().bucket(defaultBucket);
      const file = bucket.file(path);
      const [buffer] = await file.download();
      const base64Image = buffer.toString('base64');
      
      const result = await analyzeHotspotImage(base64Image, data.note, data.category);
      return result;
    } catch (err) {
      console.error('[Orchestrator] Gemini analysis failed:', err);
      throw err;
    }
  })();

  // 2. Weather Context
  const weatherPromise = getWeather(location.lat, location.lng).catch(err => {
    console.error('[Orchestrator] Weather fetch failed:', err);
    throw err;
  });

  // 3. AQI Context
  const aqiPromise = getAirPollution(location.lat, location.lng).catch(err => {
    console.error('[Orchestrator] AQI fetch failed:', err);
    throw err;
  });

  // Execute in parallel
  const [geminiResult, weatherResult, aqiResult] = await Promise.allSettled([
    geminiPromise,
    weatherPromise,
    aqiPromise
  ]);

  const updates: any = {
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  // Process Gemini Result
  if (geminiResult.status === 'fulfilled') {
    updates.aiStatus = 'completed';
    updates.aiVerification = geminiResult.value;
  } else {
    updates.aiStatus = 'failed';
  }

  // Process Context Results
  if (weatherResult.status === 'fulfilled' || aqiResult.status === 'fulfilled') {
    updates.context = {};
    if (weatherResult.status === 'fulfilled') {
      updates.context.weather = weatherResult.value;
    }
    if (aqiResult.status === 'fulfilled') {
      updates.context.air = aqiResult.value;
    }
    
    // Determine if context is fully completed or partially completed
    if (weatherResult.status === 'fulfilled' && aqiResult.status === 'fulfilled') {
      updates.contextStatus = 'completed';
    } else {
      updates.contextStatus = 'partial';
    }
  } else {
    updates.contextStatus = 'failed';
  }

  // Final Update
  await reportRef.update(updates);
}
