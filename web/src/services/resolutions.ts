import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import { db, storage, functions } from './firebase';
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

  const submitFunction = httpsCallable(functions, 'submitResolution');
  const payload: Partial<Resolution> = {
    hotspotId,
    reportId,
    note,
    evidenceImageUrl,
  };

  const result = await submitFunction(payload);
  return result.data;
};

export const getResolutionsForHotspot = async (hotspotId: string): Promise<Resolution[]> => {
  const resolutionsRef = collection(db, 'resolutions');
  const q = query(
    resolutionsRef, 
    where('hotspotId', '==', hotspotId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: parseDate(data.createdAt),
    } as Resolution;
  });
};
