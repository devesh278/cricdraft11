/**
 * Core Game Types for CricDraft 11
 */

export type WorldCupEdition = 2003 | 2007 | 2011 | 2015 | 2019 | 2023;

export type PlayerRole = 'Opener' | 'Middle' | 'WK' | 'AllRounder' | 'Pace' | 'Spin';

export type DraftSlotType = 'opener1' | 'opener2' | 'middle1' | 'middle2' | 'middle3' | 'wk' | 'ar1' | 'ar2' | 'bowler1' | 'bowler2' | 'bowler3';

export interface BattingStats {
  avg: number;
  sr: number;
  runs: number;
  bigMatchRuns: number;
  bigMatchAvg: number;
}

export interface BowlingStats {
  econ: number;
  wickets: number;
  avg: number;
  bigMatchWickets: number;
}

export interface PlayerCard {
  name: string;
  shortName: string;
  canonicalId: string; // Used to prevent duplicate players across multiple years
  role: PlayerRole;
  bat: BattingStats;
  bowl: BowlingStats;
  battingRating: number; // 60-99
  bowlingRating: number; // 60-99
  cost: number;          // 60-99
  estimated?: boolean;   // True if benchmarked/estimated for uncapped reserve
}

export interface Squad {
  id: string;            // e.g. "ind_2011"
  country: string;       // e.g. "India"
  year: WorldCupEdition; // Strictly 2003, 2007, 2011, 2015, 2019, 2023
  players: PlayerCard[];
}

export interface DraftedPick {
  slot: DraftSlotType;
  player: PlayerCard;
  country: string;
  year: WorldCupEdition;
  isOutOfPosition: boolean;
  effectiveRating: number; // Normal rating or 0.75x penalty if out of position
}

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'legend';

export interface DifficultyConfig {
  name: string;
  description: string;
  rerolls: number;
  opponentStrengthMultiplier: number;
  upsetFactor: number; // Variance / unpredictability factor
  badgeColor: string;
}

export interface BudgetConfig {
  enabled: boolean;
  totalBudget: number; // Default e.g. 850
}

export type GameMode = 'classic' | 'daily';

export type TournamentStage = 'group1' | 'group2' | 'group3' | 'group4' | 'qf' | 'sf' | 'final';

export interface MatchMinimalResult {
  matchNumber: number;
  stageName: string;
  opponentSquadName: string;
  opponentYear: WorldCupEdition;
  won: boolean;
  marginText: string; // e.g. "Won by 34 runs" or "Lost by 4 wickets"
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
}

export interface TournamentProgress {
  currentStageIndex: number;
  matchesPlayed: MatchMinimalResult[];
  isCompleted: boolean;
  isChampion: boolean; // perfect undefeated record
  isEliminated: boolean;
}

export interface TournamentUserMVP {
  topBatter: {
    name: string;
    runs: number;
    year: WorldCupEdition;
  };
  topBowler: {
    name: string;
    wickets: number;
    year: WorldCupEdition;
  };
}
