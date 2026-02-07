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
    scope: 'global',
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
    id: 'olympics_1952_hel',
    title: '1952 Helsinki Olympics',
    description: 'The Summer Games are being held in Helsinki! Athletes and spectators from around the globe are flocking to Finland.',
    startDate: new Date(1952, 6, 1), // July 1952
    endDate: new Date(1952, 7, 15),
    mtth: 10,
    oneTime: true,
    modal: true,
    triggers: [],
    mtth_modifiers: [],
    options: [
      {
        label: 'Capitalize on the demand',
        description: 'Tourism in Helsinki booms! (+50% Tourism for 2 months)',
        effects: [
          {
            type: 'addModifier',
            modifier: {
              id: 'olympics_1952_boom',
              source: 'event_olympics_1952',
              type: 'multiplier',
              target: 'cityTour',
              value: 1.5,
              context: { cityId: 'hel' },
              expireDuration: 60,
              description: 'Helsinki Olympics Boom'
            }
          }
        ]
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
    id: 'olympics_1956_mel',
    title: '1956 Melbourne Olympics',
    description: 'The Summer Games are coming to Melbourne, marking the first time they are held in the Southern Hemisphere.',
    startDate: new Date(1956, 10, 1), // Nov 1956
    endDate: new Date(1956, 11, 15),
    mtth: 10,
    oneTime: true,
    modal: true,
    triggers: [],
    mtth_modifiers: [],
    options: [
      {
        label: 'Prepare for visitors',
        description: 'Tourism in Melbourne booms! (+50% Tourism for 2 months)',
        effects: [
          {
            type: 'addModifier',
            modifier: {
              id: 'olympics_1956_boom',
              source: 'event_olympics_1956',
              type: 'multiplier',
              target: 'cityTour',
              value: 1.5,
              context: { cityId: 'mel' },
              expireDuration: 60,
              description: 'Melbourne Olympics Boom'
            }
          }
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
    id: 'olympics_1960_rom',
    title: '1960 Rome Olympics',
    description: 'The Eternal City hosts the Summer Games! A perfect opportunity to showcase Italian hospitality.',
    startDate: new Date(1960, 7, 15), // Aug 1960
    endDate: new Date(1960, 8, 30),
    mtth: 10,
    oneTime: true,
    modal: true,
    triggers: [],
    mtth_modifiers: [],
    options: [
      {
        label: 'All roads lead to Rome',
        description: 'Tourism in Rome booms! (+50% Tourism for 2 months)',
        effects: [
          {
            type: 'addModifier',
            modifier: {
              id: 'olympics_1960_boom',
              source: 'event_olympics_1960',
              type: 'multiplier',
              target: 'cityTour',
              value: 1.5,
              context: { cityId: 'rom' },
              expireDuration: 60,
              description: 'Rome Olympics Boom'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'olympics_1964_tok',
    title: '1964 Tokyo Olympics',
    description: 'Tokyo welcomes the world for the first Olympics held in Asia, showcasing Japan\'s post-war reconstruction.',
    startDate: new Date(1964, 9, 1), // Oct 1964
    endDate: new Date(1964, 10, 15),
    mtth: 10,
    oneTime: true,
    modal: true,
    triggers: [],
    mtth_modifiers: [],
    options: [
      {
        label: 'Fly to the East',
        description: 'Tourism in Tokyo booms! (+50% Tourism for 2 months)',
        effects: [
          {
            type: 'addModifier',
            modifier: {
              id: 'olympics_1964_boom',
              source: 'event_olympics_1964',
              type: 'multiplier',
              target: 'cityTour',
              value: 1.5,
              context: { cityId: 'tok' },
              expireDuration: 60,
              description: 'Tokyo Olympics Boom'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'olympics_1968_mex',
    title: '1968 Mexico City Olympics',
    description: 'The Olympics arrive in Latin America for the first time. The high altitude of Mexico City promises record-breaking performances.',
    startDate: new Date(1968, 9, 1), // Oct 1968
    endDate: new Date(1968, 10, 15),
    mtth: 10,
    oneTime: true,
    modal: true,
    triggers: [],
    mtth_modifiers: [],
    options: [
      {
        label: 'Viva Mexico!',
        description: 'Tourism in Mexico City booms! (+50% Tourism for 2 months)',
        effects: [
          {
            type: 'addModifier',
            modifier: {
              id: 'olympics_1968_boom',
              source: 'event_olympics_1968',
              type: 'multiplier',
              target: 'cityTour',
              value: 1.5,
              context: { cityId: 'mex' },
              expireDuration: 60,
              description: 'Mexico City Olympics Boom'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'olympics_1972_muc',
    title: '1972 Munich Olympics',
    description: 'Munich hosts the Summer Games, hoping to present a new, democratic Germany to the world.',
    startDate: new Date(1972, 7, 15), // Aug 1972
    endDate: new Date(1972, 8, 30),
    mtth: 10,
    oneTime: true,
    modal: true,
    triggers: [],
    mtth_modifiers: [],
    options: [
      {
        label: 'Fly to Bavaria',
        description: 'Tourism in Munich booms! (+50% Tourism for 2 months)',
        effects: [
          {
            type: 'addModifier',
            modifier: {
              id: 'olympics_1972_boom',
              source: 'event_olympics_1972',
              type: 'multiplier',
              target: 'cityTour',
              value: 1.5,
              context: { cityId: 'muc' },
              expireDuration: 60,
              description: 'Munich Olympics Boom'
            }
          }
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
  },
  {
    id: 'olympics_1976_yul',
    title: '1976 Montreal Olympics',
    description: 'Montreal hosts the Summer Games. The city is bustling with athletes and visitors.',
    startDate: new Date(1976, 6, 15), // July 1976
    endDate: new Date(1976, 7, 30),
    mtth: 10,
    oneTime: true,
    modal: true,
    triggers: [],
    mtth_modifiers: [],
    options: [
      {
        label: 'Visit Canada',
        description: 'Tourism in Montreal booms! (+50% Tourism for 2 months)',
        effects: [
          {
            type: 'addModifier',
            modifier: {
              id: 'olympics_1976_boom',
              source: 'event_olympics_1976',
              type: 'multiplier',
              target: 'cityTour',
              value: 1.5,
              context: { cityId: 'yul' },
              expireDuration: 60,
              description: 'Montreal Olympics Boom'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'olympics_1980_mos',
    title: '1980 Moscow Olympics',
    description: 'Moscow hosts the Summer Games, though some nations are boycotting. Still, a major event for the Eastern Bloc.',
    startDate: new Date(1980, 6, 15), // July 1980
    endDate: new Date(1980, 7, 30),
    mtth: 10,
    oneTime: true,
    modal: true,
    triggers: [],
    mtth_modifiers: [],
    options: [
      {
        label: 'Fly to Moscow',
        description: 'Tourism in Moscow booms! (+50% Tourism for 2 months)',
        effects: [
          {
            type: 'addModifier',
            modifier: {
              id: 'olympics_1980_boom',
              source: 'event_olympics_1980',
              type: 'multiplier',
              target: 'cityTour',
              value: 1.5,
              context: { cityId: 'mos' },
              expireDuration: 60,
              description: 'Moscow Olympics Boom'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'olympics_1984_lax',
    title: '1984 Los Angeles Olympics',
    description: 'The Games return to Los Angeles. A spectacle of modern entertainment and sports.',
    startDate: new Date(1984, 6, 25), // July 1984
    endDate: new Date(1984, 7, 30),
    mtth: 10,
    oneTime: true,
    modal: true,
    triggers: [],
    mtth_modifiers: [],
    options: [
      {
        label: 'Hollywood & Sports',
        description: 'Tourism in Los Angeles booms! (+50% Tourism for 2 months)',
        effects: [
          {
            type: 'addModifier',
            modifier: {
              id: 'olympics_1984_boom',
              source: 'event_olympics_1984',
              type: 'multiplier',
              target: 'cityTour',
              value: 1.5,
              context: { cityId: 'lax' },
              expireDuration: 60,
              description: 'LA Olympics Boom'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'olympics_1988_sel',
    title: '1988 Seoul Olympics',
    description: 'Seoul hosts the world, marking South Korea\'s emergence as a global economic power.',
    startDate: new Date(1988, 8, 15), // Sep 1988
    endDate: new Date(1988, 9, 30),
    mtth: 10,
    oneTime: true,
    modal: true,
    triggers: [],
    mtth_modifiers: [],
    options: [
      {
        label: 'Experience Seoul',
        description: 'Tourism in Seoul booms! (+50% Tourism for 2 months)',
        effects: [
          {
            type: 'addModifier',
            modifier: {
              id: 'olympics_1988_boom',
              source: 'event_olympics_1988',
              type: 'multiplier',
              target: 'cityTour',
              value: 1.5,
              context: { cityId: 'sel' },
              expireDuration: 60,
              description: 'Seoul Olympics Boom'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'olympics_1992_bcn',
    title: '1992 Barcelona Olympics',
    description: 'Barcelona transforms itself for the Games, becoming a major tourist destination.',
    startDate: new Date(1992, 6, 25), // July 1992
    endDate: new Date(1992, 7, 30),
    mtth: 10,
    oneTime: true,
    modal: true,
    triggers: [],
    mtth_modifiers: [],
    options: [
      {
        label: 'Viva Barcelona!',
        description: 'Tourism in Barcelona booms! (+50% Tourism for 2 months)',
        effects: [
          {
            type: 'addModifier',
            modifier: {
              id: 'olympics_1992_boom',
              source: 'event_olympics_1992',
              type: 'multiplier',
              target: 'cityTour',
              value: 1.5,
              context: { cityId: 'bcn' },
              expireDuration: 60,
              description: 'Barcelona Olympics Boom'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'olympics_1996_atl',
    title: '1996 Atlanta Olympics',
    description: 'The Centennial Olympic Games are held in Atlanta, Georgia.',
    startDate: new Date(1996, 6, 15), // July 1996
    endDate: new Date(1996, 7, 30),
    mtth: 10,
    oneTime: true,
    modal: true,
    triggers: [],
    mtth_modifiers: [],
    options: [
      {
        label: 'Southern Hospitality',
        description: 'Tourism in Atlanta booms! (+50% Tourism for 2 months)',
        effects: [
          {
            type: 'addModifier',
            modifier: {
              id: 'olympics_1996_boom',
              source: 'event_olympics_1996',
              type: 'multiplier',
              target: 'cityTour',
              value: 1.5,
              context: { cityId: 'atl' },
              expireDuration: 60,
              description: 'Atlanta Olympics Boom'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'olympics_2000_syd',
    title: '2000 Sydney Olympics',
    description: 'The New Millennium begins with the Games Down Under in Sydney.',
    startDate: new Date(2000, 8, 15), // Sep 2000
    endDate: new Date(2000, 9, 30),
    mtth: 10,
    oneTime: true,
    modal: true,
    triggers: [],
    mtth_modifiers: [],
    options: [
      {
        label: 'G\'day Sydney!',
        description: 'Tourism in Sydney booms! (+50% Tourism for 2 months)',
        effects: [
          {
            type: 'addModifier',
            modifier: {
              id: 'olympics_2000_boom',
              source: 'event_olympics_2000',
              type: 'multiplier',
              target: 'cityTour',
              value: 1.5,
              context: { cityId: 'syd' },
              expireDuration: 60,
              description: 'Sydney Olympics Boom'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'olympics_2004_ath',
    title: '2004 Athens Olympics',
    description: 'The Games return to their ancient birthplace in Athens, Greece.',
    startDate: new Date(2004, 7, 10), // Aug 2004
    endDate: new Date(2004, 7, 30),
    mtth: 10,
    oneTime: true,
    modal: true,
    triggers: [],
    mtth_modifiers: [],
    options: [
      {
        label: 'Return to Roots',
        description: 'Tourism in Athens booms! (+50% Tourism for 2 months)',
        effects: [
          {
            type: 'addModifier',
            modifier: {
              id: 'olympics_2004_boom',
              source: 'event_olympics_2004',
              type: 'multiplier',
              target: 'cityTour',
              value: 1.5,
              context: { cityId: 'ath' },
              expireDuration: 60,
              description: 'Athens Olympics Boom'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'olympics_2008_pek',
    title: '2008 Beijing Olympics',
    description: 'Beijing hosts a spectacular Games, welcoming the world to a modern China.',
    startDate: new Date(2008, 7, 1), // Aug 2008
    endDate: new Date(2008, 7, 30),
    mtth: 10,
    oneTime: true,
    modal: true,
    triggers: [],
    mtth_modifiers: [],
    options: [
      {
        label: 'Visit Beijing',
        description: 'Tourism in Beijing booms! (+50% Tourism for 2 months)',
        effects: [
          {
            type: 'addModifier',
            modifier: {
              id: 'olympics_2008_boom',
              source: 'event_olympics_2008',
              type: 'multiplier',
              target: 'cityTour',
              value: 1.5,
              context: { cityId: 'pek' },
              expireDuration: 60,
              description: 'Beijing Olympics Boom'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'olympics_2012_lon',
    title: '2012 London Olympics',
    description: 'London becomes the first city to host the Summer Games three times.',
    startDate: new Date(2012, 6, 25), // July 2012
    endDate: new Date(2012, 7, 30),
    mtth: 10,
    oneTime: true,
    modal: true,
    triggers: [],
    mtth_modifiers: [],
    options: [
      {
        label: 'London Calling',
        description: 'Tourism in London booms! (+50% Tourism for 2 months)',
        effects: [
          {
            type: 'addModifier',
            modifier: {
              id: 'olympics_2012_boom',
              source: 'event_olympics_2012',
              type: 'multiplier',
              target: 'cityTour',
              value: 1.5,
              context: { cityId: 'lon' },
              expireDuration: 60,
              description: 'London Olympics Boom'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'olympics_2016_rio',
    title: '2016 Rio Olympics',
    description: 'The Games come to South America for the first time, hosted by Rio de Janeiro.',
    startDate: new Date(2016, 7, 1), // Aug 2016
    endDate: new Date(2016, 7, 30),
    mtth: 10,
    oneTime: true,
    modal: true,
    triggers: [],
    mtth_modifiers: [],
    options: [
      {
        label: 'Carnival Atmosphere',
        description: 'Tourism in Rio booms! (+50% Tourism for 2 months)',
        effects: [
          {
            type: 'addModifier',
            modifier: {
              id: 'olympics_2016_boom',
              source: 'event_olympics_2016',
              type: 'multiplier',
              target: 'cityTour',
              value: 1.5,
              context: { cityId: 'rio' },
              expireDuration: 60,
              description: 'Rio Olympics Boom'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'olympics_2020_tok',
    title: '2020 Tokyo Olympics',
    description: 'Tokyo hosts the Games for a second time, featuring high-tech innovation.',
    startDate: new Date(2020, 6, 20), // July 2020
    endDate: new Date(2020, 7, 30),
    mtth: 10,
    oneTime: true,
    modal: true,
    triggers: [],
    mtth_modifiers: [],
    options: [
      {
        label: 'Return to Tokyo',
        description: 'Tourism in Tokyo booms! (+50% Tourism for 2 months)',
        effects: [
          {
            type: 'addModifier',
            modifier: {
              id: 'olympics_2020_boom',
              source: 'event_olympics_2020',
              type: 'multiplier',
              target: 'cityTour',
              value: 1.5,
              context: { cityId: 'tok' },
              expireDuration: 60,
              description: 'Tokyo Olympics Boom'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'olympics_2024_par',
    title: '2024 Paris Olympics',
    description: 'Paris hosts the Summer Games exactly 100 years after it last hosted them in 1924.',
    startDate: new Date(2024, 6, 25), // July 2024
    endDate: new Date(2024, 7, 30),
    mtth: 10,
    oneTime: true,
    modal: true,
    triggers: [],
    mtth_modifiers: [],
    options: [
      {
        label: 'Parisian Games',
        description: 'Tourism in Paris booms! (+50% Tourism for 2 months)',
        effects: [
          {
            type: 'addModifier',
            modifier: {
              id: 'olympics_2024_boom',
              source: 'event_olympics_2024',
              type: 'multiplier',
              target: 'cityTour',
              value: 1.5,
              context: { cityId: 'par' },
              expireDuration: 60,
              description: 'Paris Olympics Boom'
            }
          }
        ]
      }
    ]
  }
];
