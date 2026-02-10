import { generateId, calculateDistance } from './utils';
import { PROPERTY_TYPES } from '../data/properties';
import { CITIES } from '../data/cities';
import { Company, Route, OwnedProperty, Modifier } from '../types';

/**
 * Pure functions for company actions.
 * Each function takes the current company state and action payload,
 * and returns the Partial<Company> update.
 */

export const CompanyActions = {
  ADD_ROUTE: (company: Company, payload: Partial<Route>): Partial<Company> => {
    const flightNumber = `${company.code}${company.nextFlightNum}`;
    
    // Resolve cities and calculate distance
    const fromId = (payload as any).sourceId || payload.from;
    const toId = (payload as any).targetId || payload.to;
    const fromCity = CITIES.find(c => c.id === fromId);
    const toCity = CITIES.find(c => c.id === toId);
    const distance = (fromCity && toCity) ? calculateDistance(fromCity, toCity) : 0;

    const newRoute: Route = {
      ...payload as any, // Cast to any to merge payload with defaults. Ideally payload should match Route creation params
      id: payload.id || generateId(),
      flightNumber, // Note: flightNumber is not in Route interface yet?
      autoManaged: payload.autoManaged || false, // Note: autoManaged is not in Route interface
      // Route interface: id, from, to, planeTypeId, assignedCount, frequency, priceModifier, distance, passengers, income, cost, color?, stats?
      // Payload usually has sourceId, targetId. We need to map them if needed, or assume payload is correct.
      // Based on usage in AIController: sourceId, targetId, planeTypeId, assignedCount, frequency, priceModifier, autoManaged
      // But Route interface uses 'from' and 'to'.
      // We should probably normalize this.
      from: fromId,
      to: toId,
      distance,
      
      stats: {
        profitLastWeek: 0,
        revenue: 0,
        flightCost: 0,
        maintCost: 0,
        occupancy: 0,
        passengers: 0,
        actualTicket: 0
      },
      // Ensure required fields
      passengers: 0,
      income: 0,
      cost: 0
    } as Route; // Force cast for now, we should update Route interface

    return {
      routes: [...company.routes, newRoute],
      nextFlightNum: (company.nextFlightNum || 0) + 1
    };
  },

  UPDATE_ROUTE: (company: Company, payload: { routeId: string, updates: Partial<Route> }): Partial<Company> => {
    const { routeId, updates } = payload;
    return {
      routes: company.routes.map(r =>
        r.id === routeId ? { ...r, ...updates } : r
      )
    };
  },

  DELETE_ROUTE: (company: Company, payload: { routeId: string }): Partial<Company> => {
    const { routeId } = payload;
    return {
      routes: company.routes.filter(r => r.id !== routeId)
    };
  },

  BUY_PLANE: (company: Company, payload: { typeId: string, cost: number, delayed?: boolean }): Partial<Company> => {
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

  UPDATE_EFFORTS: (company: Company, payload: { maintenanceEffort: number, serviceEffort: number, prBudget: number }): Partial<Company> => {
    const { maintenanceEffort, serviceEffort, prBudget } = payload;
    return {
      maintenanceEffort,
      serviceEffort,
      prBudget
    };
  },

  BUY_PROPERTY: (company: Company, payload: { type: string, cityId: string, cost: number, date: Date }): Partial<Company> => {
    const { type, cityId, cost, date } = payload;
    
    // Check if company already owns this type of property in this city
    const alreadyOwned = company.properties?.some(
      p => p.typeId === type && p.cityId === cityId // Note: OwnedProperty uses typeId, payload uses type?
      // In properties.ts/js, it seemed to be 'type' or 'typeId'.
      // OwnedProperty interface has 'typeId'.
      // JS code used `p.type === type`. Let's assume payload.type maps to OwnedProperty.typeId
    );

    if (alreadyOwned) {
      throw new Error("Property already owned");
    }

    if (company.money < cost) {
      throw new Error("Insufficient funds");
    }

    const newProperty: OwnedProperty = {
      id: generateId(),
      typeId: type,
      cityId,
      name: PROPERTY_TYPES[type]?.name || 'Property', // Fallback name
      value: cost, // Initial value
      // Extra fields not in OwnedProperty interface but used in JS:
      // purchaseDate: date,
      // purchaseCost: cost,
      // weeklyIncome: 0,
      // weeklyMaintCost: 0
    };

    return {
      money: company.money - cost,
      properties: [...(company.properties || []), newProperty]
    };
  },

  APPLY_EVENT_EFFECT: (company: Company, payload: { type: string, value: any }): Partial<Company> => {
    const { type, value } = payload;
    
    switch (type) {
      case 'money':
        return { money: company.money + (value as number) };
      case 'fame':
        return { fame: Math.max(0, Math.min(100, (company.fame || 0) + (value as number))) };
      case 'addModifier':
        return { activeModifiers: [...(company.activeModifiers || []), value as Modifier] };
      case 'removeModifier':
        return { activeModifiers: (company.activeModifiers || []).filter(m => m.id !== value) };
      default:
        console.warn("Unknown effect type in APPLY_EVENT_EFFECT", type);
        return {};
    }
  },

  SELL_PROPERTY: (company: Company, payload: { propertyId: string }): Partial<Company> => {
    const { propertyId } = payload;
    const property = company.properties?.find(p => p.id === propertyId);
    if (!property) {
        throw new Error("Property not found");
    }

    // Sell for 50% of purchase cost (value?)
    // In JS it used property.purchaseCost.
    // OwnedProperty has 'value'. Let's use 'value' for now or assume it stores current value.
    const sellValue = property.value * 0.5;

    return {
      money: company.money + sellValue,
      properties: company.properties?.filter(p => p.id !== propertyId)
    };
  },
  
  // For AI or events adding money directly
  ADD_MONEY: (company: Company, payload: { amount: number }): Partial<Company> => {
      const { amount } = payload;
      return {
          money: company.money + amount
      };
  }
};
