import { CITIES } from '../data/cities.js';
import { generateId } from './utils.js';

const AI_NAMES = [
  { name: 'Pan Global', code: 'PGL' },
  { name: 'Trans World', code: 'TWA' },
  { name: 'Oceanic Air', code: 'OCA' },
  { name: 'Global Wings', code: 'GLW' },
  { name: 'Euro Sky', code: 'ESK' },
  { name: 'Asian Star', code: 'AST' },
  { name: 'AmeriJet', code: 'AMJ' },
  { name: 'Royal Air', code: 'RYL' },
  { name: 'Pacific Blue', code: 'PBL' },
  { name: 'Northern Air', code: 'NTH' }
];

export const generateAICompanies = (count = 3, excludeHqId = null) => {
  const companies = [];
  const usedHqs = new Set([excludeHqId]);
  const usedNames = new Set();

  for (let i = 0; i < count; i++) {
    // Pick random name
    let nameObj;
    let nameAttempts = 0;
    do {
      nameObj = AI_NAMES[Math.floor(Math.random() * AI_NAMES.length)];
      nameAttempts++;
    } while (usedNames.has(nameObj.name) && nameAttempts < 50);
    usedNames.add(nameObj.name);

    // Pick random HQ (prefer larger cities)
    let hq;
    let attempts = 0;
    do {
        hq = CITIES[Math.floor(Math.random() * CITIES.length)];
        attempts++;
    } while (usedHqs.has(hq.id) && attempts < 100);
    usedHqs.add(hq.id);

    companies.push({
      id: generateId(),
      isPlayer: false,
      name: nameObj.name,
      code: nameObj.code,
      hq: hq.id,
      money: 50000000, // Same start as player
      fleet: {},
      routes: [],
      nextFlightNum: 10,
      fame: 40 + Math.floor(Math.random() * 20), // 40-60
      maintenanceEffort: 50,
      serviceEffort: 50,
      prBudget: 0,
      properties: [],
      activeModifiers: [],
      stats: {
        totalRevenue: 0,
        totalFlightCost: 0,
        totalMaintCost: 0,
        totalIdleCost: 0,
        netIncome: 0,
        idleCounts: {},
        totalPrCost: 0,
        totalPropertyIncome: 0,
        totalPropertyCost: 0
      }
    });
  }

  return companies;
};
