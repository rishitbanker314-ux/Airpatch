import { collection, doc, addDoc, query, where, getDocs, orderBy, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { parseDate } from '../utils/date';
import type { Resolution } from '../shared/types';

export const uploadResolutionImage = async (imageFile: File) => {
  const filename = `${Date.now()}_${imageFile.name}`;
  const storagePath = `resolutions/${filename}`;
  const storageRef = ref(storage, storagePath);
  
  await uploadBytes(storageRef, imageFile);
  const downloadUrl = await getDownloadURL(storageRef);

  return downloadUrl;
};

export const submitResolution = async (
  hotspotId: string, 
  reportId?: string, 
  note?: string, 
  imageFile?: File
) => {
  let evidenceImageUrl;
  if (imageFile) {
    evidenceImageUrl = await uploadResolutionImage(imageFile);
  }

  const resolutionData: any = {
    hotspotId,
    resolvedBy: 'authority_demo',
    createdAt: serverTimestamp(),
  };

  if (reportId) resolutionData.reportId = reportId;
  if (note) resolutionData.note = note;
  if (evidenceImageUrl) resolutionData.evidenceImageUrl = evidenceImageUrl;

  const resolutionRef = await addDoc(collection(db, 'resolutions'), resolutionData);

  // Mark the report as resolved if provided
  if (reportId) {
    const reportRef = doc(db, 'reports', reportId);
    await updateDoc(reportRef, {
      status: 'resolved',
      updatedAt: serverTimestamp(),
    });
  }

  return { success: true, resolutionId: resolutionRef.id };
};

export const getResolutionsForHotspot = async (hotspotId: string): Promise<Resolution[]> => {
  const resolutionsRef = collection(db, 'resolutions');
  const q = query(
    resolutionsRef, 
    where('hotspotId', '==', hotspotId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      createdAt: parseDate(data.createdAt),
    } as Resolution;
  });
};
