import { historicalEvents } from './historical.js';
import { companyEvents } from './company.js';
import { economicEvents } from './economic.js';
import { accidentEvents } from './accidents.js';

export const ALL_EVENTS = [
  ...historicalEvents,
  ...companyEvents,
  ...economicEvents,
  ...accidentEvents
];
