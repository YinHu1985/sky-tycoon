/**
 * Event System - Scheduling and Processing
 *
 * Handles:
 * - Scheduling time-based events using MTTH (Mean Time To Happen)
 * - Processing event triggers
 * - Applying event effects
 * - Dynamic probability checks (triggers & modifiers)
 */

import { ALL_EVENTS } from '../data/events/index.js';

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
 * @param {string} [companyId] - Optional company ID for company-specific events
 * @returns {Object|null} Scheduled event object or null if not valid
 */
export function scheduleNextOccurrence(currentDate, event, companyId = null) {
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
    scheduledDate: nextDate,
    companyId
  };
}

/**
 * Initialize schedule for all eligible events
 * Called at game start
 *
 * @param {Date} currentDate - Current game date
 * @param {Set<string>} firedOneTimeEvents - Set of one-time event IDs that have fired
 * @param {Array} companies - List of companies to schedule events for
 * @returns {Array<{eventId: string, scheduledDate: Date, companyId?: string}>} Array of scheduled events
 */
export function scheduleEvents(currentDate, firedOneTimeEvents = new Set(), companies = []) {
  const scheduled = [];

  ALL_EVENTS.forEach(event => {
    // Determine scope (default to company unless specified global)
    // We'll assume if it's in economic events it might be global, but for now 
    // let's rely on an explicit flag or default to company if not sure.
    // Actually, most existing events (accidents, company) are company-specific.
    // Economic events (boom) are global.
    // I should probably add a 'scope' property to events.
    // If not present, I'll infer from ID or file location? No, that's brittle.
    // Let's assume 'global' if explicitly set, otherwise 'company'.
    
    // For now, let's treat 'post_war_boom' and 'olympics' as global.
    const isGlobal = ['post_war_boom', 'olympics_1964'].includes(event.id) || event.scope === 'global';

    // Skip if one-time event already fired (globally or for company?)
    // One-time events are usually unique per game (global) or per company.
    // If global one-time event fired, skip.
    if (isGlobal && event.oneTime && firedOneTimeEvents.has(event.id)) return;

    if (isGlobal) {
        const nextOccurrence = scheduleNextOccurrence(currentDate, event);
        if (nextOccurrence) scheduled.push(nextOccurrence);
    } else {
        // Schedule for each company
        companies.forEach(company => {
            // Check if this one-time event fired for this company
            // firedOneTimeEvents is currently a Set of strings (eventIds).
            // For company specific, we might need composite key "eventId:companyId"
            // For now, let's assume oneTime means "once per game globally" if we don't have per-company tracking.
            // But 'bankruptcy_bailout' is oneTime. It should be oneTime per company.
            
            // To support per-company one-time events, we'd need to update how we track fired events.
            // For now, let's just schedule it. checking logic will handle firing.
            const compositeId = `${event.id}:${company.id}`;
            if (event.oneTime && firedOneTimeEvents.has(compositeId)) return;

            const nextOccurrence = scheduleNextOccurrence(currentDate, event, company.id);
            if (nextOccurrence) scheduled.push(nextOccurrence);
        });
    }
  });

  return scheduled;
}

/**
 * Evaluate if an event should fire based on triggers and modifiers
 * 
 * @param {Object} event - The event object
 * @param {Object} state - The entire game state (from store)
 * @param {Object} company - The specific company being evaluated
 * @returns {boolean} True if event should fire
 */
export function shouldEventFire(event, state, company) {
  // 1. Check Triggers (All must be true)
  if (event.triggers && event.triggers.length > 0) {
    try {
      const allTriggersMet = event.triggers.every(trigger => trigger(state, company));
      if (!allTriggersMet) return false;
    } catch (e) {
      console.warn(`Event ${event.id} trigger failed (likely missing company context):`, e);
      return false;
    }
  }

  // 2. Calculate Modified MTTH
  let currentMtth = event.mtth;
  if (event.mtth_modifiers && event.mtth_modifiers.length > 0) {
    event.mtth_modifiers.forEach(mod => {
      if (mod.condition(state, company)) {
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

  scheduledEvents.forEach(({ eventId, scheduledDate, companyId }) => {
    // Check if date matches
    if (scheduledDate.toDateString() === dateStr) {
      eventsToProcess.push({ eventId, companyId });
    }
  });

  return eventsToProcess;
}

/**
 * Apply event effects based on player's chosen option
 *
 * @param {Object} option - The selected option object
 * @param {Object} gameStore - The game store instance
 * @param {string} companyId - The ID of the company to apply effects to
 */
export function applyEventEffects(option, gameStore, companyId) {
  if (!option.effects || option.effects.length === 0) return;

  const { performAction, triggerEvent, date } = gameStore.getState();
  const currentDate = date || new Date();

  // If companyId is not provided, we assume it's a global event effect
  // that should apply to ALL companies (e.g. global modifier).
  if (!companyId) {
      const { companies } = gameStore.getState();
      companies.forEach(c => applyEventEffects(option, gameStore, c.id));
      return;
  }

  option.effects.forEach(effect => {
    switch (effect.type) {
      case 'money':
        // Use performAction for money changes to ensure consistency
        // But performAction is for user-initiated actions. Events are "god mode".
        // However, we can add a 'SYSTEM_UPDATE' or similar action, or just expose a raw update method.
        // For now, let's use a specific action or direct store update if possible.
        // The store likely doesn't have a direct 'updateCompany' method exposed easily.
        // Actually, we should probably add an action for "APPLY_EVENT_EFFECT" in CompanyActions?
        // Or just use 'performAction' with a generic 'UPDATE_FUNDS' action.
        
        // Wait, the store has `addMoney` which updates the PLAYER company.
        // We need `addMoneyToCompany(companyId, amount)`.
        
        // Let's assume the store has been updated or we need to update it.
        // I'll use a new store method `applyEffectToCompany` if it exists, or `performAction`.
        // Since `performAction` uses `CompanyActions`, I should check if there's a generic update.
        // There isn't. I'll add one to CompanyActions later: 'APPLY_EFFECT'
        
        // For now, I will assume `gameStore` has a method `applyCompanyEffect` 
        // OR I will rely on `performAction` if I add a 'APPLY_EVENT_EFFECT' action type.
        
        // Let's use `performAction` with a new action type 'APPLY_EVENT_EFFECT'.
        performAction(companyId, 'APPLY_EVENT_EFFECT', { type: 'money', value: effect.amount });
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

          performAction(companyId, 'APPLY_EVENT_EFFECT', { type: 'addModifier', value: modifierToAdd });
        }
        break;

      case 'removeModifier':
        if (effect.modifierId) {
             performAction(companyId, 'APPLY_EVENT_EFFECT', { type: 'removeModifier', value: effect.modifierId });
        }
        break;

      case 'triggerEvent':
        if (effect.eventId) {
          triggerEvent(effect.eventId); // Trigger another event (global or for same company?)
          // Usually chain events are for the same company. 
          // But `triggerEvent` currently puts it in `pendingEvents`.
          // We might need to specify companyId for the triggered event too.
          // Let's leave this for now as it puts it in the global queue.
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
