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
exports.onReportCreated = void 0;
const functions = __importStar(require("firebase-functions/v1"));
const reportOrchestrator_1 = require("../services/reportOrchestrator");
exports.onReportCreated = functions.firestore
    .document('reports/{reportId}')
    .onCreate(async (snap, context) => {
    const data = snap.data();
    // Prevent re-processing if it already has a status
    if (data.aiStatus && data.aiStatus !== 'pending') {
        return;
    }
    try {
        await (0, reportOrchestrator_1.processReportCreated)(context.params.reportId, data);
    }
    catch (error) {
        console.error(`[ReportTrigger] Error processing report ${context.params.reportId}:`, error);
        // Fallback update in case the orchestrator threw before it could write failed statuses
        await snap.ref.update({
            aiStatus: data.aiStatus || 'failed',
            contextStatus: data.contextStatus || 'failed',
        });
    }
});
//# sourceMappingURL=reportTriggers.js.map