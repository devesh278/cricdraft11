import React from 'react';
import { Squad, WorldCupEdition } from '../../types/game';
import { getCountryInfo } from '../../utils/countryData';
import { RefreshCw, RotateCcw } from 'lucide-react';

interface DrawnCardProps {
  squad: Squad | null;
  isRolling: boolean;
  onRerollNation: () => void;
  onRerollEdition: () => void;
  onRerollAll: () => void;
  rerollsRemaining: number;
}

export const DrawnCard: React.FC<DrawnCardProps> = ({
  squad,
  isRolling,
  onRerollNation,
  onRerollEdition,
  onRerollAll,
  rerollsRemaining,
}) => {
  if (!squad) return null;

  const countryInfo = getCountryInfo(squad.country);

  return (
    <div className="space-y-3">
      {/* 1. DRAWN SQUAD BOX (Matches 7a0.org exactly) */}
      <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
        <span className="text-[11px] font-bold uppercase tracking-widest text-stone-400 dark:text-slate-500 block mb-1">
          DRAWN
        </span>

        <div className="flex items-center gap-2.5 my-1">
          <span className="text-3xl sm:text-4xl leading-none select-none drop-shadow-sm">
            {countryInfo.flag}
          </span>
          <h2
            className={`font-headline text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none transition-all ${
              isRolling ? 'opacity-40 scale-95 blur-[1px]' : 'animate-roll-reveal'
            }`}
          >
            {squad.country}
          </h2>
        </div>

        <div
          className={`font-headline text-xl sm:text-2xl font-black text-brand-red tracking-wide uppercase transition-all ${
            isRolling ? 'opacity-40 scale-95' : 'animate-roll-reveal'
          }`}
        >
          World Cup {squad.year}
        </div>
      </div>

      {/* 2. REROLL ACTIONS (Matches 7a0.org exactly) */}
      <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-sm space-y-2">
        <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-slate-400 flex items-center justify-between">
          <span>NOT CONVINCED?</span>
          <span className="font-mono text-slate-900 dark:text-white font-bold">
            REROLL &middot; {rerollsRemaining} LEFT
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onRerollNation}
            disabled={rerollsRemaining <= 0 || isRolling}
            className={`py-2 px-2.5 rounded-xl border font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              rerollsRemaining > 0 && !isRolling
                ? 'bg-stone-50 dark:bg-slate-800 hover:bg-stone-100 border-stone-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 active:scale-95'
                : 'bg-stone-100 dark:bg-slate-800/50 border-stone-200 dark:border-slate-800 text-stone-400 dark:text-slate-600 cursor-not-allowed'
            }`}
          >
            <RefreshCw className={`w-3 h-3 ${isRolling ? 'animate-spin' : ''}`} />
            <span className="truncate">ANOTHER NATION</span>
          </button>

          <button
            onClick={onRerollEdition}
            disabled={rerollsRemaining <= 0 || isRolling}
            className={`py-2 px-2.5 rounded-xl border font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              rerollsRemaining > 0 && !isRolling
                ? 'bg-stone-50 dark:bg-slate-800 hover:bg-stone-100 border-stone-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 active:scale-95'
                : 'bg-stone-100 dark:bg-slate-800/50 border-stone-200 dark:border-slate-800 text-stone-400 dark:text-slate-600 cursor-not-allowed'
            }`}
          >
            <RotateCcw className={`w-3 h-3 ${isRolling ? 'animate-spin' : ''}`} />
            <span className="truncate">ANOTHER WC</span>
          </button>
        </div>
      </div>
    </div>
  );
};
