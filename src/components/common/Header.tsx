import React from 'react';
import { Trophy, Calendar, Moon, Sun, HelpCircle } from 'lucide-react';
import { GameMode, DifficultyLevel } from '../../types/game';
import { DIFFICULTIES } from '../../config/difficulties';

interface HeaderProps {
  mode: GameMode;
  onModeChange: (newMode: GameMode) => void;
  difficulty: DifficultyLevel;
  onDifficultyChange: (newDiff: DifficultyLevel) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenRules: () => void;
  isDrafting: boolean;
  onLogoClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onModeChange,
  difficulty,
  onDifficultyChange,
  isDarkMode,
  onToggleTheme,
  onOpenRules,
  isDrafting,
  onLogoClick,
}) => {
  return (
    <header className="border-b border-stone-200 dark:border-slate-800 bg-[#f5f4ef]/90 dark:bg-slate-950/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Brand */}
        <div
          onClick={onLogoClick}
          className="flex items-center gap-2 cursor-pointer group select-none"
        >
          <div className="px-2.5 py-1 rounded-lg bg-brand-red text-white font-headline text-2xl font-black tracking-wider leading-none shadow-sm group-hover:bg-brand-red-hover transition-colors">
            RUN
          </div>
          <div className="border-l border-stone-300 dark:border-slate-700 pl-2">
            <span className="font-headline text-lg font-black tracking-wider text-slate-900 dark:text-white uppercase leading-none block">
              CRICDRAFT
            </span>
            <span className="text-[9px] uppercase tracking-wider text-stone-500 dark:text-slate-400 font-bold block">
              World Cup (2003&ndash;2023)
            </span>
          </div>
        </div>

        {/* Center: Mode Switcher */}
        <div className="flex items-center bg-stone-200/80 dark:bg-slate-900 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => onModeChange('classic')}
            disabled={isDrafting}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              mode === 'classic'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-stone-600 dark:text-slate-400 hover:text-slate-900'
            } ${isDrafting ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            Classic
          </button>
          <button
            onClick={() => onModeChange('daily')}
            disabled={isDrafting}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              mode === 'daily'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-stone-600 dark:text-slate-400 hover:text-slate-900'
            } ${isDrafting ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            Daily Seed
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Difficulty Dropdown */}
          <select
            value={difficulty}
            disabled={isDrafting}
            onChange={(e) => onDifficultyChange(e.target.value as DifficultyLevel)}
            className={`bg-white dark:bg-slate-900 border border-stone-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs rounded-xl px-2.5 py-1.5 font-bold uppercase tracking-wider focus:outline-none cursor-pointer ${
              isDrafting ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            <option value="easy">Easy (5 Rerolls)</option>
            <option value="medium">Medium (3 Rerolls)</option>
            <option value="hard">Hard (1 Reroll)</option>
            <option value="legend">Legend (0 Rerolls)</option>
          </select>

          {/* Rules */}
          <button
            onClick={onOpenRules}
            className="p-2 text-stone-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 border border-stone-300 dark:border-slate-800 rounded-xl transition-colors cursor-pointer"
            title="How to Play"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 text-stone-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 border border-stone-300 dark:border-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
