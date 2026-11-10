/**
 * Seeded Pseudo-Random Number Generator (Mulberry32)
 *
 * Provides deterministic pseudo-random sequences for:
 * 1. Daily Challenge mode (seeded by date YYYY-MM-DD)
 * 2. Reproducible tournament and match simulations
 */

export function createRng(seed: number): () => number {
  let s = Math.floor(seed) >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Hash a string (such as "2026-11-10") to a 32-bit unsigned integer seed.
 */
export function hashStringToSeed(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

/**
 * Returns today's ISO date string in YYYY-MM-DD format (local).
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Create an RNG seeded for today's daily challenge.
 */
export function createDailyRng(dateStr: string = getTodayDateString()): () => number {
  const seed = hashStringToSeed('cricdraft_daily_' + dateStr);
  return createRng(seed);
}
