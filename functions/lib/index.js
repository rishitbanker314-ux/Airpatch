"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCityAqiForecast = exports.getCityAqiTrend = exports.seedDummyHotspots = void 0;
const functions = __importStar(require("firebase-functions/v1"));
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
const openWeatherProvider_1 = require("./providers/openWeatherProvider");
admin.initializeApp();
__exportStar(require("./triggers/reportTriggers"), exports);
__exportStar(require("./hotspots"), exports);
__exportStar(require("./resolution"), exports);
exports.seedDummyHotspots = functions.https.onRequest(async (req, res) => {
    const db = admin.firestore();
    const dummyHotspots = [
        {
            category: 'unpicked_waste',
            center: { lat: 23.0300, lng: 72.5800 },
            status: 'active',
            reportIds: [],
            firstSeenAt: firestore_1.FieldValue.serverTimestamp(),
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
            activeReportCount: 5,
            totalReportCount: 5,
            avgSeverity: 4,
            risk: {
                riskScore: 75,
                riskBand: 'high',
                summary: 'Operational risk is high. Prioritize investigation.',
                drivers: ['High severity reports']
            },
            latestReportAt: firestore_1.FieldValue.serverTimestamp(),
        },
        {
            category: 'construction_dust',
            center: { lat: 23.0150, lng: 72.5600 },
            status: 'active',
            reportIds: [],
            firstSeenAt: firestore_1.FieldValue.serverTimestamp(),
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
            activeReportCount: 3,
            totalReportCount: 3,
            avgSeverity: 3,
            risk: {
                riskScore: 50,
                riskBand: 'medium',
                summary: 'Operational risk is medium. Monitor for escalation.',
                drivers: ['Moderate severity']
            },
            latestReportAt: firestore_1.FieldValue.serverTimestamp(),
        }
    ];
    for (const h of dummyHotspots) {
        await db.collection('hotspots').add(h);
    }
    res.send('Dummy hotspots in Ahmedabad seeded successfully!');
});
exports.getCityAqiTrend = functions.https.onCall(async (data, context) => {
    // Default to New Delhi coordinates
    const lat = data.lat || 28.6139;
    const lng = data.lng || 77.2090;
    const period = data.period || '24h';
    let days = 1;
    if (period === 'weekly')
        days = 7;
    else if (period === 'monthly')
        days = 30;
    const end = Math.floor(Date.now() / 1000);
    const start = end - days * 24 * 60 * 60;
    try {
        const history = await (0, openWeatherProvider_1.getHistoricalAirPollution)(lat, lng, start, end);
        // We want 9 buckets
        const buckets = new Array(9).fill(0);
        const bucketDuration = (days * 24 * 60 * 60) / 9;
        if (history.list && Array.isArray(history.list)) {
            history.list.forEach((entry) => {
                const timeDiff = entry.dt - start;
                let bucketIndex = Math.floor(timeDiff / bucketDuration);
                if (bucketIndex >= 9)
                    bucketIndex = 8;
                if (bucketIndex >= 0) {
                    // OpenWeather AQI is 1-5. Store raw AQI, we map it later on frontend
                    // But wait, it's better to map it right here!
                    let usAqi = 0;
                    const owAqi = entry.main.aqi || 0;
                    if (owAqi === 1)
                        usAqi = 30;
                    else if (owAqi === 2)
                        usAqi = 75;
                    else if (owAqi === 3)
                        usAqi = 125;
                    else if (owAqi === 4)
                        usAqi = 175;
                    else if (owAqi === 5)
                        usAqi = 250;
                    else
                        usAqi = owAqi; // fallback
                    buckets[bucketIndex] = Math.max(buckets[bucketIndex], usAqi);
                }
            });
        }
        return { buckets };
    }
    catch (error) {
        console.error("Failed to fetch city AQI trend:", error);
        throw new functions.https.HttpsError('internal', 'Failed to fetch city AQI trend');
    }
});
exports.getCityAqiForecast = functions.https.onCall(async (data, context) => {
    // Default to New Delhi coordinates
    const lat = data.lat || 28.6139;
    const lng = data.lng || 77.2090;
    try {
        const forecast = await (0, openWeatherProvider_1.getAirPollutionForecast)(lat, lng);
        // We want the peak AQI for the next 3 days
        // The forecast endpoint returns hourly data for ~5 days
        // Each entry has `dt` (unix timestamp)
        const now = new Date();
        // Midnight tonight (start of tomorrow)
        const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() / 1000;
        // We will collect max AQI for: Day 1 (tomorrow), Day 2, Day 3
        let day1Max = 0;
        let day2Max = 0;
        let day3Max = 0;
        if (forecast.list && Array.isArray(forecast.list)) {
            forecast.list.forEach((entry) => {
                let usAqi = 0;
                const owAqi = entry.main.aqi || 0;
                if (owAqi === 1)
                    usAqi = 30;
                else if (owAqi === 2)
                    usAqi = 75;
                else if (owAqi === 3)
                    usAqi = 125;
                else if (owAqi === 4)
                    usAqi = 175;
                else if (owAqi === 5)
                    usAqi = 250;
                else
                    usAqi = owAqi;
                const dt = entry.dt;
                if (dt >= tomorrowStart && dt < tomorrowStart + 86400) {
                    day1Max = Math.max(day1Max, usAqi);
                }
                else if (dt >= tomorrowStart + 86400 && dt < tomorrowStart + 86400 * 2) {
                    day2Max = Math.max(day2Max, usAqi);
                }
                else if (dt >= tomorrowStart + 86400 * 2 && dt < tomorrowStart + 86400 * 3) {
                    day3Max = Math.max(day3Max, usAqi);
                }
            });
        }
        // If no data was found for a day, provide a reasonable fallback or 0
        return {
            forecast: [day1Max, day2Max, day3Max]
        };
    }
    catch (error) {
        console.error("Failed to fetch city AQI forecast:", error);
        throw new functions.https.HttpsError('internal', 'Failed to fetch city AQI forecast');
    }
});
//# sourceMappingURL=index.js.map