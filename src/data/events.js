/**
 * Event System for Sky Tycoon
 *
 * Event Structure:
 * - id: Unique identifier for the event
 * - title: Display title for the event
 * - description: Full description shown to the player
 * - startDate: Optional Date object - when the event can start happening (null = game start)
 * - endDate: Optional Date object - when the event stops happening (null = never ends)
 * - mtth: Mean Time To Happen in days (null = doesn't trigger by time)
 * - oneTime: Boolean - if true, event only fires once
 * - modal: Boolean - if true, pauses game and requires user action (default: true)
 * - options: Array of choices the player can make
 *
 * Option Structure:
 * - label: Button text
 * - description: What this choice does (optional)
 * - effects: Array of effect objects
 *
 * Effect Types:
 * - { type: 'money', amount: number } - Add/subtract money
 * - { type: 'addModifier', modifier: {...} } - Add a game modifier
 * - { type: 'removeModifier', modifierId: string } - Remove a modifier by ID
 * - { type: 'triggerEvent', eventId: string } - Trigger another event
 *
 * Modifier Expiry:
 * - expiryDate: Absolute Date object for expiry (calculated at event definition time)
 * - expireDuration: Number of days until expiry (calculated when event fires)
 * - Use expireDuration for relative times, expiryDate for absolute dates
 * - If both are null, modifier is permanent
 */

export const EVENTS = {
  // ============================================================================
  // TUTORIAL & WELCOME EVENTS
  // ============================================================================

  welcome_1950: {
    id: 'welcome_1950',
    title: 'Welcome to Sky Tycoon!',
    description: `The year is 1950, and the golden age of commercial aviation is just beginning. You've founded your airline with dreams of connecting the world.

Your starting capital of $5,000,000 might seem like a lot, but aircraft are expensive and routes take time to become profitable. Choose your first moves wisely!

Good luck building your aviation empire!`,
    startDate: new Date(1950, 0, 1), // January 1, 1950
    endDate: new Date(1950, 1, 2),   // Feb 1, 1950 (one month window)
    mtth: 1, // Will happen on day 1
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
          { type: 'money', amount: 2000000 } // Extra $2M
        ]
      }
    ]
  },

  // ============================================================================
  // EXAMPLE EVENTS (for future development)
  // ============================================================================

  oil_crisis_1973: {
    id: 'oil_crisis_1973',
    title: 'Oil Crisis!',
    description: `A global oil crisis has erupted, causing fuel prices to skyrocket. Flight costs are expected to increase significantly for the next year.

How will you respond to this challenge?`,
    startDate: new Date(1973, 0, 1),
    endDate: new Date(1974, 11, 31),
    mtth: 180, // Average 180 days
    oneTime: true,
    modal: true,
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
              expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
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
              expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
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
              expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
              description: 'Oil Crisis: Higher fuel costs'
            }
          }
        ]
      },
      {
        label: 'Reduce service temporarily',
        description: 'Cut flights to save fuel (-30% frequency)',
        effects: [
          { type: 'money', amount: -500000 } // Penalty for route cancellations
        ]
      }
    ]
  },

  excellent_ceo_hired: {
    id: 'excellent_ceo_hired',
    title: 'Excellent CEO Candidate',
    description: `A highly experienced aviation executive has approached your company about becoming CEO. They have a proven track record of increasing revenue and company reputation.

Their salary demands are high, but they're offering a 5-year contract that could transform your airline.`,
    startDate: new Date(1955, 0, 1),
    endDate: null, // Can happen anytime after 1955
    mtth: 7300, // Average every 20 years (20 * 365 days)
    oneTime: false, // Can hire multiple CEOs over time
    modal: true,
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
  }
};

// Export array of all events for easy iteration
export const ALL_EVENTS = Object.values(EVENTS);
