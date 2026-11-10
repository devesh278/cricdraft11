import { describe, it, expect } from 'vitest';
import {
  validateRoster,
  calculateBattingStrength,
  calculateBowlingStrength,
  simulateMatch,
} from './simulation';
import { DraftedPick, Squad, PlayerCard } from '../types/game';
import { DIFFICULTIES } from '../config/difficulties';
import { createRng } from './seededRandom';

// Test fixtures
function createMockPlayer(
  name: string,
  id: string,
  role: PlayerCard['role'],
  battingRating = 75,
  bowlingRating = 60
): PlayerCard {
  return {
    name,
    shortName: name,
    canonicalId: id,
    role,
    bat: { avg: 40, sr: 90, runs: 350, bigMatchRuns: 100, bigMatchAvg: 50 },
    bowl: { econ: 5.0, wickets: 10, avg: 25.0, bigMatchWickets: 5 },
    battingRating,
    bowlingRating,
    cost: battingRating,
  };
}

function createValidPicks(): DraftedPick[] {
  return [
    { slot: 'opener1', player: createMockPlayer('Opener 1', 'op1', 'Opener', 85, 60), country: 'India', year: 2011, isOutOfPosition: false, effectiveRating: 85 },
    { slot: 'opener2', player: createMockPlayer('Opener 2', 'op2', 'Opener', 82, 60), country: 'India', year: 2011, isOutOfPosition: false, effectiveRating: 82 },
    { slot: 'middle1', player: createMockPlayer('Middle 1', 'mid1', 'Middle', 88, 60), country: 'India', year: 2011, isOutOfPosition: false, effectiveRating: 88 },
    { slot: 'middle2', player: createMockPlayer('Middle 2', 'mid2', 'Middle', 80, 60), country: 'India', year: 2011, isOutOfPosition: false, effectiveRating: 80 },
    { slot: 'middle3', player: createMockPlayer('Middle 3', 'mid3', 'Middle', 78, 60), country: 'India', year: 2011, isOutOfPosition: false, effectiveRating: 78 },
    { slot: 'wk', player: createMockPlayer('Wicketkeeper', 'wk1', 'WK', 84, 60), country: 'India', year: 2011, isOutOfPosition: false, effectiveRating: 84 },
    { slot: 'ar1', player: createMockPlayer('AllRounder 1', 'ar1', 'AllRounder', 82, 80), country: 'India', year: 2011, isOutOfPosition: false, effectiveRating: 82 },
    { slot: 'ar2', player: createMockPlayer('AllRounder 2', 'ar2', 'AllRounder', 76, 78), country: 'India', year: 2011, isOutOfPosition: false, effectiveRating: 76 },
    { slot: 'bowler1', player: createMockPlayer('Bowler 1', 'bowl1', 'Pace', 60, 90), country: 'India', year: 2011, isOutOfPosition: false, effectiveRating: 90 },
    { slot: 'bowler2', player: createMockPlayer('Bowler 2', 'bowl2', 'Pace', 60, 86), country: 'India', year: 2011, isOutOfPosition: false, effectiveRating: 86 },
    { slot: 'bowler3', player: createMockPlayer('Bowler 3', 'bowl3', 'Spin', 60, 84), country: 'India', year: 2011, isOutOfPosition: false, effectiveRating: 84 },
  ];
}

function createMockOpponentSquad(): Squad {
  const players: PlayerCard[] = [
    createMockPlayer('Opp Opener 1', 'opp_op1', 'Opener', 82, 60),
    createMockPlayer('Opp Opener 2', 'opp_op2', 'Opener', 80, 60),
    createMockPlayer('Opp Middle 1', 'opp_mid1', 'Middle', 85, 60),
    createMockPlayer('Opp Middle 2', 'opp_mid2', 'Middle', 78, 60),
    createMockPlayer('Opp Middle 3', 'opp_mid3', 'Middle', 75, 60),
    createMockPlayer('Opp WK', 'opp_wk', 'WK', 80, 60),
    createMockPlayer('Opp AR 1', 'opp_ar1', 'AllRounder', 78, 76),
    createMockPlayer('Opp AR 2', 'opp_ar2', 'AllRounder', 74, 75),
    createMockPlayer('Opp Bowler 1', 'opp_bw1', 'Pace', 60, 88),
    createMockPlayer('Opp Bowler 2', 'opp_bw2', 'Pace', 60, 84),
    createMockPlayer('Opp Bowler 3', 'opp_bw3', 'Spin', 60, 82),
    createMockPlayer('Opp Res 1', 'opp_res1', 'Middle', 70, 60),
    createMockPlayer('Opp Res 2', 'opp_res2', 'Pace', 60, 72),
    createMockPlayer('Opp Res 3', 'opp_res3', 'Spin', 60, 70),
    createMockPlayer('Opp Res 4', 'opp_res4', 'Pace', 60, 68),
  ];

  return {
    id: 'aus_2015',
    country: 'Australia',
    year: 2015,
    players,
  };
}

describe('Match Simulation Engine Tests', () => {
  describe('validateRoster', () => {
    it('passes for a valid complete 11 with WK and 5 bowlers', () => {
      const picks = createValidPicks();
      const res = validateRoster(picks);
      expect(res.valid).toBe(true);
      expect(res.errors).toHaveLength(0);
    });

    it('fails when less than 11 players are drafted', () => {
      const picks = createValidPicks().slice(0, 10);
      const res = validateRoster(picks);
      expect(res.valid).toBe(false);
      expect(res.errors[0]).toContain('11 players required');
    });

    it('fails when no wicketkeeper is in the roster', () => {
      const picks = createValidPicks();
      // Replace WK with Middle
      picks[5] = {
        slot: 'wk',
        player: createMockPlayer('Pure Batter', 'bat_nowk', 'Middle', 80, 60),
        country: 'India',
        year: 2011,
        isOutOfPosition: true,
        effectiveRating: 60,
      };
      const res = validateRoster(picks);
      expect(res.valid).toBe(false);
      expect(res.errors.some((e) => e.includes('Wicketkeeper'))).toBe(true);
    });

    it('fails when fewer than 5 bowling options are present', () => {
      const picks = createValidPicks();
      // Replace bowler1 with a Middle order pure batter
      picks[8] = {
        slot: 'bowler1',
        player: createMockPlayer('Pure Batter 2', 'bat_nobowl', 'Middle', 80, 60),
        country: 'India',
        year: 2011,
        isOutOfPosition: true,
        effectiveRating: 60,
      };
      const res = validateRoster(picks);
      expect(res.valid).toBe(false);
      expect(res.errors.some((e) => e.includes('bowling options'))).toBe(true);
    });

    it('fails when the same player appears twice even under different years', () => {
      const picks = createValidPicks();
      // Duplicate opener 1 into middle 1 slot
      picks[2] = {
        ...picks[0],
        slot: 'middle1',
        year: 2015, // Same canonicalId, different year
      };
      const res = validateRoster(picks);
      expect(res.valid).toBe(false);
      expect(res.errors.some((e) => e.includes('Duplicate player'))).toBe(true);
    });
  });

  describe('Rating Calculations & Out of Position Penalty', () => {
    it('applies 0.75x penalty to out of position picks', () => {
      const picks = createValidPicks();
      const normalBat = calculateBattingStrength(picks);

      // Make opener 1 out of position
      picks[0].isOutOfPosition = true;
      const penalizedBat = calculateBattingStrength(picks);

      expect(penalizedBat).toBeLessThan(normalBat);
    });

    it('computes bowling strength from top 5 bowling options', () => {
      const picks = createValidPicks();
      const bowlStrength = calculateBowlingStrength(picks);
      expect(bowlStrength).toBeGreaterThanOrEqual(75);
      expect(bowlStrength).toBeLessThanOrEqual(95);
    });
  });

  describe('simulateMatch', () => {
    it('produces strict minimal match output with Result, Top Scorer, and Top Wicket-taker', () => {
      const picks = createValidPicks();
      const opponent = createMockOpponentSquad();
      const rng = createRng(12345);

      const result = simulateMatch(picks, opponent, DIFFICULTIES.medium, rng);

      // Verify minimal result structure
      expect(result).toHaveProperty('won');
      expect(typeof result.won).toBe('boolean');
      expect(result.marginText).toMatch(/(Won by|Lost by|Super Over)/);

      expect(result.topRunScorer).toBeDefined();
      expect(result.topRunScorer.name).toBeTypeOf('string');
      expect(result.topRunScorer.runs).toBeGreaterThan(0);
      expect(['player', 'opponent']).toContain(result.topRunScorer.team);

      expect(result.topWicketTaker).toBeDefined();
      expect(result.topWicketTaker.name).toBeTypeOf('string');
      expect(result.topWicketTaker.wickets).toBeGreaterThanOrEqual(0);
      expect(['player', 'opponent']).toContain(result.topWicketTaker.team);

      // Preserves individual user player logs for tournament MVPs
      expect(result.userPlayerPerformances).toHaveLength(11);
    });

    it('is deterministic when given the same seed RNG', () => {
      const picks = createValidPicks();
      const opponent = createMockOpponentSquad();

      const run1 = simulateMatch(picks, opponent, DIFFICULTIES.medium, createRng(99999));
      const run2 = simulateMatch(picks, opponent, DIFFICULTIES.medium, createRng(99999));

      expect(run1.won).toBe(run2.won);
      expect(run1.marginText).toBe(run2.marginText);
      expect(run1.topRunScorer.name).toBe(run2.topRunScorer.name);
      expect(run1.topRunScorer.runs).toBe(run2.topRunScorer.runs);
      expect(run1.topWicketTaker.name).toBe(run2.topWicketTaker.name);
      expect(run1.topWicketTaker.wickets).toBe(run2.topWicketTaker.wickets);
    });
  });
});
