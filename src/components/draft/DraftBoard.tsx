import React from 'react';
import { DraftedPick, DraftSlotType, PlayerRole } from '../../types/game';
import { RatingBadge } from '../common/Badge';
import { User, Trash2, PlusCircle, AlertCircle } from 'lucide-react';

interface DraftBoardProps {
  picks: DraftedPick[];
  selectedSlot: DraftSlotType | null;
  onSelectSlot: (slot: DraftSlotType) => void;
  onRemovePick: (slot: DraftSlotType) => void;
  isDraftLocked: boolean;
}

interface SlotMeta {
  slot: DraftSlotType;
  label: string;
  expectedRoles: PlayerRole[];
  shortLabel: string;
}

export const DRAFT_SLOTS: SlotMeta[] = [
  { slot: 'opener1', label: 'Opener 1', shortLabel: 'OPENER', expectedRoles: ['Opener'] },
  { slot: 'opener2', label: 'Opener 2', shortLabel: 'OPENER', expectedRoles: ['Opener'] },
  { slot: 'middle1', label: 'Middle 1 (#3)', shortLabel: 'MIDDLE #3', expectedRoles: ['Middle', 'Opener'] },
  { slot: 'middle2', label: 'Middle 2 (#4)', shortLabel: 'MIDDLE #4', expectedRoles: ['Middle'] },
  { slot: 'middle3', label: 'Middle 3 (#5)', shortLabel: 'MIDDLE #5', expectedRoles: ['Middle'] },
  { slot: 'wk', label: 'Wicketkeeper (#6)', shortLabel: 'WK', expectedRoles: ['WK'] },
  { slot: 'ar1', label: 'All-Rounder 1 (#7)', shortLabel: 'ALL-ROUNDER', expectedRoles: ['AllRounder'] },
  { slot: 'ar2', label: 'All-Rounder 2 (#8)', shortLabel: 'ALL-ROUNDER', expectedRoles: ['AllRounder'] },
  { slot: 'bowler1', label: 'Bowler 1', shortLabel: 'BOWLER', expectedRoles: ['Pace', 'Spin'] },
  { slot: 'bowler2', label: 'Bowler 2', shortLabel: 'BOWLER', expectedRoles: ['Pace', 'Spin'] },
  { slot: 'bowler3', label: 'Bowler 3', shortLabel: 'BOWLER', expectedRoles: ['Pace', 'Spin'] },
];

export const DraftBoard: React.FC<DraftBoardProps> = ({
  picks,
  selectedSlot,
  onSelectSlot,
  onRemovePick,
  isDraftLocked,
}) => {
  const getPickForSlot = (slot: DraftSlotType) => picks.find((p) => p.slot === slot);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Title & Field Info */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
            <span>Your World Cup XI</span>
            <span className="text-xs font-mono font-normal text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              {picks.length}/11 Picked
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Click an empty slot to target your pick, or draft directly into the next open slot.
          </p>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> In Position
          </span>
          <span className="flex items-center gap-1">
            <span className="text-amber-400 font-bold font-mono">~</span> Out of Position (0.75x)
          </span>
        </div>
      </div>

      {/* Cricket Field Layout */}
      <div className="cricket-turf rounded-2xl border-2 border-emerald-700/60 p-4 sm:p-6 shadow-inner relative">
        {/* Inner Circle Marking */}
        <div className="absolute inset-8 rounded-full border border-dashed border-white/10 pointer-events-none" />

        {/* Slots Grid Formations */}
        <div className="space-y-4 relative z-10">
          {/* Row 1: Openers (2) */}
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            {DRAFT_SLOTS.slice(0, 2).map((slotMeta) => (
              <SlotCard
                key={slotMeta.slot}
                meta={slotMeta}
                pick={getPickForSlot(slotMeta.slot)}
                isSelected={selectedSlot === slotMeta.slot}
                onSelect={() => onSelectSlot(slotMeta.slot)}
                onRemove={() => onRemovePick(slotMeta.slot)}
                isDraftLocked={isDraftLocked}
              />
            ))}
          </div>

          {/* Row 2: Middle Order (3) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-lg mx-auto">
            {DRAFT_SLOTS.slice(2, 5).map((slotMeta) => (
              <SlotCard
                key={slotMeta.slot}
                meta={slotMeta}
                pick={getPickForSlot(slotMeta.slot)}
                isSelected={selectedSlot === slotMeta.slot}
                onSelect={() => onSelectSlot(slotMeta.slot)}
                onRemove={() => onRemovePick(slotMeta.slot)}
                isDraftLocked={isDraftLocked}
              />
            ))}
          </div>

          {/* Row 3: Wicketkeeper (1) + All-rounders (2) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-lg mx-auto">
            {DRAFT_SLOTS.slice(5, 8).map((slotMeta) => (
              <SlotCard
                key={slotMeta.slot}
                meta={slotMeta}
                pick={getPickForSlot(slotMeta.slot)}
                isSelected={selectedSlot === slotMeta.slot}
                onSelect={() => onSelectSlot(slotMeta.slot)}
                onRemove={() => onRemovePick(slotMeta.slot)}
                isDraftLocked={isDraftLocked}
              />
            ))}
          </div>

          {/* Row 4: Bowlers (3) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-lg mx-auto">
            {DRAFT_SLOTS.slice(8, 11).map((slotMeta) => (
              <SlotCard
                key={slotMeta.slot}
                meta={slotMeta}
                pick={getPickForSlot(slotMeta.slot)}
                isSelected={selectedSlot === slotMeta.slot}
                onSelect={() => onSelectSlot(slotMeta.slot)}
                onRemove={() => onRemovePick(slotMeta.slot)}
                isDraftLocked={isDraftLocked}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface SlotCardProps {
  meta: SlotMeta;
  pick: DraftedPick | undefined;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  isDraftLocked: boolean;
}

const SlotCard: React.FC<SlotCardProps> = ({
  meta,
  pick,
  isSelected,
  onSelect,
  onRemove,
  isDraftLocked,
}) => {
  if (pick) {
    return (
      <div
        className={`relative rounded-xl border p-2.5 transition-all text-left shadow-lg ${
          pick.isOutOfPosition
            ? 'bg-amber-950/70 border-amber-600/60 text-amber-100'
            : 'bg-slate-900/90 border-slate-700/80 text-white'
        }`}
      >
        <div className="flex items-start justify-between gap-1 mb-1">
          <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 truncate">
            {meta.shortLabel}
          </span>
          {!isDraftLocked && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="text-slate-400 hover:text-rose-400 p-0.5 rounded transition-colors"
              title="Remove pick"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="font-display font-bold text-xs sm:text-sm tracking-tight truncate text-white">
          {pick.player.name}
        </div>

        <div className="flex items-center justify-between gap-1 mt-1 text-[11px]">
          <span className="text-slate-300 text-[10px] truncate">
            {pick.country} '{String(pick.year).slice(2)}
          </span>
          <RatingBadge
            rating={pick.effectiveRating}
            isOutOfPosition={pick.isOutOfPosition}
            size="sm"
          />
        </div>
      </div>
    );
  }

  // Empty Slot
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={isDraftLocked}
      className={`w-full rounded-xl border-2 border-dashed p-2.5 transition-all text-center flex flex-col items-center justify-center min-h-[76px] cursor-pointer ${
        isSelected
          ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-emerald-500/20 shadow-md ring-2 ring-emerald-500/40'
          : 'bg-black/30 hover:bg-black/50 border-white/20 text-slate-300 hover:border-white/40'
      } ${isDraftLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-200">
        <PlusCircle className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
        <span>{meta.shortLabel}</span>
      </div>
      <span className="text-[10px] text-slate-400 mt-0.5">
        {meta.expectedRoles.join('/')}
      </span>
    </button>
  );
};
