/**
 * Event System - Scheduling and Processing
 *
 * Handles:
 * - Scheduling time-based events using MTTH (Mean Time To Happen)
 * - Processing event triggers
 * - Applying event effects
 */

import { ALL_EVENTS } from '../data/events';

/**
 * Calculate the next occurrence date for an event based on MTTH
 * Uses exponential distribution: P(t) = (1/MTTH) * e^(-t/MTTH)
 *
 * @param {Date} currentDate - Current game date
 * @param {number} mtth - Mean Time To Happen in days
 * @returns {Date} Next scheduled date
 */
export function calculateNextEventDate(currentDate, mtth) {
  // Use exponential distribution to generate random time
  // E[X] = MTTH, so the distribution naturally centers around MTTH
  const u = Math.random(); // Uniform random [0, 1)
  const days = -mtth * Math.log(1 - u); // Exponential distribution

  const nextDate = new Date(currentDate);
  nextDate.setDate(nextDate.getDate() + Math.floor(days));
  return nextDate;
}

/**
 * Schedule all eligible events for the current period
 * Called at game start and at the beginning of each year
 *
 * @param {Date} currentDate - Current game date
 * @param {Set<string>} firedOneTimeEvents - Set of one-time event IDs that have fired
 * @returns {Array<{eventId: string, scheduledDate: Date}>} Array of scheduled events
 */
export function scheduleEvents(currentDate, firedOneTimeEvents = new Set()) {
  const scheduled = [];
  const yearEnd = new Date(currentDate.getFullYear(), 11, 31); // End of current year

  ALL_EVENTS.forEach(event => {
    // Skip if event has no MTTH (not time-based)
    if (!event.mtth) return;

    // Skip if one-time event already fired
    if (event.oneTime && firedOneTimeEvents.has(event.id)) return;

    // Check if event is within its active date range
    const startDate = event.startDate || new Date(1950, 0, 1);
    const endDate = event.endDate || new Date(2100, 11, 31);

    if (currentDate < startDate || currentDate > endDate) return;

    // Calculate next occurrence
    const nextDate = calculateNextEventDate(currentDate, event.mtth);

    // Only schedule if within current year and valid date range
    if (nextDate <= yearEnd && nextDate >= startDate && nextDate <= endDate) {
      scheduled.push({
        eventId: event.id,
        scheduledDate: nextDate
      });
    }
  });

  return scheduled;
}

/**
 * Check if any scheduled events should fire today
 *
 * @param {Date} currentDate - Current game date
 * @param {Array} scheduledEvents - Array of scheduled events
 * @returns {Array<string>} Array of event IDs that should fire
 */
export function checkScheduledEvents(currentDate, scheduledEvents) {
  const eventsToFire = [];
  const dateStr = currentDate.toDateString();

  scheduledEvents.forEach(({ eventId, scheduledDate }) => {
    if (scheduledDate.toDateString() === dateStr) {
      eventsToFire.push(eventId);
    }
  });

  return eventsToFire;
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
 * Remove fired events from scheduled list
 *
 * @param {Array} scheduledEvents - Current scheduled events
 * @param {Array<string>} firedEventIds - Event IDs that fired
 * @returns {Array} Updated scheduled events
 */
export function removeScheduledEvents(scheduledEvents, firedEventIds) {
  return scheduledEvents.filter(
    ({ eventId }) => !firedEventIds.includes(eventId)
  );
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
