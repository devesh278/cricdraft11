import React, { useState, useEffect } from 'react';
import { RefreshCw, Sparkles, Shield, Dices } from 'lucide-react';
import { WorldCupEdition, Squad } from '../../types/game';

interface RollAnimationProps {
  currentSquad: Squad | null;
  isRolling: boolean;
  onReroll: () => void;
  rerollsRemaining: number;
  maxRerolls: number;
  pickCount: number; // 0 to 11
}

const COUNTRY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  India: { bg: 'from-blue-600 to-sky-700', text: 'text-sky-300', border: 'border-blue-500/40' },
  Australia: { bg: 'from-amber-500 to-yellow-600', text: 'text-amber-300', border: 'border-amber-500/40' },
  England: { bg: 'from-red-600 to-rose-700', text: 'text-rose-300', border: 'border-red-500/40' },
  'South Africa': { bg: 'from-emerald-600 to-green-700', text: 'text-emerald-300', border: 'border-emerald-500/40' },
  'New Zealand': { bg: 'from-zinc-800 to-black', text: 'text-zinc-200', border: 'border-zinc-500/40' },
  Pakistan: { bg: 'from-emerald-700 to-teal-800', text: 'text-teal-300', border: 'border-emerald-600/40' },
  'Sri Lanka': { bg: 'from-blue-700 to-indigo-800', text: 'text-indigo-300', border: 'border-blue-500/40' },
  'West Indies': { bg: 'from-rose-800 to-amber-800', text: 'text-amber-200', border: 'border-rose-600/40' },
  Bangladesh: { bg: 'from-green-700 to-red-800', text: 'text-emerald-200', border: 'border-green-600/40' },
};

const SAMPLE_COUNTRIES = ['India', 'Australia', 'England', 'South Africa', 'New Zealand', 'Pakistan', 'Sri Lanka', 'West Indies'];
const SAMPLE_YEARS: WorldCupEdition[] = [2003, 2007, 2011, 2015, 2019, 2023];

export const RollAnimation: React.FC<RollAnimationProps> = ({
  currentSquad,
  isRolling,
  onReroll,
  rerollsRemaining,
  maxRerolls,
  pickCount,
}) => {
  const [displayCountry, setDisplayCountry] = useState(currentSquad?.country || 'India');
  const [displayYear, setDisplayYear] = useState<WorldCupEdition>(currentSquad?.year || 2011);

  // Shuffling animation effect during roll
  useEffect(() => {
    if (!isRolling) {
      if (currentSquad) {
        setDisplayCountry(currentSquad.country);
        setDisplayYear(currentSquad.year);
      }
      return;
    }

    const interval = setInterval(() => {
      const randomCountry = SAMPLE_COUNTRIES[Math.floor(Math.random() * SAMPLE_COUNTRIES.length)];
      const randomYear = SAMPLE_YEARS[Math.floor(Math.random() * SAMPLE_YEARS.length)];
      setDisplayCountry(randomCountry);
      setDisplayYear(randomYear);
    }, 70);

    return () => clearInterval(interval);
  }, [isRolling, currentSquad]);

  const colors = COUNTRY_COLORS[displayCountry] || {
    bg: 'from-slate-700 to-slate-900',
    text: 'text-slate-300',
    border: 'border-slate-700',
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
      {/* Decorative background glow */}
      <div className={`absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-gradient-to-br ${colors.bg} opacity-20 blur-3xl`} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        {/* Left: Pick indicator & Suspense Roll Banner */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex flex-col items-center justify-center font-display shadow-inner">
            <span className="text-[10px] text-slate-400 uppercase font-semibold leading-none">Pick</span>
            <span className="text-lg font-black text-white leading-none mt-0.5">
              {Math.min(11, pickCount + 1)}<span className="text-xs text-slate-500 font-normal">/11</span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Dices className="w-3.5 h-3.5 text-emerald-400" />
              <span>Squad Roll (ODI World Cup)</span>
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <h2
                className={`text-2xl sm:text-3xl font-display font-black tracking-tight text-white transition-all ${
                  isRolling ? 'blur-[1px] scale-95 opacity-80' : 'animate-roll-reveal'
                }`}
              >
                {displayCountry}
              </h2>
              <span
                className={`px-2.5 py-0.5 rounded-lg text-sm sm:text-base font-display font-black bg-gradient-to-br ${colors.bg} text-white shadow-md border ${colors.border} transition-all ${
                  isRolling ? 'scale-90 opacity-70' : 'animate-roll-reveal'
                }`}
              >
                {displayYear}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Reroll Action */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-slate-400">Rerolls Left</div>
            <div className="text-sm font-bold text-white font-mono">
              {rerollsRemaining} <span className="text-slate-500 text-xs font-normal">/ {maxRerolls}</span>
            </div>
          </div>

          <button
            onClick={onReroll}
            disabled={isRolling || rerollsRemaining <= 0 || pickCount >= 11}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all ${
              rerollsRemaining > 0 && pickCount < 11 && !isRolling
                ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600 active:scale-95'
                : 'bg-slate-900 text-slate-600 border border-slate-800/80 cursor-not-allowed opacity-60'
            }`}
            title={rerollsRemaining <= 0 ? 'No rerolls remaining' : 'Roll another squad'}
          >
            <RefreshCw className={`w-4 h-4 ${isRolling ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Reroll</span>
            <span className="sm:hidden text-xs text-slate-400 font-mono">({rerollsRemaining})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
