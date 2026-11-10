import squadsData from './squads.json';
import { Squad, PlayerCard, WorldCupEdition } from '../types/game';

const ALLOWED_EDITIONS: readonly WorldCupEdition[] = [2003, 2007, 2011, 2015, 2019, 2023];

// Ensure only allowed editions are ever loaded or accessible
export const ALL_SQUADS: Squad[] = (squadsData as Squad[]).filter((s) =>
  ALLOWED_EDITIONS.includes(s.year)
);

/**
 * Returns all available squads strictly from 2003 to 2023.
 */
export function getAllSquads(): Squad[] {
  return ALL_SQUADS;
}

/**
 * Get squad by its unique identifier (e.g. "ind_2011")
 */
export function getSquadById(id: string): Squad | undefined {
  return ALL_SQUADS.find((s) => s.id === id);
}

/**
 * Roll a random squad from the eligible pool.
 * Can accept a seeded PRNG function `() => number` or default to Math.random.
 */
export function rollRandomSquad(
  rng: () => number = Math.random,
  excludeSquadIds: string[] = []
): Squad {
  const available = ALL_SQUADS.filter((s) => !excludeSquadIds.includes(s.id));
  const pool = available.length > 0 ? available : ALL_SQUADS;
  const index = Math.floor(rng() * pool.length);
  return pool[index];
}

/**
 * Roll a random opponent squad for a specific tournament stage.
 * In later stages (QF, SF, Final), prefer drawing from top historical performers.
 */
export function rollOpponentSquad(
  stage: 'group' | 'qf' | 'sf' | 'final',
  rng: () => number = Math.random,
  excludeSquadIds: string[] = []
): Squad {
  let pool = ALL_SQUADS.filter((s) => !excludeSquadIds.includes(s.id));
  if (pool.length === 0) pool = ALL_SQUADS;

  // In knockouts, filter or bias towards high-average squads
  if (stage === 'final' || stage === 'sf') {
    const topTierSquads = pool.filter((s) => {
      // Look for squads with at least 3 players rated 88+
      const starCount = s.players.filter((p) => Math.max(p.battingRating, p.bowlingRating) >= 88).length;
      return starCount >= 3;
    });
    if (topTierSquads.length > 0) {
      pool = topTierSquads;
    }
  }

  const index = Math.floor(rng() * pool.length);
  return pool[index];
}
