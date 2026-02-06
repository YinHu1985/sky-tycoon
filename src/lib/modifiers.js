/**
 * Extensible Modifier System
 * Supports both built-in modifiers (fame, efforts, properties)
 * and dynamic event-based modifiers
 */

import { CITIES } from '../data/cities';
import { PROPERTY_TYPES } from '../data/properties';
import { calculateDistance } from './utils';

// ============================================================================
// CORE MODIFIER FUNCTIONS
// ============================================================================

/**
 * Get all applicable modifiers for a specific target
 * Combines built-in modifiers (fame, efforts, properties) with stored event modifiers
 *
 * @param {Object} company - Company state
 * @param {string} target - Target type (loadFactor, revenue, flightCost, etc.)
 * @param {Object} context - Optional context { cityId, sourceId, targetId, routeId, planeTypeId }
 * @returns {Array} Array of applicable modifiers
 */
export const getModifiersForTarget = (company, target, context = {}) => {
  const modifiers = [];

  // 1. Get built-in modifiers (calculated on-the-fly)
  const builtIn = getBuiltInModifiers(company, target, context);
  modifiers.push(...builtIn);

  // 2. Get stored event-based modifiers
  if (company.activeModifiers) {
    const eventModifiers = company.activeModifiers.filter(mod => {
      // Check if target matches
      if (mod.target !== target) return false;

      // Check context matching
      if (mod.context) {
        // If modifier has context, check if it matches
        if (mod.context.cityId && mod.context.cityId !== context.cityId &&
            mod.context.cityId !== context.sourceId && mod.context.cityId !== context.targetId) {
          return false;
        }
        if (mod.context.routeId && mod.context.routeId !== context.routeId) {
          return false;
        }
        if (mod.context.planeTypeId && mod.context.planeTypeId !== context.planeTypeId) {
          return false;
        }
      }

      return true;
    });
    modifiers.push(...eventModifiers);
  }

  return modifiers;
};

/**
 * Apply modifiers to a base value
 * Stacks multiple modifiers: multipliers multiply, flats add
 *
 * @param {number} baseValue - Base value before modifiers
 * @param {Array} modifiers - Array of modifier objects
 * @returns {number} Final value after all modifiers applied
 */
export const applyModifiers = (baseValue, modifiers) => {
  let multiplier = 1.0;
  let flatBonus = 0;

  modifiers.forEach(mod => {
    if (mod.type === 'multiplier') {
      multiplier *= mod.value;
    } else if (mod.type === 'flat') {
      flatBonus += mod.value;
    } else if (mod.type === 'percentage') {
      // Percentage modifiers add to the multiplier
      multiplier *= (1 + mod.value);
    }
  });

  return (baseValue * multiplier) + flatBonus;
};

/**
 * Remove expired modifiers from company
 * Called weekly during financial processing
 *
 * @param {Object} company - Company state
 * @returns {Array} Updated activeModifiers array
 */
export const expireModifiers = (company, currentDate) => {
  if (!company.activeModifiers) return [];

  return company.activeModifiers.filter(mod => {
    // Keep modifiers with no expiry (permanent)
    if (!mod.expiryDate) return true;

    // Keep modifiers that haven't expired yet
    const expiryDate = new Date(mod.expiryDate);
    return expiryDate > currentDate;
  });
};

// ============================================================================
// BUILT-IN MODIFIER SOURCES
// ============================================================================

/**
 * Get built-in modifiers (fame, efforts, properties, relationships)
 * These are calculated on-the-fly, not stored
 *
 * @param {Object} company - Company state
 * @param {string} target - Target type
 * @param {Object} context - Context for city/route specific modifiers
 * @returns {Array} Array of built-in modifiers
 */
const getBuiltInModifiers = (company, target, context) => {
  const modifiers = [];

  // Fame modifiers
  if (target === 'loadFactor') {
    // Fame affects load factor: 0 fame = 0.8x, 50 fame = 1.0x, 100 fame = 1.2x
    const fameMultiplier = 0.8 + (company.fame / 100) * 0.4;
    modifiers.push({
      source: 'fame',
      type: 'multiplier',
      target: 'loadFactor',
      value: fameMultiplier,
      description: `Fame bonus (${company.fame.toFixed(0)})`
    });
  }

  // Maintenance effort modifiers
  if (target === 'maintenanceCost' || target === 'idleCost') {
    // Maintenance effort: 0% = 0.5x cost, 50% = 1.0x, 100% = 1.8x
    const maintMultiplier = 0.5 + (company.maintenanceEffort / 100) * 1.3;
    modifiers.push({
      source: 'maintenanceEffort',
      type: 'multiplier',
      target,
      value: maintMultiplier,
      description: `Maintenance effort (${company.maintenanceEffort}%)`
    });
  }

  // Service effort modifiers
  if (target === 'flightCost') {
    // Service effort: 0% = 0.7x cost, 50% = 1.0x, 100% = 1.5x
    const serviceMultiplier = 0.7 + (company.serviceEffort / 100) * 0.8;
    modifiers.push({
      source: 'serviceEffort',
      type: 'multiplier',
      target: 'flightCost',
      value: serviceMultiplier,
      description: `Service quality (${company.serviceEffort}%)`
    });
  }

  // City relationship modifiers
  if (target === 'loadFactor' && (context.sourceId || context.cityId)) {
    // Calculate relationship for source city
    const sourceCityId = context.sourceId || context.cityId;
    const sourceRelationship = calculateCityRelationship(company, sourceCityId);
    // Relationship: 0 = 0.85x, 50 = 1.0x, 100 = 1.15x
    const sourceRelMult = 0.85 + (sourceRelationship / 100) * 0.3;

    modifiers.push({
      source: 'cityRelationship',
      type: 'multiplier',
      target: 'loadFactor',
      value: sourceRelMult,
      description: `${sourceCityId} relationship (${sourceRelationship.toFixed(0)})`
    });

    // If there's a target city, calculate for that too and average
    if (context.targetId && context.targetId !== sourceCityId) {
      const targetRelationship = calculateCityRelationship(company, context.targetId);
      const targetRelMult = 0.85 + (targetRelationship / 100) * 0.3;

      modifiers.push({
        source: 'cityRelationship',
        type: 'multiplier',
        target: 'loadFactor',
        value: targetRelMult,
        description: `${context.targetId} relationship (${targetRelationship.toFixed(0)})`
      });
    }
  }

  // Property bonuses for routes
  if (target === 'loadFactor' && context.sourceId && context.targetId) {
    const propertyBonus = getPropertyLoadFactorBonus(company, context.sourceId, context.targetId);
    if (propertyBonus > 0) {
      modifiers.push({
        source: 'properties',
        type: 'flat',
        target: 'loadFactor',
        value: propertyBonus,
        description: `Property bonuses (+${(propertyBonus * 100).toFixed(0)}%)`
      });
    }
  }

  // Maintenance Center cost reduction for flights
  if (target === 'maintenanceCost' && (context.sourceId || context.targetId)) {
    const maintReduction = getMaintenanceCenterReduction(company, context.sourceId, context.targetId);
    if (maintReduction > 0) {
      modifiers.push({
        source: 'maintenanceCenter',
        type: 'multiplier',
        target: 'maintenanceCost',
        value: 1 - maintReduction,
        description: `Maintenance Center (-${(maintReduction * 100).toFixed(0)}%)`
      });
    }
  }

  // Airline Meal Factory service cost reduction for flights
  if (target === 'flightCost' && (context.sourceId || context.targetId)) {
    const serviceReduction = getServiceCostReduction(company, context.sourceId, context.targetId);
    if (serviceReduction > 0) {
      modifiers.push({
        source: 'mealFactory',
        type: 'multiplier',
        target: 'flightCost',
        value: 1 - serviceReduction,
        description: `Meal Factory (-${(serviceReduction * 100).toFixed(0)}%)`
      });
    }
  }

  return modifiers;
};

/**
 * Calculate company fame from efforts and PR spending
 * Fame naturally decays over time if not maintained
 *
 * @param {number} currentFame - Current fame value (0-100)
 * @param {number} maintenanceEffort - Maintenance effort (0-100)
 * @param {number} serviceEffort - Service effort (0-100)
 * @param {number} prBudget - Weekly PR spending ($)
 * @param {Object} company - Company state for checking modifiers
 * @returns {number} New fame value (clamped 0-100)
 */
export const calculateFame = (currentFame, maintenanceEffort, serviceEffort, prBudget, company) => {
  // Base decay: -0.5 fame per week
  let newFame = currentFame - 0.5;

  // Maintenance effort contribution: 0-50 → -2 to +2
  const maintContrib = (maintenanceEffort - 50) * 0.04;

  // Service effort contribution: 0-50 → -2 to +2
  const serviceContrib = (serviceEffort - 50) * 0.04;

  // PR contribution: $100k/week → +1 fame, capped at +10
  const prContrib = Math.min(10, (prBudget / 100000));

  newFame += maintContrib + serviceContrib + prContrib;

  // Apply any event-based fame modifiers
  const fameModifiers = getModifiersForTarget(company, 'fame');
  newFame = applyModifiers(newFame - currentFame, fameModifiers) + currentFame;

  // Clamp to 0-100
  return Math.max(0, Math.min(100, newFame));
};

/**
 * Calculate company-city relationship score
 * Base: 50, Range: 0-100
 *
 * @param {Object} company - Company state
 * @param {string} cityId - City ID
 * @returns {number} Relationship score (0-100)
 */
export const calculateCityRelationship = (company, cityId) => {
  let relationship = 50; // Base neutral relationship

  // 1. HQ bonus: +20 if this is HQ city
  if (company.hq === cityId) {
    relationship += 20;
  }

  // 2. Route presence: +5 for each route connected to this city (max +20)
  const connectedRoutes = company.routes.filter(
    r => r.sourceId === cityId || r.targetId === cityId
  );
  relationship += Math.min(20, connectedRoutes.length * 5);

  // 3. Property bonuses
  if (company.properties) {
    const cityProperties = company.properties.filter(p => p.cityId === cityId);
    cityProperties.forEach(prop => {
      const propType = PROPERTY_TYPES[prop.type];
      if (propType) {
        relationship += propType.relationshipBonus;
      }
    });
  }

  // 4. HQ proximity bonus: Cities close to HQ get +5
  const hqCity = CITIES.find(c => c.id === company.hq);
  const city = CITIES.find(c => c.id === cityId);
  if (hqCity && city && hqCity.id !== city.id) {
    const dist = calculateDistance(hqCity, city);
    if (dist < 2000) { // Within 2000km
      relationship += 5;
    }
  }

  // Apply any event-based relationship modifiers
  const relationshipModifiers = getModifiersForTarget(company, 'relationship', { cityId });
  relationship = applyModifiers(relationship, relationshipModifiers);

  // Clamp to 0-100
  return Math.max(0, Math.min(100, relationship));
};

/**
 * Calculate modified city attributes (biz, tour)
 *
 * @param {Object} company - Company state
 * @param {Object} city - City object
 * @returns {Object} Modified city attributes { biz, tour }
 */
export const getCityAttributes = (company, city) => {
  if (!city) return { biz: 0, tour: 0 };

  // Calculate Biz
  const bizModifiers = getModifiersForTarget(company, 'cityBiz', { cityId: city.id });
  const biz = applyModifiers(city.biz, bizModifiers);

  // Calculate Tour
  const tourModifiers = getModifiersForTarget(company, 'cityTour', { cityId: city.id });
  const tour = applyModifiers(city.tour, tourModifiers);

  return {
    biz: Math.max(0, biz),
    tour: Math.max(0, tour)
  };
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get property load factor bonuses for a route
 *
 * @param {Object} company - Company state
 * @param {string} sourceId - Source city ID
 * @param {string} targetId - Target city ID
 * @returns {number} Combined load factor bonus (flat addition)
 */
const getPropertyLoadFactorBonus = (company, sourceId, targetId) => {
  if (!company.properties) return 0;

  let bonus = 0;

  // Check properties at source city
  const sourceProps = company.properties.filter(p => p.cityId === sourceId);
  sourceProps.forEach(prop => {
    const propType = PROPERTY_TYPES[prop.type];
    if (propType && propType.loadFactorBonus) {
      bonus += propType.loadFactorBonus;
    }
  });

  // Check properties at target city
  const targetProps = company.properties.filter(p => p.cityId === targetId);
  targetProps.forEach(prop => {
    const propType = PROPERTY_TYPES[prop.type];
    if (propType && propType.loadFactorBonus) {
      bonus += propType.loadFactorBonus;
    }
  });

  return bonus;
};

/**
 * Get maintenance cost reduction from Maintenance Centers
 *
 * @param {Object} company - Company state
 * @param {string} sourceId - Source city ID
 * @param {string} targetId - Target city ID
 * @returns {number} Maintenance cost reduction multiplier (0-1)
 */
const getMaintenanceCenterReduction = (company, sourceId, targetId) => {
  if (!company.properties) return 0;

  let maxReduction = 0;

  // Check if source city has a maintenance center
  const sourceProps = company.properties.filter(p => p.cityId === sourceId);
  sourceProps.forEach(prop => {
    const propType = PROPERTY_TYPES[prop.type];
    if (propType && propType.maintReduction) {
      maxReduction = Math.max(maxReduction, propType.maintReduction);
    }
  });

  // Check if target city has a maintenance center
  if (targetId) {
    const targetProps = company.properties.filter(p => p.cityId === targetId);
    targetProps.forEach(prop => {
      const propType = PROPERTY_TYPES[prop.type];
      if (propType && propType.maintReduction) {
        maxReduction = Math.max(maxReduction, propType.maintReduction);
      }
    });
  }

  return maxReduction;
};

/**
 * Get service cost reduction from Airline Meal Factories
 *
 * @param {Object} company - Company state
 * @param {string} sourceId - Source city ID
 * @param {string} targetId - Target city ID
 * @returns {number} Service cost reduction multiplier (0-1)
 */
const getServiceCostReduction = (company, sourceId, targetId) => {
  if (!company.properties) return 0;

  let maxReduction = 0;

  // Check if source city has a meal factory
  const sourceProps = company.properties.filter(p => p.cityId === sourceId);
  sourceProps.forEach(prop => {
    const propType = PROPERTY_TYPES[prop.type];
    if (propType && propType.serviceReduction) {
      maxReduction = Math.max(maxReduction, propType.serviceReduction);
    }
  });

  // Check if target city has a meal factory
  if (targetId) {
    const targetProps = company.properties.filter(p => p.cityId === targetId);
    targetProps.forEach(prop => {
      const propType = PROPERTY_TYPES[prop.type];
      if (propType && propType.serviceReduction) {
        maxReduction = Math.max(maxReduction, propType.serviceReduction);
      }
    });
  }

  return maxReduction;
};

/**
 * Calculate weekly income and costs for all properties
 * No longer has competition penalty since only one of each type per city is allowed
 *
 * @param {Object} company - Company state
 * @returns {Object} { properties: updatedProperties[], totalPropertyIncome, totalPropertyCost }
 */
export const calculatePropertyFinancials = (company) => {
  if (!company.properties || company.properties.length === 0) {
    return {
      properties: [],
      totalPropertyIncome: 0,
      totalPropertyCost: 0
    };
  }

  let totalIncome = 0;
  let totalCost = 0;

  // Calculate for each property
  const updatedProperties = company.properties.map(prop => {
    const city = CITIES.find(c => c.id === prop.cityId);
    if (!city) return { ...prop, weeklyIncome: 0, weeklyMaintCost: 0 };

    const propType = PROPERTY_TYPES[prop.type];
    if (!propType) return { ...prop, weeklyIncome: 0, weeklyMaintCost: 0 };

    // Get dynamic city attributes
    const { biz, tour } = getCityAttributes(company, city);

    // Calculate income based on separate multipliers for biz and tour
    const bizIncome = biz * 100000 * (propType.bizMultiplier || 0);
    const tourIncome = tour * 100000 * (propType.tourMultiplier || 0);
    let income = bizIncome + tourIncome;

    // Fixed maintenance cost (not related to city attributes)
    const cost = propType.fixedMaintCost || 0;

    // Apply modifiers
    const incomeModifiers = getModifiersForTarget(company, 'propertyIncome', { cityId: prop.cityId });
    income = applyModifiers(income, incomeModifiers);

    totalIncome += income;
    totalCost += cost;

    return {
      ...prop,
      weeklyIncome: income,
      weeklyMaintCost: cost
    };
  });

  return {
    properties: updatedProperties,
    totalPropertyIncome: totalIncome,
    totalPropertyCost: totalCost
  };
};
