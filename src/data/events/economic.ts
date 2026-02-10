import { GameEvent, GameState, Company } from '../../types';

export const economicEvents: GameEvent[] = [
  {
    id: 'tech_breakthrough',
    title: 'Aviation Tech Breakthrough',
    description: `Engineers have developed a new aerodynamic winglet design that significantly reduces fuel consumption. Implementing this fleet-wide upgrade will cost money upfront but save on fuel in the long run.`,
    startDate: new Date(1960, 0, 1),
    endDate: null,
    mtth: 3650, // Every 10 years
    oneTime: false,
    modal: true,
    triggers: [
       (state: GameState, company: Company) => company.money > 500000
    ],
    mtth_modifiers: [],
    options: [
      {
        label: 'Invest in upgrade ($500k)',
        description: '-10% Flight Costs for 5 years',
        effects: [
           { type: 'money', amount: -500000 },
           {
             type: 'addModifier',
             modifier: {
               id: 'tech_upgrade_fuel_save',
               source: 'event_tech_breakthrough',
               type: 'multiplier',
               target: 'flightCost',
               value: 0.9,
               context: null,
               expireDuration: 1825,
               description: 'Tech Upgrade: Fuel Savings'
             }
           }
        ]
      },
      {
        label: 'Pass on this technology',
        description: 'No change',
        effects: []
      }
    ]
  },
  {
    id: 'post_war_boom',
    title: 'Economic Boom',
    description: 'The global economy is recovering rapidly. Disposable income is rising, and more people are eager to travel by air!',
    startDate: new Date(1951, 0, 1),
    endDate: new Date(1955, 11, 31),
    mtth: 365,
    oneTime: true,
    modal: true,
    triggers: [],
    mtth_modifiers: [],
    options: [
      {
        label: 'Great news!',
        description: '+10% Demand for 2 years',
        effects: [
          {
             type: 'addModifier',
             modifier: {
               id: 'boom_50s',
               source: 'event_post_war_boom',
               type: 'multiplier',
               target: 'demand',
               value: 1.1,
               context: null,
               expireDuration: 730,
               description: 'Post-War Boom'
             }
          }
        ]
      }
    ]
  }
];
