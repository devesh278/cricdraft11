import React from 'react';
import { GameMode, DifficultyLevel } from '../../types/game';
import { DIFFICULTIES } from '../../config/difficulties';
import { Sparkles, Trophy, Calendar, ShieldCheck, ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  mode: GameMode;
  onModeChange: (m: GameMode) => void;
  difficulty: DifficultyLevel;
  onDifficultyChange: (d: DifficultyLevel) => void;
  onStartDraft: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  mode,
  onModeChange,
  difficulty,
  onDifficultyChange,
  onStartDraft,
}) => {
  return (
    <section className="relative overflow-hidden pt-4 pb-8 sm:pb-12 border-b border-stone-300/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4">
        {/* Micro breadcrumb / Category label */}
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-slate-400 mb-3">
          <span>THE RUN</span>
          <span>&middot;</span>
          <span>WORLD CUP CRICKET DRAFT</span>
          <span>&middot;</span>
          <span className="font-mono">2003 &mdash; 2023</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Big RUN Branding & Call to Action */}
          <div className="lg:col-span-7 space-y-5">
            {/* Giant RUN Title */}
            <div className="flex items-baseline gap-2 leading-none select-none">
              <span className="font-headline text-8xl sm:text-9xl md:text-[140px] font-black tracking-tighter text-slate-900 dark:text-white">
                RUN
              </span>
            </div>

            {/* Headline */}
            <div>
              <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-wide uppercase leading-tight">
                BUILD YOUR DREAM WORLD CUP XI
              </h2>
              <p className="text-sm sm:text-base text-stone-600 dark:text-slate-300 mt-2 max-w-xl leading-relaxed">
                A cricket drafting game built for World Cup fans: roll a national team and tournament year (strictly 2003&ndash;2023), draft one real player at a time, and see whether your XI can turn cricket memory into an unbeaten World Cup championship run.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onStartDraft}
                className="px-8 py-4 rounded-2xl font-headline text-2xl tracking-wider uppercase text-white bg-brand-red hover:bg-brand-red-hover active:scale-95 transition-all shadow-xl shadow-brand-red/25 flex items-center gap-2 cursor-pointer"
              >
                <span>PLAY NOW</span>
                <ArrowRight className="w-6 h-6 stroke-[3]" />
              </button>

              <div className="relative">
                <button
                  onClick={() => {
                    onModeChange(mode === 'classic' ? 'daily' : 'classic');
                  }}
                  className="px-5 py-3.5 rounded-2xl font-bold text-sm bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 text-slate-900 dark:text-white shadow-sm hover:bg-stone-50 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-brand-red" />
                  <span>{mode === 'daily' ? 'DAILY CHALLENGE ON' : 'TRY DAILY SEED'}</span>
                </button>
                <span className="absolute -top-2.5 -right-2 px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider shadow">
                  DAILY
                </span>
              </div>
            </div>

            {/* Mode & Difficulty Pills */}
            <div className="pt-2 space-y-3">
              {/* Difficulty selector */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold uppercase tracking-wider text-stone-500 dark:text-slate-400 mr-1 text-[11px]">
                  DIFFICULTY:
                </span>
                {(['easy', 'medium', 'hard', 'legend'] as DifficultyLevel[]).map((d) => {
                  const isSelected = difficulty === d;
                  return (
                    <button
                      key={d}
                      onClick={() => onDifficultyChange(d)}
                      className={`px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider text-xs transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow'
                          : 'bg-white dark:bg-slate-900 border border-stone-300 dark:border-slate-800 text-stone-600 dark:text-slate-300 hover:border-stone-400'
                      }`}
                    >
                      {d} ({DIFFICULTIES[d].rerolls} {DIFFICULTIES[d].rerolls === 1 ? 'Reroll' : 'Rerolls'})
                    </button>
                  );
                })}
              </div>

              {/* Roster slots info */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-stone-500 dark:text-slate-400">
                <span className="font-bold uppercase tracking-wider">ROSTER SLOTS:</span>
                <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 font-semibold text-stone-700 dark:text-slate-300">2 Openers</span>
                <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 font-semibold text-stone-700 dark:text-slate-300">3 Middle</span>
                <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 font-semibold text-stone-700 dark:text-slate-300">1 Wicketkeeper</span>
                <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 font-semibold text-stone-700 dark:text-slate-300">2 All-Rounders</span>
                <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 font-semibold text-stone-700 dark:text-slate-300">3 Bowlers</span>
              </div>
            </div>

            {/* Bottom Counter Bar */}
            <div className="pt-2 flex items-center gap-4 text-xs font-bold text-stone-600 dark:text-slate-400 font-mono border-t border-stone-200 dark:border-slate-800">
              <span>8 NATIONS</span>
              <span>&middot;</span>
              <span>48 WORLD CUP SQUADS</span>
              <span>&middot;</span>
              <span>720 REAL TOURNAMENT CARDS</span>
            </div>
          </div>

          {/* Right Column: Mini Pitch Graphic Visualizer (Matching Screenshot 4) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-[3/4] pitch-field rounded-3xl border-4 border-emerald-900/60 shadow-2xl p-4 overflow-hidden">
              {/* Cricket Field Markings */}
              <div className="absolute inset-4 rounded-full border border-white/20" />
              <div className="absolute inset-10 rounded-full border border-dashed border-white/20" />
              
              {/* Pitch strip */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-36 bg-[#caba98] rounded shadow-inner border border-stone-300/40">
                <div className="w-full h-1 border-b border-white/80 mt-3" />
                <div className="w-full h-1 border-b border-white/80 mt-24" />
              </div>

              {/* Sample 11 XI circle tokens with names */}
              <div className="relative z-10 w-full h-full flex flex-col justify-between py-2 text-center text-white">
                {/* Openers */}
                <div className="flex justify-around px-8">
                  <TokenCircle number="10" name="Tendulkar" rating="92" />
                  <TokenCircle number="45" name="Rohit" rating="90" />
                </div>

                {/* Middle order */}
                <div className="flex justify-around px-4">
                  <TokenCircle number="14" name="Ponting" rating="91" />
                  <TokenCircle number="18" name="Kohli" rating="93" />
                  <TokenCircle number="17" name="de Villiers" rating="97" />
                </div>

                {/* Wicketkeeper */}
                <div className="flex justify-center">
                  <TokenCircle number="7" name="Dhoni (WK)" rating="84" />
                </div>

                {/* All-rounders */}
                <div className="flex justify-around px-10">
                  <TokenCircle number="12" name="Yuvraj" rating="86" />
                  <TokenCircle number="55" name="Stokes" rating="88" />
                </div>

                {/* Bowlers */}
                <div className="flex justify-around px-4">
                  <TokenCircle number="11" name="McGrath" rating="96" />
                  <TokenCircle number="11" name="Shami" rating="94" />
                  <TokenCircle number="56" name="Starc" rating="97" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

interface TokenCircleProps {
  number: string;
  name: string;
  rating: string;
}

const TokenCircle: React.FC<TokenCircleProps> = ({ number, name, rating }) => (
  <div className="flex flex-col items-center">
    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-slate-900 border-2 border-stone-200 shadow-md flex items-center justify-center font-bold text-xs sm:text-sm font-headline">
      {number}
    </div>
    <span className="text-[10px] sm:text-[11px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] mt-0.5 whitespace-nowrap">
      {name}
    </span>
  </div>
);
