export const parseDate = (val: any): Date => {
  if (!val) return new Date();
  
  // If it's a Firestore Timestamp from client SDK
  if (typeof val.toDate === 'function') {
    return val.toDate();
  }
  
  // If it's a serialized Timestamp from Firebase Functions (admin SDK)
  if (val && typeof val === 'object' && '_seconds' in val) {
    return new Date(val._seconds * 1000);
  }
  
  // If it's an ISO string or a Date object
  return new Date(val);
};
