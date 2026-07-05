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
const geo_1 = require("./utils/geo");
const hotspots_1 = require("./hotspots");
const admin = __importStar(require("firebase-admin"));
jest.mock('firebase-admin', () => {
    const collectionMock = jest.fn();
    const firestoreMock = jest.fn(() => ({
        collection: collectionMock
    }));
    return {
        firestore: Object.assign(firestoreMock, {
            FieldValue: {
                serverTimestamp: jest.fn(() => 'server-timestamp')
            },
            Timestamp: class Timestamp {
                static fromDate(date) { return date; }
            }
        })
    };
});
describe('Hotspot Engine Tests', () => {
    describe('calculateDistanceMeters', () => {
        it('calculates accurate distance between two points', () => {
            // New York (40.7128, -74.0060) to Newark (40.7357, -74.1724)
            const dist = (0, geo_1.calculateDistanceMeters)(40.7128, -74.0060, 40.7357, -74.1724);
            // Roughly 14.3km
            expect(dist).toBeGreaterThan(14000);
            expect(dist).toBeLessThan(14500);
        });
        it('returns 0 for the same point', () => {
            expect((0, geo_1.calculateDistanceMeters)(40, -74, 40, -74)).toBe(0);
        });
    });
    describe('assignReportToHotspot logic (mocked)', () => {
        let mockCollection;
        beforeEach(() => {
            mockCollection = admin.firestore().collection;
            mockCollection.mockClear();
        });
        it('assigns to closest hotspot within radius', async () => {
            const mockUpdate = jest.fn();
            const mockWhere = jest.fn().mockReturnThis();
            const mockGet = jest.fn().mockResolvedValue({
                forEach: (callback) => {
                    callback({
                        id: 'hotspot-1',
                        data: () => ({
                            category: 'waste_burning_smoke',
                            center: { lat: 40.7128, lng: -74.0060 }
                        })
                    });
                }
            });
            mockCollection.mockImplementation((name) => {
                if (name === 'hotspots') {
                    return {
                        where: mockWhere,
                        get: mockGet,
                        doc: () => ({ get: () => Promise.resolve({ exists: true, data: () => ({}) }), update: mockUpdate, set: mockUpdate })
                    };
                }
                if (name === 'reports') {
                    return {
                        doc: () => ({ update: mockUpdate }),
                        where: () => ({ get: () => Promise.resolve({ forEach: () => { }, docs: [] }) })
                    };
                }
                return {};
            });
            const report = {
                category: 'waste_burning_smoke',
                location: { lat: 40.7130, lng: -74.0065 }, // Very close
                createdAt: new Date()
            };
            await (0, hotspots_1.assignReportToHotspot)('report-1', report);
            expect(mockWhere).toHaveBeenCalledWith('category', '==', 'waste_burning_smoke');
            expect(mockUpdate).toHaveBeenCalledWith({ hotspotId: 'hotspot-1' });
        });
    });
    describe('recomputeHotspot logic (mocked)', () => {
        let mockCollection;
        beforeEach(() => {
            mockCollection = admin.firestore().collection;
            mockCollection.mockClear();
        });
        it('computes correct averages and counts', async () => {
            const mockUpdate = jest.fn();
            const mockWhere = jest.fn().mockReturnThis();
            const mockGet = jest.fn().mockResolvedValue({
                docs: [
                    { id: 'report-1', data: () => ({ status: 'pending', aiVerification: { severity: 50 }, createdAt: new Date(1000) }) },
                    { id: 'report-2', data: () => ({ status: 'verified', aiVerification: { severity: 90 }, createdAt: new Date(2000) }) },
                    { id: 'report-3', data: () => ({ status: 'rejected', aiVerification: { severity: 10 }, createdAt: new Date(500) }) }
                ],
                forEach: function (callback) {
                    this.docs.forEach(callback);
                }
            });
            mockCollection.mockImplementation((name) => {
                if (name === 'reports') {
                    return { where: mockWhere, get: mockGet };
                }
                if (name === 'hotspots') {
                    return { doc: () => ({ get: () => Promise.resolve({ exists: true, data: () => ({}) }), update: mockUpdate }) };
                }
                return {};
            });
            await (0, hotspots_1.recomputeHotspotStats)('hotspot-1');
            expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
                activeReportCount: 2,
                totalReportCount: 3,
                avgSeverity: 50, // (50+90+10)/3 = 50
                status: 'active'
            }));
        });
    });
});
//# sourceMappingURL=hotspots.test.js.map