import { describe, it, expect } from 'vitest';
import { CITIES } from './cities';
import { PLANE_TYPES } from './planes';

describe('Data Integrity', () => {
  describe('CITIES', () => {
    it('should have valid coordinates for all cities', () => {
      CITIES.forEach(city => {
        expect(city.id).toBeDefined();
        expect(city.name).toBeDefined();
        expect(typeof city.lat).toBe('number');
        expect(typeof city.lon).toBe('number');
        expect(city.lat).toBeGreaterThanOrEqual(-90);
        expect(city.lat).toBeLessThanOrEqual(90);
        expect(city.lon).toBeGreaterThanOrEqual(-180);
        expect(city.lon).toBeLessThanOrEqual(180);
      });
    });

    it('should have valid business and tourism scores', () => {
      CITIES.forEach(city => {
        expect(typeof city.biz).toBe('number');
        expect(typeof city.tour).toBe('number');
        expect(city.biz).toBeGreaterThanOrEqual(0);
        expect(city.tour).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('PLANE_TYPES', () => {
    it('should have valid stats for all planes', () => {
      PLANE_TYPES.forEach(plane => {
        expect(plane.id).toBeDefined();
        expect(plane.name).toBeDefined();
        expect(plane.speed).toBeGreaterThan(0);
        expect(plane.range).toBeGreaterThan(0);
        expect(plane.capacity).toBeGreaterThan(0);
        expect(plane.price).toBeGreaterThan(0);
        
        // Ensure new fields exist
        expect(plane.fuelCost).toBeDefined();
        expect(typeof plane.fuelCost).toBe('number');
        expect(plane.fuelCost).toBeGreaterThan(0);
        
        expect(plane.maint).toBeDefined();
        expect(typeof plane.maint).toBe('number');
      });
    });

    it('should have valid availability dates', () => {
        PLANE_TYPES.forEach(plane => {
            if (plane.intro && plane.end) {
                expect(plane.end).toBeGreaterThanOrEqual(plane.intro);
            }
        });
    });
  });
});
