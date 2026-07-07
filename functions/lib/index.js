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
exports.seedDummyHotspots = void 0;
const functions = __importStar(require("firebase-functions/v1"));
const admin = __importStar(require("firebase-admin"));
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
            firstSeenAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            activeReportCount: 5,
            totalReportCount: 5,
            avgSeverity: 4,
            risk: {
                riskScore: 75,
                riskBand: 'high',
                summary: 'Operational risk is high. Prioritize investigation.',
                drivers: ['High severity reports']
            },
            latestReportAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        {
            category: 'construction_dust',
            center: { lat: 23.0150, lng: 72.5600 },
            status: 'active',
            reportIds: [],
            firstSeenAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            activeReportCount: 3,
            totalReportCount: 3,
            avgSeverity: 3,
            risk: {
                riskScore: 50,
                riskBand: 'medium',
                summary: 'Operational risk is medium. Monitor for escalation.',
                drivers: ['Moderate severity']
            },
            latestReportAt: admin.firestore.FieldValue.serverTimestamp(),
        }
    ];
    for (const h of dummyHotspots) {
        await db.collection('hotspots').add(h);
    }
    res.send('Dummy hotspots in Ahmedabad seeded successfully!');
});
//# sourceMappingURL=index.js.map