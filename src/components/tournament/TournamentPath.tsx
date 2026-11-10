import React from 'react';
import { TOURNAMENT_STAGES } from '../../engine/tournament';
import { MatchMinimalResult } from '../../types/game';
import { Check, X, Trophy, Flame } from 'lucide-react';

interface TournamentPathProps {
  currentStageIndex: number;
  matchResults: MatchMinimalResult[];
  isCompleted: boolean;
  isChampion: boolean;
}

export const TournamentPath: React.FC<TournamentPathProps> = ({
  currentStageIndex,
  matchResults,
  isCompleted,
  isChampion,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg overflow-x-auto">
      <div className="flex items-center justify-between min-w-[580px] gap-2">
        {TOURNAMENT_STAGES.map((stage, idx) => {
          const matchResult = matchResults[idx];
          const isPlayed = matchResult !== undefined;
          const isCurrent = idx === currentStageIndex && !isCompleted;
          const isWon = matchResult?.won;

          let nodeStyle = 'bg-slate-800/60 border-slate-700/60 text-slate-500';
          if (isCurrent) {
            nodeStyle = 'bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-2 ring-emerald-500/40 animate-pulse-subtle';
          } else if (isPlayed) {
            nodeStyle = isWon
              ? 'bg-emerald-600 border-emerald-400 text-white shadow-emerald-600/30 shadow-md'
              : 'bg-rose-600 border-rose-400 text-white';
          }

          return (
            <React.Fragment key={stage.id}>
              {/* Stage Node */}
              <div className="flex flex-col items-center text-center gap-1.5 flex-1">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center font-display font-black text-xs transition-all ${nodeStyle}`}
                >
                  {isPlayed ? (
                    isWon ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : (
                      <X className="w-4 h-4 stroke-[3]" />
                    )
                  ) : idx === 6 ? (
                    <Trophy className="w-4 h-4 text-amber-400" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                <div className="text-[11px] font-bold text-slate-300 whitespace-nowrap">
                  {stage.shortName}
                </div>

                <div className="text-[9px] uppercase tracking-wider text-slate-500">
                  {stage.isKnockout ? 'Knockout' : 'Group'}
                </div>
              </div>

              {/* Connector Line */}
              {idx < TOURNAMENT_STAGES.length - 1 && (
                <div
                  className={`h-0.5 flex-1 -mt-6 transition-all ${
                    idx < matchResults.length && matchResults[idx]?.won
                      ? 'bg-emerald-500'
                      : 'bg-slate-800'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
