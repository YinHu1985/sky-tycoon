/**
 * Property Types Configuration
 * Defines different types of properties that airlines can purchase in cities
 */

export const PROPERTY_TYPES = {
  hotel: {
    id: 'hotel',
    name: 'Luxury Hotel',
    description: 'Premium hotel providing accommodation to passengers',
    baseCost: 5000000,           // $5M base purchase cost
    incomeMultiplier: 0.02,      // Income = (city.biz + city.tour) * 100000 * 0.02
    maintMultiplier: 0.003,      // Maintenance = (city.biz + city.tour) * 100000 * 0.003
    relationshipBonus: 5,        // +5 to city relationship
    loadFactorBonus: 0.03,       // +3% load factor for routes to/from this city
    icon: 'Building2'
  },
  travel_agency: {
    id: 'travel_agency',
    name: 'Travel Agency',
    description: 'Travel agency promoting your airline and booking tickets',
    baseCost: 2000000,           // $2M base purchase cost
    incomeMultiplier: 0.01,      // Lower income than hotel
    maintMultiplier: 0.002,      // Lower maintenance than hotel
    relationshipBonus: 8,        // Higher relationship bonus than hotel
    loadFactorBonus: 0.05,       // +5% load factor (higher than hotel)
    icon: 'Briefcase'
  }
};
