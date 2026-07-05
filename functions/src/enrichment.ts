import * as functions from 'firebase-functions';
import { MockWeatherProvider } from './providers/weather';

const weatherProvider = new MockWeatherProvider();

export const enrichReportContext = functions.firestore
  .document('reports/{reportId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    
    if (data.contextStatus !== 'pending') {
      return;
    }

    try {
      const location = data.location;
      if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
        throw new Error('Invalid location data');
      }

      const weatherContext = await weatherProvider.getContext(location.lat, location.lng);

      await snap.ref.update({
        context: weatherContext,
        contextStatus: 'processed'
      });

    } catch (error) {
      console.error('Error enriching report context:', error);
      
      // Fail gracefully
      await snap.ref.update({
        contextStatus: 'failed'
      });
    }
  });
