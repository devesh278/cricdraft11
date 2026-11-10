/**
 * CricDraft 11 - Tournament Progression System
 *
 * 7-Match Path:
 * - Match 1: Group Match 1
 * - Match 2: Group Match 2
 * - Match 3: Group Match 3
 * - Match 4: Group Match 4
 * - Match 5: Quarter-Final (Knockout)
 * - Match 6: Semi-Final (Knockout)
 * - Match 7: Final (Knockout)
 *
 * Rules:
 * - A knockout loss immediately ends the tournament.
 * - Group stage: Top 2 advance to knockouts (need at least 2 wins in group to qualify).
 * - Winning all 7 matches achieves the coveted World Cup Champion glory!
 */

import { Squad, MatchMinimalResult, TournamentUserMVP, WorldCupEdition } from '../types/game';
import { rollOpponentSquad } from '../data/squadService';

export interface StageDefinition {
  index: number;
  id: string;
  name: string;
  shortName: string;
  isKnockout: boolean;
}

export const TOURNAMENT_STAGES: StageDefinition[] = [
  { index: 0, id: 'group1', name: 'Group Match 1', shortName: 'GRP 1', isKnockout: false },
  { index: 1, id: 'group2', name: 'Group Match 2', shortName: 'GRP 2', isKnockout: false },
  { index: 2, id: 'group3', name: 'Group Match 3', shortName: 'GRP 3', isKnockout: false },
  { index: 3, id: 'group4', name: 'Group Match 4', shortName: 'GRP 4', isKnockout: false },
  { index: 4, id: 'qf', name: 'Quarter-Final', shortName: 'QF', isKnockout: true },
  { index: 5, id: 'sf', name: 'Semi-Final', shortName: 'SF', isKnockout: true },
  { index: 6, id: 'final', name: 'World Cup Final', shortName: 'FINAL', isKnockout: true },
];

export interface TournamentState {
  currentStageIndex: number;
  matchResults: MatchMinimalResult[];
  userTournamentStats: Map<string, { name: string; runs: number; wickets: number; year: WorldCupEdition }>;
  opponentsByStage: Squad[];
  isCompleted: boolean;
  isChampion: boolean;
  isEliminated: boolean;
  eliminationStageName?: string;
}

/**
 * Initializes a new tournament run with pre-seeded opponent squads for all 7 matches.
 */
export function initializeTournament(rng: () => number = Math.random): TournamentState {
  const opponents: Squad[] = [];
  const usedSquadIds: string[] = [];

  // Group 1-4
  for (let i = 0; i < 4; i++) {
    const opp = rollOpponentSquad('group', rng, usedSquadIds);
    usedSquadIds.push(opp.id);
    opponents.push(opp);
  }

  // QF
  const qfOpp = rollOpponentSquad('qf', rng, usedSquadIds);
  usedSquadIds.push(qfOpp.id);
  opponents.push(qfOpp);

  // SF
  const sfOpp = rollOpponentSquad('sf', rng, usedSquadIds);
  usedSquadIds.push(sfOpp.id);
  opponents.push(sfOpp);

  // Final
  const finalOpp = rollOpponentSquad('final', rng, usedSquadIds);
  usedSquadIds.push(finalOpp.id);
  opponents.push(finalOpp);

  return {
    currentStageIndex: 0,
    matchResults: [],
    userTournamentStats: new Map(),
    opponentsByStage: opponents,
    isCompleted: false,
    isChampion: false,
    isEliminated: false,
  };
}

/**
 * Processes the outcome of a match and advances tournament state.
 */
export function processMatchOutcome(
  currentState: TournamentState,
  matchResult: MatchMinimalResult,
  userPlayerPerformances: { canonicalId: string; name: string; runs: number; wickets: number }[],
  userXIYearMap: Map<string, WorldCupEdition>
): TournamentState {
  const stage = TOURNAMENT_STAGES[currentState.currentStageIndex];
  const nextResults = [...currentState.matchResults, matchResult];

  // Update cumulative user player stats
  const nextUserStats = new Map(currentState.userTournamentStats);
  userPlayerPerformances.forEach((p) => {
    const prev = nextUserStats.get(p.canonicalId) || {
      name: p.name,
      runs: 0,
      wickets: 0,
      year: userXIYearMap.get(p.canonicalId) || 2023,
    };
    nextUserStats.set(p.canonicalId, {
      name: p.name,
      runs: prev.runs + p.runs,
      wickets: prev.wickets + p.wickets,
      year: prev.year,
    });
  });

  // Check elimination conditions
  if (stage.isKnockout && !matchResult.won) {
    // Knockout loss = Elimination!
    return {
      ...currentState,
      matchResults: nextResults,
      userTournamentStats: nextUserStats,
      isCompleted: true,
      isEliminated: true,
      isChampion: false,
      eliminationStageName: stage.name,
    };
  }

  // If after group stage (4 matches), check if user qualified (needs >= 2 wins)
  if (currentState.currentStageIndex === 3) {
    const groupWins = nextResults.filter((m) => m.won).length;
    if (groupWins < 2) {
      return {
        ...currentState,
        matchResults: nextResults,
        userTournamentStats: nextUserStats,
        isCompleted: true,
        isEliminated: true,
        isChampion: false,
        eliminationStageName: 'Group Stage (Failed to Qualify)',
      };
    }
  }

  // Final match check
  if (currentState.currentStageIndex === 6) {
    const wonFinal = matchResult.won;
    const winsCount = nextResults.filter((m) => m.won).length;
    return {
      ...currentState,
      matchResults: nextResults,
      userTournamentStats: nextUserStats,
      isCompleted: true,
      isEliminated: !wonFinal,
      isChampion: wonFinal && winsCount === 7,
      eliminationStageName: wonFinal ? undefined : 'World Cup Final',
    };
  }

  // Advance to next stage
  return {
    ...currentState,
    currentStageIndex: currentState.currentStageIndex + 1,
    matchResults: nextResults,
    userTournamentStats: nextUserStats,
  };
}

/**
 * Computes tournament MVPs from the user's XI:
 * Top run-scorer across all tournament matches
 * Top wicket-taker across all tournament matches
 */
export function computeTournamentMVPs(
  statsMap: Map<string, { name: string; runs: number; wickets: number; year: WorldCupEdition }>
): TournamentUserMVP {
  const list = Array.from(statsMap.values());

  const topBatter = [...list].sort((a, b) => b.runs - a.runs)[0] || {
    name: 'Batter',
    runs: 0,
    year: 2023 as WorldCupEdition,
  };

  const topBowler = [...list].sort((a, b) => b.wickets - a.wickets)[0] || {
    name: 'Bowler',
    wickets: 0,
    year: 2023 as WorldCupEdition,
  };

  return {
    topBatter: {
      name: topBatter.name,
      runs: topBatter.runs,
      year: topBatter.year,
    },
    topBowler: {
      name: topBowler.name,
      wickets: topBowler.wickets,
      year: topBowler.year,
    },
  };
}
