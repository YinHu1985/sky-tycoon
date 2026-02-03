import { create } from 'zustand';
import { START_YEAR, generateId } from '../lib/utils';

const SAVE_KEY = 'airline_tycoon_save_v2';

const initialCompany = {
  name: 'Skyways Int.',
  code: 'SKW',
  hq: 'nyc',
  money: 50000000,
  fleet: {},
  routes: [],
  nextFlightNum: 10,

  // Fame & Efforts System
  fame: 50,                    // 0-100 scale, starts at 50 (neutral)
  maintenanceEffort: 50,       // 0-100 scale, default 50%
  serviceEffort: 50,           // 0-100 scale, default 50%
  prBudget: 0,                 // Weekly PR spending ($/week)

  // Properties owned by the company
  properties: [],              // Array of property objects

  // Event-based modifiers
  activeModifiers: [],         // Array of modifier objects (for events)

  stats: {
    totalRevenue: 0,
    totalFlightCost: 0,
    totalMaintCost: 0,
    totalIdleCost: 0,
    netIncome: 0,
    idleCounts: {},

    // Additional costs/income
    totalPrCost: 0,            // Weekly PR spending
    totalPropertyIncome: 0,    // Income from properties
    totalPropertyCost: 0       // Property maintenance costs
  }
};

export const useGameStore = create((set, get) => ({
  // Global State
  gameStarted: false,
  date: new Date(`${START_YEAR}-01-01`),
  paused: true,
  speed: 1,
  debugUnlockAll: false,

  // Company State
  company: initialCompany,

  // Tasks
  tasks: [],

  // Event System
  scheduledEvents: [],           // Events scheduled to happen on specific dates
  firedOneTimeEvents: new Set(), // IDs of one-time events that have already fired
  pendingEvents: [],             // Events waiting to be displayed (queue)
  activeEvent: null,             // Currently displayed event (or null)

  // UI State
  notifications: [],

  // Actions
  setGameStarted: (started) => set({ gameStarted: started }),
  setPaused: (paused) => set({ paused }),
  setSpeed: (speed) => set({ speed }),
  setDate: (date) => set({ date }),
  setDebugUnlockAll: (value) => set({ debugUnlockAll: value }),

  addNotification: (msg, type = 'info') => {
    const id = generateId();
    set(state => ({
      notifications: [...state.notifications, { id, msg, type }]
    }));
    setTimeout(() => {
      set(state => ({
        notifications: state.notifications.filter(n => n.id !== id)
      }));
    }, 4000);
  },

  updateCompany: (updates) => set(state => ({
    company: { ...state.company, ...updates }
  })),

  // Route Management
  addRoute: (route) => set(state => {
    const flightNumber = `${state.company.code}${state.company.nextFlightNum}`;
    const newRoute = {
      ...route,
      id: route.id || generateId(),
      flightNumber,
      stats: {
        profitLastWeek: 0,
        revenue: 0,
        flightCost: 0,
        maintCost: 0,
        occupancy: 0,
        passengers: 0,
        actualTicket: 0
      }
    };

    return {
      company: {
        ...state.company,
        routes: [...state.company.routes, newRoute],
        nextFlightNum: state.company.nextFlightNum + 1
      }
    };
  }),

  updateRoute: (routeId, updates) => set(state => ({
    company: {
      ...state.company,
      routes: state.company.routes.map(r =>
        r.id === routeId ? { ...r, ...updates } : r
      )
    }
  })),

  deleteRoute: (routeId) => set(state => ({
    company: {
      ...state.company,
      routes: state.company.routes.filter(r => r.id !== routeId)
    }
  })),

  // Fleet Management
  buyPlane: (typeId, cost) => set(state => {
    const currentCount = state.company.fleet[typeId] || 0;
    return {
      company: {
        ...state.company,
        money: state.company.money - cost,
        fleet: {
          ...state.company.fleet,
          [typeId]: currentCount + 1
        }
      }
    };
  }),

  // Company Management (Efforts & Fame)
  updateEfforts: (maintenanceEffort, serviceEffort, prBudget) => set(state => ({
    company: {
      ...state.company,
      maintenanceEffort,
      serviceEffort,
      prBudget
    }
  })),

  // Property Management
  buyProperty: (type, cityId, cost) => set(state => {
    const newProperty = {
      id: generateId(),
      type,
      cityId,
      purchaseDate: state.date.toISOString(),
      purchaseCost: cost,
      weeklyIncome: 0,
      weeklyMaintCost: 0
    };

    return {
      company: {
        ...state.company,
        money: state.company.money - cost,
        properties: [...state.company.properties, newProperty]
      }
    };
  }),

  sellProperty: (propertyId) => set(state => {
    const property = state.company.properties.find(p => p.id === propertyId);
    if (!property) return state;

    // Sell for 50% of purchase cost
    const sellValue = property.purchaseCost * 0.5;

    return {
      company: {
        ...state.company,
        money: state.company.money + sellValue,
        properties: state.company.properties.filter(p => p.id !== propertyId)
      }
    };
  }),

  // Modifier Management (for events)
  addModifier: (modifier) => set(state => {
    const modifierId = modifier.id || generateId();
    const newModifier = { ...modifier, id: modifierId };

    // Remove any existing modifier with the same ID (prevent stacking)
    const filteredModifiers = state.company.activeModifiers.filter(m => m.id !== modifierId);

    return {
      company: {
        ...state.company,
        activeModifiers: [...filteredModifiers, newModifier]
      }
    };
  }),

  removeModifier: (modifierId) => set(state => ({
    company: {
      ...state.company,
      activeModifiers: state.company.activeModifiers.filter(m => m.id !== modifierId)
    }
  })),

  removeModifiersBySource: (source) => set(state => ({
    company: {
      ...state.company,
      activeModifiers: state.company.activeModifiers.filter(m => m.source !== source)
    }
  })),

  // Task Management
  addTask: (task) => set(state => ({
    tasks: [...state.tasks, { ...task, id: task.id || generateId() }]
  })),

  removeTask: (taskId) => set(state => ({
    tasks: state.tasks.filter(t => t.id !== taskId)
  })),

  // Event System Management
  setScheduledEvents: (events) => set({ scheduledEvents: events }),

  addScheduledEvent: (eventId, scheduledDate) => set(state => ({
    scheduledEvents: [...state.scheduledEvents, { eventId, scheduledDate }]
  })),

  removeScheduledEvent: (eventId) => set(state => ({
    scheduledEvents: state.scheduledEvents.filter(e => e.eventId !== eventId)
  })),

  markEventAsFired: (eventId) => set(state => {
    const newSet = new Set(state.firedOneTimeEvents);
    newSet.add(eventId);
    return { firedOneTimeEvents: newSet };
  }),

  triggerEvent: (eventId) => set(state => {
    // Add to pending events queue if not already there
    if (!state.pendingEvents.includes(eventId)) {
      return {
        pendingEvents: [...state.pendingEvents, eventId],
        paused: true // Pause game when event is triggered
      };
    }
    return state;
  }),

  showNextEvent: () => set(state => {
    if (state.pendingEvents.length === 0) return state;

    const [nextEventId, ...remainingEvents] = state.pendingEvents;
    return {
      activeEvent: nextEventId,
      pendingEvents: remainingEvents,
      paused: true // Ensure game is paused
    };
  }),

  dismissEvent: () => set({
    activeEvent: null
  }),

  addMoney: (amount) => set(state => ({
    company: {
      ...state.company,
      money: state.company.money + amount
    }
  })),

  // Save/Load
  saveGame: () => {
    const state = get();
    const saveData = {
      date: state.date.toISOString(),
      company: state.company,
      tasks: state.tasks,
      debugUnlockAll: state.debugUnlockAll,
      // Event system state (don't save scheduledEvents - recalculate on load)
      firedOneTimeEvents: Array.from(state.firedOneTimeEvents)
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    get().addNotification('Game Saved Successfully', 'success');
  },

  loadGame: () => {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      try {
        const data = JSON.parse(raw);
        set({
          date: new Date(data.date),
          company: data.company,
          tasks: data.tasks || [],
          debugUnlockAll: data.debugUnlockAll || false,
          firedOneTimeEvents: new Set(data.firedOneTimeEvents || []),
          scheduledEvents: [], // Will be recalculated in game loop
          pendingEvents: [],
          activeEvent: null,
          gameStarted: true,
          paused: true
        });
        get().addNotification('Game Loaded Successfully', 'success');
        return true;
      } catch (e) {
        console.error('Failed to load save:', e);
        get().addNotification('Failed to Load Game', 'error');
        return false;
      }
    }
    return false;
  },

  hasSave: () => {
    return !!localStorage.getItem(SAVE_KEY);
  },

  getSaveDate: () => {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      try {
        const data = JSON.parse(raw);
        return data.date;
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  newGame: (name, code, hq) => {
    set({
      gameStarted: true,
      date: new Date(`${START_YEAR}-01-01`),
      paused: true,
      speed: 1,
      company: {
        ...initialCompany,
        name: name || 'New Airline',
        code: code || 'AIR',
        hq: hq || 'nyc'
      },
      tasks: [],
      notifications: [],
      // Initialize event system
      scheduledEvents: [],
      firedOneTimeEvents: new Set(),
      pendingEvents: [],
      activeEvent: null
    });
  }
}));
