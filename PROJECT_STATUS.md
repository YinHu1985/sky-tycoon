# Sky Tycoon - Project Status

## 📅 Latest Updates (February 2026)

### New Features Added ✨

#### Reputation & Management System (Latest)
1. **Company Fame System** - 0-100 scale affecting passenger demand and load factors
2. **Maintenance Effort** - Adjustable 0-100% affecting costs, fame, and future accident risk
3. **Service Quality** - Adjustable 0-100% affecting flight costs and fame
4. **PR & Advertisement** - Weekly budget to boost company fame
5. **Extensible Modifier System** - Support for event-based modifiers (CEO bonuses, crises, etc.)
6. **Company-City Relationships** - Dynamic relationships based on HQ, routes, and properties
7. **Property Ownership** - Buy hotels and travel agencies in cities for income and bonuses
8. **Property Benefits** - Generate weekly income and improve route performance

#### Previous Features
9. **City Details Window** - Click any city to see information and connected routes
10. **Map Selection Mode** - Click map pin icons to select cities directly from the map when planning routes
11. **Route Editing** - Edit button on each route to modify aircraft count and pricing
12. **Route Details View** - Comprehensive route statistics, performance metrics, and cost breakdown
13. **Geodesic Route Rendering** - Routes now follow proper great circle paths on the map
14. **Infinite Horizontal Scrolling** - Map wraps seamlessly east/west for better navigation
15. **Map Zoom Controls** - Zoom in/out buttons with smart limits

### Bug Fixes 🐛
1. **Fleet Count Issue** - Fixed: Buying multiple planes now correctly increases fleet count
2. **Antimeridian Crossing** - Fixed: Routes crossing the date line now display correctly without horizontal lines

### Status
- ✅ All core gameplay features implemented
- ✅ Build succeeds without errors
- 🎮 **Ready to play!**

---

## Completed Features

### ✅ Core Architecture
1. **Zustand Store** (`src/store/useGameStore.js`)
   - Complete state management for game, company, routes, tasks
   - Implemented save/load system with localStorage
   - Added task management (aircraft delivery tracking)
   - Added route CRUD operations
   - Added debug/sandbox mode toggle

2. **Economic System Module** (`src/lib/economy.js`)
   - Extracted economic calculations from game loop
   - Implemented Economic Model v2.0
   - Added automatic frequency calculation based on aircraft specs
   - Proper demand/revenue/cost calculations

3. **Enhanced Game Loop** (`src/hooks/useGameLoop.js`)
   - Integrated with economy module
   - Added task processing system
   - Improved weekly financial cycle with proper week tracking
   - Auto-save on January 1st each year

### ✅ UI Components

4. **Main Menu** (`src/components/ui/MainMenu.jsx`)
   - New game creation with airline name, code, and HQ selection
   - Load game functionality with save date display
   - Modern, polished UI design

5. **Enhanced Fleet Manager** (`src/components/game/FleetManager.jsx`)
   - Aircraft ordering with 14-day delivery system
   - Pending deliveries display with countdown
   - Idle aircraft tracking and cost display
   - Sandbox mode support
   - Market filtered by historical availability

6. **Route Manager** (`src/components/game/RouteManager.jsx`)
   - Proper frequency auto-calculation
   - Aircraft assignment with availability tracking
   - Price modifier slider (-50% to +50%)
   - Real-time route profitability display
   - Improved route statistics (load factor, revenue, profit)
   - Duplicate route prevention
   - **Map city selection mode** - Click map pins to select cities from map
   - **Edit button** - Opens route details for modification

7. **City Details Window** (`src/components/game/CityDetails.jsx`) ✨ NEW
   - Shows city information (country, business/tourism demand)
   - Lists all connected routes from that city
   - Displays aircraft types used on each route
   - Direction indicators (→ outbound, ← inbound)

8. **Route Details & Editor** (`src/components/game/RouteDetails.jsx`) ✨ NEW
   - Comprehensive route information display
   - **Edit mode** - Modify assigned aircraft count and price modifier
   - Live frequency calculation preview
   - Performance statistics (load factor, passengers, revenue, profit)
   - Cost breakdown (flight operations, maintenance)
   - Save/cancel changes

9. **Enhanced WorldMap** (`src/components/map/WorldMap.jsx`)
   - Infinite horizontal scrolling (3 world instances)
   - Dynamic zoom limits to show whole world when zoomed out
   - Zoom in/out buttons
   - **Selection mode** - Cities pulse yellow when selecting for routes
   - Selection mode banner with instructions
   - **Geodesic route rendering** with antimeridian crossing support
   - Color-coded routes (green = profit, red = loss)

10. **Updated App.jsx**
    - Integrated main menu
    - Added settings window with save and sandbox toggle
    - Improved window management
    - Better notification system
    - **City click handler** - Opens city details window
    - **Map selection mode state** - Manages city selection for route planning
    - **Route details window** - Integrated route editor

### ✅ Data & Utilities
8. **Constants File** (`src/data/constants.js`)
   - Centralized game constants

9. **Preserved Assets**
   - `cities.js` - 16 world cities with demand data
   - `planes.js` - 47 historical aircraft (1936-2050)
   - `utils.js` - Geographic and formatting utilities

## Game Features Status

### ✅ Fully Implemented

#### Core Systems
- [x] Time system with play/pause and speed controls (1x, 2x, 4x)
- [x] Company creation and management
- [x] Aircraft purchasing with delivery delays
- [x] Fleet management with idle cost tracking
- [x] Route creation with auto-frequency calculation
- [x] Economic model v2.0 (demand, pricing, costs)
- [x] Weekly financial cycle
- [x] Task system (aircraft deliveries)
- [x] Save/load system (localStorage)
- [x] Notifications system
- [x] Settings (sandbox mode, manual save)
- [x] Historical aircraft availability (1950+)
- [x] Financial reporting
- [x] Route profitability tracking

#### Reputation & Management System ✨ NEW
- [x] **Company Fame** - 0-100 scale, affects load factors and demand
  - Fame naturally decays (-0.5/week)
  - Boosted by maintenance effort, service quality, and PR spending
  - $100k PR/week = +1 fame (max +10/week)
  - 100 fame = 1.2x load factor, 0 fame = 0.8x load factor
- [x] **Maintenance Effort** - 0-100% adjustable
  - 0% = 0.5x maint costs, 100% = 1.8x maint costs
  - Affects fame and future accident risk
- [x] **Service Quality** - 0-100% adjustable
  - 0% = 0.7x flight costs, 100% = 1.5x flight costs
  - Affects fame and passenger satisfaction
- [x] **Company-City Relationships** - 0-100 scale per city
  - Calculated from: HQ location, routes, properties, proximity
  - Affects load factors (0 = 0.85x, 100 = 1.15x)
- [x] **Property Ownership** - Buy hotels and travel agencies
  - Hotels: $5M, higher income, +5 relationship, +3% load factor
  - Travel Agencies: $2M, lower income, +8 relationship, +5% load factor
  - Income based on city business/tourism values
  - Competition penalty: Multiple properties in same city reduce income by 10% each
- [x] **Extensible Modifier System**
  - Support for event-based modifiers (CEO bonuses, fuel crises, etc.)
  - Modifiers can target: loadFactor, revenue, costs, fame, demand, relationship
  - Context support: Global, city-specific, route-specific, plane-specific
  - Temporary modifiers with expiry dates
  - Easy to extend for future random events

#### Map & UI Features
- [x] **City details window** - Shows city info, connected routes, relationship, properties
- [x] **Map selection mode** - Click cities on map when planning routes
- [x] **Route editing** - Modify aircraft count and pricing for existing routes
- [x] **Route details view** - Comprehensive route statistics and configuration
- [x] **Geodesic route curves** - Proper great circle paths on map
- [x] **Antimeridian crossing** - Routes wrap correctly across date line
- [x] **Infinite horizontal map scrolling** - Seamless east/west wrapping
- [x] **Map zoom controls** - Buttons and limits for zooming
- [x] **Company Management Window** - Adjust efforts, view fame, manage reputation

### 📋 Not Yet Implemented
- [ ] Canvas-based map rendering (currently SVG, works well for 16 cities)
- [ ] Aircraft retirement/resale
- [ ] Bankruptcy detection and game over
- [ ] Random events (fuel crises, disasters, opportunities)
- [ ] Achievements and milestones
- [ ] More cities (expand from 16 to 50+)

## Project Architecture
```
src/
├── components/
│   ├── game/
│   │   ├── FleetManager.jsx      # Aircraft purchasing & management
│   │   ├── RouteManager.jsx      # Route creation with map selection
│   │   ├── RouteDetails.jsx      # Route editor & statistics ✨
│   │   ├── CityDetails.jsx       # City info, properties, relationship ✨ UPDATED
│   │   ├── CompanyManagement.jsx # Fame & efforts management ✨ NEW
│   │   └── FinancialReport.jsx   # Weekly financial breakdown ✨ UPDATED
│   ├── map/
│   │   └── WorldMap.jsx          # Interactive map with zoom & selection
│   ├── ui/
│   │   ├── Dashboard.jsx         # Time controls & action buttons ✨ UPDATED
│   │   └── MainMenu.jsx          # Game start screen
│   └── layout/
│       └── GameWindow.jsx        # Draggable window component
├── data/
│   ├── cities.js       # 16 world cities with demand data
│   ├── planes.js       # 47 historical aircraft (1936-2050)
│   ├── properties.js   # Property types (hotels, agencies) ✨ NEW
│   └── constants.js    # Game constants
├── hooks/
│   └── useGameLoop.js  # Game simulation, task & modifier processing ✨ UPDATED
├── lib/
│   ├── utils.js        # Geographic utilities & geodesic math
│   ├── economy.js      # Economic model v2.0 with modifiers ✨ UPDATED
│   └── modifiers.js    # Extensible modifier system ✨ NEW
├── store/
│   └── useGameStore.js # Zustand state management ✨ UPDATED
└── App.jsx             # Main app with window management ✨ UPDATED
```

## Recent Bug Fixes (Feb 2026)

### ✅ Fixed: Fleet Count Not Increasing
**Issue**: When buying multiple planes of the same type (either on same day or sequentially), the fleet count would only increase by 1.

**Root Cause**: Task processing was reading company state once and reusing it for all deliveries, causing concurrent updates to overwrite each other.

**Fix**: Modified `useGameLoop.js` to re-fetch company state for each task completion, ensuring each delivery sees the latest fleet count.

**Location**: `src/hooks/useGameLoop.js:27` - Added `const { company } = useGameStore.getState()` inside task processing loop.

### ✅ Fixed: Route Lines Across Antimeridian
**Issue**: Flight routes crossing the International Date Line displayed horizontal lines across the entire map instead of proper curved paths.

**Root Cause**: Geodesic path calculation produced large horizontal jumps when crossing ±180° longitude, and edge detection logic was backwards.

**Fix**:
1. Created `getGreatCircleSegments()` to detect antimeridian crossings (dx > MAP_WIDTH/2)
2. Interpolate edge points where route crosses map boundary
3. Split into multiple polyline segments at crossing points
4. Fixed edge direction logic (wrappingRight = prevPoint.x > point.x)

**Location**: `src/lib/utils.js:75-123` - New segmentation algorithm with proper edge interpolation.

## Known Issues & TODOs

### High Priority
1. **Map Image**: Add actual world map background image (currently uses fallback gradient)
2. **Map Performance**: Consider Canvas rendering if expanding beyond 16 cities/routes

### Medium Priority
3. **Bankruptcy Detection**: Add game over condition when money < 0 for too long
4. **Aircraft Resale**: Allow selling unused aircraft (currently can only buy)

### Low Priority
5. **More Cities**: Expand from 16 to 50+ airports worldwide
6. **Random Events**: Add fuel crises, disasters, opportunities
7. **Achievements**: Add milestone tracking
8. **Tutorial**: Add onboarding for new players

## Testing Checklist

### ✅ Build Test
- [x] `npm run build` succeeds
- [x] No TypeScript/ESLint errors

### 🔄 Runtime Tests (To Do)
- [ ] Main menu loads correctly
- [ ] New game starts at 1950 with $5M
- [ ] Aircraft can be purchased and delivered
- [ ] Routes can be created between cities
- [ ] Weekly finances calculate correctly
- [ ] Save/load preserves all state
- [ ] Time controls work (play/pause/speed)
- [ ] Notifications appear and disappear
- [ ] Windows are draggable and closeable
- [ ] Sandbox mode unlocks all aircraft

## How to Run

```bash
# Development
npm run dev

# Build
npm run build

# Preview production build
npm run preview
```

## Project Design

Sky Tycoon is built with:
- **Modular architecture** - Clear separation of concerns
- **State management** - Zustand for predictable updates
- **Component-based UI** - React with reusable components
- **Economic simulation** - Realistic demand and cost modeling
- **Time-based gameplay** - Weekly financial cycles and tasks

## Modifier System Architecture

### Overview
The extensible modifier system allows dynamic gameplay adjustments through events, achievements, and company decisions. All modifiers are centralized in `/src/lib/modifiers.js`.

### Modifier Types
- **multiplier**: Multiply values (e.g., 1.1 = +10%, 0.9 = -10%)
- **flat**: Add/subtract fixed amounts (e.g., +0.05 = +5% load factor)
- **percentage**: Percentage-based adjustments

### Modifier Targets
- `loadFactor` - Route passenger capacity utilization
- `revenue` - Ticket revenue
- `flightCost` - Flight operations costs
- `maintenanceCost` - Aircraft maintenance costs
- `idleCost` - Idle aircraft costs
- `fame` - Weekly fame change
- `relationship` - Company-city relationship
- `propertyIncome` - Property income
- `demand` - Passenger demand

### Context Support
- **Global**: Affects everything (context = null)
- **City-specific**: Only affects routes to/from specific city (context.cityId)
- **Route-specific**: Only affects specific route (context.routeId)
- **Plane-specific**: Only affects specific aircraft type (context.planeTypeId)

### Adding Event-Based Modifiers

Example 1: **Excellent CEO Hired** (permanent, multiple bonuses)
```javascript
const { addModifier } = useGameStore.getState();

addModifier({
  id: generateId(),
  source: 'event_excellent_ceo',
  type: 'multiplier',
  target: 'revenue',
  value: 1.1,  // +10% revenue
  context: null,  // global
  expiryDate: null,  // permanent
  description: 'Excellent CEO: Revenue bonus'
});

addModifier({
  id: generateId(),
  source: 'event_excellent_ceo',
  type: 'flat',
  target: 'fame',
  value: 2,  // +2 fame per week
  context: null,
  expiryDate: null,
  description: 'Excellent CEO: Fame boost'
});
```

Example 2: **Temporary Fuel Crisis** (expires after 52 weeks)
```javascript
addModifier({
  id: generateId(),
  source: 'event_fuel_crisis',
  type: 'multiplier',
  target: 'flightCost',
  value: 1.5,  // +50% flight costs
  context: null,
  expiryDate: new Date(currentDate.getTime() + 52*7*24*60*60*1000),
  description: 'Global Fuel Crisis'
});
```

Example 3: **Airport Partnership in NYC** (city-specific)
```javascript
addModifier({
  id: generateId(),
  source: 'event_airport_partnership_nyc',
  type: 'flat',
  target: 'loadFactor',
  value: 0.15,  // +15% load factor
  context: { cityId: 'nyc' },  // Only for routes to/from NYC
  expiryDate: new Date(currentDate.getTime() + 365*24*60*60*1000),
  description: 'NYC Airport Partnership'
});
```

### Removing Modifiers
```javascript
// Remove specific modifier
removeModifier('modifier_id');

// Remove all modifiers from an event (e.g., CEO retired)
removeModifiersBySource('event_excellent_ceo');
```

### Built-in Modifiers
The following modifiers are calculated automatically (not stored):
- Fame effects on load factor
- Maintenance/service effort effects on costs
- Company-city relationship effects
- Property bonuses

## Next Steps

### Immediate (Ready to Play)
1. Run `npm run dev` - All core features implemented!
2. Test new reputation system - Adjust efforts, buy properties
3. Experiment with fame impact on routes
4. Test property income generation
5. Report any bugs discovered during gameplay

### Future Enhancements
6. **Random Events System** - Use modifier system for fuel crises, CEO changes, disasters
7. Add more property types (office buildings, maintenance facilities, training centers)
8. Add more cities (expand from 16 to 50+ airports)
9. Add world map background image
10. Implement bankruptcy/game over detection
11. Add aircraft resale functionality
12. Add achievements and milestones (use modifier rewards)

### Polish
13. Enhance UI animations and transitions
14. Add sound effects (optional)
15. Add tutorial/onboarding for new players
16. Improve mobile responsiveness (if needed)
