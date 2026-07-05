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
exports.getHotspotDetails = exports.getHotspots = exports.assignReportTrigger = void 0;
exports.assignReportToHotspot = assignReportToHotspot;
exports.recomputeHotspotStats = recomputeHotspotStats;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const constants_1 = require("./config/constants");
const geo_1 = require("./utils/geo");
const risk_1 = require("./risk");
exports.assignReportTrigger = functions.firestore
    .document('reports/{reportId}')
    .onUpdate(async (change, context) => {
    var _a;
    const before = change.before.data();
    const after = change.after.data();
    const reportId = context.params.reportId;
    // Only process when AI verification completes and it is a confirmed pollution event
    if (before.aiStatus !== 'processed' && after.aiStatus === 'processed') {
        if (((_a = after.aiVerification) === null || _a === void 0 ? void 0 : _a.isPollutionEvent) && !after.hotspotId) {
            await assignReportToHotspot(reportId, after);
        }
    }
});
async function assignReportToHotspot(reportId, report) {
    const db = admin.firestore();
    // Fetch all active hotspots for this category
    // For MVP, we do this without geohashing, assuming a manageable number of active hotspots.
    const hotspotsSnapshot = await db.collection('hotspots')
        .where('category', '==', report.category)
        .where('status', '==', 'active')
        .get();
    let closestHotspotId = null;
    let minDistance = constants_1.HOTSPOT_RADIUS_METERS;
    hotspotsSnapshot.forEach(doc => {
        const hotspot = doc.data();
        const dist = (0, geo_1.calculateDistanceMeters)(report.location.latitude, report.location.longitude, hotspot.centerCoordinates.latitude, hotspot.centerCoordinates.longitude);
        if (dist <= minDistance) {
            minDistance = dist;
            closestHotspotId = doc.id;
        }
    });
    const now = admin.firestore.FieldValue.serverTimestamp();
    if (closestHotspotId) {
        // Assign to existing hotspot
        await db.collection('reports').doc(reportId).update({
            hotspotId: closestHotspotId
        });
        await recomputeHotspotStats(closestHotspotId);
    }
    else {
        // Create new hotspot anchored to this report
        const newHotspotRef = db.collection('hotspots').doc();
        // Create bare-bones hotspot and let recomputeHotspotStats populate counts/severity
        await newHotspotRef.set({
            category: report.category,
            centerCoordinates: report.location,
            status: 'active',
            createdAt: now,
            updatedAt: now,
        });
        await db.collection('reports').doc(reportId).update({
            hotspotId: newHotspotRef.id
        });
        await recomputeHotspotStats(newHotspotRef.id);
    }
}
async function recomputeHotspotStats(hotspotId) {
    const db = admin.firestore();
    // Query all reports assigned to this hotspot
    const reportsSnapshot = await db.collection('reports')
        .where('hotspotId', '==', hotspotId)
        .get();
    let activeCount = 0;
    let totalCount = 0;
    let totalSeverity = 0;
    let severityCount = 0;
    let latestDate = new Date(0);
    reportsSnapshot.forEach(doc => {
        var _a;
        const r = doc.data();
        totalCount++;
        // Assuming 'resolved' or 'rejected' are inactive
        if (r.status === 'pending' || r.status === 'verified') {
            activeCount++;
        }
        if (((_a = r.aiVerification) === null || _a === void 0 ? void 0 : _a.severity) !== undefined) {
            totalSeverity += r.aiVerification.severity;
            severityCount++;
        }
        // Convert Firestore Timestamp to Date if necessary
        const reportDate = r.createdAt instanceof admin.firestore.Timestamp
            ? r.createdAt.toDate()
            : new Date(r.createdAt);
        if (reportDate > latestDate) {
            latestDate = reportDate;
        }
    });
    const averageSeverity = severityCount > 0 ? Math.round(totalSeverity / severityCount) : 0;
    const status = activeCount === 0 ? 'resolved' : 'active';
    const latestReportAtTs = admin.firestore.Timestamp.fromDate(latestDate);
    const hotspotRef = db.collection('hotspots').doc(hotspotId);
    const hotspotDoc = await hotspotRef.get();
    if (!hotspotDoc.exists) {
        return;
    }
    const currentHotspot = hotspotDoc.data();
    // Create a merged version of the hotspot with new stats for the risk engine
    const updatedHotspotProps = {
        activeReportCount: activeCount,
        totalReportCount: totalCount,
        averageSeverity,
        status,
        latestReportAt: latestDate, // Pass Date object to risk engine
    };
    const mergedHotspot = Object.assign(Object.assign({}, currentHotspot), updatedHotspotProps);
    // Calculate risk summary
    // We need to pass the raw reports (with Context properly structured)
    const rawReports = reportsSnapshot.docs.map(d => d.data());
    const riskSummary = (0, risk_1.calculateHotspotRisk)(mergedHotspot, rawReports);
    await hotspotRef.update({
        activeReportCount: activeCount,
        totalReportCount: totalCount,
        averageSeverity,
        status,
        riskSummary,
        latestReportAt: latestReportAtTs,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
}
// Expose callable functions
exports.getHotspots = functions.https.onCall(async (data, context) => {
    const db = admin.firestore();
    const snapshot = await db.collection('hotspots')
        .where('status', '==', 'active')
        .get();
    return snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
});
exports.getHotspotDetails = functions.https.onCall(async (data, context) => {
    if (!data.hotspotId) {
        throw new functions.https.HttpsError('invalid-argument', 'hotspotId is required');
    }
    const db = admin.firestore();
    const hotspotDoc = await db.collection('hotspots').doc(data.hotspotId).get();
    if (!hotspotDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Hotspot not found');
    }
    const reportsSnapshot = await db.collection('reports')
        .where('hotspotId', '==', data.hotspotId)
        .orderBy('createdAt', 'desc')
        .get();
    return {
        hotspot: Object.assign({ id: hotspotDoc.id }, hotspotDoc.data()),
        reports: reportsSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())))
    };
});
//# sourceMappingURL=hotspots.js.map