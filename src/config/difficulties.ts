import { DifficultyConfig, DifficultyLevel } from '../types/game';

export const DIFFICULTIES: Record<DifficultyLevel, DifficultyConfig> = {
  easy: {
    name: 'Easy',
    description: 'Forgiving draft with 5 rerolls, lower opponent strength, and low upset volatility.',
    rerolls: 5,
    opponentStrengthMultiplier: 0.90,
    upsetFactor: 0.08,
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  medium: {
    name: 'Medium',
    description: 'Balanced challenge with 3 rerolls and authentic World Cup level competition.',
    rerolls: 3,
    opponentStrengthMultiplier: 1.00,
    upsetFactor: 0.15,
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  hard: {
    name: 'Hard',
    description: 'Tough tournament test with just 1 reroll and aggressive opponent batting & bowling.',
    rerolls: 1,
    opponentStrengthMultiplier: 1.08,
    upsetFactor: 0.22,
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
  legend: {
    name: 'Legend',
    description: 'Brutal championship trial. 0 rerolls, boosted opponents, high upset danger.',
    rerolls: 0,
    opponentStrengthMultiplier: 1.15,
    upsetFactor: 0.28,
    badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  },
};

export const DEFAULT_BUDGET = 850; // Cap: 850 points across 11 players (~avg 77.2 per pick)
export const MIN_BUDGET = 720;
export const MAX_BUDGET = 950;
