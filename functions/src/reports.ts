import * as functions from 'firebase-functions/v1';

export const createReport = functions.https.onCall(async (_data, _context) => {
  // TODO: Implement report creation
  return { reportId: 'dummy-id' };
});
