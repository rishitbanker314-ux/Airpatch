import { collection, doc, getDoc, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { parseDate } from '../utils/date';
import type { Hotspot, Report } from '../shared/types';

export const getHotspots = async (): Promise<Hotspot[]> => {
  const q = query(
    collection(db, 'hotspots'),
    where('status', '==', 'active')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      firstSeenAt: parseDate(data.firstSeenAt),
      updatedAt: parseDate(data.updatedAt),
      latestReportAt: parseDate(data.latestReportAt),
    } as Hotspot;
  });
};


export const subscribeToHotspots = (callback: (hotspots: Hotspot[]) => void): (() => void) => {
  const q = query(
    collection(db, 'hotspots'),
    where('status', '==', 'active')
  );
  
  return onSnapshot(q, (snapshot) => {
    const hotspots = snapshot.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        firstSeenAt: parseDate(data.firstSeenAt),
        updatedAt: parseDate(data.updatedAt),
        latestReportAt: parseDate(data.latestReportAt),
      } as Hotspot;
    });
    // Sort by latestReportAt descending so newest reports appear at the top
    hotspots.sort((a, b) => b.latestReportAt.getTime() - a.latestReportAt.getTime());
    callback(hotspots);
  }, (error) => {
    console.error("Error listening to hotspots:", error);
    callback([]);
  });
};

export const getHotspotDetails = async (id: string): Promise<{ hotspot: Hotspot; reports: Report[] }> => {
  const hotspotRef = doc(db, 'hotspots', id);
  const hotspotSnap = await getDoc(hotspotRef);

  if (!hotspotSnap.exists()) {
    throw new Error('Hotspot not found');
  }

  const hData = hotspotSnap.data();
  const hotspot = {
    id: hotspotSnap.id,
    ...hData,
    firstSeenAt: parseDate(hData.firstSeenAt),
    updatedAt: parseDate(hData.updatedAt),
    latestReportAt: parseDate(hData.latestReportAt),
  } as Hotspot;

  const reportsQuery = query(
    collection(db, 'reports'),
    where('hotspotId', '==', id)
  );
  const reportsSnap = await getDocs(reportsQuery);

  const reports = reportsSnap.docs.map(d => {
    const rData = d.data();
    return {
      id: d.id,
      ...rData,
      createdAt: parseDate(rData.createdAt),
      updatedAt: parseDate(rData.updatedAt),
    } as Report;
  });

  // Sort client-side to avoid requiring a composite index in Firestore
  reports.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return { hotspot, reports };
};
