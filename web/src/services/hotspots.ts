import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import { parseDate } from '../utils/date';
import type { Hotspot, Report } from '../shared/types';

export const getHotspots = async (): Promise<Hotspot[]> => {
  const getHotspotsFn = httpsCallable<void, any[]>(functions, 'getHotspots');
  const response = await getHotspotsFn();
  return response.data.map((h: any) => ({
    ...h,
    firstSeenAt: parseDate(h.firstSeenAt),
    updatedAt: parseDate(h.updatedAt),
    latestReportAt: parseDate(h.latestReportAt)
  })) as Hotspot[];
};

export const getHotspotDetails = async (id: string): Promise<{ hotspot: Hotspot, reports: Report[] }> => {
  const getHotspotDetailsFn = httpsCallable<{ hotspotId: string }, { hotspot: any, reports: any[] }>(functions, 'getHotspotDetails');
  const response = await getHotspotDetailsFn({ hotspotId: id });
  
  const hotspot = {
    ...response.data.hotspot,
    firstSeenAt: parseDate(response.data.hotspot.firstSeenAt),
    updatedAt: parseDate(response.data.hotspot.updatedAt),
    latestReportAt: parseDate(response.data.hotspot.latestReportAt)
  } as Hotspot;
  
  const reports = response.data.reports.map((r: any) => ({
    ...r,
    createdAt: parseDate(r.createdAt),
    updatedAt: parseDate(r.updatedAt),
  })) as Report[];

  return { hotspot, reports };
};
