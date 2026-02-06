/**
 * Event System - Scheduling and Processing
 *
 * Handles:
 * - Scheduling time-based events using MTTH (Mean Time To Happen)
 * - Processing event triggers
 * - Applying event effects
 * - Dynamic probability checks (triggers & modifiers)
 */

import { ALL_EVENTS } from '../data/events';

// How many times more frequently we check for events compared to their MTTH
// This allows for dynamic probability updates based on game state
const SAMPLING_FACTOR = 10;

/**
 * Calculate the next occurrence date for an event based on MTTH
 * Uses exponential distribution: P(t) = (1/MTTH) * e^(-t/MTTH)
 * 
 * We divide MTTH by SAMPLING_FACTOR to check more frequently.
 *
 * @param {Date} currentDate - Current game date
 * @param {number} mtth - Mean Time To Happen in days
 * @returns {Date} Next scheduled date
 */
export function calculateNextEventDate(currentDate, mtth) {
  // Effective MTTH for scheduling is much shorter to allow sampling
  const schedulingMtth = mtth / SAMPLING_FACTOR;
  
  // Use exponential distribution to generate random time
  const u = Math.random(); // Uniform random [0, 1)
  const days = -schedulingMtth * Math.log(1 - u); 

  const nextDate = new Date(currentDate);
  nextDate.setDate(nextDate.getDate() + Math.max(1, Math.floor(days))); // At least 1 day
  return nextDate;
}

/**
 * Schedule the next occurrence for a specific event
 * 
 * @param {Date} currentDate - Current game date
 * @param {Object} event - The event object
 * @returns {Object|null} Scheduled event object or null if not valid
 */
export function scheduleNextOccurrence(currentDate, event) {
  // Skip if event has no MTTH (not time-based)
  if (!event.mtth) return null;

  // Check date range
  const startDate = event.startDate || new Date(1950, 0, 1);
  const endDate = event.endDate || new Date(2100, 11, 31);
  
  if (currentDate > endDate) return null;

  // Calculate next occurrence
  // Ensure we start calculating from at least "tomorrow" or startDate
  const basisDate = currentDate < startDate ? startDate : currentDate;
  const nextDate = calculateNextEventDate(basisDate, event.mtth);

  // If next date is past end date, don't schedule
  if (nextDate > endDate) return null;

  return {
    eventId: event.id,
    scheduledDate: nextDate
  };
}

/**
 * Initialize schedule for all eligible events
 * Called at game start
 *
 * @param {Date} currentDate - Current game date
 * @param {Set<string>} firedOneTimeEvents - Set of one-time event IDs that have fired
 * @returns {Array<{eventId: string, scheduledDate: Date}>} Array of scheduled events
 */
export function scheduleEvents(currentDate, firedOneTimeEvents = new Set()) {
  const scheduled = [];

  ALL_EVENTS.forEach(event => {
    // Skip if one-time event already fired
    if (event.oneTime && firedOneTimeEvents.has(event.id)) return;

    const nextOccurrence = scheduleNextOccurrence(currentDate, event);
    if (nextOccurrence) {
      scheduled.push(nextOccurrence);
    }
  });

  return scheduled;
}

/**
 * Evaluate if an event should fire based on triggers and modifiers
 * 
 * @param {Object} event - The event object
 * @param {Object} state - The entire game state (from store)
 * @returns {boolean} True if event should fire
 */
export function shouldEventFire(event, state) {
  // 1. Check Triggers (All must be true)
  if (event.triggers && event.triggers.length > 0) {
    const allTriggersMet = event.triggers.every(trigger => trigger(state));
    if (!allTriggersMet) return false;
  }

  // 2. Calculate Modified MTTH
  let currentMtth = event.mtth;
  if (event.mtth_modifiers && event.mtth_modifiers.length > 0) {
    event.mtth_modifiers.forEach(mod => {
      if (mod.condition(state)) {
        currentMtth *= mod.factor;
      }
    });
  }

  // 3. Probability Check
  // We are checking at rate (SAMPLING_FACTOR / BaseMTTH)
  // We want effective rate (1 / CurrentMTTH)
  // Probability P * (SAMPLING_FACTOR / BaseMTTH) = (1 / CurrentMTTH)
  // P = BaseMTTH / (SAMPLING_FACTOR * CurrentMTTH)
  
  // Example: Base=365, Current=365, Factor=10. P = 365 / 3650 = 0.1. Correct.
  // Example: Base=365, Current=182.5 (2x freq), Factor=10. P = 365 / 1825 = 0.2. Correct.
  
  const probability = event.mtth / (SAMPLING_FACTOR * currentMtth);
  
  // Cap probability at 1.0 (if currentMtth is extremely low)
  // User noted: "if the calculated mtth is less than 0.1 origin one, we still hit a cap"
  if (probability >= 1.0) return true;
  
  return Math.random() < probability;
}

/**
 * Check if any scheduled events should be processed today
 *
 * @param {Date} currentDate - Current game date
 * @param {Array} scheduledEvents - Array of scheduled events
 * @returns {Array<string>} Array of event IDs that are due for checking
 */
export function checkScheduledEvents(currentDate, scheduledEvents) {
  const eventsToProcess = [];
  const dateStr = currentDate.toDateString();

  scheduledEvents.forEach(({ eventId, scheduledDate }) => {
    // Check if date matches
    // Note: In strict simulation, we might want >= check, but exact date is safer for daily ticks
    // to avoid double-firing if logic is called multiple times.
    // However, since we remove processed events immediately, >= is better to catch up if skipped ticks.
    // But our game loop ticks exactly one day at a time.
    if (scheduledDate.toDateString() === dateStr) {
      eventsToProcess.push(eventId);
    }
  });

  return eventsToProcess;
}

/**
 * Apply event effects based on player's chosen option
 *
 * @param {Object} option - The selected option object
 * @param {Object} gameStore - The game store instance
 */
export function applyEventEffects(option, gameStore) {
  if (!option.effects || option.effects.length === 0) return;

  const { addMoney, addModifier, removeModifier, triggerEvent, date } = gameStore.getState();
  const currentDate = date || new Date();

  option.effects.forEach(effect => {
    switch (effect.type) {
      case 'money':
        addMoney(effect.amount);
        break;

      case 'addModifier':
        if (effect.modifier) {
          let modifierToAdd = { ...effect.modifier };

          // Handle relative expiry duration (in days)
          if (effect.modifier.expireDuration && !effect.modifier.expiryDate) {
            const expiryDate = new Date(currentDate);
            expiryDate.setDate(expiryDate.getDate() + effect.modifier.expireDuration);
            modifierToAdd.expiryDate = expiryDate;
          }

          addModifier(modifierToAdd);
        }
        break;

      case 'removeModifier':
        if (effect.modifierId) {
          removeModifier(effect.modifierId);
        }
        break;

      case 'triggerEvent':
        if (effect.eventId) {
          triggerEvent(effect.eventId);
        }
        break;

      default:
        console.warn(`Unknown effect type: ${effect.type}`);
    }
  });
}

/**
 * Get event by ID
 *
 * @param {string} eventId - Event ID
 * @returns {Object|null} Event object or null if not found
 */
export function getEventById(eventId) {
  return ALL_EVENTS.find(e => e.id === eventId) || null;
}

/**
 * Initialize event system at game start
 *
 * @param {Date} startDate - Game start date
 * @returns {Object} Initial event state
 */
export function initializeEventSystem(startDate) {
  return {
    scheduledEvents: scheduleEvents(startDate, new Set()),
    firedOneTimeEvents: new Set(),
    pendingEvents: [], // Events waiting to be shown to player
    activeEvent: null  // Currently displayed event
  };
}
