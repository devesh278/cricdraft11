/**
 * CricDraft 11 - Rating Calculation Weights & Configuration
 *
 * Keeps all formula weights and minimum-sample thresholds in one single place.
 */

export const RATING_CONFIG = {
  // Batters need at least 3 innings, bowlers need at least 20 overs
  minSample: {
    batterInnings: 3,
    bowlerOvers: 20,
  },

  // Formula weights (Sum = 1.0)
  weights: {
    batter: {
      average: 0.30,
      strikeRate: 0.25,
      totalRuns: 0.20,
      bigMatch: 0.25,
    },
    bowler: {
      wickets: 0.30,
      economy: 0.25,      // Inverted: lower economy yields higher rating
      bowlingAvg: 0.20,   // Inverted: lower average yields higher rating
      bigMatchWickets: 0.25,
    },
  },

  // Rating and Cost bounds
  scale: {
    minRating: 60,
    maxRating: 99,
  },

  // Out of position penalty
  outOfPositionPenalty: 0.75, // Effective rating multiplier (x0.75)

  // Allowed tournament years strictly
  allowedEditions: [2003, 2007, 2011, 2015, 2019, 2023] as const,
};
