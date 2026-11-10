import React, { useState } from 'react';
import { PlayerCard, Squad, DraftSlotType } from '../../types/game';
import { Ban, AlertCircle, Plus, Info } from 'lucide-react';

interface PlayerPickerListProps {
  squad: Squad | null;
  onDraftPlayer: (player: PlayerCard) => void;
  draftedCanonicalIds: Set<string>;
  remainingBudget: number;
  budgetEnabled: boolean;
  selectedSlot: DraftSlotType | null;
  isSlotCompatible: (slot: DraftSlotType, player: PlayerCard) => boolean;
}

export const PlayerPickerList: React.FC<PlayerPickerListProps> = ({
  squad,
  onDraftPlayer,
  draftedCanonicalIds,
  remainingBudget,
  budgetEnabled,
  selectedSlot,
  isSlotCompatible,
}) => {
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [hoveredPlayerId, setHoveredPlayerId] = useState<string | null>(null);

  if (!squad) return null;

  const filteredPlayers = squad.players.filter((p) => {
    if (roleFilter === 'BAT') return p.role === 'Opener' || p.role === 'Middle';
    if (roleFilter === 'WK') return p.role === 'WK';
    if (roleFilter === 'AR') return p.role === 'AllRounder';
    if (roleFilter === 'BOWL') return p.role === 'Pace' || p.role === 'Spin';
    return true;
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
      {/* Header & Role Filter Pills */}
      <div className="flex items-center justify-between gap-2 border-b border-stone-100 dark:border-slate-800 pb-2.5">
        <span className="text-[11px] font-bold uppercase tracking-widest text-stone-400 dark:text-slate-500">
          PICK A PLAYER
        </span>

        {/* Role Filters */}
        <div className="flex items-center gap-1 text-[10px] font-bold">
          {[
            { id: 'ALL', label: 'ALL' },
            { id: 'BAT', label: 'BAT' },
            { id: 'WK', label: 'WK' },
            { id: 'AR', label: 'AR' },
            { id: 'BOWL', label: 'BOWL' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                roleFilter === tab.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-stone-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Players List Table (Matching 7a0.org style exactly) */}
      <div className="space-y-1 max-h-[440px] overflow-y-auto pr-1">
        {filteredPlayers.map((player, idx) => {
          const isAlreadyDrafted = draftedCanonicalIds.has(player.canonicalId);
          const isBudgetExceeded = budgetEnabled && player.cost > remainingBudget;
          const isOutOfPosition =
            selectedSlot !== null ? !isSlotCompatible(selectedSlot, player) : false;

          const isBowler = player.role === 'Pace' || player.role === 'Spin';
          const primaryRating = isBowler ? player.bowlingRating : player.battingRating;

          // Short role abbreviation
          const roleShort =
            player.role === 'Opener'
              ? 'OP'
              : player.role === 'Middle'
              ? 'MID'
              : player.role === 'WK'
              ? 'WK'
              : player.role === 'AllRounder'
              ? 'AR'
              : player.role === 'Pace'
              ? 'PAC'
              : 'SPN';

          const squadNumber = idx + 1;

          return (
            <div
              key={`${player.canonicalId}_${squad.year}`}
              onMouseEnter={() => setHoveredPlayerId(player.canonicalId)}
              onMouseLeave={() => setHoveredPlayerId(null)}
              onClick={() => {
                if (!isAlreadyDrafted && !isBudgetExceeded) {
                  onDraftPlayer(player);
                }
              }}
              className={`group relative flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                isAlreadyDrafted
                  ? 'bg-stone-50 dark:bg-slate-800/40 opacity-40 cursor-not-allowed'
                  : isBudgetExceeded
                  ? 'bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 cursor-not-allowed'
                  : 'hover:bg-stone-100 dark:hover:bg-slate-800/70 border border-transparent hover:border-stone-200 dark:hover:border-slate-700'
              }`}
            >
              {/* Left: Squad Number, Name & Micro stats */}
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="font-mono text-xs font-bold text-stone-400 dark:text-slate-500 w-6 shrink-0">
                  #{squadNumber}
                </span>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-brand-red transition-colors">
                      {player.name}
                    </span>
                    {player.estimated && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-stone-200 dark:bg-slate-700 text-stone-600 dark:text-slate-300 font-mono">
                        EST
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Role Tag & Big Bold Rating */}
              <div className="flex items-center gap-2.5 shrink-0 pl-2">
                <span className="text-[11px] font-bold text-stone-400 dark:text-slate-400 font-mono uppercase">
                  {roleShort}
                </span>

                <div className="text-right">
                  <div className="flex items-center justify-end gap-0.5">
                    {isOutOfPosition && (
                      <span className="text-amber-500 font-bold font-mono text-xs">~</span>
                    )}
                    <span
                      className={`font-headline text-2xl font-black leading-none ${
                        primaryRating >= 92
                          ? 'text-amber-500'
                          : primaryRating >= 85
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {isOutOfPosition ? Math.round(primaryRating * 0.75) : primaryRating}
                    </span>
                  </div>

                  {budgetEnabled && (
                    <div className="text-[9px] font-mono text-stone-400 dark:text-slate-500">
                      ${player.cost}
                    </div>
                  )}
                </div>
              </div>

              {/* Disabled Tooltip / Pill if blocked */}
              {isAlreadyDrafted && (
                <div className="absolute right-2 bg-stone-800 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                  Already in XI
                </div>
              )}
              {isBudgetExceeded && !isAlreadyDrafted && (
                <div className="absolute right-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                  Over Budget
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
