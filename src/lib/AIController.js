import { CompanyActions } from './CompanyActions.js';
import { PLANE_TYPES } from '../data/planes.js';
import { CITIES } from '../data/cities.js';
import { calculateDistance, calculateFlightTime } from './utils.js';
import { calculateFrequency, calculateOptimalRouteConfig } from './economy.js';

/**
 * AI Controller
 * Handles decision making for AI companies.
 */

const MAX_ROUTES_PER_COMPANY = 30; // Limit to avoid spam

// Simple heuristic: AI tries to maintain a balance of planes and routes.
// It prioritizes buying planes if it has cash, then finding routes for them.

export function processAI(gameState) {
  try {
    const { companies, playerCompanyId, performAction, date } = gameState;

    companies.forEach(company => {
      try {
        if (company.id === playerCompanyId) return; // Skip player
        if (company.money < 0) return; // Bankrupt/Debt: do nothing for now

        // 1. Check if we have idle planes (planes > routes)
        // This is a simplification. Real check would be fleet count vs active routes using that fleet.
        // Let's count total fleet size vs total routes.
        const totalPlanes = Object.values(company.fleet).reduce((a, b) => a + b, 0);
        const totalRoutes = company.routes.length;

        // If we have idle planes, prioritize using them regardless of route limit?
        // Or if we hit route limit, we should stop buying planes?
        // Let's say if we have idle planes, we try to route them.
        if (totalPlanes > totalRoutes) {
           if (totalRoutes < MAX_ROUTES_PER_COMPANY) {
              openNewRoute(company, performAction, date);
           }
        } else {
           // We need more planes (if we have money AND haven't hit route limit)
           if (totalRoutes < MAX_ROUTES_PER_COMPANY) {
             buyNewPlane(company, performAction, date);
           }
        }
        
        // 2. Adjust Maintenance/Service if too low
        if (company.maintenanceEffort < 50) {
            performAction(company.id, 'UPDATE_EFFORTS', { 
                maintenanceEffort: 60, 
                serviceEffort: company.serviceEffort, 
                prBudget: company.prBudget 
            });
        }
      } catch (err) {
        console.error(`Error processing AI for company ${company.id}:`, err);
      }
    });
  } catch (err) {
    console.error("Critical error in processAI:", err);
  }
}

function buyNewPlane(company, performAction, date) {
  // Simple logic: Buy the best plane we can afford that is available in this year.
  
  // Filter by price and availability (using correct field names: intro/end)
  const availablePlanes = PLANE_TYPES.filter(p => 
    company.money >= p.price && 
    (!p.intro || date.getFullYear() >= p.intro) &&
    (!p.end || date.getFullYear() <= p.end)
  );

  if (availablePlanes.length === 0) {
    console.log(`[AI-${company.code}] Cannot afford any planes or none available.`);
    return;
  }

  // Filter out "bad" planes (supersonic/experimental with high fuelCost) unless we are rich
  // Heuristic: FuelCost per seat > 2.0 is considered "inefficient" (Standard jets are ~0.4)
  // Only apply this filter if we have other options.
  const efficientPlanes = availablePlanes.filter(p => (p.fuelCost / p.capacity) < 2.0);
  
  // If we have efficient options, use them. Otherwise (e.g. early game only small planes?), fallback to all.
  const candidates = efficientPlanes.length > 0 ? efficientPlanes : availablePlanes;

  // Pick one randomly from the candidates
  const plane = candidates[Math.floor(Math.random() * candidates.length)];
  
  console.log(`[AI-${company.code}] Buying plane: ${plane.name} for ${plane.price}`);
  // Buy it
  performAction(company.id, 'BUY_PLANE', { typeId: plane.id, cost: plane.price });
}

function findBestRouteFromSource(company, sourceId, sortedPlaneTypes) {
  const source = CITIES.find(c => c.id === sourceId);
  if (!source) {
      console.log(`[AI-${company.code}] findBestRouteFromSource: Invalid source ID ${sourceId}`);
      return null;
  }

  // console.log(`[AI-${company.code}] Evaluating routes from ${source.name} (${sourceId}) with ${sortedPlaneTypes.length} plane types available.`);

  for (const plane of sortedPlaneTypes) {
      // 4. Identify potential targets
      // Filter out cities already connected to sourceId by THIS company
      const existingTargets = new Set();
      company.routes.forEach(r => {
          if (r.sourceId === sourceId) existingTargets.add(r.targetId);
          if (r.targetId === sourceId) existingTargets.add(r.sourceId);
      });

      // Calculate distance to all other cities and filter by range
      const potentialTargets = CITIES.filter(c => 
          c.id !== sourceId && 
          !existingTargets.has(c.id)
      ).map(c => {
          const dist = calculateDistance(source, c);
          return { city: c, dist };
      }).filter(item => item.dist > 0 && item.dist <= plane.range);

      // Sort by distance descending (farthest first)
      potentialTargets.sort((a, b) => b.dist - a.dist);

      // Take top 20 candidates
      const topCandidates = potentialTargets.slice(0, 20);

      console.log(`[AI-${company.code}] Plane ${plane.name} (Range: ${plane.range}km): Found ${potentialTargets.length} valid targets. Checking top ${topCandidates.length}.`);

      if (topCandidates.length === 0) continue; // Try next plane type

      // 5. Evaluate profitability
      let bestProfit = -Infinity;
      let bestCandidate = null;

      for (const candidate of topCandidates) {
          const config = calculateOptimalRouteConfig(
              company,
              sourceId,
              candidate.city.id,
              plane.id,
              1
          );
          
           console.log(`[AI-${company.code}]   -> Target: ${candidate.city.name} (${Math.round(candidate.dist)}km). Profit: ${Math.round(config.profit)}`);

          if (config.profit > bestProfit) {
              bestProfit = config.profit;
              bestCandidate = { ...candidate, ...config };
          }
      }

      if (bestCandidate && bestProfit > 0) {
          console.log(`[AI-${company.code}] Found best route: ${source.name} -> ${bestCandidate.city.name} (${Math.round(bestCandidate.dist)}km) using ${plane.name}. Est. Profit: ${Math.round(bestProfit)}`);
          return {
              sourceId: sourceId,
              targetId: bestCandidate.city.id,
              planeTypeId: plane.id,
              assignedCount: 1,
              frequency: bestCandidate.recommendedFrequency,
              priceModifier: bestCandidate.recommendedPriceModifer,
              autoManaged: true
          };
      } else {
          // console.log(`[AI-${company.code}] No profitable route found with ${plane.name} from ${source.name}. Best profit was ${Math.round(bestProfit)}`);
      }
  }
  return null;
}

function openNewRoute(company, performAction, date) {
  // 1. Identify valid source cities (HQ or existing route endpoints)
  const connectedCities = new Set(company.routes.map(r => r.sourceId).concat(company.routes.map(r => r.targetId)));
  connectedCities.add(company.hq);
  
  // New AI Logic: First 10 routes should prioritize HQ
  let candidates;
  let isHQRestricted = false;
  if (company.routes.length < 10) {
      candidates = [company.hq];
      isHQRestricted = true;
      // If HQ is somehow invalid or we want to be safe, we can fallback, but let's try strict first
      console.log(`[AI-${company.code}] Early expansion: Forcing start from HQ (${company.hq})`);
  } else {
      candidates = Array.from(connectedCities);
  }
  
  // 2. Randomly pick a start point
  const sourceId = candidates[Math.floor(Math.random() * candidates.length)];
  const source = CITIES.find(c => c.id === sourceId);

  if (!source) {
      console.log(`[AI-${company.code}] Invalid source city ID: ${sourceId}`);
      return;
  }

  console.log(`[AI-${company.code}] Searching for route from ${sourceId}`);

  // 3. Find ALL free plane types
  const freePlaneTypes = Object.keys(company.fleet).filter(typeId => {
      const owned = company.fleet[typeId];
      const assigned = company.routes
          .filter(r => r.planeTypeId === typeId)
          .reduce((sum, r) => sum + (r.assignedCount || 1), 0);
      return (owned - assigned) >= 1;
  });

  if (freePlaneTypes.length === 0) {
    console.log(`[AI-${company.code}] No suitable plane found for new route.`);
    return;
  }

  // Sort free plane types by range descending (Try longest range first, especially for HQ start)
  const sortedPlaneTypes = freePlaneTypes.map(id => PLANE_TYPES.find(p => p.id === id)).sort((a, b) => b.range - a.range);

  let bestRoute = findBestRouteFromSource(company, sourceId, sortedPlaneTypes);

  if (bestRoute) {
      console.log(`[AI-${company.code}] Opening new route: ${bestRoute.sourceId} -> ${bestRoute.targetId} with ${bestRoute.planeTypeId}`);
      performAction(company.id, 'ADD_ROUTE', bestRoute);
      return;
  }

  // If we failed to find a route with ANY free plane, and we are in early game (HQ start)
  if (company.routes.length < 10) {
      console.log(`[AI-${company.code}] Failed to find route from HQ with current fleet. Checking for better planes...`);
      
      // Find max range in current fleet
      const currentMaxRange = Object.keys(company.fleet).reduce((max, typeId) => {
          const p = PLANE_TYPES.find(pt => pt.id === typeId);
          return Math.max(max, p ? p.range : 0);
      }, 0);

      // Find purchasable planes with BETTER range
      const betterPlanes = PLANE_TYPES.filter(p => 
          p.range > currentMaxRange &&
          company.money >= p.price && 
          (!p.intro || date.getFullYear() >= p.intro) &&
          (!p.end || date.getFullYear() <= p.end)
      ).sort((a, b) => b.range - a.range);

      if (betterPlanes.length > 0) {
          const planeToBuy = betterPlanes[0]; // Buy the longest range one we can afford
          console.log(`[AI-${company.code}] Buying long-range plane ${planeToBuy.name} to escape remote HQ.`);
          performAction(company.id, 'BUY_PLANE', { typeId: planeToBuy.id, cost: planeToBuy.price });
          return;
      } 
      
      console.log(`[AI-${company.code}] No better planes available to buy.`);
      
      if (isHQRestricted) {
          // Fallback: Relax HQ constraint and try again
          console.log(`[AI-${company.code}] Fallback: Relaxing HQ constraint and trying again.`);
          const allCandidates = Array.from(connectedCities);
          const fallbackSourceId = allCandidates[Math.floor(Math.random() * allCandidates.length)];
          
          console.log(`[AI-${company.code}] Retrying search from ${fallbackSourceId}`);
          bestRoute = findBestRouteFromSource(company, fallbackSourceId, sortedPlaneTypes);
          
          if (bestRoute) {
              console.log(`[AI-${company.code}] Opening fallback route: ${bestRoute.sourceId} -> ${bestRoute.targetId} with ${bestRoute.planeTypeId}`);
              performAction(company.id, 'ADD_ROUTE', bestRoute);
          } else {
               console.log(`[AI-${company.code}] Fallback search also failed.`);
          }
      }
  }
}
