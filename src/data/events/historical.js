export const historicalEvents = [
  {
    id: 'welcome_1950',
    title: 'Welcome to Sky Tycoon!',
    description: `The year is 1950, and the golden age of commercial aviation is just beginning. You've founded your airline with dreams of connecting the world.

Your starting capital of $5,000,000 might seem like a lot, but aircraft are expensive and routes take time to become profitable. Choose your first moves wisely!

Good luck building your aviation empire!`,
    startDate: new Date(1950, 0, 1),
    endDate: new Date(1950, 1, 2),
    mtth: 1,
    triggers: [],
    mtth_modifiers: [],
    oneTime: true,
    modal: true,
    options: [
      {
        label: 'Let\'s get started!',
        description: 'Begin your journey',
        effects: []
      },
      {
        label: 'Give me a boost!',
        description: 'Start with extra capital (Easy Mode)',
        effects: [
          { type: 'money', amount: 2000000 }
        ]
      }
    ]
  },
  {
    id: 'helsinki_games_1952',
    title: '1952 Summer Games',
    description: 'The world gathers in Helsinki for the Summer Games. Athletes and spectators from around the globe are looking for flights!',
    startDate: new Date(1952, 6, 1), // July 1952
    endDate: new Date(1952, 7, 30),
    mtth: 15,
    oneTime: true,
    modal: true,
    triggers: [],
    mtth_modifiers: [],
    options: [
      {
        label: 'Add extra charter flights',
        description: 'Capitalize on the demand (+20% Revenue for 2 months)',
        effects: [
          {
            type: 'addModifier',
            modifier: {
              id: 'games_1952_boom',
              source: 'event_helsinki_1952',
              type: 'multiplier',
              target: 'revenue',
              value: 1.2,
              context: null,
              expireDuration: 60,
              description: 'Summer Games Boom'
            }
          }
        ]
      },
      {
        label: 'Ignore the hype',
        description: 'Focus on regular operations',
        effects: []
      }
    ]
  },
  {
    id: 'comet_grounding_1954',
    title: 'The Comet Grounded',
    description: 'After a series of tragic accidents, the de Havilland Comet fleet has been grounded indefinitely due to metal fatigue concerns. Public confidence in jet travel has been shaken.',
    startDate: new Date(1954, 3, 1),
    endDate: new Date(1954, 5, 30),
    mtth: 30,
    oneTime: true,
    modal: true,
    triggers: [],
    mtth_modifiers: [],
    options: [
      {
        label: 'Emphasize Propeller Safety',
        description: 'Launch a campaign highlighting the reliability of your prop fleet (+5 Fame, -5% Demand temporarily)',
        effects: [
          { type: 'addModifier', modifier: { id: 'prop_safety_campaign', source: 'event_comet', type: 'flat', target: 'fame', value: 5, context: null, expireDuration: 365, description: 'Safety Campaign' } },
          { type: 'addModifier', modifier: { id: 'jet_fear', source: 'event_comet', type: 'multiplier', target: 'demand', value: 0.95, context: null, expireDuration: 90, description: 'Fear of Jets' } }
        ]
      }
    ]
  },
  {
    id: 'grand_canyon_1956',
    title: 'Grand Canyon Tragedy',
    description: 'A mid-air collision over the Grand Canyon has shocked the nation. Authorities are calling for immediate modernization of Air Traffic Control systems and stricter flight rules.',
    startDate: new Date(1956, 5, 30),
    endDate: new Date(1956, 8, 30),
    mtth: 20,
    oneTime: true,
    modal: true,
    triggers: [],
    mtth_modifiers: [],
    options: [
      {
        label: 'Support New Regulations',
        description: 'Invest in better avionics ($500k cost, +10 Fame)',
        effects: [
          { type: 'money', amount: -500000 },
          { type: 'addModifier', modifier: { id: 'safety_leader', source: 'event_grand_canyon', type: 'flat', target: 'fame', value: 10, context: null, expireDuration: 730, description: 'Safety Leader' } }
        ]
      },
      {
        label: 'Lobby for Gradual Change',
        description: 'Avoid immediate costs, but look indifferent (-5 Fame)',
        effects: [
           { type: 'addModifier', modifier: { id: 'safety_laggard', source: 'event_grand_canyon', type: 'flat', target: 'fame', value: -5, context: null, expireDuration: 365, description: 'Safety Laggard' } }
        ]
      }
    ]
  },
  {
    id: 'rome_games_1960',
    title: '1960 Rome Games',
    description: 'The Summer Games are being held in Rome! This is a golden opportunity to promote international travel.',
    startDate: new Date(1960, 7, 15),
    endDate: new Date(1960, 8, 30),
    mtth: 15,
    oneTime: true,
    modal: true,
    triggers: [],
    mtth_modifiers: [],
    options: [
      {
        label: 'Promote "Roman Holiday" Packages',
        description: '+25% Revenue for 2 months, -10 Service Effort (Crowded)',
        effects: [
          { type: 'addModifier', modifier: { id: 'rome_boom', source: 'event_rome_1960', type: 'multiplier', target: 'revenue', value: 1.25, context: null, expireDuration: 60, description: 'Rome Games Boom' } },
          { type: 'addModifier', modifier: { id: 'rome_crowds', source: 'event_rome_1960', type: 'flat', target: 'serviceEffort', value: -10, context: null, expireDuration: 60, description: 'Crowded Flights' } }
        ]
      }
    ]
  },
  {
    id: 'oil_crisis_1973',
    title: 'Oil Crisis!',
    description: `A global oil crisis has erupted, causing fuel prices to skyrocket. Flight costs are expected to increase significantly for the next year.

How will you respond to this challenge?`,
    startDate: new Date(1973, 0, 1),
    endDate: new Date(1974, 11, 31),
    mtth: 180,
    oneTime: true,
    modal: true,
    triggers: [],
    mtth_modifiers: [],
    options: [
      {
        label: 'Raise ticket prices',
        description: 'Pass costs to passengers (+15% revenue, -10% demand)',
        effects: [
          {
            type: 'addModifier',
            modifier: {
              id: 'oil_crisis_price_increase',
              source: 'event_oil_crisis_1973',
              type: 'multiplier',
              target: 'revenue',
              value: 1.15,
              context: null,
              expireDuration: 365,
              description: 'Oil Crisis: Higher ticket prices'
            }
          },
          {
            type: 'addModifier',
            modifier: {
              id: 'oil_crisis_demand_drop',
              source: 'event_oil_crisis_1973',
              type: 'multiplier',
              target: 'demand',
              value: 0.9,
              context: null,
              expireDuration: 365,
              description: 'Oil Crisis: Reduced demand'
            }
          }
        ]
      },
      {
        label: 'Absorb the costs',
        description: 'Keep prices low to maintain market share (+50% flight costs)',
        effects: [
          {
            type: 'addModifier',
            modifier: {
              id: 'oil_crisis_cost_increase',
              source: 'event_oil_crisis_1973',
              type: 'multiplier',
              target: 'flightCost',
              value: 1.5,
              context: null,
              expireDuration: 365,
              description: 'Oil Crisis: Higher fuel costs'
            }
          }
        ]
      },
      {
        label: 'Reduce service temporarily',
        description: 'Cut flights to save fuel (-30% Revenue, -30% Costs)',
        effects: [
           {
             type: 'addModifier',
             modifier: {
               id: 'oil_crisis_rev_cut',
               source: 'event_oil_crisis_1973',
               type: 'multiplier',
               target: 'revenue',
               value: 0.7,
               context: null,
               expireDuration: 365,
               description: 'Reduced Service Revenue'
             }
           },
           {
             type: 'addModifier',
             modifier: {
               id: 'oil_crisis_cost_cut',
               source: 'event_oil_crisis_1973',
               type: 'multiplier',
               target: 'flightCost',
               value: 0.7,
               context: null,
               expireDuration: 365,
               description: 'Reduced Service Costs'
             }
           }
        ]
      }
    ]
  }
];
