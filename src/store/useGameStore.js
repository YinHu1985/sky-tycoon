import { create } from 'zustand';
import { START_YEAR, generateId } from '../lib/utils.js';
import { CompanyActions } from '../lib/CompanyActions.js';
import { generateAICompanies } from '../lib/AIUtils.js';

const SAVE_KEY = 'airline_tycoon_save_v3'; // Incremented version

const initialCompany = {
  id: 'player',
  isPlayer: true, // Flag to identify player company easily
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
  autoSaveFrequency: 'yearly', // daily, weekly, monthly, yearly

  // Companies State
  companies: [initialCompany],
  playerCompanyId: 'player',

  // Getter for current player company (helper for UI)
  get playerCompany() {
    return get().companies.find(c => c.id === get().playerCompanyId);
  },
  
  // Backwards compatibility for UI components that might access state.company directly
  // Note: Proxies or getters on the state object itself are tricky in Zustand. 
  // We will rely on components migrating to use `companies` and `playerCompanyId`
  // or using the selector: state => state.companies.find(c => c.id === state.playerCompanyId)

  // Tasks
  tasks: [],

  // Event System
  scheduledEvents: [],           // Events scheduled to happen on specific dates
  firedOneTimeEvents: new Set(), // IDs of one-time events that have already fired
  pendingEvents: [],             // Events waiting to be displayed (queue)
  activeEvent: null,             // Currently displayed event (or null)

  // UI State
  notifications: [],
  hiddenCompanyRoutes: [], // Array of company IDs whose routes should be hidden on map
  
  // UI memory
  lastRouteSourceId: null,

  // Actions
  toggleCompanyRoutes: (companyId) => set(state => {
    const isHidden = state.hiddenCompanyRoutes.includes(companyId);
    if (isHidden) {
      return { hiddenCompanyRoutes: state.hiddenCompanyRoutes.filter(id => id !== companyId) };
    } else {
      return { hiddenCompanyRoutes: [...state.hiddenCompanyRoutes, companyId] };
    }
  }),

  setGameStarted: (started) => set({ gameStarted: started }),
  setPaused: (paused) => set({ paused }),
  setSpeed: (speed) => set({ speed }),
  setDate: (date) => set({ date }),
  setDebugUnlockAll: (value) => set({ debugUnlockAll: value }),
  setAutoSaveFrequency: (frequency) => set({ autoSaveFrequency: frequency }),
  setLastRouteSourceId: (cityId) => set({ lastRouteSourceId: cityId }),

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

  // --- NEW ABSTRACTION LAYER ---
  
  performAction: (companyId, actionType, payload) => set(state => {
    const companyIndex = state.companies.findIndex(c => c.id === companyId);
    if (companyIndex === -1) {
      console.error(`Company not found: ${companyId}`);
      return state;
    }

    const company = state.companies[companyIndex];
    const actionFn = CompanyActions[actionType];

    if (!actionFn) {
      console.error(`Unknown action: ${actionType}`);
      return state;
    }

    try {
      const updates = actionFn(company, payload);
      
      const newCompanies = [...state.companies];
      newCompanies[companyIndex] = { ...company, ...updates };

      return { companies: newCompanies };
    } catch (e) {
      get().addNotification(e.message, 'error');
      return state;
    }
  }),

  // Legacy wrappers for UI convenience (acting on player company)
  addRoute: (route) => get().performAction(get().playerCompanyId, 'ADD_ROUTE', route),
  updateRoute: (routeId, updates) => get().performAction(get().playerCompanyId, 'UPDATE_ROUTE', { routeId, updates }),
  deleteRoute: (routeId) => get().performAction(get().playerCompanyId, 'DELETE_ROUTE', { routeId }),
  buyPlane: (typeId, cost, options = {}) => get().performAction(get().playerCompanyId, 'BUY_PLANE', { typeId, cost, ...options }),
  updateEfforts: (maintenanceEffort, serviceEffort, prBudget) => get().performAction(get().playerCompanyId, 'UPDATE_EFFORTS', { maintenanceEffort, serviceEffort, prBudget }),
  buyProperty: (type, cityId, cost) => get().performAction(get().playerCompanyId, 'BUY_PROPERTY', { type, cityId, cost, date: get().date.toISOString() }),
  sellProperty: (propertyId) => get().performAction(get().playerCompanyId, 'SELL_PROPERTY', { propertyId }),
  addMoney: (amount) => get().performAction(get().playerCompanyId, 'ADD_MONEY', { amount }),

  // Direct state updates for internal logic (like weekly finance)
  updateCompanyData: (companyId, updates) => set(state => ({
    companies: state.companies.map(c => 
      c.id === companyId ? { ...c, ...updates } : c
    )
  })),

  // Deprecated: Only updates player company. Kept for safety during migration.
  updateCompany: (updates) => get().updateCompanyData(get().playerCompanyId, updates),


  // Modifier Management (Refactored to support generic company update)
  addModifier: (modifier) => set(state => {
    // Defaults to player company for now as modifiers are usually triggered by player events
    // TODO: Event system should specify target company
    const companyId = state.playerCompanyId; 
    const company = state.companies.find(c => c.id === companyId);
    if (!company) return state;

    const modifierId = modifier.id || generateId();
    const newModifier = { ...modifier, id: modifierId };
    const filteredModifiers = company.activeModifiers.filter(m => m.id !== modifierId);

    return {
      companies: state.companies.map(c => 
        c.id === companyId 
          ? { ...c, activeModifiers: [...filteredModifiers, newModifier] }
          : c
      )
    };
  }),

  removeModifier: (modifierId) => set(state => {
    // Removes from ALL companies (assuming unique modifier IDs) or just player?
    // Let's assume player for now to match legacy behavior
    const companyId = state.playerCompanyId;
    return {
      companies: state.companies.map(c => 
        c.id === companyId 
          ? { ...c, activeModifiers: c.activeModifiers.filter(m => m.id !== modifierId) }
          : c
      )
    };
  }),

  removeModifiersBySource: (source) => set(state => {
    const companyId = state.playerCompanyId;
    return {
      companies: state.companies.map(c => 
        c.id === companyId 
          ? { ...c, activeModifiers: c.activeModifiers.filter(m => m.source !== source) }
          : c
      )
    };
  }),

  // Task Management
  addTask: (task) => set(state => ({
    tasks: [...state.tasks, { ...task, id: task.id || generateId() }]
  })),

  removeTask: (taskId) => set(state => ({
    tasks: state.tasks.filter(t => t.id !== taskId)
  })),

  removeTasks: (taskIds) => set(state => ({
    tasks: state.tasks.filter(t => !taskIds.includes(t.id))
  })),

  // Event System Management
  setScheduledEvents: (events) => set({ scheduledEvents: events }),

  addScheduledEvent: (eventId, scheduledDate) => set(state => ({
    scheduledEvents: [...state.scheduledEvents, { eventId, scheduledDate }]
  })),

  rescheduleEvent: (eventId, newDate, companyId = null) => set(state => {
    // Filter out the specific event instance
    const filtered = state.scheduledEvents.filter(e => {
        if (companyId) return !(e.eventId === eventId && e.companyId === companyId);
        return e.eventId !== eventId; // If global, remove all matching eventId? Or just the global one?
        // Assuming global events have companyId undefined/null.
    });
    
    return {
        scheduledEvents: [...filtered, { eventId, scheduledDate: newDate, companyId }]
    };
  }),

  removeScheduledEvent: (eventId, companyId = null) => set(state => ({
    scheduledEvents: state.scheduledEvents.filter(e => {
        if (companyId) return !(e.eventId === eventId && e.companyId === companyId);
        return e.eventId !== eventId;
    })
  })),

  markEventAsFired: (eventId, companyId = null) => set(state => {
    const newSet = new Set(state.firedOneTimeEvents);
    // If companyId is provided, we might want to track it per company?
    // Current system just tracks eventId strings.
    // If we change it to "eventId:companyId", we need to update usage elsewhere.
    // For now, if companyId is present, store composite key.
    const key = companyId ? `${eventId}:${companyId}` : eventId;
    newSet.add(key);
    return { firedOneTimeEvents: newSet };
  }),

  triggerEvent: (eventId) => set(state => {
    if (!state.pendingEvents.includes(eventId)) {
      return {
        pendingEvents: [...state.pendingEvents, eventId],
        paused: true 
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
      paused: true
    };
  }),

  dismissEvent: () => set({
    activeEvent: null
  }),

  // Save/Load
  saveGame: (silent = false) => {
    const state = get();
    const saveData = {
      date: state.date.toISOString(),
      companies: state.companies,
      playerCompanyId: state.playerCompanyId,
      tasks: state.tasks,
      debugUnlockAll: state.debugUnlockAll,
      autoSaveFrequency: state.autoSaveFrequency,
      firedOneTimeEvents: Array.from(state.firedOneTimeEvents)
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    if (!silent) {
      get().addNotification('Game Saved Successfully', 'success');
    }
  },
  
  getSaveData: () => {
    const state = get();
    return {
      date: state.date.toISOString(),
      companies: state.companies,
      playerCompanyId: state.playerCompanyId,
      tasks: state.tasks,
      debugUnlockAll: state.debugUnlockAll,
      autoSaveFrequency: state.autoSaveFrequency,
      firedOneTimeEvents: Array.from(state.firedOneTimeEvents)
    };
  },

  loadGame: () => {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      try {
        const data = JSON.parse(raw);
        // Handle migration from v2 (single company) to v3 (companies array)
        let companies = data.companies;
        let playerCompanyId = data.playerCompanyId;

        if (!companies && data.company) {
             // Migration
             const oldCompany = { ...data.company, id: 'player', isPlayer: true };
             companies = [oldCompany];
             playerCompanyId = 'player';
        }

        // Migration: Add AI companies if they don't exist (single player game)
        if (companies && companies.length === 1 && companies[0].isPlayer) {
             const aiCompanies = generateAICompanies(3, companies[0].hq);
             companies = [...companies, ...aiCompanies];
        }

        set({
          date: new Date(data.date),
          companies: companies,
          playerCompanyId: playerCompanyId || 'player',
          tasks: data.tasks || [],
          debugUnlockAll: data.debugUnlockAll || false,
          autoSaveFrequency: data.autoSaveFrequency || 'yearly',
          firedOneTimeEvents: new Set(data.firedOneTimeEvents || []),
          scheduledEvents: [], 
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
  
  importSave: (data) => {
    try {
      let companies = data.companies;
      let playerCompanyId = data.playerCompanyId;
      
      if (!companies && data.company) {
        const oldCompany = { ...data.company, id: 'player', isPlayer: true };
        companies = [oldCompany];
        playerCompanyId = 'player';
      }
      
      if (companies && companies.length === 1 && companies[0].isPlayer) {
        const aiCompanies = generateAICompanies(3, companies[0].hq);
        companies = [...companies, ...aiCompanies];
      }
      
      set({
        date: new Date(data.date),
        companies: companies,
        playerCompanyId: playerCompanyId || 'player',
        tasks: data.tasks || [],
        debugUnlockAll: data.debugUnlockAll || false,
        autoSaveFrequency: data.autoSaveFrequency || 'yearly',
        firedOneTimeEvents: new Set(data.firedOneTimeEvents || []),
        scheduledEvents: [], 
        pendingEvents: [],
        activeEvent: null,
        gameStarted: true,
        paused: true
      });
      get().addNotification('Save Imported Successfully', 'success');
      return true;
    } catch (e) {
      console.error('Failed to import save data:', e);
      get().addNotification('Failed to Import Save', 'error');
      return false;
    }
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
    const playerCompany = {
        ...initialCompany,
        id: 'player',
        isPlayer: true,
        name: name || 'New Airline',
        code: code || 'AIR',
        hq: hq || 'nyc'
    };

    const aiCompanies = generateAICompanies(3, playerCompany.hq);

    set({
      gameStarted: true,
      date: new Date(`${START_YEAR}-01-01`),
      paused: true,
      speed: 1,
      companies: [playerCompany, ...aiCompanies],
      playerCompanyId: 'player',
      tasks: [],
      notifications: [],
      autoSaveFrequency: 'yearly',
      scheduledEvents: [],
      firedOneTimeEvents: new Set(),
      pendingEvents: [],
      activeEvent: null
    });
  }
}));
