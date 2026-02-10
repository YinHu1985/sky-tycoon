import { historicalEvents } from './historical';
import { companyEvents } from './company';
import { economicEvents } from './economic';
import { accidentEvents } from './accidents';
import { GameEvent } from '../../types';

export const ALL_EVENTS: GameEvent[] = [
  ...historicalEvents,
  ...companyEvents,
  ...economicEvents,
  ...accidentEvents
];
