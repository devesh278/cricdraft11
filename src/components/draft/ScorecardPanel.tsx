import React from 'react';
import { DraftedPick, DraftSlotType } from '../../types/game';
import { SLOTS_METADATA } from './CricketPitchBoard';
import { calculateBattingStrength, calculateBowlingStrength, validateRoster } from '../../engine/simulation';
import { Trophy, HelpCircle, ArrowRight, CheckCircle2, AlertTriangle, Coins } from 'lucide-react';

interface ScorecardPanelProps {
  picks: DraftedPick[];
  selectedSlot: DraftSlotType | null;
  onSelectSlot: (slot: DraftSlotType) => void;
  onStartSimulation: () => void;
  onOpenRules: () => void;
  budgetEnabled: boolean;
  onToggleBudget: () => void;
  remainingBudget: number;
  totalBudget: number;
}

export const ScorecardPanel: React.FC<ScorecardPanelProps> = ({
  picks,
  selectedSlot,
  onSelectSlot,
  onStartSimulation,
  onOpenRules,
  budgetEnabled,
  onToggleBudget,
  remainingBudget,
  totalBudget,
}) => {
  const pickCount = picks.length;
  const battingStrength = picks.length > 0 ? Math.round(calculateBattingStrength(picks)) : 0;
  const bowlingStrength = picks.length > 0 ? Math.round(calculateBowlingStrength(picks)) : 0;
  const validation = validateRoster(picks);

  const getPickForSlot = (slot: DraftSlotType) => picks.find((p) => p.slot === slot);

  return (
    <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Top Header Buttons (Matching 7a0 top right) */}
      <div className="flex items-center justify-between gap-2 border-b border-stone-100 dark:border-slate-800 pb-3">
        <button
          onClick={onOpenRules}
          className="text-xs font-bold text-stone-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5 text-stone-400" />
          <span>Rules / Help</span>
        </button>

        <div className="px-3 py-1 rounded-lg bg-emerald-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm">
          <Trophy className="w-3.5 h-3.5 text-amber-300" />
          <span>Scorecard</span>
        </div>
      </div>

      {/* Progress Counter & Line */}
      <div>
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-slate-400 mb-1.5">
          <span>SCORECARD</span>
          <span className="font-mono text-slate-900 dark:text-white font-black text-sm">
            {pickCount} / 11
          </span>
        </div>

        {/* Thick progress bar */}
        <div className="w-full bg-stone-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-slate-900 dark:bg-white h-full transition-all duration-300 rounded-full"
            style={{ width: `${(pickCount / 11) * 100}%` }}
          />
        </div>
      </div>

      {/* Attack (Batting) & Defense (Bowling) Strength Meters */}
      <div className="space-y-2 pt-1 border-b border-stone-100 dark:border-slate-800 pb-3">
        {/* Batting Strength */}
        <div className="flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 bg-brand-red rounded-sm" />
            <span className="text-stone-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
              BATTING RATING
            </span>
          </div>
          <span className="font-headline text-lg font-black text-slate-900 dark:text-white">
            {battingStrength > 0 ? battingStrength : '&mdash;'}
          </span>
        </div>

        {/* Bowling Strength */}
        <div className="flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 bg-slate-700 dark:bg-slate-400 rounded-sm" />
            <span className="text-stone-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
              BOWLING RATING
            </span>
          </div>
          <span className="font-headline text-lg font-black text-slate-900 dark:text-white">
            {bowlingStrength > 0 ? bowlingStrength : '&mdash;'}
          </span>
        </div>
      </div>

      {/* Optional Budget Meter */}
      <div className="text-xs space-y-1 pt-1">
        <div className="flex items-center justify-between text-[11px] font-bold">
          <button
            onClick={onToggleBudget}
            className="flex items-center gap-1 text-stone-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <Coins className="w-3 h-3 text-amber-500" />
            <span>BUDGET CAP: {budgetEnabled ? 'ON' : 'OFF'}</span>
          </button>
          {budgetEnabled && (
            <span className="font-mono text-slate-900 dark:text-white font-bold">
              ${remainingBudget} <span className="text-stone-400 text-[10px]">/ ${totalBudget}</span>
            </span>
          )}
        </div>
      </div>

      {/* 11 Positions Lineup Checklist (Matching 7a0 table exactly) */}
      <div className="space-y-1.5 pt-1">
        {SLOTS_METADATA.map((slotMeta) => {
          const pick = getPickForSlot(slotMeta.slot);
          const isSelected = selectedSlot === slotMeta.slot;

          return (
            <div
              key={slotMeta.slot}
              onClick={() => onSelectSlot(slotMeta.slot)}
              className={`flex items-center justify-between py-1 px-2 rounded-lg text-xs transition-all cursor-pointer ${
                isSelected
                  ? 'bg-amber-100 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700'
                  : 'hover:bg-stone-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <span className="font-mono font-bold text-[10px] text-stone-500 dark:text-slate-400 uppercase tracking-wider">
                {slotMeta.label}
              </span>

              {pick ? (
                <div className="flex items-center gap-1.5 text-right font-medium">
                  <span className="font-bold text-slate-900 dark:text-white truncate max-w-[110px]">
                    {pick.player.shortName || pick.player.name}
                  </span>
                  <span className="font-headline font-black text-sm text-brand-red">
                    {pick.isOutOfPosition && '~'}
                    {pick.effectiveRating}
                  </span>
                </div>
              ) : (
                <span className="text-stone-300 dark:text-slate-600 font-bold font-mono">
                  &mdash;
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Start Tournament Action Button */}
      <div className="pt-2">
        <button
          onClick={onStartSimulation}
          disabled={!validation.valid}
          className={`w-full py-3.5 px-4 rounded-xl font-headline text-xl tracking-wider uppercase text-white flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
            validation.valid
              ? 'bg-brand-red hover:bg-brand-red-hover shadow-brand-red/30 cursor-pointer animate-bounce-short'
              : 'bg-stone-300 dark:bg-slate-800 text-stone-500 dark:text-slate-600 cursor-not-allowed shadow-none'
          }`}
        >
          <span>START RUN</span>
          <ArrowRight className="w-5 h-5 stroke-[3]" />
        </button>

        {!validation.valid && pickCount === 11 && (
          <div className="mt-2 text-[11px] text-rose-500 font-medium text-center">
            {validation.errors[0]}
          </div>
        )}
      </div>
    </div>
  );
};
