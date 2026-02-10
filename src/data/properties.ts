/**
 * Property Types Configuration
 * Defines different types of properties that airlines can purchase in cities
 */
import { PropertyType } from '../types';

export const PROPERTY_TYPES: { [key: string]: PropertyType } = {
  business_hotel: {
    id: 'business_hotel',
    name: 'Business Hotel',
    description: 'Hotel catering to business travelers, mainly generates income from business demand',
    baseCost: 4000000,           // $4M base purchase cost
    bizMultiplier: 0.025,        // Income = city.biz * 100000 * 0.025
    tourMultiplier: 0.005,       // Income = city.tour * 100000 * 0.005 (minimal)
    fixedMaintCost: 80000,       // Fixed weekly maintenance cost
    relationshipBonus: 5,        // +5 to city relationship
    loadFactorBonus: 0.03,       // +3% load factor for routes to/from this city
    icon: 'Building2'
  },
  luxury_hotel: {
    id: 'luxury_hotel',
    name: 'Luxury Hotel',
    description: 'Premium hotel serving both business and leisure travelers equally',
    baseCost: 6000000,           // $6M base purchase cost
    bizMultiplier: 0.015,        // Balanced income from business
    tourMultiplier: 0.015,       // Balanced income from tourism
    fixedMaintCost: 100000,      // Fixed weekly maintenance cost
    relationshipBonus: 8,        // Higher relationship bonus
    loadFactorBonus: 0.04,       // +4% load factor for routes to/from this city
    icon: 'Building2'
  },
  travel_agency: {
    id: 'travel_agency',
    name: 'Travel Agency',
    description: 'Travel agency promoting tourism and booking leisure trips',
    baseCost: 2000000,           // $2M base purchase cost
    bizMultiplier: 0,            // No business income
    tourMultiplier: 0.025,       // Purely tourism-based income
    fixedMaintCost: 40000,       // Fixed weekly maintenance cost
    relationshipBonus: 10,       // High relationship bonus
    loadFactorBonus: 0.05,       // +5% load factor (highest among income properties)
    icon: 'Briefcase'
  },
  airport_transport: {
    id: 'airport_transport',
    name: 'Airport Transport',
    description: 'Ground transportation service - pure cost but significantly boosts city relationship',
    baseCost: 3000000,           // $3M base purchase cost
    bizMultiplier: 0,            // No income
    tourMultiplier: 0,           // No income
    fixedMaintCost: 150000,      // High fixed weekly cost
    relationshipBonus: 15,       // Very high relationship bonus
    loadFactorBonus: 0.02,       // +2% load factor
    icon: 'Bus'
  },
  airline_meal_factory: {
    id: 'airline_meal_factory',
    name: 'Airline Meal Factory',
    description: 'In-flight catering facility - reduces service costs and improves passenger experience',
    baseCost: 5000000,           // $5M base purchase cost
    bizMultiplier: 0,            // No income
    tourMultiplier: 0,           // No income
    fixedMaintCost: 150000,      // Reduced weekly cost
    relationshipBonus: 5,        // Moderate relationship bonus
    loadFactorBonus: 0.04,       // +4% load factor (increased!)
    serviceReduction: 0.10,      // Reduces flight operation costs by 10%
    icon: 'UtensilsCrossed'
  },
  maintenance_center: {
    id: 'maintenance_center',
    name: 'Maintenance Center',
    description: 'Large aircraft maintenance facility - very expensive but reduces flight maintenance costs',
    baseCost: 15000000,          // $15M base purchase cost (very expensive!)
    bizMultiplier: 0,            // No income
    tourMultiplier: 0,           // No income
    fixedMaintCost: 300000,      // Very high fixed weekly cost
    relationshipBonus: 3,        // Small relationship bonus
    loadFactorBonus: 0,          // No load factor bonus
    maintReduction: 0.15,        // Reduces maintenance costs by 15% for flights to/from this city
    icon: 'Wrench'
  }
};
