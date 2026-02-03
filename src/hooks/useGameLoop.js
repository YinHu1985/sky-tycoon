import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { calculateWeeklyFinance } from '../lib/economy';
import { expireModifiers } from '../lib/modifiers';
import { formatMoney } from '../lib/utils';
import {
  scheduleEvents,
  checkScheduledEvents,
  removeScheduledEvents
} from '../lib/eventSystem';

const MS_PER_DAY_NORMAL = 200;

export const useGameLoop = () => {
  const lastUpdate = useRef(0);
  const accumulatedTime = useRef(0);
  const lastProcessedWeek = useRef(null);
  const lastProcessedYear = useRef(null);
  const eventsInitialized = useRef(false);

  useEffect(() => {
    lastUpdate.current = Date.now();
    let animationFrameId;

    const processTasks = (currentDate) => {
      const { tasks, removeTask, updateCompany, addNotification } = useGameStore.getState();

      tasks.forEach(task => {
        const taskDate = new Date(task.completeDate);
        if (currentDate >= taskDate) {
          // Task completed
          if (task.type === 'DELIVER_PLANE') {
            const { typeId, count } = task.payload;
            // Re-fetch company state to get latest fleet count
            const { company } = useGameStore.getState();
            const currentCount = company.fleet[typeId] || 0;
            updateCompany({
              fleet: {
                ...company.fleet,
                [typeId]: currentCount + count
              }
            });
            addNotification(`${count}x ${task.name.replace('Delivery: ', '')} delivered!`, 'success');
          }
          removeTask(task.id);
        }
      });
    };

    const processEvents = (currentDate) => {
      const {
        scheduledEvents,
        triggerEvent,
        showNextEvent,
        setScheduledEvents
      } = useGameStore.getState();

      // Check if any scheduled events should fire today
      const eventsToFire = checkScheduledEvents(currentDate, scheduledEvents);

      if (eventsToFire.length > 0) {
        // Trigger all events that should fire today
        eventsToFire.forEach(eventId => {
          triggerEvent(eventId);
        });

        // Remove fired events from schedule
        const updatedSchedule = removeScheduledEvents(scheduledEvents, eventsToFire);
        setScheduledEvents(updatedSchedule);

        // Get fresh state after triggering events
        const { activeEvent, pendingEvents } = useGameStore.getState();

        // Show first event if none is currently active
        if (!activeEvent && pendingEvents.length > 0) {
          showNextEvent();
        }
      }
    };

    const rescheduleEvents = (currentDate) => {
      const { firedOneTimeEvents, setScheduledEvents } = useGameStore.getState();
      const newSchedule = scheduleEvents(currentDate, firedOneTimeEvents);
      setScheduledEvents(newSchedule);
    };

    const processWeeklyFinance = () => {
      const { company, date, updateCompany, addNotification } = useGameStore.getState();

      // Expire any modifiers that have reached their expiry date
      const activeModifiers = expireModifiers(company, date);

      // Calculate weekly finances with updated modifiers
      const result = calculateWeeklyFinance({
        ...company,
        activeModifiers
      });

      updateCompany({
        money: result.money,
        routes: result.routes,
        fame: result.fame,
        properties: result.properties,
        activeModifiers,
        stats: result.stats
      });

      if (result.stats.netIncome !== 0) {
        addNotification(
          `Weekly Report: ${result.stats.netIncome > 0 ? '+' : ''}${formatMoney(result.stats.netIncome)}`,
          result.stats.netIncome > 0 ? 'success' : 'error'
        );
      }
    };

    const getWeekNumber = (date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + 4 - (d.getDay() || 7));
      const yearStart = new Date(d.getFullYear(), 0, 1);
      const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
      return `${d.getFullYear()}-${weekNo}`;
    };

    const tick = () => {
      const now = Date.now();
      const delta = now - lastUpdate.current;
      lastUpdate.current = now;

      const { date, paused, speed, gameStarted, setDate, saveGame } = useGameStore.getState();

      if (!gameStarted) {
        animationFrameId = requestAnimationFrame(tick);
        return;
      }

      // Initialize event system on first run
      if (gameStarted && !eventsInitialized.current) {
        eventsInitialized.current = true;
        rescheduleEvents(date);
      }

      if (!paused) {
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

          // Yearly processing (reschedule events)
          const currentYear = newDate.getFullYear();
          if (currentYear !== lastProcessedYear.current) {
            lastProcessedYear.current = currentYear;
            rescheduleEvents(newDate);
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

      animationFrameId = requestAnimationFrame(tick);
    };

    lastUpdate.current = Date.now();
    animationFrameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);
};
