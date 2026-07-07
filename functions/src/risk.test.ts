import { calculateHotspotRisk } from './risk';
import type { Hotspot, Report, GeoLocation } from './shared/types';

describe('Hotspot Risk Engine', () => {
  const dummyLoc: GeoLocation = { lat: 0, lng: 0 };
  const baseDate = new Date();

  const baseHotspot: Hotspot = {
    id: 'test-hotspot',
    category: 'unpicked_waste',
    center: dummyLoc,
    reportIds: [],
    activeReportCount: 1,
    totalReportCount: 1,
    avgSeverity: 0,
    status: 'active',
    latestReportAt: baseDate,
    firstSeenAt: baseDate,
    updatedAt: baseDate,
  };

  const baseReport: Report = {
    id: 'test-report',
    createdBy: 'u1',
    category: 'unpicked_waste',
    imageUrl: '',
    imagePath: '',
    location: dummyLoc,
    status: 'pending',
    aiStatus: 'completed',
    contextStatus: 'completed',
    createdAt: baseDate,
    updatedAt: baseDate,
  };

  it('assigns low risk to a new hotspot with 1 report, low severity, and no context', () => {
    const risk = calculateHotspotRisk(
      { ...baseHotspot, activeReportCount: 1, avgSeverity: 20 },
      [baseReport]
    );

    // Score = volume(5) + severity(8) = 13
    expect(risk.riskScore).toBe(13);
    expect(risk.riskBand).toBe('low');
    expect(risk.drivers).toContain('No significant risk drivers identified');
  });

  it('assigns medium risk with high report volume', () => {
    const risk = calculateHotspotRisk(
      { ...baseHotspot, activeReportCount: 10, avgSeverity: 30 },
      [baseReport]
    );

    // Score = volume(30, capped) + severity(12) = 42
    expect(risk.riskScore).toBe(42);
    expect(risk.riskBand).toBe('medium');
    expect(risk.drivers).toContain('High volume of active reports');
  });

  it('assigns high risk with high severity and unhealthy AQI', () => {
    const reportWithContext: Report = {
      ...baseReport,
      context: {
        air: { aqi: 120 },
        weather: {
          temperatureC: 25,
          weatherMain: 'Clear',
          windSpeedMps: 10,
          windDeg: 0
        }
      }
    };
    
    calculateHotspotRisk(
      { ...baseHotspot, activeReportCount: 4, avgSeverity: 80 },
      [reportWithContext]
    );

    // Score = volume(20) + severity(32) + context(10) = 62 -> Wait, that's medium!
    // Wait, let's trace:
    // Volume: 4 * 5 = 20
    // Severity: (80 / 100) * 40 = 32
    // Context: AQI>100 -> 10
    // Total: 62. The band 'high' is >= 70.
    // Let's adjust to hit 'high'
    const highRisk = calculateHotspotRisk(
      { ...baseHotspot, activeReportCount: 6, avgSeverity: 90 }, // Volume: 30, Severity: 36
      [reportWithContext] // Context: 10 => Total 76
    );

    expect(highRisk.riskScore).toBe(76);
    expect(highRisk.riskBand).toBe('high');
    expect(highRisk.drivers).toContain('High volume of active reports');
    expect(highRisk.drivers).toContain('High average visual severity assessed by AI');
    expect(highRisk.drivers).toContain('Unhealthy local AQI (120)');
  });

  it('assigns critical risk when all heuristics are maximized', () => {
    const oldDate = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48 hours ago
    
    const reportWithHazardousContext: Report = {
      ...baseReport,
      context: {
        air: { aqi: 200 },
        weather: {
          temperatureC: 30,
          weatherMain: 'Smoke',
          windSpeedMps: 15,
          windDeg: 90
        }
      }
    };
    
    const risk = calculateHotspotRisk(
      { ...baseHotspot, activeReportCount: 15, avgSeverity: 95, firstSeenAt: oldDate },
      [reportWithHazardousContext]
    );

    // Score: Volume(30) + Severity(38) + Context(20) + Duration(10) = 98
    expect(risk.riskScore).toBe(98);
    expect(risk.riskBand).toBe('critical');
    expect(risk.drivers).toContain('Hazardous local AQI (200)');
    expect(risk.drivers).toContain('Unresolved for over 24 hours');
  });
});
