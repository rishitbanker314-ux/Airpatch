import { collection, doc, setDoc, getDoc, serverTimestamp, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { parseDate } from '../utils/date';
import type { Report } from '../shared/types';

export const submitReport = async (data: Partial<Report>, imageFile: File): Promise<string> => {
  // 1. Upload image to Storage
  const filename = `${Date.now()}_${imageFile.name}`;
  const storagePath = `reports/${filename}`;
  const storageRef = ref(storage, storagePath);
  
  await uploadBytes(storageRef, imageFile);
  const downloadUrl = await getDownloadURL(storageRef);

  // 2. Create Firestore Document
  const reportRef = doc(collection(db, 'reports'));
  const reportId = reportRef.id;

  const reportDoc: any = {
    id: reportId,
    createdBy: data.createdBy || 'anonymous', // Use real UID if provided
    category: data.category,
    location: data.location,
    imageUrl: downloadUrl,
    imagePath: storagePath,
    status: 'pending',
    aiStatus: 'pending',
    contextStatus: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // Only attach note if it contains text
  if (data.note && data.note.trim() !== '') {
    reportDoc.note = data.note.trim();
  }

  await setDoc(reportRef, reportDoc);
  return reportId;
};

export const getReport = async (id: string): Promise<Report | null> => {
  const reportRef = doc(db, 'reports', id);
  const snapshot = await getDoc(reportRef);
  if (snapshot.exists()) {
    const data = snapshot.data();
    
    return {
      ...data,
      createdAt: parseDate(data.createdAt),
      updatedAt: parseDate(data.updatedAt),
    } as Report;
  }
  return null;
};


export const subscribeToReport = (id: string, callback: (report: Report | null) => void): (() => void) => {
  const reportRef = doc(db, 'reports', id);
  return onSnapshot(reportRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      callback({
        ...data,
        createdAt: parseDate(data.createdAt),
        updatedAt: parseDate(data.updatedAt),
      } as Report);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error("Error listening to report:", error);
    callback(null);
  });
};

export const subscribeToUserReports = (userId: string, callback: (reports: Report[]) => void): (() => void) => {
  const reportsRef = collection(db, 'reports');
  const q = query(
    reportsRef,
    where('createdBy', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const reports = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: parseDate(data.createdAt),
        updatedAt: parseDate(data.updatedAt),
      } as Report;
    });
    callback(reports);
  }, (error) => {
    console.error("Error listening to user reports:", error);
    callback([]);
  });
};


import { getFunctions, httpsCallable } from 'firebase/functions';

export const fetchCityAqiTrend = async (lat?: number, lng?: number, period?: string): Promise<number[]> => {
  const functions = getFunctions();
  const getCityAqiTrendFunc = httpsCallable(functions, 'getCityAqiTrend');
  try {
    const result = await getCityAqiTrendFunc({ lat, lng, period });
    return (result.data as any).buckets;
  } catch (error) {
    console.error("Error fetching city AQI trend:", error);
    return new Array(9).fill(0);
  }
};
