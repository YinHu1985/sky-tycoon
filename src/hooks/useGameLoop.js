import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore.js';
import { calculateWeeklyFinance, calculateOptimalRouteConfig, calculateFrequency } from '../lib/economy.js';
import { expireModifiers } from '../lib/modifiers.js';
import { formatMoney, calculateDistance } from '../lib/utils.js';
import { CITIES } from '../data/cities.js';
import { PLANE_TYPES } from '../data/planes.js';
import {
  scheduleEvents,
  checkScheduledEvents,
  getEventById,
  shouldEventFire,
  scheduleNextOccurrence,
  applyEventEffects
} from '../lib/eventSystem.js';
import { processAI } from '../lib/AIController.js';

const MS_PER_DAY_NORMAL = 200;

export const useGameLoop = () => {
  const lastUpdate = useRef(0);
  const accumulatedTime = useRef(0);
  const lastProcessedWeek = useRef(null);
  const lastProcessedMonth = useRef(null);
  const eventsInitialized = useRef(false);

  useEffect(() => {
    lastUpdate.current = Date.now();
    let animationFrameId;

    const processTasks = (currentDate) => {
      const { tasks, removeTasks, updateCompanyData, addNotification, companies, playerCompanyId } = useGameStore.getState();

      const playerCompany = companies.find(c => c.id === playerCompanyId);
      if (!playerCompany) return;

      const fleetUpdates = { ...playerCompany.fleet };
      let hasFleetUpdates = false;
      const tasksToRemove = [];

      tasks.forEach(task => {
        const taskDate = new Date(task.completeDate);
        if (currentDate >= taskDate) {
          // Task completed
          if (task.type === 'DELIVER_PLANE') {
            const { typeId, count } = task.payload;
            
            // Accumulate fleet updates
            fleetUpdates[typeId] = (fleetUpdates[typeId] || 0) + count;
            hasFleetUpdates = true;
            
            addNotification(`${count}x ${task.name.replace('Delivery: ', '')} delivered!`, 'success');
          }
          
          tasksToRemove.push(task.id);
        }
      });

      // Apply all fleet updates in one go
      if (hasFleetUpdates) {
        updateCompanyData(playerCompanyId, { fleet: fleetUpdates });
      }

      // Remove processed tasks
      if (tasksToRemove.length > 0) {
        removeTasks(tasksToRemove);
      }
    };

    const processEvents = (currentDate) => {
      const {
        scheduledEvents,
        triggerEvent,
        showNextEvent,
        setScheduledEvents,
        rescheduleEvent,
        removeScheduledEvent,
        companies
      } = useGameStore.getState();

      // Check if any scheduled events should fire today
      // eventsToProcess is now Array<{ eventId, companyId }>
      const eventsToProcess = checkScheduledEvents(currentDate, scheduledEvents);

      if (eventsToProcess.length > 0) {
        // Process each event that is due
        eventsToProcess.forEach(({ eventId, companyId }) => {
          const event = getEventById(eventId);
          if (!event) return;

          // Find the specific company if companyId is provided
          let targetCompany = null;
          if (companyId) {
              targetCompany = companies.find(c => c.id === companyId);
              // If company no longer exists (e.g. bankruptcy), skip event?
              // For now, if company is missing but expected, skip.
              if (!targetCompany) {
                  removeScheduledEvent(eventId, companyId);
                  return;
              }
          }

          // Check if event should fire (probability & triggers)
          // shouldEventFire now takes (event, state, company)
          const shouldFire = shouldEventFire(event, useGameStore.getState(), targetCompany);

          if (shouldFire) {
            // triggerEvent needs to know companyId too if it's targeted?
            // Currently triggerEvent just puts ID in pendingEvents.
            // If it's an AI company event, do we show it to the player?
            // User said: "event should happen to ai companies as well"
            // If it's purely internal (no modal), we just apply effects?
            // But existing events have 'options' and are 'modal'.
            // AI needs to "pick one".
            
            // For now, if it's Player company, we trigger UI.
            // If it's AI company, we automatically pick an option.
            
            const isPlayer = !companyId || companyId === useGameStore.getState().playerCompanyId;
            
            if (isPlayer) {
                triggerEvent(eventId);
            } else {
                // Handle AI Event
                // Randomly pick an option for AI
                // We need a helper for this or do it here.
                if (event.options && event.options.length > 0) {
                    const randomOption = event.options[Math.floor(Math.random() * event.options.length)];
                    applyEventEffects(randomOption, useGameStore, companyId);
                    // Add log/notification? "AI Company X faced Strike"
                }
            }
            
            // If one-time event fires, remove it from schedule
            // For company events, it's one-time for THAT company.
            if (event.oneTime) {
              removeScheduledEvent(eventId, companyId);
              return;
            }
          }

          // Reschedule for next occurrence (whether it fired or not)
          const next = scheduleNextOccurrence(currentDate, event, companyId);
          if (next) {
            rescheduleEvent(eventId, next.scheduledDate, companyId);
          } else {
            removeScheduledEvent(eventId, companyId);
          }
        });

        // Get fresh state after triggering events
        const { activeEvent, pendingEvents } = useGameStore.getState();

        // Show first event if none is currently active
        if (!activeEvent && pendingEvents.length > 0) {
          showNextEvent();
        }
      }
    };

    const processWeeklyFinance = () => {
      const { companies, date, updateCompanyData, addNotification, playerCompanyId } = useGameStore.getState();

      companies.forEach(company => {
        // Expire any modifiers that have reached their expiry date
        const activeModifiers = expireModifiers(company, date);

        // Calculate weekly finances with updated modifiers
        const result = calculateWeeklyFinance({
          ...company,
          activeModifiers
        });

        // Optimization: Handle AI Helper for Player Routes
        if (company.id === playerCompanyId) {
          let hasAutoUpdates = false;
          const optimizedRoutes = result.routes.map(route => {
            if (route.autoManaged) {
              const config = calculateOptimalRouteConfig(
                company, 
                route.sourceId, 
                route.targetId, 
                route.planeTypeId, 
                route.assignedCount
              );

              if (config.canFly) {
                // Calculate optimal assigned count to free up unused planes
                const source = CITIES.find(c => c.id === route.sourceId);
                const target = CITIES.find(c => c.id === route.targetId);
                const dist = calculateDistance(source, target);
                
                // Max frequency possible with 1 plane
                const maxFreqPerPlane = calculateFrequency(route.planeTypeId, dist, 1);
                
                // Calculate minimum planes needed for the recommended frequency
                let neededPlanes = route.assignedCount;
                if (maxFreqPerPlane > 0) {
                  neededPlanes = Math.ceil(config.recommendedFrequency / maxFreqPerPlane);
                }
                
                // Ensure we keep at least 1 plane if the route is active
                neededPlanes = Math.max(1, neededPlanes);

                if (
                  route.frequency !== config.recommendedFrequency || 
                  route.priceModifier !== config.recommendedPriceModifer ||
                  neededPlanes < route.assignedCount
                ) {
                  hasAutoUpdates = true;
                  return {
                    ...route,
                    frequency: config.recommendedFrequency,
                    priceModifier: config.recommendedPriceModifer,
                    assignedCount: neededPlanes < route.assignedCount ? neededPlanes : route.assignedCount
                  };
                }
              }
            }
            return route;
          });

          if (hasAutoUpdates) {
            result.routes = optimizedRoutes;
            // Optional: Notify user about optimizations?
            // addNotification("AI Helper optimized your flight routes", "info"); 
          }
        }

        updateCompanyData(company.id, {
          money: result.money,
          routes: result.routes,
          fame: result.fame,
          properties: result.properties,
          activeModifiers,
          stats: result.stats
        });

        // Only notify for player company
        if (company.id === playerCompanyId && result.stats.netIncome !== 0) {
          addNotification(
            `Weekly Report: ${result.stats.netIncome > 0 ? '+' : ''}${formatMoney(result.stats.netIncome)}`,
            result.stats.netIncome > 0 ? 'success' : 'error'
          );
        }
      });
    };

    const getWeekNumber = (date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + 4 - (d.getDay() || 7));
      const yearStart = new Date(d.getFullYear(), 0, 1);
      const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
      return `${d.getFullYear()}-${weekNo}`;
    };

    const tick = (timestamp) => {
      try {
        const now = Date.now();
        if (!lastUpdate.current) lastUpdate.current = now;
        const delta = now - lastUpdate.current;
        lastUpdate.current = now;

        const { 
          gameStarted, 
          paused, 
          speed, 
          date,
          setDate, 
          saveGame,
          activeEvent,
          pendingEvents
        } = useGameStore.getState();

        if (!gameStarted) {
          animationFrameId = requestAnimationFrame(tick);
          return;
        }

        // Initialize event system on first run
        if (gameStarted && !eventsInitialized.current) {
          eventsInitialized.current = true;
          const { firedOneTimeEvents, setScheduledEvents, companies } = useGameStore.getState();
          const newSchedule = scheduleEvents(date, firedOneTimeEvents, companies);
          setScheduledEvents(newSchedule);
        }

        // Don't advance time if there's an active event modal or paused
        if (!paused && !activeEvent && pendingEvents.length === 0) {
          const timeScale = speed;
          accumulatedTime.current += delta * timeScale;

          const msPerDay = MS_PER_DAY_NORMAL;

          if (accumulatedTime.current >= msPerDay) {
            const daysToAdvance = Math.floor(accumulatedTime.current / msPerDay);
            accumulatedTime.current -= daysToAdvance * msPerDay;

            const newDate = new Date(date);
            newDate.setDate(newDate.getDate() + daysToAdvance);

            setDate(newDate);

            // Process tasks
            processTasks(newDate);

            // Process events (check for scheduled events)
            processEvents(newDate);

            // Weekly processing (check if week changed)
            const currentWeek = getWeekNumber(newDate);
            if (currentWeek !== lastProcessedWeek.current) {
              lastProcessedWeek.current = currentWeek;
              processWeeklyFinance();
            }

            // Monthly processing for AI (less frequent planning)
            const currentMonth = `${newDate.getFullYear()}-${newDate.getMonth()}`;
            if (currentMonth !== lastProcessedMonth.current) {
                lastProcessedMonth.current = currentMonth;
                console.log(`[GameLoop] Month changed to ${currentMonth}. Triggering AI processing.`);
                processAI(useGameStore.getState());
            }

            // Auto-save on January 1st
            if (newDate.getDate() === 1 && newDate.getMonth() === 0) {
              const oldDate = new Date(date);
              if (oldDate.getFullYear() !== newDate.getFullYear()) {
                saveGame();
              }
            }
          }
        }
      } catch (error) {
        console.error("Game Loop Error:", error);
        useGameStore.getState().setPaused(true);
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    lastUpdate.current = Date.now();
    animationFrameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);
};
