import React from 'react';
import { Coins, AlertTriangle, ShieldCheck } from 'lucide-react';

interface BudgetBarProps {
  enabled: boolean;
  onToggle: () => void;
  totalBudget: number;
  spentBudget: number;
  picksCount: number; // 0 to 11
  isDrafting: boolean;
}

export const BudgetBar: React.FC<BudgetBarProps> = ({
  enabled,
  onToggle,
  totalBudget,
  spentBudget,
  picksCount,
  isDrafting,
}) => {
  const remainingBudget = totalBudget - spentBudget;
  const remainingSlots = 11 - picksCount;
  const avgPerSlotRemaining = remainingSlots > 0 ? (remainingBudget / remainingSlots).toFixed(1) : '0';
  const percentageSpent = Math.min(100, Math.round((spentBudget / totalBudget) * 100));

  let barColor = 'bg-emerald-500';
  if (percentageSpent > 85) barColor = 'bg-rose-500';
  else if (percentageSpent > 65) barColor = 'bg-amber-500';

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <Coins className={`w-4 h-4 ${enabled ? 'text-amber-400' : 'text-slate-500'}`} />
          <span className="text-sm font-bold text-white">Team Rating Cap (Budget)</span>
          <button
            type="button"
            onClick={onToggle}
            disabled={isDrafting}
            className={`text-xs px-2 py-0.5 rounded-full font-semibold transition-all ${
              enabled
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            } ${isDrafting ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:opacity-90'}`}
          >
            {enabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {enabled && (
          <div className="text-xs font-mono">
            <span className="text-slate-400">Remaining: </span>
            <span
              className={`font-bold ${
                remainingBudget < remainingSlots * 60 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {remainingBudget}
            </span>
            <span className="text-slate-500"> / {totalBudget}</span>
          </div>
        )}
      </div>

      {enabled ? (
        <div>
          {/* Progress meter */}
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${barColor}`}
              style={{ width: `${percentageSpent}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
            <div>
              <span>Spent: </span>
              <span className="font-bold text-slate-200">{spentBudget}</span>
              <span className="text-slate-500"> ({percentageSpent}%)</span>
            </div>
            {remainingSlots > 0 && (
              <div>
                <span>Max Avg/Slot Left: </span>
                <span
                  className={`font-bold font-mono ${
                    +avgPerSlotRemaining < 60 ? 'text-rose-400 font-black' : 'text-slate-200'
                  }`}
                >
                  {avgPerSlotRemaining}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-400">
          Rating cap disabled: Pick any rated player without budget restrictions. Turn ON for strategic constraint.
        </p>
      )}
    </div>
  );
};
