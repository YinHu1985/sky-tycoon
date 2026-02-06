import { describe, it, expect } from 'vitest';
import { applyModifiers, expireModifiers } from './modifiers';

describe('Modifier System', () => {
  describe('applyModifiers', () => {
    it('should return base value if no modifiers', () => {
      expect(applyModifiers(100, [])).toBe(100);
    });

    it('should apply multiplier modifiers', () => {
      const mods = [{ type: 'multiplier', value: 1.5 }];
      expect(applyModifiers(100, mods)).toBe(150);
    });

    it('should apply flat modifiers', () => {
      const mods = [{ type: 'flat', value: 50 }];
      expect(applyModifiers(100, mods)).toBe(150);
    });

    it('should stack multipliers (multiplicative)', () => {
      const mods = [
        { type: 'multiplier', value: 1.5 },
        { type: 'multiplier', value: 2.0 }
      ];
      // 100 * 1.5 * 2.0 = 300
      expect(applyModifiers(100, mods)).toBe(300);
    });

    it('should apply percentage modifiers', () => {
      const mods = [{ type: 'percentage', value: 0.1 }]; // +10%
      // 100 * (1 + 0.1) = 110
      expect(applyModifiers(100, mods)).toBeCloseTo(110);
    });

    it('should combine types correctly (Base * Mult + Flat)', () => {
      const mods = [
        { type: 'multiplier', value: 2 },
        { type: 'flat', value: 10 }
      ];
      // (100 * 2) + 10 = 210
      expect(applyModifiers(100, mods)).toBe(210);
    });
  });

  describe('expireModifiers', () => {
    it('should remove expired modifiers', () => {
      const now = new Date('2000-01-01');
      const company = {
        activeModifiers: [
          { id: '1', expiryDate: new Date('1999-12-31') }, // Expired
          { id: '2', expiryDate: new Date('2000-01-02') }, // Valid
          { id: '3' } // Permanent
        ]
      };
      
      const result = expireModifiers(company, now);
      expect(result).toHaveLength(2);
      expect(result.map(m => m.id)).toEqual(['2', '3']);
    });
  });
});
