"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const risk_1 = require("./risk");
describe('Hotspot Risk Engine', () => {
    const dummyLoc = { latitude: 0, longitude: 0 };
    const baseDate = new Date();
    const baseHotspot = {
        id: 'test-hotspot',
        category: 'waste_burning_smoke',
        centerCoordinates: dummyLoc,
        activeReportCount: 1,
        totalReportCount: 1,
        averageSeverity: 0,
        status: 'active',
        latestReportAt: baseDate,
        createdAt: baseDate,
        updatedAt: baseDate,
    };
    const baseReport = {
        id: 'test-report',
        userId: 'u1',
        category: 'waste_burning_smoke',
        imageMetadata: { url: '', storagePath: '', uploadedAt: baseDate },
        location: dummyLoc,
        status: 'pending',
        aiStatus: 'processed',
        contextStatus: 'processed',
        createdAt: baseDate,
    };
    it('assigns low risk to a new hotspot with 1 report, low severity, and no context', () => {
        const risk = (0, risk_1.calculateHotspotRisk)(Object.assign(Object.assign({}, baseHotspot), { activeReportCount: 1, averageSeverity: 20 }), [baseReport]);
        // Score = volume(5) + severity(8) = 13
        expect(risk.riskScore).toBe(13);
        expect(risk.riskBand).toBe('low');
        expect(risk.drivers).toContain('No significant risk drivers identified');
    });
    it('assigns medium risk with high report volume', () => {
        const risk = (0, risk_1.calculateHotspotRisk)(Object.assign(Object.assign({}, baseHotspot), { activeReportCount: 10, averageSeverity: 30 }), [baseReport]);
        // Score = volume(30, capped) + severity(12) = 42
        expect(risk.riskScore).toBe(42);
        expect(risk.riskBand).toBe('medium');
        expect(risk.drivers).toContain('High volume of active reports');
    });
    it('assigns high risk with high severity and unhealthy AQI', () => {
        const reportWithContext = Object.assign(Object.assign({}, baseReport), { context: {
                aqi: 120,
                temperature: 25,
                weatherCondition: 'Clear',
                windSpeed: 10,
                windDirection: 'N',
            } });
        (0, risk_1.calculateHotspotRisk)(Object.assign(Object.assign({}, baseHotspot), { activeReportCount: 4, averageSeverity: 80 }), [reportWithContext]);
        // Score = volume(20) + severity(32) + context(10) = 62 -> Wait, that's medium!
        // Wait, let's trace:
        // Volume: 4 * 5 = 20
        // Severity: (80 / 100) * 40 = 32
        // Context: AQI>100 -> 10
        // Total: 62. The band 'high' is >= 70.
        // Let's adjust to hit 'high'
        const highRisk = (0, risk_1.calculateHotspotRisk)(Object.assign(Object.assign({}, baseHotspot), { activeReportCount: 6, averageSeverity: 90 }), // Volume: 30, Severity: 36
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
        const reportWithHazardousContext = Object.assign(Object.assign({}, baseReport), { context: {
                aqi: 200,
                temperature: 30,
                weatherCondition: 'Smoke',
                windSpeed: 15,
                windDirection: 'E',
            } });
        const risk = (0, risk_1.calculateHotspotRisk)(Object.assign(Object.assign({}, baseHotspot), { activeReportCount: 15, averageSeverity: 95, createdAt: oldDate }), [reportWithHazardousContext]);
        // Score: Volume(30) + Severity(38) + Context(20) + Duration(10) = 98
        expect(risk.riskScore).toBe(98);
        expect(risk.riskBand).toBe('critical');
        expect(risk.drivers).toContain('Hazardous local AQI (200)');
        expect(risk.drivers).toContain('Unresolved for over 24 hours');
    });
});
//# sourceMappingURL=risk.test.js.map