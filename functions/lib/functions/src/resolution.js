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
exports.submitResolution = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const hotspots_1 = require("./hotspots");
exports.submitResolution = functions.https.onCall(async (data, context) => {
    const { hotspotId, reportId, note, evidenceImageUrl, resolvedBy } = data;
    if (!hotspotId) {
        throw new functions.https.HttpsError('invalid-argument', 'hotspotId is required');
    }
    const db = admin.firestore();
    const now = admin.firestore.FieldValue.serverTimestamp();
    // The caller might provide `resolvedBy` or we default it for MVP
    const finalResolvedBy = resolvedBy || 'authority_demo';
    if (reportId) {
        const reportRef = db.collection('reports').doc(reportId);
        const reportDoc = await reportRef.get();
        if (!reportDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Report not found');
        }
        await reportRef.update({
            status: 'resolved',
            updatedAt: now,
        });
        await (0, hotspots_1.recomputeHotspotStats)(hotspotId);
    }
    else {
        const hotspotRef = db.collection('hotspots').doc(hotspotId);
        const hotspotDoc = await hotspotRef.get();
        if (!hotspotDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Hotspot not found');
        }
        // Resolve all active reports in this hotspot
        const reportsSnapshot = await db.collection('reports')
            .where('hotspotId', '==', hotspotId)
            .where('status', 'in', ['pending', 'verified'])
            .get();
        if (!reportsSnapshot.empty) {
            const batch = db.batch();
            reportsSnapshot.forEach(doc => {
                batch.update(doc.ref, { status: 'resolved', updatedAt: now });
            });
            await batch.commit();
        }
        // Now recompute stats which will naturally resolve the hotspot
        await (0, hotspots_1.recomputeHotspotStats)(hotspotId);
    }
    // Create resolution record
    const resolutionRef = db.collection('resolutions').doc();
    const resolutionData = {
        hotspotId,
        resolvedBy: finalResolvedBy,
        createdAt: now,
    };
    if (reportId)
        resolutionData.reportId = reportId;
    if (note)
        resolutionData.note = note;
    if (evidenceImageUrl)
        resolutionData.evidenceImageUrl = evidenceImageUrl;
    await resolutionRef.set(resolutionData);
    return { success: true, resolutionId: resolutionRef.id };
});
//# sourceMappingURL=resolution.js.map