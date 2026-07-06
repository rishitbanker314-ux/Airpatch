import * as admin from 'firebase-admin';

admin.initializeApp();

export * from './triggers/reportTriggers';
export * from './hotspots';
export * from './resolution';
