export interface City {
  id: string;
  name: string;
  image: string;
  lat: number;
  lon: number;
  biz: number;
  tour: number;
  region?: string;
}

export interface PlaneType {
  id: string;
  vendor: string;
  name: string;
  image: string;
  speed: number;
  range: number;
  capacity: number;
  price: number;
  fuelCost: number;
  maint: number;
  idle: number;
  intro: number;
  end: number;
  desc: string;
  turnaroundTime?: number;
}

export interface PropertyType {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  bizMultiplier: number;
  tourMultiplier: number;
  fixedMaintCost: number;
  relationshipBonus: number;
  loadFactorBonus: number;
  icon: string;
  serviceReduction?: number;
  maintReduction?: number;
}

export interface ModifierContext {
  cityId?: string;
  sourceId?: string;
  targetId?: string;
  routeId?: string;
  planeTypeId?: string;
}

export interface Modifier {
  id?: string;
  source: string;
  type: string; // 'multiplier' | 'flat' | 'percentage'
  target: string;
  value: number;
  context?: ModifierContext;
  expiryDate?: Date | string | number;
  expireDuration?: number;
  description?: string;
}

export interface RouteStats {
  profitLastWeek: number;
  revenue: number;
  flightCost: number;
  maintCost: number;
  occupancy: number;
  passengers: number;
  actualTicket: number;
}

export interface Route {
  id: string;
  from: string;
  to: string;
  planeTypeId: string;
  assignedCount: number;
  frequency: number;
  priceModifier: number;
  distance: number;
  passengers: number; // Last week's passengers (can be redundant with stats.passengers)
  income: number; // Last week's income (can be redundant with stats.revenue)
  cost: number; // Last week's cost
  color?: string;
  stats?: RouteStats;
  autoManaged?: boolean; // For AI or auto-managed routes
  flightNumber?: string;
}

export interface Fleet {
  [planeTypeId: string]: number;
}

export interface OwnedProperty {
  id: string;
  cityId: string;
  typeId: string;
  name: string;
  value: number; // Current value
  purchaseCost: number;
  purchaseDate?: string | Date;
  weeklyIncome?: number;
  weeklyMaintCost?: number;
}

export interface CompanyStats {
  totalRevenue: number;
  totalFlightCost: number;
  totalMaintCost: number;
  totalIdleCost: number;
  netIncome: number;
  idleCounts: Record<string, { idle: number; cost: number }>;
  totalPrCost: number;
  totalPropertyIncome: number;
  totalPropertyCost: number;
}

export interface Company {
  id: string;
  name: string;
  code?: string;
  money: number;
  fleet: Fleet;
  routes: Route[];
  properties?: OwnedProperty[];
  hq: string;
  color?: string;
  isPlayer?: boolean;
  fame?: number; // Company reputation/fame
  activeModifiers?: Modifier[]; // Array of active modifiers
  
  // AI specific attributes
  maintenanceEffort?: number;
  serviceEffort?: number;
  prBudget?: number;
  
  // Added for AI and game logic
  nextFlightNum?: number;
  stats?: CompanyStats;
}

export interface Effect {
  type: string;
  amount?: number;
  target?: string;
  duration?: number;
  modifier?: Partial<Modifier>;
  value?: any;
  eventId?: string;
  modifierId?: string;
}

export interface Option {
  label: string;
  description: string;
  effects: Effect[];
}

export interface MTTHModifier {
  condition: (state: GameState, company: Company) => boolean;
  factor: number;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  startDate?: Date;
  endDate?: Date | null;
  mtth?: number;
  triggers?: ((state: GameState, company: Company) => boolean)[];
  mtth_modifiers?: MTTHModifier[];
  oneTime?: boolean;
  scope?: string;
  modal?: boolean;
  options?: Option[];
}

export interface Task {
  id: string;
  type: string;
  name: string;
  completeDate: string | Date;
  payload?: any;
}

export interface ScheduledEvent {
  id: string;
  eventId: string;
  scheduledDate: Date; // Renamed from date to scheduledDate
  companyId?: string | null;
}

export interface GameState {
  date: Date;
  companies: Company[];
  playerCompanyId: string;
  selectedCity: string | null;
  gameSpeed: number;
  isPaused: boolean;
  events?: any[]; // Optional
  modifiers?: any[]; // Optional
}
