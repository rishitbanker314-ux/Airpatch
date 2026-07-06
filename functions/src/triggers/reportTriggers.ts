import * as functions from 'firebase-functions/v1';
import { processReportCreated } from '../services/reportOrchestrator';

export const onReportCreated = functions.firestore
  .document('reports/{reportId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    
    // Prevent re-processing if it already has a status
    if (data.aiStatus && data.aiStatus !== 'pending') {
      return;
    }
    
    try {
      await processReportCreated(context.params.reportId, data);
    } catch (error) {
      console.error(`[ReportTrigger] Error processing report ${context.params.reportId}:`, error);
      
      // Fallback update in case the orchestrator threw before it could write failed statuses
      await snap.ref.update({
        aiStatus: data.aiStatus || 'failed',
        contextStatus: data.contextStatus || 'failed',
      });
    }
  });
