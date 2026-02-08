# Sky Tycoon - Airline Management Game Requirements

## Project Overview

**Sky Tycoon** (also referred to as "Airline Tycoon") is a web-based airline management simulation game where players build and manage an airline company from 1950 onwards, progressing through aviation history.

**Game Genre**: Business Simulation / Tycoon / Strategy
**Platform**: Web Browser
**Tech Stack**: React, Vite, Tailwind CSS, Zustand (State Management), Lucide Icons

---

## Core Game Concept

Players start their airline in 1950 with $5,000,000 capital and must:
- Purchase historical aircraft that were available in that era
- Create profitable flight routes between major world cities
- Manage finances, fleet, and operations
- Progress through decades as time advances (day-by-day simulation)
- Avoid bankruptcy

---

## Game Mechanics

### 1. Time System
- **Start Year**: 1950
- **Time Progression**: Day-by-day simulation
- **Time Controls**:
  - Play/Pause toggle
  - Speed multipliers: 1x, 2x, 4x
- **Tick Rate**: 200ms per game day at 1x speed (configurable)
- **Weekly Financial Cycle**: Financial calculations occur every Monday (day 1 of week)
- **Auto-Save**: Automatically saves on January 1st of each year

### 2. Player Company

#### Company Attributes
- **Name**: Player-chosen airline name
- **Code**: 3-letter ICAO airline code (e.g., "SKW", "AIR")
- **Headquarters**: One city chosen from available cities
- **Starting Capital**: $5,000,000
- **Money**: Current cash balance (can go negative = bankruptcy risk)

#### Fleet Management
- Players purchase aircraft from manufacturers
- Each aircraft type has specific characteristics
- Fleet is stored as `{ typeId: count }` dictionary
- Aircraft can be assigned to routes or remain idle
- Idle aircraft incur weekly idle costs

#### Routes
- Routes are established between two cities (bidirectional)
- Each route requires:
  - Origin city
  - Destination city
  - Aircraft type
  - Number of aircraft assigned
  - Pricing strategy (modifier: -50% to +50%)
- Routes are assigned flight numbers (e.g., "SKW10", "SKW11")
- Duplicate routes between same city pairs are not allowed

### 3. Aircraft System

#### Aircraft Procurement
- Players order aircraft from a market interface
- Payment is immediate upon order
- **Delivery Time**: 14 days from order date
- Task system tracks pending deliveries

#### Aircraft Database Attributes
Each aircraft type has:
- **ID**: Unique identifier
- **Vendor**: Manufacturer name (e.g., Boeing, Airbus, Douglas)
- **Name**: Model name (e.g., "747-400", "DC-3")
- **Speed**: Cruise speed in km/h
- **Range**: Maximum range in km
- **Capacity**: Passenger capacity (seats)
- **Price**: Purchase price in USD
- **Fuel Cost (fuelCost)**: Cost per km flown
- **Maintenance Cost (maint)**: Weekly maintenance cost per aircraft
- **Idle Cost (idle)**: Weekly cost when aircraft not assigned to routes
- **Introduction Year**: Year aircraft becomes available
- **Retirement Year**: Year aircraft is no longer sold
- **Description**: Flavor text

#### Historical Aircraft Progression
- Aircraft availability is time-locked to historical accuracy
- Early game (1950s): DC-3, DC-6, Constellation, etc.
- Jet age (1960s-70s): 707, DC-8, 747, etc.
- Modern era (1990s-2020s): 777, A380, 787, A350, etc.
- Supersonic options: Concorde, Tu-144 (premium pricing, high costs)
- **Sandbox Mode**: Optional debug mode to unlock all aircraft regardless of year

### 4. City and Geography System

#### City Attributes
Each city has:
- **ID**: Unique identifier
- **Name**: City name
- **Latitude/Longitude**: Real-world coordinates
- **Business Index (biz)**: Business travel demand (0-100)
- **Tourism Index (tour)**: Tourism demand (0-100)
- **Country**: Country/region name

#### Map System
- **Projection**: Equirectangular (flat) world map
- **Map Dimensions**: 2000 x 1000 pixels
- **Map Image**: NASA Blue Marble satellite imagery (or fallback to vector grid)
- **Infinite Scrolling**: Map wraps horizontally for seamless panning
- **Interactive Controls**:
  - Pan/drag to move map
  - Mouse wheel to zoom (0.4x to 4x zoom levels)
  - Click cities to view details
  - Visual route lines showing connections

#### Route Visualization
- Routes drawn as **geodesic curves** (great circle paths) between cities
- Route color coding:
  - Green: Profitable routes
  - Red: Loss-making routes
- Route thickness indicates number of aircraft assigned
- Anti-meridian crossing handled (routes wrap around Pacific)

### 5. Economic Model (v2.0)

#### Revenue Calculation

**Demand Generation**:
```
baseDemand = (source.biz + target.biz + source.tour + target.tour) × 10
```

**Price Sensitivity**:
```
demandMultiplier = 1 - (priceModifier × 0.6)
realDemand = baseDemand × demandMultiplier
```
- At +50% price: demand drops to 70%
- At -50% price: demand increases to 150%

**Capacity and Load Factor**:
```
weeklyCapacity = frequency × aircraftCapacity × 2  // round trip
passengers = min(weeklyCapacity, realDemand)
loadFactor = passengers / weeklyCapacity
```

**Ticket Pricing**:
```
// Regular flights
baseTicket = $50 + ($0.35 × distance_km)

// Supersonic flights (speed > 1000 km/h)
baseTicket = $200 + ($0.85 × distance_km)

actualTicket = baseTicket × (1 + priceModifier)
routeRevenue = passengers × actualTicket
```

#### Cost Calculation

**Flight Operations Cost**:
```
flightOpsCost = frequency × (2 × distance × opCostPerKm)
```
- Covers fuel, crew, airport fees
- Frequency = number of round trips per week

**Maintenance Cost**:
```
activeMaintCost = assignedAircraftCount × maintenanceWeeklyCost
```

**Idle Aircraft Cost**:
```
idleCost = idleAircraftCount × idleCostPerWeek
```

**Net Income**:
```
totalRevenue = sum of all route revenues
totalCosts = flightOpsCosts + maintenanceCosts + idleCosts
netIncome = totalRevenue - totalCosts
```

#### Frequency Calculation (Automatic)
```
flightTime = distance / aircraftSpeed
roundTripTime = (flightTime × 2) + 4 hours  // 4hr turnaround
tripsPerPlanePerWeek = floor(168 hours / roundTripTime)
routeFrequency = tripsPerPlanePerWeek × assignedAircraftCount
```

### 6. Task and Events System

#### Task Types
- **DELIVER_PLANE**: Aircraft delivery task
  - Tracks delivery date
  - Adds aircraft to fleet when completed
  - Generates success notification

#### Task Structure
```javascript
{
  id: "unique_id",
  type: "DELIVER_PLANE",
  name: "Delivery: Boeing 747-400",
  completeDate: "2025-01-15T00:00:00.000Z",
  payload: { typeId: "b747_400", count: 1 }
}
```

---

## User Interface Requirements

### 1. Main HUD (Top Bar)
Displays:
- Company name and code
- Current cash balance (prominent, color-coded)
- Current game date
- Time controls (play/pause, speed selector)
- Active tasks indicator
- Settings button
- Exit button

### 2. Side Menu (Floating Buttons)
- **Market**: Aircraft purchase interface
- **Routes**: Route management and creation
- **Fleet**: Fleet overview and status
- **Company**: Headquarters and financial dashboard

### 3. Game Windows
All windows are:
- Draggable (by title bar)
- Closeable
- Focusable (bring to front on click)
- Positioned with automatic offset for multiple windows
- Styled with dark theme (slate colors)

#### Window Types:

**Market Window**
- Filter by manufacturer
- Grid/list of available aircraft
- Shows: image placeholder, name, vendor, price, specs
- Purchase button (disabled if insufficient funds)
- Year-based availability filtering

**Fleet Window**
- List of owned aircraft
- Shows: model name, total count, idle count, idle cost, maintenance cost
- Color-coded idle aircraft warnings

**Route Manager Window**
- List all active routes
- Filter by city
- Shows: flight number, origin-destination, aircraft, load factor, revenue, profit
- Edit and delete buttons per route
- "Launch New Route" button

**Route Planner Window**
- Origin/destination selection (dropdown or map click)
- Aircraft type selection (only shows available aircraft)
- Number of aircraft slider
- Price strategy slider (-50% to +50%)
- Distance calculation and range validation
- Estimated frequency display
- Submit button (disabled if invalid)

**Company Window**
- Company logo/code display
- Headquarters location
- Weekly financial breakdown:
  - Total revenue
  - Flight operations cost
  - Maintenance cost
  - Idle aircraft cost
  - Net income (highlighted)

**City Info Window**
- City name, country
- Background image placeholder
- Business and tourism indices
- List of connected routes
- "Manage Routes" button

**Settings Window**
- Manual save button
- Sandbox mode toggle (unlock all aircraft)
- Additional settings as needed

### 4. Map Interaction Modes

#### Normal Mode
- Click cities to view info
- Hover over cities highlights them
- Drag to pan
- Scroll to zoom

#### Selection Mode
- Activated when planning a route and using "Select on Map"
- Cursor changes to crosshair
- Banner displays "Click a city on the map to select it"
- Click city to assign it to route field
- Click empty space to cancel selection

### 5. Notifications System
- Toast-style notifications appear in bottom-right
- Types: info, success, error
- Auto-dismiss after 4 seconds
- Color-coded borders

---

## Data Structures

### Game State (Zustand Store)
```javascript
{
  date: Date,
  paused: boolean,
  speed: number, // 1, 2, or 4

  company: {
    name: string,
    code: string,
    hq: string, // city ID
    money: number,
    fleet: { [typeId]: count },
    routes: Route[],
    nextFlightNum: number,
    stats: {
      totalRevenue: number,
      totalFlightCost: number,
      totalMaintCost: number,
      totalIdleCost: number,
      netIncome: number,
      idleCounts: { [typeId]: { idle: number, cost: number } }
    }
  },

  tasks: Task[],
  notifications: Notification[]
}
```

### Route Object
```javascript
{
  id: string,
  flightNumber: string,
  sourceId: string,
  targetId: string,
  planeTypeId: string,
  assignedCount: number,
  frequency: number,
  priceModifier: number, // -50 to 50
  stats: {
    profitLastWeek: number,
    revenue: number,
    flightCost: number,
    maintCost: number,
    occupancy: number, // 0-1
    passengers: number,
    actualTicket: number
  }
}
```

---

## Technical Specifications

### Map Rendering
- HTML5 Canvas-based rendering
- Equirectangular projection: `lon → x`, `lat → y` linear mapping
- Geodesic path calculation using spherical interpolation (slerp)
- Multi-instance world rendering for seamless wrapping
- Efficient redraw on state changes

### Coordinate Conversion
```javascript
geoToPixel(lat, lon):
  x = (lon + 180) × (MAP_WIDTH / 360)
  y = (-lat + 90) × (MAP_HEIGHT / 180)
  return {x, y}
```

### Great Circle Path Algorithm
- Uses spherical linear interpolation (SLERP)
- Generates 50-100 intermediate points for smooth curves
- Handles anti-meridian crossings (Pacific date line)

### Performance Considerations
- Game loop runs on `requestAnimationFrame`
- Uses accumulator pattern for fixed time steps
- State updates batched in weekly cycles
- Canvas rendering optimized with save/restore contexts

### Persistence
- LocalStorage-based save system
- Save key: `airline_tycoon_save_v2`
- Saves: date, company state, tasks
- Auto-save annually, manual save available

---

## Game Balance and Tuning

### Starting Conditions
- Capital: $5,000,000
- Year: 1950
- Available aircraft: DC-3, DC-6, Constellation, 377 Stratocruiser

### Difficulty Considerations
- Early game aircraft are cheap but limited range
- Supersonic aircraft are high-risk/high-reward (Concorde, Tu-144)
- Idle aircraft drain money quickly
- Weekly financial cycles create rhythm
- Player must balance expansion vs. cash reserves

### Demand Scaling
- Major hubs (NYC, London, Tokyo): biz/tour 80-95
- Emerging markets (Dubai): lower initial demand
- Distance affects profitability: short routes = frequent trips, long routes = premium pricing

---

## Known Constraints and Design Decisions

1. **Bidirectional Routes**: Routes are symmetric (no separate outbound/inbound)
2. **Simplified Operations**: No crew management, fuel purchasing, or maintenance events
3. **Static City Demand**: City attributes don't change over time
4. **No Competition**: Single-player, no AI airlines
5. **No Random Events**: No strikes, disasters, or market fluctuations (yet)
6. **Instant Route Creation**: No setup time for new routes
7. **No Aircraft Retirement**: Owned aircraft never age out or need replacement
8. **Simplified Geography**: Only 16 cities initially (expandable)

---

## Implementation Status

### ✅ Completed Features
- All core game mechanics
- Full UI with draggable windows
- Economic model v2
- Map rendering with geodesic routes
- Time simulation system
- Save/load functionality
- Task system
- Notifications
- Component architecture separation
- Zustand store implementation
- Module organization

### 📋 Future Enhancements
- More cities (50-100 major airports)
- More aircraft (100+ models)
- Random events (fuel crises, disasters)
- Research/upgrades system
- Marketing and reputation
- Cargo routes
- Alliance and codeshare
- Multiplayer leaderboards
- Aircraft customization (livery, classes)
- Loan system
- Staff management

---

## AI Development Guidelines

### When Working on This Project:

1. **Preserve Game Balance**: Don't arbitrarily change economic constants without understanding impact
2. **Historical Accuracy**: Maintain correct aircraft introduction/retirement years
3. **Type Safety**: Use TypeScript or JSDoc for complex data structures
4. **Performance**: Canvas operations should remain smooth at 60fps
5. **Mobile Considerations**: Current design is desktop-focused; mobile will need separate UI
6. **Accessibility**: Consider keyboard navigation for all window operations
7. **Extensibility**: Design new features to be data-driven (JSON configs) rather than hardcoded

### Code Style:
- Functional React components with hooks
- Zustand for global state
- Tailwind CSS for styling
- Lucide React for icons
- Keep components under 200 lines when possible
- Separate business logic from UI rendering
- Use custom hooks for complex behaviors (useGameLoop, useMapControls, etc.)

---

## File Organization (Target Structure)

```
src/
├── components/
│   ├── game/          # Game-specific UI
│   │   ├── FleetManager.jsx
│   │   ├── RouteManager.jsx
│   │   ├── RoutePlanner.jsx
│   │   ├── CityDetails.jsx
│   │   └── FinancialReport.jsx
│   ├── map/           # Map rendering
│   │   ├── WorldMap.jsx
│   │   └── RouteLayer.jsx
│   ├── ui/            # Reusable UI
│   │   ├── Dashboard.jsx
│   │   └── Notification.jsx
│   └── layout/        # Layout components
│       └── GameWindow.jsx
├── data/
│   ├── cities.js      # City definitions
│   ├── planes.js      # Aircraft catalog
│   └── constants.js   # Game constants
├── hooks/
│   ├── useGameLoop.js
│   └── useMapControls.js
├── lib/
│   ├── utils.js       # Helper functions
│   ├── economy.js     # Economic calculations
│   └── geometry.js    # Map math
├── store/
│   └── useGameStore.js  # Zustand store
├── App.jsx
└── main.jsx
```

---

## Testing Scenarios

### Game Start
1. Create new airline with custom name/code
2. Verify starting capital is $5,000,000
3. Confirm year is 1950
4. Check only 1950s aircraft are available

### Aircraft Purchase
1. Order aircraft from market
2. Verify money deducted immediately
3. Check delivery task created (14 days)
4. Advance time to delivery date
5. Confirm aircraft added to fleet

### Route Creation
1. Select two cities
2. Choose aircraft with sufficient range
3. Create route
4. Verify flight number assigned
5. Check route appears on map
6. Verify aircraft no longer available

### Financial Cycle
1. Create profitable route
2. Advance to Monday
3. Check weekly report shows positive income
4. Verify money balance increased
5. Check route stats updated

### Edge Cases
- Attempt route beyond aircraft range → blocked
- Try to assign more aircraft than owned → blocked
- Attempt duplicate route → blocked
- Run out of money → game continues (no hard stop yet)

---

## References

### Data Sources
- Aircraft specifications: Based on real-world aviation data
- City coordinates: Real latitude/longitude
- Economic model: Simplified airline economics

### Visual Style
- Dark theme (slate/gray color scheme)
- Blue accents for interactive elements
- Green for profit, red for loss
- Amber/yellow for warnings

---

## Version History

- **v1.0 (Current)**: Complete airline management simulation with modular architecture
- **v2.0 (Planned)**: Enhanced features, random events, more content

---

## Glossary

- **ICAO Code**: International Civil Aviation Organization airline designator
- **Load Factor**: Percentage of seats filled (occupancy rate)
- **Round Trip**: Outbound + return flight (2 legs)
- **Frequency**: Number of round trips per week
- **Operating Cost**: Variable cost per kilometer flown
- **Maintenance Cost**: Fixed weekly cost per aircraft
- **Idle Cost**: Weekly cost for unused aircraft
- **Great Circle**: Shortest path between two points on a sphere
- **Geodesic**: Curved path following Earth's surface
- **Equirectangular**: Map projection with linear lat/lon to x/y
