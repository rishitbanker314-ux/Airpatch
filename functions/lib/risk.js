"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateHotspotRisk = calculateHotspotRisk;
/**
 * Calculates a heuristic operational risk score (0-100) for a hotspot.
 *
 * Heuristic Components:
 * 1. Report Volume (0-30 pts)
 * 2. AI Severity (0-40 pts)
 * 3. Environmental Context (0-20 pts)
 * 4. Duration/Staleness (0-10 pts)
 */
function calculateHotspotRisk(hotspot, reports) {
    var _a;
    let score = 0;
    const drivers = [];
    // 1. Report Volume (Up to 30 pts)
    // E.g., 5 points per active report, capped at 30 (6+ reports)
    const volumeScore = Math.min(hotspot.activeReportCount * 5, 30);
    score += volumeScore;
    if (volumeScore >= 20) {
        drivers.push('High volume of active reports');
    }
    // 2. AI Severity (Up to 40 pts)
    // Maps 0-100 severity to 0-40 points
    const severityScore = Math.round((hotspot.avgSeverity / 100) * 40);
    score += severityScore;
    if (hotspot.avgSeverity >= 70) {
        drivers.push('High average visual severity assessed by AI');
    }
    // 3. Environmental Context (Up to 20 pts)
    // Use the most recent report's context
    const latestContext = (_a = reports.find(r => r.context)) === null || _a === void 0 ? void 0 : _a.context;
    let contextScore = 0;
    if (latestContext && latestContext.air) {
        if (latestContext.air.aqi && latestContext.air.aqi > 150) {
            contextScore = 20;
            drivers.push(`Hazardous local AQI (${latestContext.air.aqi})`);
        }
        else if (latestContext.air.aqi && latestContext.air.aqi > 100) {
            contextScore = 10;
            drivers.push(`Unhealthy local AQI (${latestContext.air.aqi})`);
        }
        score += contextScore;
    }
    // 4. Duration / Staleness (Up to 10 pts)
    // If the hotspot has been open for > 24 hours, add 10 points
    let durationScore = 0;
    if (hotspot.firstSeenAt) {
        const firstSeenMs = typeof hotspot.firstSeenAt.toMillis === 'function'
            ? hotspot.firstSeenAt.toMillis()
            : typeof hotspot.firstSeenAt.getTime === 'function'
                ? hotspot.firstSeenAt.getTime()
                : hotspot.firstSeenAt.toDate ? hotspot.firstSeenAt.toDate().getTime() : Date.now();
        const hoursOpen = (Date.now() - firstSeenMs) / (1000 * 60 * 60);
        if (hoursOpen > 24) {
            durationScore = 10;
            drivers.push('Unresolved for over 24 hours');
        }
    }
    score += durationScore;
    // Clamp final score 0-100
    const finalScore = Math.min(Math.max(score, 0), 100);
    // Assign Band
    let riskBand = 'low';
    let summary = 'Operational risk is low.';
    if (finalScore >= 90) {
        riskBand = 'critical';
        summary = 'Operational risk is critical. Immediate escalation required.';
    }
    else if (finalScore >= 70) {
        riskBand = 'high';
        summary = 'Operational risk is high. Prioritize investigation.';
    }
    else if (finalScore >= 30) {
        riskBand = 'medium';
        summary = 'Operational risk is medium. Monitor for escalation.';
    }
    // Default driver if empty
    if (drivers.length === 0) {
        drivers.push('No significant risk drivers identified');
    }
    return {
        riskBand,
        riskScore: finalScore,
        predictionWindow: 24, // Fixed 24h window for MVP
        summary,
        drivers
    };
}
//# sourceMappingURL=risk.js.map