# Airline Tycoon

A web-based airline management simulation game.

## Features

- **World Map**: Interactive map with real-world cities.
- **Fleet Management**: Buy and manage historical aircraft from 1950 to modern day.
- **Route Planning**: Create routes between cities, manage frequency and prices.
- **Economy**: Dynamic demand system, revenue calculation, and costs (fuel, maintenance).
- **Time Progression**: Start in 1950 and play through aviation history.

## Tech Stack

- React
- Vite
- Tailwind CSS
- Zustand (State Management)
- Lucide React (Icons)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser at `http://localhost:5173`

## How to Play

1. **Start**: You begin in 1950 with $5,000,000.
2. **Buy Planes**: Open the Fleet menu to buy aircraft available in the current year.
3. **Create Routes**: Open the Routes menu to plan flights between cities.
   - You need an available plane with enough range.
   - Adjust frequency to maximize profit.
4. **Manage**: Watch your finances in the dashboard. Don't go bankrupt!
