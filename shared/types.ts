export type PollutionCategory = 'waste_burning_smoke' | 'construction_dust' | 'industrial_smoke';
export type ReportStatus = 'pending' | 'verified' | 'rejected' | 'resolved';
export type ProcessingStatus = 'pending' | 'processed' | 'failed';
export type HotspotStatus = 'active' | 'resolved';
export type RiskBand = 'low' | 'medium' | 'high' | 'critical';

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface User {
  id: string;
  role: 'citizen' | 'authority';
  createdAt: Date;
}

export interface Report {
  id: string; // Document ID
  userId: string;
  category: PollutionCategory;
  note?: string;
  imageMetadata: {
    url: string;
    storagePath: string;
    uploadedAt: Date;
  };
  location: GeoLocation;
  status: ReportStatus;
  aiStatus: ProcessingStatus;
  contextStatus: ProcessingStatus;
  aiVerification?: {
    isPollutionEvent: boolean;
    predictedCategory: PollutionCategory | 'none';
    confidence: number;
    severity: number;
    reason: string;
    analyzedAt: Date;
  };
  context?: {
    aqi: number;
    pm25?: number;
    pm10?: number;
    temperature: number;
    weatherCondition: string;
    windSpeed: number;
    windDirection: string;
  };
  hotspotId?: string;
  createdAt: Date;
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
  centerCoordinates: GeoLocation;
  activeReportCount: number;
  totalReportCount: number;
  averageSeverity: number;
  status: HotspotStatus;
  riskSummary?: RiskAssessment;
  latestReportAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Resolution {
  id: string;
  targetId: string;
  targetType: 'report' | 'hotspot';
  resolvedBy: string; // Authority User ID
  resolutionNote?: string;
  imageMetadata?: {
    url: string;
    storagePath: string;
    uploadedAt: Date;
  };
  resolvedAt: Date;
}
