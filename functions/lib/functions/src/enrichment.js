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
exports.enrichReportContext = void 0;
const functions = __importStar(require("firebase-functions"));
const weather_1 = require("./providers/weather");
const weatherProvider = new weather_1.MockWeatherProvider();
exports.enrichReportContext = functions.firestore
    .document('reports/{reportId}')
    .onCreate(async (snap, context) => {
    const data = snap.data();
    if (data.contextStatus !== 'pending') {
        return;
    }
    try {
        const location = data.location;
        if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
            throw new Error('Invalid location data');
        }
        const weatherContext = await weatherProvider.getContext(location.lat, location.lng);
        await snap.ref.update({
            context: weatherContext,
            contextStatus: 'processed'
        });
    }
    catch (error) {
        console.error('Error enriching report context:', error);
        // Fail gracefully
        await snap.ref.update({
            contextStatus: 'failed'
        });
    }
});
//# sourceMappingURL=enrichment.js.map