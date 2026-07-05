import { collection, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
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

  // Use any to bypass Date vs FieldValue typing issues during write
  const reportDoc: any = {
    id: reportId,
    userId: 'anonymous', // Dummy UID for MVP
    category: data.category,
    location: data.location,
    imageMetadata: {
      url: downloadUrl,
      storagePath: storagePath,
      uploadedAt: serverTimestamp(),
    },
    status: 'pending',
    aiStatus: 'pending',
    contextStatus: 'pending',
    createdAt: serverTimestamp(),
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
      imageMetadata: {
        ...data.imageMetadata,
        uploadedAt: parseDate(data.imageMetadata?.uploadedAt),
      }
    } as Report;
  }
  return null;
};
