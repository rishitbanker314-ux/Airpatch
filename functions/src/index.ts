import * as admin from 'firebase-admin';

admin.initializeApp();

export * from './reports';
export * from './triggers/reportTriggers';
export * from './hotspots';
export * from './risk';
export * from './resolution';
