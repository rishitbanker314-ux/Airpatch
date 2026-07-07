import { collection, doc, addDoc, query, where, getDocs, serverTimestamp, updateDoc, increment, setDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from './firebase';
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
    resolvedBy: auth.currentUser?.uid || 'anonymous',
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

  // Mark the hotspot as resolved
  if (hotspotId) {
    const hotspotRef = doc(db, 'hotspots', hotspotId);
    await updateDoc(hotspotRef, {
      status: 'resolved',
      updatedAt: serverTimestamp(),
    });
  }

  // Award 20 points to the user for resolving the report
  if (auth.currentUser) {
    const userRef = doc(db, 'users', auth.currentUser.uid);
    await setDoc(userRef, {
      points: increment(20)
    }, { merge: true });
  }

  return { success: true, resolutionId: resolutionRef.id };
};

export const getResolutionsForHotspot = async (hotspotId: string): Promise<Resolution[]> => {
  const resolutionsRef = collection(db, 'resolutions');
  const q = query(
    resolutionsRef, 
    where('hotspotId', '==', hotspotId)
  );

  const snapshot = await getDocs(q);
  
  const resolutions = snapshot.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      createdAt: parseDate(data.createdAt),
    } as Resolution;
  });

  resolutions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return resolutions;
};

export const subscribeToUserResolutions = (
  userId: string, 
  onUpdate: (resolutions: Resolution[]) => void
) => {
  const resolutionsRef = collection(db, 'resolutions');
  const q = query(
    resolutionsRef, 
    where('resolvedBy', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const resolutions = snapshot.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt ? parseDate(data.createdAt) : new Date(),
      } as Resolution;
    });

    resolutions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    onUpdate(resolutions);
  }, (error) => {
    console.error("Error subscribing to user resolutions:", error);
  });
};
