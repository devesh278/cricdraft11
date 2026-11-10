import React from 'react';
import { PlayerRole } from '../../types/game';

interface RoleBadgeProps {
  role: PlayerRole;
  size?: 'sm' | 'md';
}

export const ROLE_LABELS: Record<PlayerRole, string> = {
  Opener: 'Opener',
  Middle: 'Middle Order',
  WK: 'Wicketkeeper',
  AllRounder: 'All-Rounder',
  Pace: 'Pace Bowler',
  Spin: 'Spin Bowler',
};

export const ROLE_COLORS: Record<PlayerRole, string> = {
  Opener: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Middle: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  WK: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  AllRounder: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  Pace: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  Spin: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'sm' }) => {
  const colorClass = ROLE_COLORS[role] || 'bg-slate-500/15 text-slate-300 border-slate-500/30';
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${colorClass} ${sizeClass}`}
    >
      {ROLE_LABELS[role]}
    </span>
  );
};

interface RatingBadgeProps {
  rating: number;
  label?: string;
  isOutOfPosition?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RatingBadge: React.FC<RatingBadgeProps> = ({
  rating,
  label,
  isOutOfPosition = false,
  size = 'md',
}) => {
  let color = 'from-slate-600 to-slate-800 text-slate-200 border-slate-500';
  if (rating >= 92) {
    color = 'from-amber-500 to-yellow-600 text-white border-amber-300 shadow-amber-500/20';
  } else if (rating >= 85) {
    color = 'from-emerald-600 to-teal-700 text-white border-emerald-400';
  } else if (rating >= 75) {
    color = 'from-blue-600 to-indigo-700 text-white border-blue-400';
  }

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 min-w-[28px]',
    md: 'text-sm px-2.5 py-1 min-w-[36px]',
    lg: 'text-lg px-3 py-1.5 min-w-[44px]',
  };

  return (
    <div
      className={`inline-flex items-center justify-center font-display font-bold rounded-lg bg-gradient-to-br border shadow-sm ${color} ${sizeClasses[size]}`}
      title={isOutOfPosition ? 'Out of position penalty applied (x0.75)' : undefined}
    >
      {isOutOfPosition && <span className="mr-0.5 text-amber-200 text-xs font-mono font-bold">~</span>}
      <span>{rating}</span>
      {label && <span className="ml-1 text-[10px] font-normal uppercase opacity-80">{label}</span>}
    </div>
  );
};
