import React from 'react';
import { DraftedPick } from '../../types/game';
import { validateRoster } from '../../engine/simulation';
import { CheckCircle2, AlertCircle, Play, ShieldAlert } from 'lucide-react';

interface RosterValidationProps {
  picks: DraftedPick[];
  onStartSimulation: () => void;
  disabled: boolean;
}

export const RosterValidation: React.FC<RosterValidationProps> = ({
  picks,
  onStartSimulation,
  disabled,
}) => {
  const validation = validateRoster(picks);
  const count = picks.length;
  const hasWK = picks.some((p) => p.player.role === 'WK');
  const bowlingOptionsCount = picks.filter(
    (p) => p.player.role === 'Pace' || p.player.role === 'Spin' || p.player.role === 'AllRounder'
  ).length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Validation Checklist Badges */}
      <div className="flex flex-wrap items-center gap-2.5 text-xs">
        {/* Count */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-medium ${
            count === 11
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          {count === 11 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <span className="w-2 h-2 rounded-full bg-slate-500" />}
          <span>11 Players ({count}/11)</span>
        </div>

        {/* Wicketkeeper */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-medium ${
            hasWK
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
          }`}
        >
          {hasWK ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertCircle className="w-3.5 h-3.5 text-rose-400" />}
          <span>1+ Wicketkeeper</span>
        </div>

        {/* 5 Bowling options */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-medium ${
            bowlingOptionsCount >= 5
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
          }`}
        >
          {bowlingOptionsCount >= 5 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertCircle className="w-3.5 h-3.5 text-rose-400" />}
          <span>5+ Bowlers/All-Rounders ({bowlingOptionsCount}/5)</span>
        </div>
      </div>

      {/* Start Tournament Action Button */}
      <button
        onClick={onStartSimulation}
        disabled={!validation.valid || disabled}
        className={`w-full sm:w-auto px-6 py-3 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98 ${
          validation.valid && !disabled
            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/25 animate-bounce-short'
            : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed'
        }`}
      >
        <Play className="w-4 h-4 fill-current" />
        <span>Start World Cup Run</span>
      </button>
    </div>
  );
};
