import React from 'react';
import { PlayerCard as PlayerCardType, DraftSlotType } from '../../types/game';
import { RoleBadge, RatingBadge } from '../common/Badge';
import { Check, AlertCircle, Ban, TrendingUp, Zap } from 'lucide-react';

interface PlayerCardProps {
  player: PlayerCardType;
  squadCountry: string;
  squadYear: number;
  onDraftPlayer: (player: PlayerCardType) => void;
  isAlreadyDrafted: boolean;
  isBudgetExceeded: boolean;
  selectedSlot: DraftSlotType | null;
  slotIsOutOfPosition: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  squadCountry,
  squadYear,
  onDraftPlayer,
  isAlreadyDrafted,
  isBudgetExceeded,
  selectedSlot,
  slotIsOutOfPosition,
}) => {
  const isBowler = player.role === 'Pace' || player.role === 'Spin';
  const isBatter = player.role === 'Opener' || player.role === 'Middle' || player.role === 'WK';
  const isAllRounder = player.role === 'AllRounder';

  const effectiveRating = slotIsOutOfPosition
    ? Math.round((isBowler ? player.bowlingRating : player.battingRating) * 0.75)
    : (isBowler ? player.bowlingRating : player.battingRating);

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-200 p-4 flex flex-col justify-between ${
        isAlreadyDrafted
          ? 'bg-slate-900/40 border-slate-800/50 opacity-50'
          : isBudgetExceeded
          ? 'bg-slate-900/60 border-rose-900/30'
          : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:shadow-lg'
      }`}
    >
      {/* Top Header: Name, Year, Rating & Cost */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <h4 className="font-display font-bold text-base text-white tracking-tight truncate group-hover:text-emerald-400 transition-colors">
              {player.name}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <RoleBadge role={player.role} size="sm" />
              {player.estimated && (
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  Est.
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            {/* Primary Rating Badge */}
            {isAllRounder ? (
              <div className="flex items-center gap-1">
                <RatingBadge
                  rating={slotIsOutOfPosition ? Math.round(player.battingRating * 0.75) : player.battingRating}
                  label="BAT"
                  isOutOfPosition={slotIsOutOfPosition}
                  size="sm"
                />
                <RatingBadge
                  rating={slotIsOutOfPosition ? Math.round(player.bowlingRating * 0.75) : player.bowlingRating}
                  label="BWL"
                  isOutOfPosition={slotIsOutOfPosition}
                  size="sm"
                />
              </div>
            ) : isBowler ? (
              <RatingBadge
                rating={effectiveRating}
                label="BWL"
                isOutOfPosition={slotIsOutOfPosition}
                size="md"
              />
            ) : (
              <RatingBadge
                rating={effectiveRating}
                label="BAT"
                isOutOfPosition={slotIsOutOfPosition}
                size="md"
              />
            )}

            {/* Cost Badge */}
            <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
              <span>Cost:</span>
              <span className="font-bold text-slate-200">{player.cost}</span>
            </div>
          </div>
        </div>

        {/* Tournament Performance Stats Grid (WC Edition Stats Only) */}
        <div className="my-3 py-2 px-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-1.5">
          {/* Batting Row */}
          {(isBatter || isAllRounder || player.bat.runs > 0) && (
            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Batting</span>
                <span>
                  {player.bat.runs} runs @ {player.bat.avg} (SR {player.bat.sr})
                </span>
              </div>
              {player.bat.bigMatchRuns > 0 && (
                <div className="text-[10px] text-emerald-400 font-mono flex items-center justify-between">
                  <span>Big-Match:</span>
                  <span>{player.bat.bigMatchRuns} runs @ {player.bat.bigMatchAvg}</span>
                </div>
              )}
            </div>
          )}

          {/* Bowling Row */}
          {(isBowler || isAllRounder || player.bowl.wickets > 0) && (
            <div className={isAllRounder ? 'border-t border-slate-800/60 pt-1.5' : ''}>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Bowling</span>
                <span>
                  {player.bowl.wickets} wkts @ {player.bowl.avg || '-'} (Econ {player.bowl.econ})
                </span>
              </div>
              {player.bowl.bigMatchWickets > 0 && (
                <div className="text-[10px] text-emerald-400 font-mono flex items-center justify-between">
                  <span>Big-Match:</span>
                  <span>{player.bowl.bigMatchWickets} wkts</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-2 pt-2 border-t border-slate-800/60">
        {isAlreadyDrafted ? (
          <div className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-400 bg-slate-800/40 rounded-xl border border-slate-800">
            <Ban className="w-3.5 h-3.5 text-rose-400" />
            <span>Already in XI</span>
          </div>
        ) : isBudgetExceeded ? (
          <div className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-rose-400 bg-rose-500/10 rounded-xl border border-rose-500/20">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Exceeds Budget</span>
          </div>
        ) : (
          <button
            onClick={() => onDraftPlayer(player)}
            className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98 ${
              slotIsOutOfPosition
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{slotIsOutOfPosition ? 'Draft (~ Out of Position)' : 'Draft into XI'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
