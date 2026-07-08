export type PollutionCategory = 'construction_dust' | 'industrial_smoke' | 'unpicked_waste' | 'stagnant_water';
export type ReportStatus = 'pending' | 'verified' | 'rejected' | 'failed' | 'resolved';
export type AIProcessingStatus = 'pending' | 'completed' | 'failed';
export type ContextProcessingStatus = 'pending' | 'completed' | 'partial' | 'failed';
export type HotspotStatus = 'active' | 'resolved';
export type RiskBand = 'low' | 'medium' | 'high' | 'critical';

export interface GeoLocation {
  lat: number;
  lng: number;
  localityName?: string;
}

export interface User {
  id: string;
  role: 'citizen' | 'authority';
  createdAt: Date;
  points?: number;
}

export interface Report {
  id: string; // Document ID
  createdBy: string;
  category: PollutionCategory;
  note?: string;
  imageUrl: string;
  imagePath: string;
  location: GeoLocation;
  status: ReportStatus;
  aiStatus: AIProcessingStatus;
  contextStatus: ContextProcessingStatus;
  aiVerification?: {
    isPollutionEvent: boolean;
    predictedCategory: PollutionCategory | 'none';
    confidence: number;
    severity: 1 | 2 | 3 | 4 | 5;
    reason: string;
    analyzedAt?: Date;
  };
  context?: {
    weather?: {
      temperatureC?: number;
      humidityPct?: number;
      windSpeedMps?: number;
      windDeg?: number;
      weatherMain?: string;
      weatherDescription?: string;
      fetchedAt?: Date;
    };
    air?: {
      aqi?: number;
      pm25?: number;
      pm10?: number;
      co?: number;
      no2?: number;
      o3?: number;
      so2?: number;
      fetchedAt?: Date;
    };
  };
  hotspotId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RiskAssessment {
  riskBand: RiskBand;
  riskScore: number; // 0-100
  predictionWindow: number; // e.g., 24 (hours)
  summary: string;
  drivers: string[];
}

export interface Hotspot {
  id: string; // Document ID
  category: PollutionCategory;
  center: GeoLocation;
  reportIds: string[];
  activeReportCount: number;
  totalReportCount: number;
  avgSeverity: number;
  status: HotspotStatus;
  risk?: RiskAssessment;
  name?: string;
  imageUrl?: string;
  latestReportAt: Date;
  firstSeenAt: Date;
  updatedAt: Date;
}

export interface Resolution {
  id: string;
  hotspotId: string;
  reportId?: string;
  resolvedBy: string; // Authority User ID
  note?: string;
  evidenceImageUrl?: string;
  createdAt: Date;
}
