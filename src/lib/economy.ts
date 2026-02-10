import { PLANE_TYPES } from '../data/planes';
import { CITIES } from '../data/cities';
import { calculateDistance } from './utils';
import {
  getModifiersForTarget,
  applyModifiers,
  calculateFame,
  calculatePropertyFinancials,
  getCityAttributes
} from './modifiers';
import { Company, Route, City, PlaneType, Fleet, RouteStats, Modifier } from '../types';

export interface OptimalRouteConfig {
  profit?: number;
  revenue?: number;
  cost?: number;
  loadFactor?: number;
  passengers?: number;
  recommendedFrequency?: number;
  recommendedPriceModifer?: number;
  canFly: boolean;
}

export const calculateFlightRouteIncome = (company: Company, route: Route): RouteStats => {
  const type = PLANE_TYPES.find(t => t.id === route.planeTypeId);
  const source = CITIES.find(c => c.id === route.from); // Route interface uses 'from'
  const target = CITIES.find(c => c.id === route.to);   // Route interface uses 'to'

  if (!type || !source || !target) {
    return {
      profitLastWeek: 0,
      revenue: 0,
      flightCost: 0,
      maintCost: 0,
      occupancy: 0,
      passengers: 0,
      actualTicket: 0
    };
  }

  const dist = calculateDistance(source, target);
  if (typeof dist !== 'number' || isNaN(dist)) {
      console.error(`Invalid distance calculated for route ${route.id}: ${source.name} -> ${target.name}`);
      return {
          profitLastWeek: 0,
          revenue: 0,
          flightCost: 0,
          maintCost: 0,
          occupancy: 0,
          passengers: 0,
          actualTicket: 0
      };
  }

  // --- ECONOMY MODEL v2.0 with MODIFIERS ---
  // 1. Demand Calculation
  const sourceAttrs = getCityAttributes(company, source);
  const targetAttrs = getCityAttributes(company, target);
  const baseDemand = (sourceAttrs.biz + targetAttrs.biz + sourceAttrs.tour + targetAttrs.tour) * 10;

  // Price Sensitivity
  const priceModDecimal = (route.priceModifier || 0) / 100;
  const demandMultiplier = 1 - (priceModDecimal * 0.6);

  // Apply demand modifiers
  const demandMods = getModifiersForTarget(company, 'demand', {
    sourceId: route.from,
    targetId: route.to,
    routeId: route.id
  });
  const realDemand = applyModifiers(baseDemand * demandMultiplier, demandMods);

  // 2. Capacity (Round Trip = 2x capacity per freq)
  const weeklyCapacity = route.frequency * type.capacity * 2;

  // 3. Occupancy with Load Factor Modifiers
  const basePassengers = Math.floor(Math.min(weeklyCapacity, realDemand));
  let baseLoadFactor = weeklyCapacity > 0 ? basePassengers / weeklyCapacity : 0;

  // Apply load factor modifiers (fame, relationship, properties, events)
  const loadFactorMods = getModifiersForTarget(company, 'loadFactor', {
    sourceId: route.from,
    targetId: route.to,
    routeId: route.id,
    planeTypeId: route.planeTypeId
  });
  const modifiedLoadFactor = Math.min(1.0, applyModifiers(baseLoadFactor, loadFactorMods));

  // Recalculate passengers with modified load factor
  const passengers = Math.floor(Math.min(weeklyCapacity, weeklyCapacity * modifiedLoadFactor));
  const loadFactor = modifiedLoadFactor;

  // 4. Revenue with Modifiers
  const isSupersonic = type.speed > 1000;
  // Adjusted base rates to ensure profitability for modern jets (v2.1)
  // Previous: 0.35/0.85 -> resulted in ~$0.25/pax-km vs ~$0.35 cost
  // New: 0.55/1.10 -> targets ~$0.38/pax-km
  const baseRate = isSupersonic ? 1.10 : 0.55;
  const baseFee = isSupersonic ? 200 : 50;

  const baseTicket = baseFee + (dist * baseRate);
  const actualTicket = baseTicket * (1 + priceModDecimal);
  let routeRevenue = passengers * actualTicket;

  // Apply revenue modifiers
  const revenueMods = getModifiersForTarget(company, 'revenue', {
    sourceId: route.from,
    targetId: route.to,
    routeId: route.id
  });
  routeRevenue = applyModifiers(routeRevenue, revenueMods);

  // 5. Costs with Modifiers
  // Flight operations cost (affected by service effort)
  let flightOpsCost = route.frequency * (2 * dist * type.fuelCost);
  const flightCostMods = getModifiersForTarget(company, 'flightCost', {
    sourceId: route.from,
    targetId: route.to,
    routeId: route.id,
    planeTypeId: route.planeTypeId
  });
  flightOpsCost = applyModifiers(flightOpsCost, flightCostMods);

  // Maintenance cost (affected by maintenance effort)
  let activeMaintCost = route.assignedCount * type.maint;
  const maintCostMods = getModifiersForTarget(company, 'maintenanceCost', {
    planeTypeId: route.planeTypeId,
    routeId: route.id
  });
  activeMaintCost = applyModifiers(activeMaintCost, maintCostMods);

  const routeTotalCost = flightOpsCost + activeMaintCost;
  const profit = routeRevenue - routeTotalCost;

  return {
    profitLastWeek: profit,
    revenue: routeRevenue,
    flightCost: flightOpsCost,
    maintCost: activeMaintCost,
    occupancy: loadFactor,
    passengers,
    actualTicket
  };
}


/**
 * Calculate weekly financial results for all routes
 * Based on the economic model v2.0 with extensible modifier system
 */
export const calculateWeeklyFinance = (company: Company) => {
  let totalRevenue = 0;
  let totalFlightCost = 0;
  let totalMaintCost = 0;
  let totalIdleCost = 0;

  // 1. Calculate Route Revenue & Costs (with modifiers)
  const updatedRoutes = company.routes.map(route => {
    let stats = calculateFlightRouteIncome(company, route)

    totalRevenue += stats.revenue;
    totalFlightCost += stats.flightCost;
    totalMaintCost += stats.maintCost;

    return {
      ...route,
      stats // Ensure Route interface in types/index.ts has 'stats'
    };
  });

  // 2. Process Idle Planes (with maintenance effort modifier)
  const idleCounts: Record<string, { idle: number, cost: number }> = {};
  Object.keys(company.fleet).forEach(typeId => {
    const owned = company.fleet[typeId] || 0;
    const assigned = updatedRoutes
      .filter(r => r.planeTypeId === typeId)
      .reduce((sum, r) => sum + r.assignedCount, 0);
    const idle = Math.max(0, owned - assigned);

    const type = PLANE_TYPES.find(t => t.id === typeId);
    if (idle > 0 && type) {
      let idleCost = idle * type.idle;

      // Apply idle cost modifiers (maintenance effort affects idle costs too)
      const idleCostMods = getModifiersForTarget(company, 'idleCost', {
        planeTypeId: typeId
      });
      idleCost = applyModifiers(idleCost, idleCostMods);

      totalIdleCost += idleCost;
      idleCounts[typeId] = { idle, cost: idleCost };
    } else {
      idleCounts[typeId] = { idle: 0, cost: 0 };
    }
  });

  // 3. Process Properties
  const propertyResults = calculatePropertyFinancials(company);

  // 4. Calculate new fame
  const newFame = calculateFame(
    company.fame || 0,
    company.maintenanceEffort || 0,
    company.serviceEffort || 0,
    company.prBudget || 0,
    company
  );

  // 5. Calculate net income (including all new costs/income)
    const netIncome = totalRevenue
                  + propertyResults.totalPropertyIncome
                  - (totalFlightCost + totalMaintCost + totalIdleCost + (company.prBudget || 0) + propertyResults.totalPropertyCost);

    const safeNetIncome = isNaN(netIncome) ? 0 : netIncome;
    const safeTotalRevenue = isNaN(totalRevenue) ? 0 : totalRevenue;

    return {
    routes: updatedRoutes,
    properties: propertyResults.properties,
    fame: newFame,
    stats: {
      totalRevenue: safeTotalRevenue,
      totalFlightCost,
      totalMaintCost,
      totalIdleCost,
      totalPrCost: company.prBudget || 0,
      totalPropertyIncome: propertyResults.totalPropertyIncome,
      totalPropertyCost: propertyResults.totalPropertyCost,
      netIncome: safeNetIncome,
      idleCounts
    },
    money: company.money + safeNetIncome
  };
};

/**
 * Calculate max frequency based on aircraft and route
 */
export const calculateFrequency = (planeTypeId: string, distance: number, assignedCount: number): number => {
  const type = PLANE_TYPES.find(t => t.id === planeTypeId);
  if (!type) return 0;
  if (distance <= 0) return 0;

  const flightTime = distance / type.speed;
  const roundTripTime = (flightTime * 2) + (type.turnaroundTime || 4); // Use defined turnaround time or default 4h
  
  if (roundTripTime <= 0) return 0;

  const tripsPerPlane = Math.floor(168 / roundTripTime); // 168 hours per week
  
  return tripsPerPlane * assignedCount;
};

/**
 * Helper to evaluate potential route profitability
 * Can be used by AI or Player "Auto-Manage"
 */
export const calculateOptimalRouteConfig = (company: Company, sourceId: string, targetId: string, planeTypeId: string, assignedCount: number): OptimalRouteConfig => {
  // this function ignores plane range for simplicity

  const source = CITIES.find(c => c.id === sourceId);
  const target = CITIES.find(c => c.id === targetId);
  const type = PLANE_TYPES.find(t => t.id === planeTypeId);

  if (!source || !target || !type) {
    return { canFly: false };
  }

  const distance = calculateDistance(source, target);
  
  // 1. Optimize Frequency (at priceModifier = 0)
  const maxFrequency = calculateFrequency(planeTypeId, distance, assignedCount);
  let bestFrequency = maxFrequency;
  let bestProfitFreq = -Infinity;

  // Try frequencies from max down to 1
  for (let f = maxFrequency; f >= 1; f--) {
    const stats = calculateFlightRouteIncome(company, {
      id: 'temp', // Dummy ID
      from: sourceId,
      to: targetId,
      planeTypeId,
      assignedCount,
      frequency: f,
      priceModifier: 0,
      color: '#000000', // Dummy color
      distance: distance, // Required by Route interface
      passengers: 0,
      income: 0,
      cost: 0
    } as Route);

    if (stats.profitLastWeek > bestProfitFreq) {
      bestProfitFreq = stats.profitLastWeek;
      bestFrequency = f;
    } else {
      if (bestProfitFreq > -Infinity) {
          break;
      }
    }
  }

  // 2. Optimize Price (at bestFrequency)
  let bestPriceModifier = 0; // Default
  let bestProfitPrice = -Infinity;
  let finalStats: RouteStats | null = null;

  // Try prices from 50 to -50, step 10
  for (let p = 50; p >= -50; p -= 10) {
    const stats = calculateFlightRouteIncome(company, {
      id: 'temp',
      from: sourceId,
      to: targetId,
      planeTypeId,
      assignedCount,
      frequency: bestFrequency,
      priceModifier: p,
      color: '#000000',
      distance: distance,
      passengers: 0,
      income: 0,
      cost: 0
    } as Route);

    if (stats.profitLastWeek > bestProfitPrice) {
      bestProfitPrice = stats.profitLastWeek;
      bestPriceModifier = p;
      finalStats = stats;
    } else {
      // If profit drops, we assume we passed the peak
      if (bestProfitPrice > -Infinity) {
        break;
      }
    }
  }

  // Safety fallback if loops didn't run (e.g. maxFreq=0)
  if (!finalStats) {
      finalStats = calculateFlightRouteIncome(company, {
          id: 'temp',
          from: sourceId,
          to: targetId,
          planeTypeId,
          assignedCount,
          frequency: bestFrequency,
          priceModifier: bestPriceModifier,
          color: '#000000',
          distance: distance,
          passengers: 0,
          income: 0,
          cost: 0
      } as Route);
  }
  
  return {
      profit: finalStats.profitLastWeek,
      revenue: finalStats.revenue,
      cost: finalStats.flightCost + finalStats.maintCost,
      loadFactor: finalStats.occupancy,
      passengers: finalStats.passengers,
      recommendedFrequency: bestFrequency,
      recommendedPriceModifer: bestPriceModifier,
      canFly: true
  };
};
