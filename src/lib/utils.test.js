import { describe, it, expect } from 'vitest';
import { 
  calculateDistance, 
  calculateFlightTime, 
  geoToPixel, 
  formatMoney, 
  formatDate,
  getGreatCircleSegments,
  MAP_WIDTH,
  MAP_HEIGHT
} from './utils';

describe('Utils Library', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two points accurately (NYC to London)', () => {
      // NYC
      const c1 = { lat: 40.7128, lon: -74.0060 };
      // London
      const c2 = { lat: 51.5074, lon: -0.1278 };
      
      const dist = calculateDistance(c1, c2);
      // Expected approx 5570 km
      expect(dist).toBeGreaterThan(5500);
      expect(dist).toBeLessThan(5600);
    });

    it('should return 0 for same point', () => {
      const c1 = { lat: 0, lon: 0 };
      const dist = calculateDistance(c1, c1);
      expect(dist).toBe(0);
    });
  });

  describe('calculateFlightTime', () => {
    it('should calculate flight time correctly', () => {
      // 1000 km, 500 km/h -> 2 hours
      expect(calculateFlightTime(1000, 500)).toBe(2);
    });

    it('should return 0 for zero or negative speed', () => {
      expect(calculateFlightTime(1000, 0)).toBe(0);
      expect(calculateFlightTime(1000, -100)).toBe(0);
    });
  });

  describe('geoToPixel', () => {
    it('should map coordinates to map dimensions', () => {
      // 0,0 should be center
      const center = geoToPixel(0, 0);
      expect(center.x).toBe(MAP_WIDTH / 2);
      expect(center.y).toBe(MAP_HEIGHT / 2);
    });

    it('should map top-left correctly (90 lat, -180 lon)', () => {
      const tl = geoToPixel(90, -180);
      expect(tl.x).toBe(0);
      expect(tl.y).toBe(0);
    });
  });

  describe('formatMoney', () => {
    it('should format numbers as USD currency', () => {
      // Intl behavior can depend on locale, but typically '$1,000'
      const formatted = formatMoney(1000);
      expect(formatted).toContain('$');
      expect(formatted).toContain('1,000');
    });
  });

  describe('formatDate', () => {
    it('should format date object correctly', () => {
      const date = new Date('2020-01-01');
      const formatted = formatDate(date);
      expect(formatted).toBe('Jan 1, 2020');
    });
  });

  describe('getGreatCircleSegments', () => {
    it('should return segments for a path', () => {
      const c1 = { lat: 40, lon: -74 };
      const c2 = { lat: 51, lon: 0 };
      const segments = getGreatCircleSegments(c1, c2, 10);
      expect(Array.isArray(segments)).toBe(true);
      expect(segments.length).toBeGreaterThan(0);
    });

    it('should handle antimeridian crossing (Pacific Ocean)', () => {
      // Tokyo (35, 139) to LA (34, -118)
      // Should wrap around
      const c1 = { lat: 35.6762, lon: 139.6503 };
      const c2 = { lat: 34.0522, lon: -118.2437 };
      
      const segments = getGreatCircleSegments(c1, c2, 50);
      // Expecting at least 2 segments due to crossing
      expect(segments.length).toBeGreaterThanOrEqual(2);
    });
  });
});
