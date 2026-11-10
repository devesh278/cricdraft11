import React from 'react';
import { MatchMinimalResult } from '../../types/game';
import { Trophy, ArrowRight, Zap, Target, AlertTriangle } from 'lucide-react';

interface MinimalMatchResultProps {
  result: MatchMinimalResult;
  isKnockout: boolean;
  onContinue: () => void;
}

export const MinimalMatchResult: React.FC<MinimalMatchResultProps> = ({
  result,
  isKnockout,
  onContinue,
}) => {
  const isWin = result.won;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 text-center space-y-5 animate-scale-up">
        {/* Match Header */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-400 border border-stone-200 dark:border-slate-700">
            {result.stageName}
          </span>
          <h3 className="text-sm font-bold text-stone-600 dark:text-slate-400 mt-2">
            vs <span className="text-slate-900 dark:text-white font-headline text-lg uppercase tracking-wide">{result.opponentSquadName} ({result.opponentYear})</span>
          </h3>
        </div>

        {/* 1. MATCH RESULT & MARGIN */}
        <div
          className={`py-5 px-4 rounded-2xl border ${
            isWin
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
          }`}
        >
          <div className="flex justify-center mb-1">
            {isWin ? (
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <Trophy className="w-6 h-6" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md">
                <AlertTriangle className="w-6 h-6" />
              </div>
            )}
          </div>

          <div
            className={`font-headline text-3xl sm:text-4xl font-black tracking-tight uppercase leading-none mt-2 ${
              isWin ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'
            }`}
          >
            {result.marginText}
          </div>

          {isKnockout && !isWin && (
            <p className="text-xs text-rose-600 dark:text-rose-400 font-bold mt-1.5 uppercase tracking-wide">
              Knockout Defeat &middot; Tournament Ended
            </p>
          )}
        </div>

        {/* 2 & 3. STRICT MINIMAL STATS: TOP SCORER & TOP WICKET TAKER */}
        <div className="grid grid-cols-2 gap-3 text-left">
          {/* Top Run Scorer */}
          <div className="bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 rounded-2xl p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Top Scorer</span>
            </div>
            <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
              {result.topRunScorer.name}
            </div>
            <div className="text-xs text-stone-500 dark:text-slate-400 font-mono mt-0.5">
              <span className="font-bold text-slate-900 dark:text-white">{result.topRunScorer.runs}</span> runs
              <span className="text-[10px] text-stone-400 ml-1">
                ({result.topRunScorer.team === 'player' ? 'Your XI' : 'Opp'})
              </span>
            </div>
          </div>

          {/* Top Wicket Taker */}
          <div className="bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 rounded-2xl p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 mb-1">
              <Target className="w-3.5 h-3.5" />
              <span>Top Bowler</span>
            </div>
            <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
              {result.topWicketTaker.name}
            </div>
            <div className="text-xs text-stone-500 dark:text-slate-400 font-mono mt-0.5">
              <span className="font-bold text-slate-900 dark:text-white">{result.topWicketTaker.wickets}</span> wkts
              <span className="text-[10px] text-stone-400 ml-1">
                ({result.topWicketTaker.team === 'player' ? 'Your XI' : 'Opp'})
              </span>
            </div>
          </div>
        </div>

        {/* Continue Action */}
        <div>
          <button
            onClick={onContinue}
            className={`w-full py-3.5 px-4 rounded-xl font-headline text-xl uppercase tracking-wider text-white flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer ${
              isWin
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                : 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700'
            }`}
          >
            <span>{isKnockout && !isWin ? 'View Summary' : 'Next Match'}</span>
            <ArrowRight className="w-5 h-5 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};
