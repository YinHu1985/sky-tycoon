import { ALL_EVENTS } from '../data/events/index';
import { GameEvent, Option, Effect, Company, GameState, Modifier, ScheduledEvent } from '../types';

export const calculateNextEventDate = (event: GameEvent, currentDate: Date): Date => {
  // 1. Determine Earliest Possible Date
  let earliest = currentDate;
  if (event.startDate) {
    const start = new Date(event.startDate);
    if (start > currentDate) {
      earliest = start;
    }
  }

  // 2. Determine Latest Possible Date
  let latest: Date | null = null;
  if (event.endDate) {
    latest = new Date(event.endDate);
  }

  // 3. Handle Fixed Window Events (e.g. Historical Events like Olympics)
  // If there is a specific window defined by startDate and endDate
  if (event.startDate && latest) {
    const start = new Date(event.startDate);
    const windowSize = latest.getTime() - start.getTime();
    const windowDays = windowSize / (1000 * 3600 * 24);

    // If the window is relatively short (less than a year), treat it as a fixed event
    // and schedule it randomly within that window
    if (windowDays < 365) {
      const randomOffset = Math.random() * windowSize;
      return new Date(start.getTime() + randomOffset);
    }
  }

  // 4. Handle Standard MTTH Events
  const mtth = event.mtth || 1;
  const randomDays = (0.5 + Math.random()) * mtth * 365;
  
  let nextDate = new Date(currentDate);

  if (earliest > currentDate) {
    // If the event hasn't started becoming available yet (startDate is in future)
    // We schedule it to start exactly at startDate (or very close to it)
    // instead of adding MTTH from now.
    nextDate = earliest;
  } else {
    // If we are already in the eligible period, add random delay
    nextDate.setDate(nextDate.getDate() + randomDays);
  }

  // 5. Clamp to End Date
  if (latest && nextDate > latest) {
    // If the calculated date is beyond the end date
    // For fixed events, this shouldn't happen due to logic #3
    // For long running events, maybe we just clamp it to the end date
    // or we could consider it "missed" (but simpler to just clamp for now)
    nextDate = latest;
  }

  return nextDate;
};

export const scheduleNextOccurrence = (event: GameEvent, currentDate: Date): Date => {
    return calculateNextEventDate(event, currentDate);
};

export const scheduleEvents = (currentDate: Date, existingScheduledEvents: ScheduledEvent[] = []): ScheduledEvent[] => {
  const scheduled = [...existingScheduledEvents];
  const scheduledIds = new Set(scheduled.map(e => e.eventId));

  ALL_EVENTS.forEach(event => {
    // Only schedule if not already scheduled and is repeatable or not fired yet
    // (For now, we re-schedule everything that isn't in the list. 
    // Real logic needs to track 'fired' state for one-time events outside of this list, or in it.)
    
    if (!scheduledIds.has(event.id)) {
        // Check triggers? No, here we just schedule time-based checks?
        // Or do we schedule EVERYTHING and check conditions when it fires?
        // Standard Paradox style: Check conditions daily/monthly.
        // Optimization: Schedule next check date.
        
        const nextDate = scheduleNextOccurrence(event, currentDate);
        scheduled.push({
            id: `sched_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            eventId: event.id,
            scheduledDate: nextDate
        });
    }
  });

  return scheduled.sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());
};

export const shouldEventFire = (event: GameEvent, company: Company, gameState: GameState): boolean => {
  if (!event.triggers || event.triggers.length === 0) return true;

  // Check all triggers. All must be true? Or any?
  // Usually triggers list means "if all these conditions are met".
  // But let's check how data uses it.
  // accidents.ts: `triggers: [ (state, company) => ... ]`
  // So it's an array. Let's assume ALL must match.
  
  return event.triggers.every(trigger => {
      try {
          return trigger(gameState, company);
      } catch (e) {
          console.warn(`Event trigger error for ${event.id}:`, e);
          return false;
      }
  });
};

export const checkScheduledEvents = (
    scheduledEvents: ScheduledEvent[], 
    currentDate: Date, 
    companies: Company[], 
    gameState: GameState
) => {
    const eventsToFire: { event: GameEvent; companyId?: string; scheduledEvent: ScheduledEvent }[] = [];
    const remainingEvents: ScheduledEvent[] = [];

    scheduledEvents.forEach(se => {
        if (se.scheduledDate <= currentDate) {
            const event = ALL_EVENTS.find(e => e.id === se.eventId);
            if (event) {
                // If event is company-scoped, we might need to fire it for specific company?
                // Or if it's global?
                // Current system seems to treat all events as potentially affecting a company or global.
                // If `se.companyId` is set, check for that company.
                // Else, check for all companies (if it's a company event) or just once (if global).
                
                // Simplified logic:
                // 1. If event is global (no company context needed), fire it.
                // 2. If event needs company, try to fire for each company (if conditions met).
                
                // But `se` might not have companyId.
                
                // If it's a "Company" event (e.g. accident), it should probably be checked against all companies.
                // If it triggers, we fire it.
                
                // Let's assume for now we check against "Player" company for notification, 
                // but AI companies also get events?
                
                // For MVP: Check against Player Company.
                const playerCompany = companies.find(c => c.isPlayer);
                if (playerCompany && shouldEventFire(event, playerCompany, gameState)) {
                    eventsToFire.push({ event, companyId: playerCompany.id, scheduledEvent: se });
                } else {
                    // Reschedule if not fired? Or assume it "misfired" and schedule next?
                    // Usually we reschedule.
                }
            }
        } else {
            remainingEvents.push(se);
        }
    });
    
    // Reschedule fired events (if repeatable)
    eventsToFire.forEach(({ event }) => {
        // If not one_shot, schedule next
        // (We don't have one_shot flag in GameEvent interface yet? implicit?)
        // historical events usually happen once.
        // accidents happen many times.
        
        // Let's assume if 'meanTimeToHappen' is present, it repeats?
        // Or check `isUnique`?
        
        // historical.ts events don't have isUnique, but logic implies date-bound.
        
        // For now, always reschedule 1 year later to check again?
        // Or use MTTH.
        
        const nextDate = scheduleNextOccurrence(event, currentDate);
        remainingEvents.push({
            id: `sched_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            eventId: event.id,
            scheduledDate: nextDate
        });
    });
    
    return { eventsToFire, remainingEvents: remainingEvents.sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime()) };
};

export const applyEventEffects = (event: GameEvent, optionIndex: number, companyId: string, performAction: Function, currentDate: Date) => {
    if (!event.options) return;
    const option = event.options[optionIndex];
    if (!option) return;

    option.effects.forEach(effect => {
        if (effect.type === 'money') {
            performAction(companyId, 'APPLY_EVENT_EFFECT', { type: 'money', value: effect.amount });
        } else if (effect.type === 'fame') {
            performAction(companyId, 'APPLY_EVENT_EFFECT', { type: 'fame', value: effect.amount });
        } else if (effect.type === 'addModifier' || effect.type === 'add_modifier') {
             if (effect.modifier) {
                 // Calculate expiry date if duration is provided
                 let expiryDate = effect.modifier.expiryDate;
                 const durationWeeks = effect.duration || effect.modifier.expireDuration;
                 
                 if (!expiryDate && durationWeeks) {
                     const date = new Date(currentDate);
                     date.setDate(date.getDate() + (durationWeeks * 7));
                     expiryDate = date;
                 }

                 const modifier: Modifier = {
                     id: `evt_mod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                     source: event.title,
                     type: effect.modifier.type || 'flat',
                     target: effect.modifier.target || 'unknown',
                     value: effect.modifier.value || 0,
                     context: effect.modifier.context,
                     expiryDate: expiryDate,
                     expireDuration: durationWeeks, // Keep for reference
                     description: option.description || effect.modifier.description,
                 };
                 performAction(companyId, 'APPLY_EVENT_EFFECT', { type: 'addModifier', value: modifier });
             }
         } else if (effect.type === 'removeModifier' || effect.type === 'remove_modifier') {
            performAction(companyId, 'APPLY_EVENT_EFFECT', { type: 'removeModifier', value: effect.modifierId });
        } else if (effect.type === 'trigger_event') {
             console.log("Trigger event not implemented:", effect.eventId);
        }
    });
};

export const getEventById = (id: string): GameEvent | undefined => {
    return ALL_EVENTS.find(e => e.id === id);
};

export const initializeEventSystem = (): ScheduledEvent[] => {
    // Initial scheduling
    const startDate = new Date(1955, 0, 1); // Game start date
    return scheduleEvents(startDate);
};
