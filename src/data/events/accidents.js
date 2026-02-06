export const accidentEvents = [
  {
    id: 'minor_accident_engine',
    title: 'Engine Failure Incident',
    description: `One of your aircraft experienced an engine failure mid-flight. The pilots landed safely, but the incident has shaken public confidence and requires immediate repairs.`,
    startDate: new Date(1950, 0, 1),
    endDate: null,
    mtth: 730, // Every 2 years
    oneTime: false,
    modal: true,
    triggers: [
      (state) => state.company.maintenanceEffort < 50 // Only if maintenance is lax
    ],
    mtth_modifiers: [
      {
         condition: (state) => state.company.maintenanceEffort < 20,
         factor: 0.2 // 5x more likely if very low maintenance
      }
    ],
    options: [
      {
        label: 'Repair and Apologize',
        description: 'Cost: $100k, Fame: -5',
        effects: [
          { type: 'money', amount: -100000 },
          { 
             type: 'addModifier',
             modifier: {
               id: 'accident_reputation_hit',
               source: 'event_accident',
               type: 'flat',
               target: 'fame',
               value: -5,
               context: null,
               expireDuration: 180, // 6 months
               description: 'Accident: Reputation Hit'
             }
          }
        ]
      }
    ]
  },
  {
    id: 'labor_strike',
    title: 'Pilot Strike!',
    description: `Your pilots have gone on strike demanding better working conditions and pay. Operations are severely disrupted.`,
    startDate: new Date(1950, 0, 1),
    endDate: null,
    mtth: 1095, // Every 3 years
    oneTime: false,
    modal: true,
    triggers: [
       (state) => state.company.serviceEffort < 40 // Low service/pay effort triggers it
    ],
    mtth_modifiers: [],
    options: [
      {
         label: 'Negotiate (Pay Raise)',
         description: 'Agreed to higher wages to end the strike immediately.',
         effects: [
            {
              type: 'addModifier',
              modifier: {
                id: 'strike_settlement_cost',
                source: 'event_strike',
                type: 'multiplier',
                target: 'flightCost',
                value: 1.2,
                context: null,
                expireDuration: 365,
                description: 'Strike Settlement: Higher Wages'
              }
            }
         ]
      },
      {
         label: 'Wait them out',
         description: 'Refuse demands. Operations will suffer for a month.',
         effects: [
            {
               type: 'addModifier',
               modifier: {
                 id: 'strike_disruption',
                 source: 'event_strike',
                 type: 'multiplier',
                 target: 'loadFactor',
                 value: 0.5, // 50% capacity
                 context: null,
                 expireDuration: 30,
                 description: 'Strike: Flight Cancellations'
               }
            }
         ]
      }
    ]
  },
  {
    id: 'severe_turbulence',
    title: 'Severe Turbulence Incident',
    description: 'A flight encountered severe clear-air turbulence, resulting in minor injuries to passengers and crew. The press is asking questions about safety protocols.',
    startDate: new Date(1950, 0, 1),
    endDate: null,
    mtth: 180, // Twice a year avg
    oneTime: false,
    modal: true,
    triggers: [],
    mtth_modifiers: [
       { factor: 0.5, condition: (state) => state.company.maintenanceEffort < 40 }
    ],
    options: [
      {
        label: 'Issue standard apology',
        description: '-2 Fame',
        effects: [
           { type: 'addModifier', modifier: { id: 'turb_fame_hit', source: 'event_turbulence', type: 'flat', target: 'fame', value: -2, context: null, expireDuration: 30, description: 'Turbulence Bad Press' } }
        ]
      },
      {
        label: 'Compensate passengers',
        description: 'Cost $10k, +1 Fame',
        effects: [
           { type: 'money', amount: -10000 },
           { type: 'addModifier', modifier: { id: 'turb_good_pr', source: 'event_turbulence', type: 'flat', target: 'fame', value: 1, context: null, expireDuration: 30, description: 'Good Crisis Management' } }
        ]
      }
    ]
  }
];
