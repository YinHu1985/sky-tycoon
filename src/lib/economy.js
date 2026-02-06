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

/**
 * Calculate weekly financial results for all routes
 * Based on the economic model v2.0 with extensible modifier system
 */
export const calculateWeeklyFinance = (company) => {
  let totalRevenue = 0;
  let totalFlightCost = 0;
  let totalMaintCost = 0;
  let totalIdleCost = 0;

  // 1. Calculate Route Revenue & Costs (with modifiers)
  const updatedRoutes = company.routes.map(route => {
    const type = PLANE_TYPES.find(t => t.id === route.planeTypeId);
    const source = CITIES.find(c => c.id === route.sourceId);
    const target = CITIES.find(c => c.id === route.targetId);

    if (!type || !source || !target) return route;

    const dist = calculateDistance(source, target);

    // --- ECONOMY MODEL v2.0 with MODIFIERS ---
    // 1. Demand Calculation
    const sourceAttrs = getCityAttributes(company, source);
    const targetAttrs = getCityAttributes(company, target);
    const baseDemand = (sourceAttrs.biz + targetAttrs.biz + sourceAttrs.tour + targetAttrs.tour) * 10;

    // Price Sensitivity
    const priceModDecimal = route.priceModifier / 100;
    const demandMultiplier = 1 - (priceModDecimal * 0.6);

    // Apply demand modifiers
    const demandMods = getModifiersForTarget(company, 'demand', {
      sourceId: route.sourceId,
      targetId: route.targetId,
      routeId: route.id
    });
    const realDemand = applyModifiers(baseDemand * demandMultiplier, demandMods);

    // 2. Capacity (Round Trip = 2x capacity per freq)
    const weeklyCapacity = route.frequency * type.capacity * 2;

    // 3. Occupancy with Load Factor Modifiers
    const basePassengers = Math.min(weeklyCapacity, realDemand);
    let baseLoadFactor = weeklyCapacity > 0 ? basePassengers / weeklyCapacity : 0;

    // Apply load factor modifiers (fame, relationship, properties, events)
    const loadFactorMods = getModifiersForTarget(company, 'loadFactor', {
      sourceId: route.sourceId,
      targetId: route.targetId,
      routeId: route.id,
      planeTypeId: route.planeTypeId
    });
    const modifiedLoadFactor = Math.min(1.0, applyModifiers(baseLoadFactor, loadFactorMods));

    // Recalculate passengers with modified load factor
    const passengers = Math.min(weeklyCapacity, weeklyCapacity * modifiedLoadFactor);
    const loadFactor = modifiedLoadFactor;

    // 4. Revenue with Modifiers
    const isSupersonic = type.speed > 1000;
    const baseRate = isSupersonic ? 0.85 : 0.35;
    const baseFee = isSupersonic ? 200 : 50;

    const baseTicket = baseFee + (dist * baseRate);
    const actualTicket = baseTicket * (1 + priceModDecimal);
    let routeRevenue = passengers * actualTicket;

    // Apply revenue modifiers
    const revenueMods = getModifiersForTarget(company, 'revenue', {
      sourceId: route.sourceId,
      targetId: route.targetId,
      routeId: route.id
    });
    routeRevenue = applyModifiers(routeRevenue, revenueMods);

    // 5. Costs with Modifiers
    // Flight operations cost (affected by service effort)
    let flightOpsCost = route.frequency * (2 * dist * type.opCost);
    const flightCostMods = getModifiersForTarget(company, 'flightCost', {
      sourceId: route.sourceId,
      targetId: route.targetId,
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

    totalRevenue += routeRevenue;
    totalFlightCost += flightOpsCost;
    totalMaintCost += activeMaintCost;

    return {
      ...route,
      stats: {
        profitLastWeek: profit,
        revenue: routeRevenue,
        flightCost: flightOpsCost,
        maintCost: activeMaintCost,
        occupancy: loadFactor,
        passengers,
        actualTicket
      }
    };
  });

  // 2. Process Idle Planes (with maintenance effort modifier)
  const idleCounts = {};
  Object.keys(company.fleet).forEach(typeId => {
    const owned = company.fleet[typeId];
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
    company.fame,
    company.maintenanceEffort,
    company.serviceEffort,
    company.prBudget,
    company
  );

  // 5. Calculate net income (including all new costs/income)
  const netIncome = totalRevenue
                  + propertyResults.totalPropertyIncome
                  - (totalFlightCost + totalMaintCost + totalIdleCost + company.prBudget + propertyResults.totalPropertyCost);

  return {
    routes: updatedRoutes,
    properties: propertyResults.properties,
    fame: newFame,
    stats: {
      totalRevenue,
      totalFlightCost,
      totalMaintCost,
      totalIdleCost,
      totalPrCost: company.prBudget,
      totalPropertyIncome: propertyResults.totalPropertyIncome,
      totalPropertyCost: propertyResults.totalPropertyCost,
      netIncome,
      idleCounts
    },
    money: company.money + netIncome
  };
};

/**
 * Calculate automatic frequency based on aircraft and route
 */
export const calculateFrequency = (planeTypeId, distance, assignedCount) => {
  const type = PLANE_TYPES.find(t => t.id === planeTypeId);
  if (!type) return 0;

  const flightTime = distance / type.speed;
  const roundTripTime = (flightTime * 2) + 4; // 4 hour turnaround
  const tripsPerPlane = Math.floor(168 / roundTripTime); // 168 hours per week

  return tripsPerPlane * assignedCount;
};
