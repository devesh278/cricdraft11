import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { DraftedPick, MatchMinimalResult, TournamentUserMVP, DifficultyLevel } from '../../types/game';
import { Trophy, RotateCcw, Zap, Target } from 'lucide-react';

interface FinalSummaryProps {
  picks: DraftedPick[];
  matchResults: MatchMinimalResult[];
  isChampion: boolean;
  isEliminated: boolean;
  eliminationStageName?: string;
  mvp: TournamentUserMVP;
  difficulty: DifficultyLevel;
  mode: string;
  onPlayAgain: () => void;
}

export const FinalSummary: React.FC<FinalSummaryProps> = ({
  picks,
  matchResults,
  isChampion,
  isEliminated,
  eliminationStageName,
  mvp,
  difficulty,
  mode,
  onPlayAgain,
}) => {
  const winsCount = matchResults.filter((m) => m.won).length;

  useEffect(() => {
    if (isChampion) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
      const timeout = setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [isChampion]);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in p-4">
      {/* Hero Result Banner */}
      <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden shadow-sm">
        <div className="flex justify-center mb-3">
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg ${
              isChampion
                ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/20'
                : 'bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300'
            }`}
          >
            <Trophy className="w-10 h-10" />
          </div>
        </div>

        <h2 className="font-headline text-4xl sm:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-wide">
          {isChampion ? 'WORLD CUP CHAMPION!' : 'CAMPAIGN COMPLETED'}
        </h2>

        <p className="text-stone-600 dark:text-slate-300 text-sm sm:text-base mt-2 max-w-md mx-auto">
          {isChampion
            ? 'Flawless 7-match unbeaten World Cup campaign! You turned cricket memory into an unbeaten championship run.'
            : `Knocked out in ${eliminationStageName || 'the tournament'}. Finished with ${winsCount} victory${
                winsCount !== 1 ? 's' : ''
              } in 7 matches.`}
        </p>

        {/* Big Record Pill */}
        <div className="mt-4 inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-slate-900 text-white font-headline text-2xl font-black uppercase tracking-wider">
          <span>{winsCount}</span>
          <span className="text-amber-400 font-normal">/</span>
          <span>7 WINS</span>
        </div>
      </div>

      {/* USER XI TOURNAMENT MVPs */}
      <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <h3 className="font-headline text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <span>Your XI Tournament MVPs</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Top Batter */}
          <div className="bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
              <Zap className="w-4 h-4" />
              <span>Tournament Top Scorer</span>
            </div>
            <div className="font-bold text-lg text-slate-900 dark:text-white">
              {mvp.topBatter.name}
            </div>
            <div className="text-sm font-mono text-emerald-600 dark:text-emerald-400 font-bold mt-1">
              {mvp.topBatter.runs} Runs{' '}
              <span className="text-xs text-stone-400 font-normal">
                ({mvp.topBatter.year} Card)
              </span>
            </div>
          </div>

          {/* Top Bowler */}
          <div className="bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 mb-1">
              <Target className="w-4 h-4" />
              <span>Tournament Top Wickets</span>
            </div>
            <div className="font-bold text-lg text-slate-900 dark:text-white">
              {mvp.topBowler.name}
            </div>
            <div className="text-sm font-mono text-sky-600 dark:text-sky-400 font-bold mt-1">
              {mvp.topBowler.wickets} Wickets{' '}
              <span className="text-xs text-stone-400 font-normal">
                ({mvp.topBowler.year} Card)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Play Again Button */}
      <div className="pt-2">
        <button
          onClick={onPlayAgain}
          className="w-full py-4 px-6 rounded-2xl font-headline text-2xl uppercase tracking-wider bg-brand-red hover:bg-brand-red-hover text-white shadow-xl shadow-brand-red/20 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
        >
          <RotateCcw className="w-6 h-6 stroke-[3]" />
          <span>Draft New XI & Play Again</span>
        </button>
      </div>
    </div>
  );
};
