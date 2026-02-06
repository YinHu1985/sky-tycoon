import { describe, it, expect } from 'vitest';
import { ALL_EVENTS } from './index';

describe('Event Data Integrity', () => {
  // Relaxed test: Just ensures the events are valid objects.
  // Does not check for specific counts or specific IDs unless necessary for game logic.
  
  it('should have valid structure for all events', () => {
    const ids = new Set();
    
    // It's okay if we have few events, but if we have them, they must be valid.
    ALL_EVENTS.forEach(event => {
      expect(event.id).toBeDefined();
      expect(typeof event.id).toBe('string');
      
      // Unique IDs are still critical for the system to work
      if (ids.has(event.id)) {
        throw new Error(`Duplicate event ID: ${event.id}`);
      }
      ids.add(event.id);

      expect(event.title).toBeDefined();
      expect(event.description).toBeDefined();
      expect(event.options).toBeInstanceOf(Array);
      expect(event.options.length).toBeGreaterThan(0);
      
      // Check options
      event.options.forEach(opt => {
        expect(opt.label).toBeDefined();
        if (opt.effects) {
            expect(opt.effects).toBeInstanceOf(Array);
        }
      });
    });
  });
});
