import { generateId } from './utils.js';
import { PROPERTY_TYPES } from '../data/properties.js';

/**
 * Pure functions for company actions.
 * Each function takes the current company state and action payload,
 * and returns the Partial<Company> update.
 */

export const CompanyActions = {
  ADD_ROUTE: (company, payload) => {
    const flightNumber = `${company.code}${company.nextFlightNum}`;
    const newRoute = {
      ...payload, // { sourceId, targetId, planeTypeId, distance, flightTime, weeklyFrequency, price, autoManaged }
      id: payload.id || generateId(),
      flightNumber,
      autoManaged: payload.autoManaged || false,
      stats: {
        profitLastWeek: 0,
        revenue: 0,
        flightCost: 0,
        maintCost: 0,
        occupancy: 0,
        passengers: 0,
        actualTicket: 0
      }
    };

    return {
      routes: [...company.routes, newRoute],
      nextFlightNum: company.nextFlightNum + 1
    };
  },

  UPDATE_ROUTE: (company, payload) => {
    const { routeId, updates } = payload;
    return {
      routes: company.routes.map(r =>
        r.id === routeId ? { ...r, ...updates } : r
      )
    };
  },

  DELETE_ROUTE: (company, payload) => {
    const { routeId } = payload;
    return {
      routes: company.routes.filter(r => r.id !== routeId)
    };
  },

  BUY_PLANE: (company, payload) => {
    const { typeId, cost, delayed } = payload;
    const currentCount = company.fleet[typeId] || 0;
    
    // Check funds
    if (company.money < cost) {
      throw new Error("Insufficient funds");
    }

    const moneyUpdate = { money: company.money - cost };

    // If delivery is delayed, only deduct money
    if (delayed) {
      return moneyUpdate;
    }

    // Instant delivery (default behavior for AI)
    return {
      ...moneyUpdate,
      fleet: {
        ...company.fleet,
        [typeId]: currentCount + 1
      }
    };
  },

  UPDATE_EFFORTS: (company, payload) => {
    const { maintenanceEffort, serviceEffort, prBudget } = payload;
    return {
      maintenanceEffort,
      serviceEffort,
      prBudget
    };
  },

  BUY_PROPERTY: (company, payload) => {
    const { type, cityId, cost, date } = payload;
    
    // Check if company already owns this type of property in this city
    const alreadyOwned = company.properties.some(
      p => p.type === type && p.cityId === cityId
    );

    if (alreadyOwned) {
      throw new Error("Property already owned");
    }

    if (company.money < cost) {
      throw new Error("Insufficient funds");
    }

    const newProperty = {
      id: generateId(),
      type,
      cityId,
      purchaseDate: date,
      purchaseCost: cost,
      weeklyIncome: 0,
      weeklyMaintCost: 0
    };

    return {
      money: company.money - cost,
      properties: [...company.properties, newProperty]
    };
  },

  APPLY_EVENT_EFFECT: (company, payload) => {
    const { type, value } = payload;
    
    switch (type) {
      case 'money':
        return { money: company.money + value };
      case 'fame':
        return { fame: Math.max(0, Math.min(100, company.fame + value)) };
      case 'addModifier':
        return { activeModifiers: [...(company.activeModifiers || []), value] };
      case 'removeModifier':
        return { activeModifiers: (company.activeModifiers || []).filter(m => m.id !== value) };
      default:
        console.warn("Unknown effect type in APPLY_EVENT_EFFECT", type);
        return {};
    }
  },

  SELL_PROPERTY: (company, payload) => {
    const { propertyId } = payload;
    const property = company.properties.find(p => p.id === propertyId);
    if (!property) {
        throw new Error("Property not found");
    }

    // Sell for 50% of purchase cost
    const sellValue = property.purchaseCost * 0.5;

    return {
      money: company.money + sellValue,
      properties: company.properties.filter(p => p.id !== propertyId)
    };
  },
  
  // For AI or events adding money directly
  ADD_MONEY: (company, payload) => {
      const { amount } = payload;
      return {
          money: company.money + amount
      };
  }
};
