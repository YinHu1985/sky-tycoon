# Sky Tycoon - Project Status

## 📅 Latest Updates (February 2026)

### New Features Added ✨

#### Property System Overhaul (Latest - Feb 4, 2026)
1. **Strategic Property Portfolio** - 6 distinct building types with unique purposes
2. **Separated Income Calculations** - Properties now have separate business and tourism income multipliers
3. **Fixed Operating Costs** - Properties have consistent weekly costs, income scales with city attributes
4. **One Building Per Type Per City** - Strategic limitation forces careful city selection
5. **Building Types**:
   - **Business Hotel** - Income-focused, high business demand scaling
   - **Luxury Hotel** - Balanced income from both business and tourism
   - **Travel Agency** - Pure tourism income, highest load factor bonus
   - **Airport Transport** - Pure cost, massive relationship boost
   - **Airline Meal Factory** - Reduces flight operation costs by 10%, improved load factor
   - **Maintenance Center** - Expensive hub facility, reduces flight maintenance costs by 15%
6. **Property Management** - Sell any property for 50% of purchase price
7. **Cost Reduction Facilities** - Maintenance Centers and Meal Factories create strategic hub advantages

#### Reputation & Management System
8. **Company Fame System** - 0-100 scale affecting passenger demand and load factors
9. **Maintenance Effort** - Adjustable 0-100% affecting costs, fame, and future accident risk
10. **Service Quality** - Adjustable 0-100% affecting flight costs and fame
11. **PR & Advertisement** - Weekly budget to boost company fame
12. **Extensible Modifier System** - Support for event-based modifiers (CEO bonuses, crises, etc.)
13. **Company-City Relationships** - Dynamic relationships based on HQ, routes, and properties
14. **Property Benefits** - Generate weekly income and improve route performance

#### Previous Features
15. **City Details Window** - Click any city to see information and connected routes
16. **Map Selection Mode** - Click map pin icons to select cities directly from the map when planning routes
17. **Route Editing** - Edit button on each route to modify aircraft count and pricing
18. **Route Details View** - Comprehensive route statistics, performance metrics, and cost breakdown
19. **Geodesic Route Rendering** - Routes now follow proper great circle paths on the map
20. **Infinite Horizontal Scrolling** - Map wraps seamlessly east/west for better navigation
21. **Map Zoom Controls** - Zoom in/out buttons with smart limits

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
- [x] **Property Ownership System** - Strategic building portfolio with 6 types
  - **One building per type per city** - Forces strategic city selection
  - **Sell properties** - Recover 50% of purchase cost anytime
  - **Income Properties** (generate revenue):
    - **Business Hotel**: $4M, 2.5% biz income + 0.5% tour income, $80k/wk cost, +3% load factor, +5 relationship
    - **Luxury Hotel**: $6M, 1.5% biz income + 1.5% tour income, $100k/wk cost, +4% load factor, +8 relationship
    - **Travel Agency**: $2M, 2.5% tour income, $40k/wk cost, +5% load factor, +10 relationship
  - **Cost-Reduction Facilities** (operational savings):
    - **Airport Transport**: $3M, $150k/wk cost, +2% load factor, +15 relationship
    - **Airline Meal Factory**: $5M, $150k/wk cost, **-10% flight operation costs**, +4% load factor, +5 relationship
    - **Maintenance Center**: $15M, $300k/wk cost, **-15% flight maintenance costs**, +3 relationship
  - **Separated multipliers**: Business and tourism income calculated independently
  - **Fixed costs**: Property maintenance costs independent of city size
  - **Hub strategy**: Build cost-reduction facilities in high-traffic hubs for maximum savings
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

## Property System Architecture

### Overview
The property system allows companies to invest in city infrastructure for strategic benefits. Properties can generate income, reduce operational costs, or boost relationships and load factors. All properties are limited to **one per type per city** to encourage strategic placement decisions.

### Property Categories

#### 1. Income-Generating Properties
These properties generate weekly revenue based on city attributes:
- **Business Hotel**: Focuses on business demand (2.5% biz, 0.5% tour)
- **Luxury Hotel**: Balanced income from both markets (1.5% biz, 1.5% tour)
- **Travel Agency**: Pure tourism play (2.5% tour)

**Income Formula**: `(city.biz * 100000 * bizMultiplier) + (city.tour * 100000 * tourMultiplier) - fixedMaintCost`

#### 2. Cost-Reduction Facilities
These properties have no income but reduce flight operational costs:
- **Maintenance Center**: Reduces maintenance costs by **15%** for all flights to/from the city
- **Airline Meal Factory**: Reduces flight operation costs by **10%** for all flights to/from the city
- **Airport Transport**: Pure cost, but provides massive relationship boost (+15)

**Strategic Value**: Build in high-traffic hub cities to maximize savings. A maintenance center in a hub with 20 weekly flights can save more than its weekly cost.

### Property Mechanics

#### Purchase & Ownership
```javascript
// Purchase (one per type per city enforced)
buyProperty(propertyType, cityId, cost);

// Sell for 50% value
sellProperty(propertyId);  // Returns 50% of purchaseCost
```

#### Cost Reduction Implementation
Both maintenance centers and meal factories automatically apply their benefits:
- Checked in `getBuiltInModifiers()` in `/src/lib/modifiers.js`
- Applied as multipliers (0.85 for 15% reduction, 0.90 for 10% reduction)
- Works for both source and target cities (if either has facility, benefit applies)
- Uses `Math.max()` to prevent stacking multiple facilities of same type

#### Financial Processing
Properties are processed weekly in `calculatePropertyFinancials()`:
1. Calculate business income: `city.biz * 100000 * bizMultiplier`
2. Calculate tourism income: `city.tour * 100000 * tourMultiplier`
3. Apply fixed maintenance cost
4. Apply any event-based modifiers to income
5. Return updated property objects with `weeklyIncome` and `weeklyMaintCost`

### Property Stats Summary

| Property | Cost | Weekly Cost | Income/Benefit | Load Factor | Relationship |
|----------|------|-------------|----------------|-------------|--------------|
| Business Hotel | $4M | $80k | 2.5% biz, 0.5% tour | +3% | +5 |
| Luxury Hotel | $6M | $100k | 1.5% biz, 1.5% tour | +4% | +8 |
| Travel Agency | $2M | $40k | 2.5% tour | +5% | +10 |
| Airport Transport | $3M | $150k | Pure cost | +2% | +15 |
| Meal Factory | $5M | $150k | -10% flight ops | +4% | +5 |
| Maintenance Center | $15M | $300k | -15% maintenance | 0% | +3 |

### Strategic Considerations

1. **Income Properties**: Best in high-demand cities (NYC, London, Dubai)
   - Business Hotels excel in financial centers (biz 85+)
   - Travel Agencies excel in tourist destinations (tour 85+)
   - Luxury Hotels work well in balanced cities

2. **Cost-Reduction Facilities**: Best in hub cities with many routes
   - Maintenance Centers: Essential for hubs with 15+ weekly flights
   - Meal Factories: Good for medium hubs with 10+ weekly flights
   - Calculate ROI: (weekly savings vs weekly cost)

3. **Relationship Boosters**: Airport Transport for strategic cities
   - Use to unlock better load factors in important markets
   - Synergizes with routes and properties for compound benefits

4. **One Per Type Limit**: Plan your network carefully
   - Can't spam properties in every city
   - Must choose optimal locations for each type
   - Creates meaningful strategic decisions

## Next Steps

### Immediate (Ready to Play)
1. Run `npm run dev` - All core features implemented!
2. Test new reputation system - Adjust efforts, buy properties
3. Experiment with fame impact on routes
4. Test property income generation
5. Report any bugs discovered during gameplay

### Future Enhancements
6. **Random Events System** - Use modifier system for fuel crises, CEO changes, disasters
7. Add more cities (expand from 16 to 50+ airports)
8. Add world map background image
9. Implement bankruptcy/game over detection
10. Add aircraft resale functionality
11. Add achievements and milestones (use modifier rewards)
12. Add more property types (if needed - cargo terminals, flight schools, etc.)

### Polish
13. Enhance UI animations and transitions
14. Add sound effects (optional)
15. Add tutorial/onboarding for new players
16. Improve mobile responsiveness (if needed)
