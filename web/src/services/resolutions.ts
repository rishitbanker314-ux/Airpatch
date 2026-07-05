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

  return {
    url: downloadUrl,
    storagePath,
    uploadedAt: new Date(),
  };
};

export const submitResolution = async (
  targetId: string, 
  targetType: 'report' | 'hotspot', 
  resolutionNote?: string, 
  imageFile?: File
) => {
  let imageMetadata;
  if (imageFile) {
    imageMetadata = await uploadResolutionImage(imageFile);
  }

  const submitFunction = httpsCallable(functions, 'submitResolution');
  const payload: Partial<Resolution> = {
    targetId,
    targetType,
    resolutionNote,
    imageMetadata,
  };

  const result = await submitFunction(payload);
  return result.data;
};

export const getResolutionsForTarget = async (targetId: string): Promise<Resolution[]> => {
  const resolutionsRef = collection(db, 'resolutions');
  const q = query(
    resolutionsRef, 
    where('targetId', '==', targetId),
    orderBy('resolvedAt', 'desc')
  );

  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      resolvedAt: parseDate(data.resolvedAt),
      imageMetadata: data.imageMetadata ? {
        ...data.imageMetadata,
        uploadedAt: parseDate(data.imageMetadata.uploadedAt),
      } : undefined,
    } as Resolution;
  });
};
