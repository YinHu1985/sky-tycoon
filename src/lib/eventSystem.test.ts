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
        triggers: [(s, c) => c.money < 0]
      };
      // Money is 1000, so trigger (money < 0) is false
      expect(shouldEventFire(event, mockState.company, mockState)).toBe(false);
    });

    it('should return true if triggers pass', () => {
        const event = {
          ...baseEvent,
          triggers: [(s, c) => c.money > 0]
        };
        // Money is 1000, so trigger is true
        expect(shouldEventFire(event, mockState.company, mockState)).toBe(true);
    });

    it('should return true if no triggers', () => {
      expect(shouldEventFire(baseEvent, mockState.company, mockState)).toBe(true);
    });
  });
});
