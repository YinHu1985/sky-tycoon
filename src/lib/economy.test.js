import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateFlightRouteIncome, calculateFrequency, calculateWeeklyFinance } from './economy';
import * as utils from './utils';
import * as modifiers from './modifiers';

// Mock imports
vi.mock('../data/cities.js', () => ({
  CITIES: [
    { id: 'nyc', name: 'New York', lat: 40.7128, lon: -74.0060, region: 'NA', biz: 8, tour: 6 },
    { id: 'lon', name: 'London', lat: 51.5074, lon: -0.1278, region: 'EU', biz: 9, tour: 7 },
  ]
}));

vi.mock('../data/planes.js', () => ({
  PLANE_TYPES: [
    { id: 'b737', name: 'B737', speed: 800, range: 5000, capacity: 150, fuelCost: 2.5, maint: 1000, idle: 500 },
  ]
}));

// Mock utils and modifiers to isolate economy logic
vi.mock('./utils.js', async () => {
  const actual = await vi.importActual('./utils.js');
  return {
    ...actual,
    calculateDistance: vi.fn(),
  };
});

vi.mock('./modifiers.js', async () => {
    return {
        getModifiersForTarget: vi.fn(() => []),
        applyModifiers: vi.fn((val) => val),
        calculateFame: vi.fn(() => 100),
        calculatePropertyFinancials: vi.fn(() => ({ totalPropertyIncome: 0, totalPropertyCost: 0, properties: [] })),
        getCityAttributes: vi.fn((company, city) => ({ biz: city.biz, tour: city.tour })),
    };
});

describe('Economy Library', () => {
  const mockCompany = {
    id: 'player',
    routes: [],
    fleet: { 'b737': 2 },
    maintenanceEffort: 50,
    serviceEffort: 50,
    prBudget: 1000,
    fame: 100,
    money: 1000000
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default distance mock
    vi.mocked(utils.calculateDistance).mockReturnValue(5500); // approx NYC-LON km
  });

  describe('calculateFlightRouteIncome', () => {
    it('should calculate flight costs correctly based on fuelCost', () => {
      const route = {
        id: 'r1',
        sourceId: 'nyc',
        targetId: 'lon',
        planeTypeId: 'b737',
        frequency: 7,
        assignedCount: 1,
        priceModifier: 0
      };

      const dist = 5500;
      vi.mocked(utils.calculateDistance).mockReturnValue(dist);

      const result = calculateFlightRouteIncome(mockCompany, route);

      // Formula: frequency * (2 * dist * fuelCost)
      // 7 * (2 * 5500 * 2.5)
      // 7 * (11000 * 2.5)
      // 7 * 27500 = 192500
      const expectedFlightCost = 7 * 2 * dist * 2.5;
      expect(result.flightCost).toBe(expectedFlightCost);
      expect(result.flightCost).toBe(192500);
    });

    it('should calculate maintenance costs correctly', () => {
        const route = {
          id: 'r1',
          sourceId: 'nyc',
          targetId: 'lon',
          planeTypeId: 'b737',
          frequency: 7,
          assignedCount: 2, // 2 planes
          priceModifier: 0
        };
  
        const result = calculateFlightRouteIncome(mockCompany, route);
  
        // Formula: assignedCount * maint
        // 2 * 1000 = 2000
        expect(result.maintCost).toBe(2000);
    });

    it('should handle invalid route data gracefully', () => {
        const route = {
            id: 'r_invalid',
            sourceId: 'invalid_city',
            targetId: 'lon',
            planeTypeId: 'b737'
        };
        const result = calculateFlightRouteIncome(mockCompany, route);
        // Should return the route object itself or a safe object
        // The current implementation returns the route object if data is missing
        expect(result).toBe(route);
    });
  });

  describe('calculateFrequency', () => {
      it('should calculate max frequency correctly', () => {
          // speed 800, dist 1600
          // flightTime = 2 hours
          // roundTrip = 2*2 + 4 = 8 hours
          // tripsPerPlane = floor(168 / 8) = 21
          // assignedCount = 2
          // total = 42

          vi.mocked(utils.calculateDistance).mockReturnValue(1600); // Not used by calculateFrequency directly but good to note
          // Wait, calculateFrequency takes distance as arg
          
          const result = calculateFrequency('b737', 1600, 2);
          expect(result).toBe(42);
      });

      it('should return 0 for invalid plane type', () => {
          const result = calculateFrequency('ufo', 1000, 1);
          expect(result).toBe(0);
      });
  });

  describe('calculateWeeklyFinance', () => {
      it('should aggregate costs and revenue', () => {
          const company = {
              ...mockCompany,
              routes: [
                  {
                      id: 'r1',
                      sourceId: 'nyc',
                      targetId: 'lon',
                      planeTypeId: 'b737',
                      frequency: 1,
                      assignedCount: 1,
                      priceModifier: 0
                  }
              ],
              fleet: { 'b737': 2 } // 1 assigned, 1 idle
          };

          // Setup mocks for predictable results
          const dist = 1000;
          vi.mocked(utils.calculateDistance).mockReturnValue(dist);
          
          // Flight Cost: 1 * 2 * 1000 * 2.5 = 5000
          // Maint Cost: 1 * 1000 = 1000
          // Idle Cost: 1 idle plane * 500 = 500
          // PR Cost: 1000
          
          // Revenue: depends on demand logic, let's just check if it returns a number
          // But we can calculate expected rough revenue
          // Capacity: 1 * 150 * 2 = 300
          // Base Demand: (8+9+6+7)*10 = 300. 
          // Load Factor ~ 1.0
          // Pax ~ 300
          // Ticket: 50 + 1000*0.55 = 600
          // Revenue ~ 300 * 600 = 180000

          const result = calculateWeeklyFinance(company);

          expect(result.stats.totalFlightCost).toBe(5000);
          expect(result.stats.totalMaintCost).toBe(1000);
          expect(result.stats.totalIdleCost).toBe(500);
          expect(result.stats.totalPrCost).toBe(1000);
          
          expect(result.stats.netIncome).toBe(
              result.stats.totalRevenue 
              - result.stats.totalFlightCost 
              - result.stats.totalMaintCost 
              - result.stats.totalIdleCost 
              - result.stats.totalPrCost
          );
      });
  });
});
