import { describe, it, expect, vi, afterEach } from 'vitest';
import { shouldEventFire, calculateNextEventDate } from './eventSystem';

describe('Event System', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('calculateNextEventDate', () => {
    it('should return a future date', () => {
      const now = new Date(1950, 0, 1);
      const mtth = 30;
      const next = calculateNextEventDate(now, mtth);
      expect(next.getTime()).toBeGreaterThan(now.getTime());
    });
  });

  describe('shouldEventFire', () => {
    const baseEvent = {
      id: 'test',
      mtth: 100,
      triggers: [],
      mtth_modifiers: []
    };
    
    const mockState = { company: { money: 1000, fame: 50 } };

    it('should return false if triggers fail', () => {
      const event = {
        ...baseEvent,
        triggers: [(s) => s.company.money < 0]
      };
      // Even if random returns 0 (force fire), trigger should block it
      vi.spyOn(Math, 'random').mockReturnValue(0); 
      expect(shouldEventFire(event, mockState)).toBe(false);
    });

    it('should return true if probability check passes', () => {
      // MTTH=100. Sampling=10. P = 100 / (10 * 100) = 0.1
      // If random < 0.1, it fires.
      vi.spyOn(Math, 'random').mockReturnValue(0.05);
      expect(shouldEventFire(baseEvent, mockState)).toBe(true);
    });

    it('should return false if probability check fails', () => {
      // P = 0.1
      vi.spyOn(Math, 'random').mockReturnValue(0.15);
      expect(shouldEventFire(baseEvent, mockState)).toBe(false);
    });

    it('should apply mtth modifiers', () => {
      const event = {
        ...baseEvent,
        mtth_modifiers: [
          { condition: () => true, factor: 0.5 } // 2x frequency
        ]
      };
      // MTTH=100. Modified=50. Sampling=10.
      // P = 100 / (10 * 50) = 100 / 500 = 0.2.
      
      // Random 0.15 should fire (0.15 < 0.2)
      vi.spyOn(Math, 'random').mockReturnValue(0.15);
      expect(shouldEventFire(event, mockState)).toBe(true);
      
      // Random 0.25 should fail
      vi.spyOn(Math, 'random').mockReturnValue(0.25);
      expect(shouldEventFire(event, mockState)).toBe(false);
    });
  });
});
