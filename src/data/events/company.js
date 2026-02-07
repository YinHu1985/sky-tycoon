export const companyEvents = [
  {
    id: 'bankruptcy_bailout',
    title: 'Government Bailout?',
    description: `Your airline is running out of cash! The government is concerned about the loss of connectivity and jobs.

They are offering a one-time emergency bailout to keep operations running, but it comes with strings attached.`,
    startDate: new Date(1950, 0, 1),
    endDate: null,
    mtth: 30, // Check frequently (monthly avg)
    oneTime: true, // Only once per game
    modal: true,
    triggers: [
      (state, company) => company.money < 100000 // Only fires if money is very low (< $100k)
    ],
    mtth_modifiers: [
      { 
        factor: 0.1, // 10x more likely (effectively immediate)
        condition: (state, company) => company.money < -1000000 // If deeply in debt
      }
    ],
    options: [
      {
        label: 'Accept Bailout',
        description: 'Receive $5M grant, but lose 20 Fame',
        effects: [
          { type: 'money', amount: 5000000 },
          { 
            type: 'addModifier',
            modifier: {
              id: 'bailout_shame',
              source: 'event_bailout',
              type: 'flat',
              target: 'fame',
              value: -20,
              context: null,
              expireDuration: 365, // 1 year
              description: 'Bailout Shame: -20 Fame'
            }
          }
        ]
      },
      {
        label: 'Refuse',
        description: 'We will find our own way',
        effects: []
      }
    ]
  },
  {
    id: 'excellent_ceo_hired',
    title: 'Excellent CEO Candidate',
    description: `A highly experienced aviation executive has approached your company about becoming CEO. They have a proven track record of increasing revenue and company reputation.

Their salary demands are high, but they're offering a 5-year contract that could transform your airline.`,
    startDate: new Date(1955, 0, 1),
    endDate: null, // Can happen anytime after 1955
    mtth: 7300, // Average every 20 years (20 * 365 days)
    oneTime: false, // Can hire multiple CEOs over time
    modal: true,
    triggers: [
      (state, company) => company.money > 2000000 // Must have some cash
    ],
    mtth_modifiers: [
      {
        factor: 0.5, // 2x more likely
        condition: (state, company) => company.fame > 80 // If famous
      },
      {
        factor: 2.0, // 2x less likely
        condition: (state, company) => company.fame < 20 // If unknown
      }
    ],
    options: [
      {
        label: 'Hire them ($1M signing bonus)',
        description: '5-year contract: +10% revenue and +2 fame per week',
        effects: [
          { type: 'money', amount: -1000000 },
          {
            type: 'addModifier',
            modifier: {
              id: 'excellent_ceo_revenue_boost',
              source: 'event_excellent_ceo',
              type: 'multiplier',
              target: 'revenue',
              value: 1.1,
              context: null,
              expireDuration: 1825, // 5 years (5 * 365 days)
              description: 'Excellent CEO: Revenue boost'
            }
          },
          {
            type: 'addModifier',
            modifier: {
              id: 'excellent_ceo_fame_boost',
              source: 'event_excellent_ceo',
              type: 'flat',
              target: 'fame',
              value: 2,
              context: null,
              expireDuration: 1825, // 5 years
              description: 'Excellent CEO: Fame boost'
            }
          }
        ]
      },
      {
        label: 'Decline the offer',
        description: 'Keep current management',
        effects: []
      }
    ]
  },
  {
    id: 'celebrity_endorsement',
    title: 'Celebrity Spotting',
    description: `A world-famous movie star was spotted flying on one of your routes. The press is going wild!`,
    startDate: new Date(1950, 0, 1),
    endDate: null,
    mtth: 365, // Yearly
    oneTime: false,
    modal: true,
    triggers: [
       (state, company) => company && company.fame > 30 // Must be somewhat known
    ],
    mtth_modifiers: [
       { factor: 0.5, condition: (state, company) => company && company.serviceEffort > 80 } // High service attracts celebs
    ],
    options: [
       {
         label: 'Issue a press release',
         description: 'Capitalize on the publicity (+5 Fame)',
         effects: [
            {
               type: 'addModifier',
               modifier: {
                 id: 'celeb_buzz',
                 source: 'event_celeb',
                 type: 'flat',
                 target: 'fame',
                 value: 5,
                 context: null,
                 expireDuration: 90,
                 description: 'Celebrity Buzz'
               }
            }
         ]
       },
       {
         label: 'Respect their privacy',
         description: 'Classy move. (+2 Fame, longer duration)',
         effects: [
            {
               type: 'addModifier',
               modifier: {
                 id: 'celeb_respect',
                 source: 'event_celeb',
                 type: 'flat',
                 target: 'fame',
                 value: 2,
                 context: null,
                 expireDuration: 365,
                 description: 'Respected Privacy'
               }
            }
         ]
       }
    ]
  }
];
