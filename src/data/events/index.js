import { historicalEvents } from './historical';
import { companyEvents } from './company';
import { economicEvents } from './economic';
import { accidentEvents } from './accidents';

export const ALL_EVENTS = [
  ...historicalEvents,
  ...companyEvents,
  ...economicEvents,
  ...accidentEvents
];
