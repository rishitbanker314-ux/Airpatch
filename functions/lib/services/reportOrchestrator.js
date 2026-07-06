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
Object.defineProperty(exports, "__esModule", { value: true });
exports.processReportCreated = processReportCreated;
const admin = __importStar(require("firebase-admin"));
const geminiProvider_1 = require("../providers/geminiProvider");
const openWeatherProvider_1 = require("../providers/openWeatherProvider");
async function processReportCreated(reportId, data) {
    // Validate requirements
    const storagePath = data.imagePath || data.imageUrl; // Using imagePath is preferred for Admin SDK
    const location = data.location;
    if (!storagePath) {
        throw new Error('Report missing imagePath or imageUrl');
    }
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
        throw new Error('Report missing valid location data');
    }
    // Update status to started/pending
    const db = admin.firestore();
    const reportRef = db.collection('reports').doc(reportId);
    await reportRef.update({
        aiStatus: 'pending',
        contextStatus: 'pending',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    // Prepare promises
    // 1. Gemini (requires downloading image first)
    const geminiPromise = (async () => {
        try {
            // Determine if it's a full URL or a storage path. If it's a full URL, we extract the path or fetch it natively.
            // But for Airpatch we assume imagePath is a storage path (e.g. 'reports/xxx/image.jpg').
            // Let's just use the bucket to download it.
            let bucketName;
            let path = storagePath;
            // Basic safety if it's a gs:// URL
            if (storagePath.startsWith('gs://')) {
                const parts = storagePath.replace('gs://', '').split('/');
                bucketName = parts.shift();
                path = parts.join('/');
            }
            const defaultBucket = process.env.FIREBASE_STORAGE_BUCKET || 'airpatch-b750a.firebasestorage.app';
            const bucket = bucketName ? admin.storage().bucket(bucketName) : admin.storage().bucket(defaultBucket);
            const file = bucket.file(path);
            const [buffer] = await file.download();
            const base64Image = buffer.toString('base64');
            const result = await (0, geminiProvider_1.analyzeHotspotImage)(base64Image, data.note, data.category);
            return result;
        }
        catch (err) {
            console.error('[Orchestrator] Gemini analysis failed:', err);
            throw err;
        }
    })();
    // 2. Weather Context
    const weatherPromise = (0, openWeatherProvider_1.getWeather)(location.lat, location.lng).catch(err => {
        console.error('[Orchestrator] Weather fetch failed:', err);
        throw err;
    });
    // 3. AQI Context
    const aqiPromise = (0, openWeatherProvider_1.getAirPollution)(location.lat, location.lng).catch(err => {
        console.error('[Orchestrator] AQI fetch failed:', err);
        throw err;
    });
    // Execute in parallel
    const [geminiResult, weatherResult, aqiResult] = await Promise.allSettled([
        geminiPromise,
        weatherPromise,
        aqiPromise
    ]);
    const updates = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    // Process Gemini Result
    if (geminiResult.status === 'fulfilled') {
        updates.aiStatus = 'completed';
        updates.aiVerification = geminiResult.value;
        // Gamification: Award 10 points if it is a verified pollution event
        if (geminiResult.value.isPollutionEvent && data.createdBy) {
            const userRef = db.collection('users').doc(data.createdBy);
            await userRef.update({
                points: admin.firestore.FieldValue.increment(10)
            }).catch(err => console.error('[Orchestrator] Failed to award points:', err));
        }
    }
    else {
        updates.aiStatus = 'failed';
    }
    // Process Context Results
    if (weatherResult.status === 'fulfilled' || aqiResult.status === 'fulfilled') {
        updates.context = {};
        if (weatherResult.status === 'fulfilled') {
            updates.context.weather = weatherResult.value;
        }
        if (aqiResult.status === 'fulfilled') {
            updates.context.air = aqiResult.value;
        }
        // Determine if context is fully completed or partially completed
        if (weatherResult.status === 'fulfilled' && aqiResult.status === 'fulfilled') {
            updates.contextStatus = 'completed';
        }
        else {
            updates.contextStatus = 'partial';
        }
    }
    else {
        updates.contextStatus = 'failed';
    }
    // Final Update
    await reportRef.update(updates);
}
//# sourceMappingURL=reportOrchestrator.js.map