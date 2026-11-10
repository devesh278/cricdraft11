import React from 'react';
import { DraftedPick, DraftSlotType, PlayerRole } from '../../types/game';
import { X, User } from 'lucide-react';

interface CricketPitchBoardProps {
  picks: DraftedPick[];
  selectedSlot: DraftSlotType | null;
  onSelectSlot: (slot: DraftSlotType) => void;
  onRemovePick: (slot: DraftSlotType) => void;
  isDraftLocked: boolean;
}

interface SlotInfo {
  slot: DraftSlotType;
  label: string;
  shortCode: string;
  expectedRoles: PlayerRole[];
  row: 'openers' | 'middle' | 'wk' | 'allrounders' | 'bowlers';
}

export const SLOTS_METADATA: SlotInfo[] = [
  { slot: 'opener1', label: 'Opener 1', shortCode: 'OP', expectedRoles: ['Opener'], row: 'openers' },
  { slot: 'opener2', label: 'Opener 2', shortCode: 'OP', expectedRoles: ['Opener'], row: 'openers' },
  { slot: 'middle1', label: 'Middle 1 (#3)', shortCode: 'MID', expectedRoles: ['Middle', 'Opener'], row: 'middle' },
  { slot: 'middle2', label: 'Middle 2 (#4)', shortCode: 'MID', expectedRoles: ['Middle'], row: 'middle' },
  { slot: 'middle3', label: 'Middle 3 (#5)', shortCode: 'MID', expectedRoles: ['Middle'], row: 'middle' },
  { slot: 'wk', label: 'Wicketkeeper (#6)', shortCode: 'WK', expectedRoles: ['WK'], row: 'wk' },
  { slot: 'ar1', label: 'All-Rounder 1 (#7)', shortCode: 'AR', expectedRoles: ['AllRounder'], row: 'allrounders' },
  { slot: 'ar2', label: 'All-Rounder 2 (#8)', shortCode: 'AR', expectedRoles: ['AllRounder'], row: 'allrounders' },
  { slot: 'bowler1', label: 'Bowler 1', shortCode: 'BWL', expectedRoles: ['Pace', 'Spin'], row: 'bowlers' },
  { slot: 'bowler2', label: 'Bowler 2', shortCode: 'BWL', expectedRoles: ['Pace', 'Spin'], row: 'bowlers' },
  { slot: 'bowler3', label: 'Bowler 3', shortCode: 'BWL', expectedRoles: ['Pace', 'Spin'], row: 'bowlers' },
];

export const CricketPitchBoard: React.FC<CricketPitchBoardProps> = ({
  picks,
  selectedSlot,
  onSelectSlot,
  onRemovePick,
  isDraftLocked,
}) => {
  const getPick = (slot: DraftSlotType) => picks.find((p) => p.slot === slot);

  return (
    <div className="relative w-full aspect-[9/13] sm:aspect-[9/12] max-w-[480px] mx-auto pitch-field rounded-3xl border-4 border-emerald-950/60 shadow-2xl p-3 sm:p-5 flex flex-col justify-between overflow-hidden select-none">
      {/* 1. Field Markings */}
      {/* Outer oval boundary */}
      <div className="absolute inset-3 sm:inset-4 rounded-full border border-white/25 pointer-events-none" />
      {/* 30-yard inner circle */}
      <div className="absolute inset-8 sm:inset-12 rounded-full border border-dashed border-white/20 pointer-events-none" />

      {/* Center 22-Yard Cricket Pitch Strip */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 sm:w-20 h-40 sm:h-52 bg-[#caba98] rounded shadow-inner border border-stone-300/40 pointer-events-none opacity-85">
        {/* Popping creases and bowling creases */}
        <div className="w-full h-1 border-b border-white/90 mt-4 sm:mt-6" />
        <div className="w-full h-1 border-b border-white/90 mt-28 sm:mt-36" />
        {/* Stumps indicators */}
        <div className="w-4 h-1 bg-white mx-auto mt-[-18px]" />
        <div className="w-4 h-1 bg-white mx-auto mt-[120px] sm:mt-[150px]" />
      </div>

      {/* 2. Formation Rows (2 - 3 - 1 - 2 - 3) */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between py-1 sm:py-2">
        {/* Row 1: Openers (2) */}
        <div className="flex justify-around items-center px-10 sm:px-14">
          {SLOTS_METADATA.slice(0, 2).map((slot, i) => (
            <FieldSlotNode
              key={slot.slot}
              slot={slot}
              pick={getPick(slot.slot)}
              jerseyNum={String(i + 1)}
              isSelected={selectedSlot === slot.slot}
              onSelect={() => onSelectSlot(slot.slot)}
              onRemove={() => onRemovePick(slot.slot)}
              isDraftLocked={isDraftLocked}
            />
          ))}
        </div>

        {/* Row 2: Middle Order (3) */}
        <div className="flex justify-between items-center px-3 sm:px-5">
          {SLOTS_METADATA.slice(2, 5).map((slot, i) => (
            <FieldSlotNode
              key={slot.slot}
              slot={slot}
              pick={getPick(slot.slot)}
              jerseyNum={String(i + 3)}
              isSelected={selectedSlot === slot.slot}
              onSelect={() => onSelectSlot(slot.slot)}
              onRemove={() => onRemovePick(slot.slot)}
              isDraftLocked={isDraftLocked}
            />
          ))}
        </div>

        {/* Row 3: Wicketkeeper (1) */}
        <div className="flex justify-center items-center">
          {SLOTS_METADATA.slice(5, 6).map((slot) => (
            <FieldSlotNode
              key={slot.slot}
              slot={slot}
              pick={getPick(slot.slot)}
              jerseyNum="7"
              isSelected={selectedSlot === slot.slot}
              onSelect={() => onSelectSlot(slot.slot)}
              onRemove={() => onRemovePick(slot.slot)}
              isDraftLocked={isDraftLocked}
            />
          ))}
        </div>

        {/* Row 4: All-Rounders (2) */}
        <div className="flex justify-around items-center px-10 sm:px-14">
          {SLOTS_METADATA.slice(6, 8).map((slot, i) => (
            <FieldSlotNode
              key={slot.slot}
              slot={slot}
              pick={getPick(slot.slot)}
              jerseyNum={String(i + 8)}
              isSelected={selectedSlot === slot.slot}
              onSelect={() => onSelectSlot(slot.slot)}
              onRemove={() => onRemovePick(slot.slot)}
              isDraftLocked={isDraftLocked}
            />
          ))}
        </div>

        {/* Row 5: Bowlers (3) */}
        <div className="flex justify-between items-center px-3 sm:px-5">
          {SLOTS_METADATA.slice(8, 11).map((slot, i) => (
            <FieldSlotNode
              key={slot.slot}
              slot={slot}
              pick={getPick(slot.slot)}
              jerseyNum={String(i + 9)}
              isSelected={selectedSlot === slot.slot}
              onSelect={() => onSelectSlot(slot.slot)}
              onRemove={() => onRemovePick(slot.slot)}
              isDraftLocked={isDraftLocked}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface FieldSlotNodeProps {
  slot: SlotInfo;
  pick: DraftedPick | undefined;
  jerseyNum: string;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  isDraftLocked: boolean;
}

const FieldSlotNode: React.FC<FieldSlotNodeProps> = ({
  slot,
  pick,
  jerseyNum,
  isSelected,
  onSelect,
  onRemove,
  isDraftLocked,
}) => {
  if (pick) {
    // Drafted Player Circle Token (Matches 7a0 white circular token)
    return (
      <div className="flex flex-col items-center group relative">
        <div
          onClick={onSelect}
          className={`w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white text-slate-950 border-2 shadow-lg flex items-center justify-center font-headline text-lg sm:text-xl font-black relative transition-transform group-hover:scale-105 cursor-pointer ${
            pick.isOutOfPosition ? 'border-amber-400 ring-2 ring-amber-400/50' : 'border-stone-300'
          }`}
        >
          <span>{jerseyNum}</span>

          {/* Remove button on hover */}
          {!isDraftLocked && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow transition-opacity"
              title="Remove pick"
            >
              <X className="w-3 h-3 stroke-[3]" />
            </button>
          )}

          {/* Rating tag in corner */}
          <div
            className={`absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded font-headline text-[11px] font-black text-white shadow-sm leading-none ${
              pick.effectiveRating >= 90 ? 'bg-amber-500' : 'bg-slate-900'
            }`}
          >
            {pick.isOutOfPosition && '~'}
            {pick.effectiveRating}
          </div>
        </div>

        {/* Player Name label */}
        <div className="text-center mt-1 max-w-[85px] sm:max-w-[100px]">
          <span className="block font-bold text-[10px] sm:text-[11px] text-white leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] truncate">
            {pick.player.shortName || pick.player.name}
          </span>
          <span className="block text-[8px] font-mono text-emerald-200/90 drop-shadow uppercase leading-none mt-0.5 truncate">
            {pick.country} '{String(pick.year).slice(2)}
          </span>
        </div>
      </div>
    );
  }

  // Empty Slot Token: Dotted yellow/gold circle (Matches 7a0 dotted token)
  return (
    <div
      onClick={onSelect}
      className={`flex flex-col items-center group cursor-pointer transition-transform hover:scale-105 ${
        isDraftLocked ? 'opacity-40 pointer-events-none' : ''
      }`}
    >
      <div
        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-dashed flex items-center justify-center transition-all ${
          isSelected
            ? 'border-white bg-white/30 text-white ring-4 ring-white/40 scale-110 shadow-lg'
            : 'border-yellow-300/80 hover:border-yellow-200 bg-black/15 hover:bg-black/25 text-yellow-300'
        }`}
      >
        <span className="font-headline font-black text-xs sm:text-sm tracking-wider">
          {slot.shortCode}
        </span>
      </div>

      <span className="text-[9px] font-bold text-yellow-200/90 drop-shadow mt-1 uppercase font-mono">
        {slot.label.split(' ')[0]}
      </span>
    </div>
  );
};
