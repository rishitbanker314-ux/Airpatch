import { calculateDistanceMeters } from './utils/geo';
import { assignReportToHotspot, recomputeHotspotStats } from './hotspots';
import * as admin from 'firebase-admin';

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
        static fromDate(date: Date) { return date; }
      }
    })
  };
});

describe('Hotspot Engine Tests', () => {
  describe('calculateDistanceMeters', () => {
    it('calculates accurate distance between two points', () => {
      // New York (40.7128, -74.0060) to Newark (40.7357, -74.1724)
      const dist = calculateDistanceMeters(40.7128, -74.0060, 40.7357, -74.1724);
      // Roughly 14.3km
      expect(dist).toBeGreaterThan(14000);
      expect(dist).toBeLessThan(14500);
    });

    it('returns 0 for the same point', () => {
      expect(calculateDistanceMeters(40, -74, 40, -74)).toBe(0);
    });
  });

  describe('assignReportToHotspot logic (mocked)', () => {
    let mockCollection: jest.Mock;
    
    beforeEach(() => {
      mockCollection = admin.firestore().collection as jest.Mock;
      mockCollection.mockClear();
    });

    it('assigns to closest hotspot within radius', async () => {
      const mockUpdate = jest.fn();
      const mockWhere = jest.fn().mockReturnThis();
      const mockGet = jest.fn().mockResolvedValue({
        forEach: (callback: any) => {
          callback({
            id: 'hotspot-1',
            data: () => ({
              category: 'unpicked_waste',
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
            where: () => ({ get: () => Promise.resolve({ forEach: () => {}, docs: [] }) })
          };
        }
        return {};
      });

      const report: any = {
        category: 'unpicked_waste',
        location: { lat: 40.7130, lng: -74.0065 }, // Very close
        createdAt: new Date()
      };

      await assignReportToHotspot('report-1', report);
      expect(mockWhere).toHaveBeenCalledWith('category', '==', 'unpicked_waste');
      expect(mockUpdate).toHaveBeenCalledWith({ hotspotId: 'hotspot-1' });
    });
  });

  describe('recomputeHotspot logic (mocked)', () => {
    let mockCollection: jest.Mock;
    
    beforeEach(() => {
      mockCollection = admin.firestore().collection as jest.Mock;
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
        forEach: function(this: any, callback: any) {
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

      await recomputeHotspotStats('hotspot-1');
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        activeReportCount: 2,
        totalReportCount: 3,
        avgSeverity: 50, // (50+90+10)/3 = 50
        status: 'active'
      }));
    });
  });
});
