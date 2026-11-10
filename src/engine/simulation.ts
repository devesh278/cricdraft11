/**
 * CricDraft 11 - Match Simulation Engine
 *
 * Simulates a full ODI World Cup match between the user's drafted XI
 * and an opponent squad, adhering to strict design rules:
 *
 * 1. Team batting & bowling strengths calculated from tournament ratings
 *    (including the 0.75x penalty for out-of-position picks).
 * 2. Opponent strength adjusted by difficulty multiplier.
 * 3. Controlled randomness with pitch variance and upset factor.
 * 4. Realistic coin toss and batting first vs chasing dynamics.
 * 5. Tie-break resolution (Super Over) for tied scores.
 * 6. Minimal output: only Result + Margin, Match Top Scorer, Match Top Wicket-taker.
 */

import { DraftedPick, Squad, DifficultyConfig, WorldCupEdition } from '../types/game';

export interface PlayerMatchPerformance {
  name: string;
  canonicalId: string;
  runs: number;
  wickets: number;
}

export interface MatchSimulationOutput {
  won: boolean;
  marginText: string;
  opponentSquadName: string;
  opponentYear: WorldCupEdition;
  topRunScorer: {
    name: string;
    runs: number;
    team: 'player' | 'opponent';
  };
  topWicketTaker: {
    name: string;
    wickets: number;
    team: 'player' | 'opponent';
  };
  // Detailed player logs preserved for tournament total stats (Top Batter/Bowler MVPs)
  userPlayerPerformances: PlayerMatchPerformance[];
}

/**
 * Validates roster before simulation:
 * - Must have exactly 11 players
 * - At least 1 Wicketkeeper (WK)
 * - At least 5 bowling options (Bowlers: Pace/Spin or AllRounders)
 */
export function validateRoster(picks: DraftedPick[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (picks.length !== 11) {
    errors.push(`Roster incomplete: 11 players required (currently ${picks.length}/11).`);
  }

  const hasWK = picks.some((p) => p.player.role === 'WK');
  if (!hasWK) {
    errors.push('Invalid XI: Must have at least 1 Wicketkeeper (WK).');
  }

  const bowlingOptions = picks.filter(
    (p) => p.player.role === 'Pace' || p.player.role === 'Spin' || p.player.role === 'AllRounder'
  );
  if (bowlingOptions.length < 5) {
    errors.push(`Invalid XI: Need at least 5 bowling options (currently ${bowlingOptions.length}).`);
  }

  // Duplicate check
  const playerIds = new Set<string>();
  for (const pick of picks) {
    const id = pick.player.canonicalId || pick.player.name;
    if (playerIds.has(id)) {
      errors.push(`Duplicate player detected: ${pick.player.name} cannot appear twice in the XI.`);
    }
    playerIds.add(id);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Compute team batting strength:
 * Sums the effective batting rating of top order and middle order.
 */
export function calculateBattingStrength(picks: DraftedPick[]): number {
  return picks.reduce((sum, pick) => {
    // Effective rating already factors in 0.75x penalty if out of position
    const rating = pick.isOutOfPosition
      ? Math.round(pick.player.battingRating * 0.75)
      : pick.player.battingRating;
    return sum + rating;
  }, 0) / picks.length;
}

/**
 * Compute team bowling strength:
 * Identifies the top 5 bowling options in the squad and calculates their average.
 */
export function calculateBowlingStrength(picks: DraftedPick[]): number {
  const bowlers = picks
    .map((p) => {
      const eff = p.isOutOfPosition
        ? Math.round(p.player.bowlingRating * 0.75)
        : p.player.bowlingRating;
      return eff;
    })
    .sort((a, b) => b - a);

  // Take top 5 bowling options (each bowls 10 overs in a 50-over ODI)
  const top5 = bowlers.slice(0, 5);
  const avg = top5.reduce((sum, r) => sum + r, 0) / 5;
  return avg;
}

/**
 * Computes opponent squad strengths adjusted by difficulty multiplier.
 */
export function calculateOpponentStrengths(
  opponent: Squad,
  difficulty: DifficultyConfig
): { battingStrength: number; bowlingStrength: number } {
  // Opponent uses top 7 batters for batting strength
  const batRatings = opponent.players
    .map((p) => p.battingRating)
    .sort((a, b) => b - a)
    .slice(0, 7);
  const rawBat = batRatings.reduce((s, r) => s + r, 0) / 7;

  // Opponent uses top 5 bowlers for bowling strength
  const bowlRatings = opponent.players
    .map((p) => p.bowlingRating)
    .sort((a, b) => b - a)
    .slice(0, 5);
  const rawBowl = bowlRatings.reduce((s, r) => s + r, 0) / 5;

  return {
    battingStrength: rawBat * difficulty.opponentStrengthMultiplier,
    bowlingStrength: rawBowl * difficulty.opponentStrengthMultiplier,
  };
}

/**
 * Simulates a single ODI match between user XI and opponent squad.
 */
export function simulateMatch(
  userPicks: DraftedPick[],
  opponent: Squad,
  difficulty: DifficultyConfig,
  rng: () => number = Math.random
): MatchSimulationOutput {
  // 1. Calculate base ratings
  const userBat = calculateBattingStrength(userPicks);
  const userBowl = calculateBowlingStrength(userPicks);

  const { battingStrength: oppBat, bowlingStrength: oppBowl } = calculateOpponentStrengths(
    opponent,
    difficulty
  );

  // 2. Pitch & Conditions Factor (typical ODI par score ~ 275)
  // Pitch condition factor varies between 0.92 (bowling pitch) and 1.12 (batting pitch)
  const pitchFactor = 0.92 + rng() * 0.20;

  // 3. Toss Simulation
  // True = User bats first, False = Opponent bats first
  const userBatsFirst = rng() > 0.5;

  // 4. Random variance / Upset factor (based on difficulty)
  // Higher upset factor creates wider swing possibilities
  const upsetRange = difficulty.upsetFactor;
  const userBatVariance = 1 + (rng() * 2 - 1) * upsetRange;
  const oppBatVariance = 1 + (rng() * 2 - 1) * upsetRange;

  // 5. Inning 1 Simulation (Setting the Target)
  let inn1Score: number;
  let inn1Wickets: number;

  if (userBatsFirst) {
    // User sets target against Opponent bowling
    const scoreDiff = (userBat * userBatVariance) - (oppBowl * 0.95);
    const baseTotal = 270 + scoreDiff * 2.2;
    inn1Score = Math.max(140, Math.round(baseTotal * pitchFactor));
    inn1Wickets = Math.min(10, Math.max(3, Math.round(10 - (userBat / 15) + (rng() * 4))));
  } else {
    // Opponent sets target against User bowling
    const scoreDiff = (oppBat * oppBatVariance) - (userBowl * 0.95);
    const baseTotal = 270 + scoreDiff * 2.2;
    inn1Score = Math.max(140, Math.round(baseTotal * pitchFactor));
    inn1Wickets = Math.min(10, Math.max(3, Math.round(10 - (oppBat / 15) + (rng() * 4))));
  }

  // 6. Inning 2 Simulation (Chasing the Target)
  let inn2Score: number;
  let inn2Wickets: number;
  let won: boolean;
  let marginText: string;

  if (userBatsFirst) {
    // Opponent chases Target (inn1Score + 1)
    const target = inn1Score + 1;
    const chasePace = (oppBat * oppBatVariance) / (userBowl * 1.0);
    // Chase progression variance
    const chaseFactor = chasePace + (rng() * 0.20 - 0.10);
    const projectedChase = Math.round(inn1Score * chaseFactor);

    if (projectedChase >= target) {
      // Opponent wins chase
      won = false;
      inn2Score = target + Math.floor(rng() * 4); // Hits boundary to win
      inn2Wickets = Math.floor(3 + rng() * 6); // 3 to 8 wickets down
      const wktsLeft = 10 - inn2Wickets;
      marginText = `Lost by ${wktsLeft} wicket${wktsLeft > 1 ? 's' : ''}`;
    } else if (projectedChase === inn1Score) {
      // Tied Match -> Super Over!
      const userSuperOverRuns = Math.floor(10 + rng() * 15);
      const oppSuperOverRuns = Math.floor(10 + rng() * 14);
      if (userSuperOverRuns >= oppSuperOverRuns) {
        won = true;
        marginText = `Won via Super Over (${userSuperOverRuns} vs ${oppSuperOverRuns})`;
      } else {
        won = false;
        marginText = `Lost via Super Over (${oppSuperOverRuns} vs ${userSuperOverRuns})`;
      }
      inn2Score = inn1Score;
      inn2Wickets = 10;
    } else {
      // User defends target
      won = true;
      inn2Score = projectedChase;
      const marginRuns = inn1Score - inn2Score;
      inn2Wickets = marginRuns > 40 ? 10 : Math.floor(7 + rng() * 4); // Often bowled out
      marginText = `Won by ${marginRuns} run${marginRuns > 1 ? 's' : ''}`;
    }
  } else {
    // User chases Opponent's Target (inn1Score + 1)
    const target = inn1Score + 1;
    const chasePace = (userBat * userBatVariance) / (oppBowl * 1.0);
    const chaseFactor = chasePace + (rng() * 0.20 - 0.10);
    const projectedChase = Math.round(inn1Score * chaseFactor);

    if (projectedChase >= target) {
      // User successfully chases target!
      won = true;
      inn2Score = target + Math.floor(rng() * 4);
      inn2Wickets = Math.floor(2 + rng() * 6); // Wickets lost
      const wktsLeft = 10 - inn2Wickets;
      marginText = `Won by ${wktsLeft} wicket${wktsLeft > 1 ? 's' : ''}`;
    } else if (projectedChase === inn1Score) {
      // Tied Match -> Super Over!
      const userSuperOverRuns = Math.floor(10 + rng() * 15);
      const oppSuperOverRuns = Math.floor(10 + rng() * 14);
      if (userSuperOverRuns >= oppSuperOverRuns) {
        won = true;
        marginText = `Won via Super Over (${userSuperOverRuns} vs ${oppSuperOverRuns})`;
      } else {
        won = false;
        marginText = `Lost via Super Over (${oppSuperOverRuns} vs ${userSuperOverRuns})`;
      }
      inn2Score = inn1Score;
      inn2Wickets = 10;
    } else {
      // User fails in chase
      won = false;
      inn2Score = projectedChase;
      const marginRuns = inn1Score - inn2Score;
      inn2Wickets = marginRuns > 35 ? 10 : Math.floor(8 + rng() * 3);
      marginText = `Lost by ${marginRuns} run${marginRuns > 1 ? 's' : ''}`;
    }
  }

  // 7. Individual Player Stats Breakdown
  // Generates individual scores for user and opponent to find match highest run-scorer & wicket-taker
  const userTeamScore = userBatsFirst ? inn1Score : inn2Score;
  const oppTeamScore = userBatsFirst ? inn2Score : inn1Score;
  const userTeamWickets = userBatsFirst ? inn1Wickets : inn2Wickets;
  const oppTeamWickets = userBatsFirst ? inn2Wickets : inn1Wickets;

  // Distribute user team runs among batters
  const userPlayerPerformances: PlayerMatchPerformance[] = [];
  const userBatWeights = userPicks.map((p, idx) => {
    // Top order gets more weight, scaled by batting rating
    const posMultiplier = idx < 2 ? 1.4 : idx < 5 ? 1.2 : idx < 7 ? 0.9 : 0.4;
    return Math.max(1, (p.player.battingRating - 50) * posMultiplier * (0.6 + rng() * 0.8));
  });
  const totalUserWeight = userBatWeights.reduce((s, w) => s + w, 0);

  // Distribute user team wickets among bowlers
  const userBowlers = userPicks.filter(
    (p) => p.player.role === 'Pace' || p.player.role === 'Spin' || p.player.role === 'AllRounder'
  );
  const bowlerWktCount = new Map<string, number>();
  let remainingWkts = oppTeamWickets;
  const bowlWeights = userBowlers.map((b) => Math.max(1, (b.player.bowlingRating - 55) * (0.7 + rng() * 0.6)));
  const totalBowlWeight = bowlWeights.reduce((s, w) => s + w, 0);

  userBowlers.forEach((b, idx) => {
    if (remainingWkts <= 0) {
      bowlerWktCount.set(b.player.canonicalId, 0);
      return;
    }
    const share = bowlWeights[idx] / totalBowlWeight;
    const wkts = Math.min(5, Math.min(remainingWkts, Math.round(oppTeamWickets * share + (rng() * 1.5 - 0.7))));
    bowlerWktCount.set(b.player.canonicalId, Math.max(0, wkts));
  });

  userPicks.forEach((pick, idx) => {
    const runShare = userBatWeights[idx] / totalUserWeight;
    let runs = Math.round(userTeamScore * runShare);
    // Add anchor innings potential
    if (runs > 120) runs = 115 + Math.floor(rng() * 15);
    const wkts = bowlerWktCount.get(pick.player.canonicalId) || 0;

    userPlayerPerformances.push({
      name: pick.player.name,
      canonicalId: pick.player.canonicalId,
      runs,
      wickets: wkts,
    });
  });

  // Distribute opponent team runs & wickets
  const oppBatWeights = opponent.players.slice(0, 11).map((p, idx) => {
    const posMultiplier = idx < 2 ? 1.4 : idx < 5 ? 1.2 : idx < 7 ? 0.9 : 0.4;
    return Math.max(1, (p.battingRating - 50) * posMultiplier * (0.6 + rng() * 0.8));
  });
  const totalOppWeight = oppBatWeights.reduce((s, w) => s + w, 0);

  const oppPerformances = opponent.players.slice(0, 11).map((p, idx) => {
    const runShare = oppBatWeights[idx] / totalOppWeight;
    let runs = Math.round(oppTeamScore * runShare);
    if (runs > 120) runs = 110 + Math.floor(rng() * 20);
    return { name: p.name, runs };
  });

  // Opponent top wicket taker
  const oppBowlers = opponent.players
    .filter((p) => p.role === 'Pace' || p.role === 'Spin' || p.role === 'AllRounder')
    .slice(0, 5);
  let oppRemainingWkts = userTeamWickets;
  const oppBowlPerformances = oppBowlers.map((p) => {
    if (oppRemainingWkts <= 0) return { name: p.name, wickets: 0 };
    const wkts = Math.min(5, Math.min(oppRemainingWkts, Math.floor(rng() * 3 + 1)));
    oppRemainingWkts -= wkts;
    return { name: p.name, wickets: Math.max(0, wkts) };
  });

  // 8. Find Match Top Scorer
  const bestUserBatter = [...userPlayerPerformances].sort((a, b) => b.runs - a.runs)[0];
  const bestOppBatter = [...oppPerformances].sort((a, b) => b.runs - a.runs)[0];

  const topRunScorer =
    bestUserBatter.runs >= bestOppBatter.runs
      ? { name: bestUserBatter.name, runs: bestUserBatter.runs, team: 'player' as const }
      : { name: bestOppBatter.name, runs: bestOppBatter.runs, team: 'opponent' as const };

  // 9. Find Match Top Wicket-taker
  const bestUserBowler = [...userPlayerPerformances].sort((a, b) => b.wickets - a.wickets)[0];
  const bestOppBowler = [...oppBowlPerformances].sort((a, b) => b.wickets - a.wickets)[0];

  const topWicketTaker =
    (bestUserBowler?.wickets || 0) >= (bestOppBowler?.wickets || 0)
      ? { name: bestUserBowler?.name || 'Bowler', wickets: bestUserBowler?.wickets || 0, team: 'player' as const }
      : { name: bestOppBowler.name, wickets: bestOppBowler.wickets, team: 'opponent' as const };

  return {
    won,
    marginText,
    opponentSquadName: opponent.country,
    opponentYear: opponent.year,
    topRunScorer,
    topWicketTaker,
    userPlayerPerformances,
  };
}
