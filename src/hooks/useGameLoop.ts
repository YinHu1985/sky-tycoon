import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { calculateWeeklyFinance, calculateOptimalRouteConfig, calculateFrequency } from '../lib/economy';
import { expireModifiers } from '../lib/modifiers';
import { formatMoney, calculateDistance } from '../lib/utils';
import { CITIES } from '../data/cities';
import { PLANE_TYPES } from '../data/planes';
import {
  scheduleEvents,
  checkScheduledEvents,
  getEventById,
  shouldEventFire,
  scheduleNextOccurrence,
  applyEventEffects
} from '../lib/eventSystem';
import { processAI, AIContext } from '../lib/AIController';
import { Company, GameEvent, ScheduledEvent } from '../types';

const MS_PER_DAY_NORMAL = 200;

export const useGameLoop = () => {
  const lastUpdate = useRef(0);
  const accumulatedTime = useRef(0);
  const lastProcessedWeek = useRef<number | null>(null);
  const lastProcessedMonth = useRef<number | null>(null);
  const eventsInitialized = useRef(false);

  useEffect(() => {
    lastUpdate.current = Date.now();
    let animationFrameId: number;

    const processTasks = (currentDate: Date) => {
      const { tasks, removeTasks, updateCompanyData, addNotification, companies, playerCompanyId } = useGameStore.getState();

      const playerCompany = companies.find(c => c.id === playerCompanyId);
      if (!playerCompany) return;

      const fleetUpdates = { ...playerCompany.fleet };
      let hasFleetUpdates = false;
      const tasksToRemove: string[] = [];

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

    const processEvents = (currentDate: Date) => {
      const state = useGameStore.getState();
      const {
        scheduledEvents,
        triggerEvent,
        showNextEvent,
        setScheduledEvents,
        rescheduleEvent,
        removeScheduledEvent,
        companies,
        playerCompanyId
      } = state;

      // Adapt store state to GameState interface
      const gameState = {
        ...state,
        gameSpeed: state.speed,
        isPaused: state.paused,
        selectedCity: null, // Default or mock
        events: []
      };

      const { eventsToFire, remainingEvents } = checkScheduledEvents(
          scheduledEvents, 
          currentDate, 
          companies, 
          gameState
      );

      if (eventsToFire.length > 0) {
          // Process triggered events
          eventsToFire.forEach(({ event, companyId, scheduledEvent }) => {
              const targetCompanyId = companyId || playerCompanyId;
              const isPlayer = targetCompanyId === playerCompanyId;
              
              if (isPlayer) {
                  triggerEvent(event.id);
              } else {
                  // Handle AI Event
                  if (event.options && event.options.length > 0) {
                      const randomOptionIndex = Math.floor(Math.random() * event.options.length);
                      applyEventEffects(event, randomOptionIndex, targetCompanyId, state.performAction, currentDate);
                  }
              }
          });
          
          setScheduledEvents(remainingEvents);

          // Get fresh state after triggering events
          const { activeEvent, pendingEvents } = useGameStore.getState();

          // Show first event if none is currently active
          if (!activeEvent && pendingEvents.length > 0) {
            showNextEvent();
          }
      } else {
          if (remainingEvents.length !== scheduledEvents.length) {
               setScheduledEvents(remainingEvents);
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
                route.from, 
                route.to,   
                route.planeTypeId, 
                route.assignedCount
              );

              if (config.canFly) {
                // Calculate optimal assigned count to free up unused planes
                const source = CITIES.find(c => c.id === route.from);
                const target = CITIES.find(c => c.id === route.to);
                
                if (!source || !target) return route;

                const dist = calculateDistance(source, target);
                
                // Max frequency possible with 1 plane
                const maxFreqPerPlane = calculateFrequency(route.planeTypeId, dist, 1);
                
                // Calculate minimum planes needed for the recommended frequency
                let neededPlanes = route.assignedCount;
                if (maxFreqPerPlane > 0 && config.recommendedFrequency) {
                  neededPlanes = Math.ceil(config.recommendedFrequency / maxFreqPerPlane);
                }
                
                // Don't reduce planes below 1 if profitable
                if (neededPlanes < 1) neededPlanes = 1;
                
                if (config.recommendedFrequency !== undefined && (
                    config.recommendedFrequency !== route.frequency || 
                    config.recommendedPriceModifer !== route.priceModifier ||
                    neededPlanes !== route.assignedCount)) {
                  hasAutoUpdates = true;
                  return {
                    ...route,
                    frequency: config.recommendedFrequency,
                    priceModifier: config.recommendedPriceModifer || 0,
                    assignedCount: neededPlanes
                  };
                }
              }
            }
            return route;
          });

          if (hasAutoUpdates) {
             updateCompanyData(company.id, { 
                 money: result.money, // Use result.money which includes netIncome
                 stats: result.stats,
                 routes: optimizedRoutes,
                 activeModifiers,
                 properties: result.properties
             });
             return;
          }
        }

        // Apply financial results
        updateCompanyData(company.id, { 
            money: result.money,
            stats: result.stats,
            activeModifiers,
            routes: result.routes,
            properties: result.properties
        });
      });
    };

    const processAICompanies = (currentDate: Date) => {
        const state = useGameStore.getState();
        const aiContext: AIContext = {
            companies: state.companies,
            playerCompanyId: state.playerCompanyId,
            date: state.date,
            performAction: state.performAction
        };

        processAI(aiContext);
    };

    const update = () => {
      const now = Date.now();
      const dt = now - lastUpdate.current;
      lastUpdate.current = now;

      const { paused, speed, date, setDate, gameStarted, scheduledEvents } = useGameStore.getState();

      if (!gameStarted) {
        animationFrameId = requestAnimationFrame(update);
        return;
      }
      
      if (paused) {
        animationFrameId = requestAnimationFrame(update);
        return;
      }

      // Initialize events if needed
      if (!eventsInitialized.current && scheduledEvents.length === 0) {
          const { setScheduledEvents } = useGameStore.getState();
          const initialEvents = scheduleEvents(date);
          setScheduledEvents(initialEvents);
          eventsInitialized.current = true;
      }

      accumulatedTime.current += dt * speed;

      const msPerDay = MS_PER_DAY_NORMAL; // Constant speed for now, controlled by 'speed' multiplier

      if (accumulatedTime.current >= msPerDay) {
        const daysToAdvance = Math.floor(accumulatedTime.current / msPerDay);
        accumulatedTime.current -= daysToAdvance * msPerDay;

        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() + daysToAdvance);
        setDate(newDate);

        // Daily Checks
        processTasks(newDate);
        processEvents(newDate);

        // Weekly Checks
        const currentWeek = Math.floor(newDate.getTime() / (7 * 24 * 60 * 60 * 1000));
        if (lastProcessedWeek.current !== currentWeek) {
          processWeeklyFinance();
          
          processAICompanies(newDate);
          
          lastProcessedWeek.current = currentWeek;
        }
      }

      animationFrameId = requestAnimationFrame(update);
    };

    animationFrameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
};
