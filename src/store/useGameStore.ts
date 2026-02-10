import { create } from 'zustand';
import { START_YEAR, generateId } from '../lib/utils';
import { CompanyActions } from '../lib/CompanyActions';
import { Company, Modifier, Route, OwnedProperty, ScheduledEvent } from '../types';

const SAVE_KEY = 'airline_tycoon_save_v3'; // Incremented version

// Define types for the store
interface Notification {
  id: string;
  msg: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface Task {
  id: string;
  [key: string]: any;
}

// interface ScheduledEvent removed (imported from types)

interface GameStoreState {
  // Global State
  gameStarted: boolean;
  date: Date;
  paused: boolean;
  speed: number;
  debugUnlockAll: boolean;
  autoSaveFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly';

  // Companies State
  companies: Company[];
  playerCompanyId: string;

  // Tasks
  tasks: Task[];

  // Event System
  scheduledEvents: ScheduledEvent[];
  firedOneTimeEvents: Set<string>;
  pendingEvents: string[]; // Event IDs
  activeEvent: string | null; // Event ID

  // UI State
  notifications: Notification[];
  hiddenCompanyRoutes: string[];
  lastRouteSourceId: string | null;

  // Computed (simulated)
  playerCompany: Company | undefined;

  // Actions
  toggleCompanyRoutes: (companyId: string) => void;
  setGameStarted: (started: boolean) => void;
  setPaused: (paused: boolean) => void;
  setSpeed: (speed: number) => void;
  setDate: (date: Date) => void;
  setDebugUnlockAll: (value: boolean) => void;
  setAutoSaveFrequency: (frequency: 'daily' | 'weekly' | 'monthly' | 'yearly') => void;
  setLastRouteSourceId: (cityId: string | null) => void;
  addNotification: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;

  performAction: (companyId: string, actionType: string, payload: any) => void;

  // Legacy wrappers
  addRoute: (route: Partial<Route>) => void;
  updateRoute: (routeId: string, updates: Partial<Route>) => void;
  deleteRoute: (routeId: string) => void;
  buyPlane: (typeId: string, cost: number, options?: any) => void;
  updateEfforts: (maintenanceEffort: number, serviceEffort: number, prBudget: number) => void;
  buyProperty: (type: string, cityId: string, cost: number) => void;
  sellProperty: (propertyId: string) => void;
  addMoney: (amount: number) => void;

  updateCompanyData: (companyId: string, updates: Partial<Company>) => void;
  updateCompany: (updates: Partial<Company>) => void;

  addModifier: (modifier: Modifier) => void;
  removeModifier: (modifierId: string) => void;
  removeModifiersBySource: (source: string) => void;

  addTask: (task: Task) => void;
  removeTask: (taskId: string) => void;
  removeTasks: (taskIds: string[]) => void;

  setScheduledEvents: (events: ScheduledEvent[]) => void;
  addScheduledEvent: (eventId: string, scheduledDate: Date) => void;
  rescheduleEvent: (eventId: string, newDate: Date, companyId?: string | null) => void;
  removeScheduledEvent: (eventId: string, companyId?: string | null) => void;
  markEventAsFired: (eventId: string, companyId?: string | null) => void;
  triggerEvent: (eventId: string) => void;
  showNextEvent: () => void;
  dismissEvent: () => void;

  saveGame: (silent?: boolean) => void;
  loadGame: () => boolean;
  resetGame: () => void;
  hasSave: () => boolean;
  getSaveDate: () => Date | null;
  getSaveData: () => any;
  importSave: (data: any) => boolean;
  newGame: (name: string, code: string, hq: string) => void;
}

const initialCompany: Company = {
  id: 'player',
  isPlayer: true,
  name: 'Skyways Int.',
  code: 'SKW',
  hq: 'nyc',
  money: 50000000,
  fleet: {},
  routes: [],
  nextFlightNum: 10,
  fame: 50,
  maintenanceEffort: 50,
  serviceEffort: 50,
  prBudget: 0,
  properties: [],
  activeModifiers: [],
  stats: {
    totalRevenue: 0,
    totalFlightCost: 0,
    totalMaintCost: 0,
    totalIdleCost: 0,
    netIncome: 0,
    idleCounts: {},
    totalPrCost: 0,
    totalPropertyIncome: 0,
    totalPropertyCost: 0
  }
};

export const useGameStore = create<GameStoreState>((set, get) => ({
  // Global State
  gameStarted: false,
  date: new Date(`${START_YEAR}-01-01`),
  paused: true,
  speed: 1,
  debugUnlockAll: false,
  autoSaveFrequency: 'yearly',

  // Companies State
  companies: [initialCompany],
  playerCompanyId: 'player',

  // Getter for current player company
  get playerCompany() {
    return get().companies.find(c => c.id === get().playerCompanyId);
  },

  // Tasks
  tasks: [],

  // Event System
  scheduledEvents: [],
  firedOneTimeEvents: new Set(),
  pendingEvents: [],
  activeEvent: null,

  // UI State
  notifications: [],
  hiddenCompanyRoutes: [],
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

  performAction: (companyId, actionType, payload) => set(state => {
    const companyIndex = state.companies.findIndex(c => c.id === companyId);
    if (companyIndex === -1) {
      console.error(`Company not found: ${companyId}`);
      return state;
    }

    const company = state.companies[companyIndex];
    const actionFn = (CompanyActions as any)[actionType]; // Cast to any to access by string key

    if (!actionFn) {
      console.error(`Unknown action: ${actionType}`);
      return state;
    }

    try {
      const updates = actionFn(company, payload);
      
      const newCompanies = [...state.companies];
      newCompanies[companyIndex] = { ...company, ...updates };

      return { companies: newCompanies };
    } catch (e: any) {
      get().addNotification(e.message || 'Action failed', 'error');
      return state;
    }
  }),

  // Legacy wrappers
  addRoute: (route) => get().performAction(get().playerCompanyId, 'ADD_ROUTE', route),
  updateRoute: (routeId, updates) => get().performAction(get().playerCompanyId, 'UPDATE_ROUTE', { routeId, updates }),
  deleteRoute: (routeId) => get().performAction(get().playerCompanyId, 'DELETE_ROUTE', { routeId }),
  buyPlane: (typeId, cost, options = {}) => get().performAction(get().playerCompanyId, 'BUY_PLANE', { typeId, cost, ...options }),
  updateEfforts: (maintenanceEffort, serviceEffort, prBudget) => get().performAction(get().playerCompanyId, 'UPDATE_EFFORTS', { maintenanceEffort, serviceEffort, prBudget }),
  buyProperty: (type, cityId, cost) => get().performAction(get().playerCompanyId, 'BUY_PROPERTY', { type, cityId, cost, date: get().date.toISOString() }),
  sellProperty: (propertyId) => get().performAction(get().playerCompanyId, 'SELL_PROPERTY', { propertyId }),
  addMoney: (amount) => get().performAction(get().playerCompanyId, 'ADD_MONEY', { amount }),

  updateCompanyData: (companyId, updates) => set(state => ({
    companies: state.companies.map(c => 
      c.id === companyId ? { ...c, ...updates } : c
    )
  })),

  updateCompany: (updates) => get().updateCompanyData(get().playerCompanyId, updates),

  addModifier: (modifier) => set(state => {
    const companyId = state.playerCompanyId; 
    const company = state.companies.find(c => c.id === companyId);
    if (!company) return state;

    const modifierId = modifier.id || generateId();
    const newModifier = { ...modifier, id: modifierId };
    const filteredModifiers = (company.activeModifiers || []).filter(m => m.id !== modifierId);

    return {
      companies: state.companies.map(c => 
        c.id === companyId 
          ? { ...c, activeModifiers: [...filteredModifiers, newModifier] }
          : c
      )
    };
  }),

  removeModifier: (modifierId) => set(state => {
    const companyId = state.playerCompanyId;
    return {
      companies: state.companies.map(c => 
        c.id === companyId 
          ? { ...c, activeModifiers: (c.activeModifiers || []).filter(m => m.id !== modifierId) }
          : c
      )
    };
  }),

  removeModifiersBySource: (source) => set(state => {
    const companyId = state.playerCompanyId;
    return {
      companies: state.companies.map(c => 
        c.id === companyId 
          ? { ...c, activeModifiers: (c.activeModifiers || []).filter(m => m.source !== source) }
          : c
      )
    };
  }),

  addTask: (task) => set(state => ({
    tasks: [...state.tasks, { ...task, id: task.id || generateId() }]
  })),

  removeTask: (taskId) => set(state => ({
    tasks: state.tasks.filter(t => t.id !== taskId)
  })),

  removeTasks: (taskIds) => set(state => ({
    tasks: state.tasks.filter(t => !taskIds.includes(t.id))
  })),

  setScheduledEvents: (events) => set({ scheduledEvents: events }),

  addScheduledEvent: (eventId, scheduledDate) => set(state => ({
    scheduledEvents: [...state.scheduledEvents, { id: generateId(), eventId, scheduledDate }]
  })),

  rescheduleEvent: (eventId, newDate, companyId = null) => set(state => {
    const filtered = state.scheduledEvents.filter(e => {
        if (companyId) return !(e.eventId === eventId && e.companyId === companyId);
        return e.eventId !== eventId; 
    });
    
    return {
        scheduledEvents: [...filtered, { id: generateId(), eventId, scheduledDate: newDate, companyId }]
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
  
  loadGame: () => {
    try {
        const json = localStorage.getItem(SAVE_KEY);
        if (!json) return false;
        
        const saveData = JSON.parse(json);
        
        // Restore Sets and Dates
        if (saveData.date) saveData.date = new Date(saveData.date);
        if (saveData.firedOneTimeEvents) saveData.firedOneTimeEvents = new Set(saveData.firedOneTimeEvents);
        
        set({
            ...saveData,
            gameStarted: true,
            paused: true
        });
        return true;
    } catch (e) {
        console.error("Failed to load game", e);
        return false;
    }
  },
  
  resetGame: () => {
      set({
          gameStarted: false,
          date: new Date(`${START_YEAR}-01-01`),
          paused: true,
          companies: [initialCompany],
          tasks: [],
          scheduledEvents: [],
          firedOneTimeEvents: new Set(),
          notifications: [],
          hiddenCompanyRoutes: []
      });
  },

  getSaveData: () => {
    const state = get();
    return {
      date: state.date,
      companies: state.companies,
      playerCompanyId: state.playerCompanyId,
      tasks: state.tasks,
      scheduledEvents: state.scheduledEvents,
      firedOneTimeEvents: Array.from(state.firedOneTimeEvents),
      gameStarted: state.gameStarted,
      autoSaveFrequency: state.autoSaveFrequency,
    };
  },

  hasSave: () => !!localStorage.getItem(SAVE_KEY),

  getSaveDate: () => {
    const json = localStorage.getItem(SAVE_KEY);
    if (!json) return null;
    try {
      const data = JSON.parse(json);
      // We might want the actual save timestamp, but for now let's return the in-game date or something
      // Actually MainMenu expects a date to show "Last played".
      // The save data has `date` which is game date. 
      // If we want real date, we should have saved it.
      // Assuming game date for now as per `loadGame` usage.
      return data.date ? new Date(data.date) : null;
    } catch { return null; }
  },

  importSave: (data: any) => {
    try {
        // Restore Sets and Dates
        if (data.date) data.date = new Date(data.date);
        if (data.firedOneTimeEvents) data.firedOneTimeEvents = new Set(data.firedOneTimeEvents);
        
        set({
            ...data,
            gameStarted: true,
            paused: true
        });
        return true;
    } catch (e) {
        console.error("Failed to import save", e);
        return false;
    }
  },

  newGame: (name, code, hq) => {
    get().resetGame();
    set(state => ({
      gameStarted: true,
      paused: true,
      companies: state.companies.map(c => 
        c.id === 'player' ? { ...c, name, code, hq } : c
      )
    }));
    get().addNotification(`Welcome to ${name}!`, 'success');
  }
}));
