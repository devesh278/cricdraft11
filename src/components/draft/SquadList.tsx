import React, { useState, useMemo } from 'react';
import { PlayerCard as PlayerCardType, Squad, DraftSlotType } from '../../types/game';
import { PlayerCard } from './PlayerCard';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

interface SquadListProps {
  squad: Squad | null;
  onDraftPlayer: (player: PlayerCardType) => void;
  draftedCanonicalIds: Set<string>;
  remainingBudget: number;
  budgetEnabled: boolean;
  selectedSlot: DraftSlotType | null;
  isSlotCompatible: (slot: DraftSlotType, player: PlayerCardType) => boolean;
}

export const SquadList: React.FC<SquadListProps> = ({
  squad,
  onDraftPlayer,
  draftedCanonicalIds,
  remainingBudget,
  budgetEnabled,
  selectedSlot,
  isSlotCompatible,
}) => {
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'rating' | 'cost' | 'runs' | 'wickets'>('rating');

  const filteredPlayers = useMemo(() => {
    if (!squad) return [];

    let list = squad.players.filter((p) => {
      // Role filter
      if (roleFilter !== 'ALL') {
        if (roleFilter === 'BAT' && p.role !== 'Opener' && p.role !== 'Middle') return false;
        if (roleFilter === 'WK' && p.role !== 'WK') return false;
        if (roleFilter === 'AR' && p.role !== 'AllRounder') return false;
        if (roleFilter === 'BOWL' && p.role !== 'Pace' && p.role !== 'Spin') return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(query) || p.shortName.toLowerCase().includes(query);
      }

      return true;
    });

    // Sorting
    list = [...list].sort((a, b) => {
      if (sortBy === 'rating') {
        const aRat = Math.max(a.battingRating, a.bowlingRating);
        const bRat = Math.max(b.battingRating, b.bowlingRating);
        return bRat - aRat;
      }
      if (sortBy === 'cost') return a.cost - b.cost;
      if (sortBy === 'runs') return b.bat.runs - a.bat.runs;
      if (sortBy === 'wickets') return b.bowl.wickets - a.bowl.wickets;
      return 0;
    });

    return list;
  }, [squad, roleFilter, searchQuery, sortBy]);

  if (!squad) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400">
        Roll a squad to see available players.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-slate-900/60 border border-slate-800/80 p-3 rounded-2xl">
        {/* Role pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-semibold">
          {[
            { id: 'ALL', label: 'All Players' },
            { id: 'BAT', label: 'Batters' },
            { id: 'WK', label: 'Wicketkeepers' },
            { id: 'AR', label: 'All-Rounders' },
            { id: 'BOWL', label: 'Bowlers' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                roleFilter === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-800/70 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search input and Sort selector */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter player..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-xl px-2.5 py-1.5 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="rating">Sort: Rating</option>
              <option value="cost">Sort: Cost</option>
              <option value="runs">Sort: Runs</option>
              <option value="wickets">Sort: Wickets</option>
            </select>
          </div>
        </div>
      </div>

      {/* Players Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredPlayers.map((player) => {
          const isAlreadyDrafted = draftedCanonicalIds.has(player.canonicalId);
          const isBudgetExceeded = budgetEnabled && player.cost > remainingBudget;
          const slotIsOutOfPosition =
            selectedSlot !== null ? !isSlotCompatible(selectedSlot, player) : false;

          return (
            <PlayerCard
              key={`${player.canonicalId}_${squad.year}`}
              player={player}
              squadCountry={squad.country}
              squadYear={squad.year}
              onDraftPlayer={onDraftPlayer}
              isAlreadyDrafted={isAlreadyDrafted}
              isBudgetExceeded={isBudgetExceeded}
              selectedSlot={selectedSlot}
              slotIsOutOfPosition={slotIsOutOfPosition}
            />
          );
        })}
      </div>
    </div>
  );
};
