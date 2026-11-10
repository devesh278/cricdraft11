import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  GameMode,
  DifficultyLevel,
  DraftSlotType,
  DraftedPick,
  PlayerCard,
  Squad,
  WorldCupEdition,
} from './types/game';
import { DIFFICULTIES, DEFAULT_BUDGET } from './config/difficulties';
import { rollRandomSquad, getAllSquads } from './data/squadService';
import { createDailyRng, getTodayDateString } from './engine/seededRandom';
import {
  initializeTournament,
  processMatchOutcome,
  computeTournamentMVPs,
  TOURNAMENT_STAGES,
  TournamentState,
} from './engine/tournament';
import { simulateMatch, validateRoster } from './engine/simulation';

// Components
import { Header } from './components/common/Header';
import { Modal } from './components/common/Modal';
import { HeroSection } from './components/landing/HeroSection';
import { DrawnCard } from './components/draft/DrawnCard';
import { PlayerPickerList } from './components/draft/PlayerPickerList';
import { CricketPitchBoard, SLOTS_METADATA } from './components/draft/CricketPitchBoard';
import { ScorecardPanel } from './components/draft/ScorecardPanel';
import { MinimalMatchResult } from './components/match/MinimalMatchResult';
import { TournamentPath } from './components/tournament/TournamentPath';
import { FinalSummary } from './components/tournament/FinalSummary';
import { Trophy } from 'lucide-react';

export function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState<boolean>(false);

  // Game configuration
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [budgetEnabled, setBudgetEnabled] = useState<boolean>(false);
  const [totalBudget, setTotalBudget] = useState<number>(DEFAULT_BUDGET);

  // Draft state
  const [draftedPicks, setDraftedPicks] = useState<DraftedPick[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<DraftSlotType | null>(null);
  const [currentSquad, setCurrentSquad] = useState<Squad | null>(null);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [rerollsRemaining, setRerollsRemaining] = useState<number>(DIFFICULTIES.medium.rerolls);
  const [usedSquadIds, setUsedSquadIds] = useState<string[]>([]);

  // Tournament state
  const [tournamentState, setTournamentState] = useState<TournamentState | null>(null);
  const [activeMatchResult, setActiveMatchResult] = useState<any>(null);
  const [gamePhase, setGamePhase] = useState<'drafting' | 'tournament' | 'summary'>('drafting');

  const draftZoneRef = useRef<HTMLDivElement>(null);

  // Daily mode RNG generator
  const dailyRng = useMemo(() => {
    return gameMode === 'daily' ? createDailyRng(getTodayDateString()) : Math.random;
  }, [gameMode]);

  // Sync theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Roll squad
  const rollNewSquad = useCallback(
    (forcedCountry?: string, forcedYear?: WorldCupEdition) => {
      setIsRolling(true);
      setTimeout(() => {
        let rolled: Squad;
        if (forcedCountry) {
          // Find squad with same country but different year
          const sameCountry = getAllSquads().filter(
            (s) => s.country === forcedCountry && s.id !== currentSquad?.id
          );
          rolled =
            sameCountry.length > 0
              ? sameCountry[Math.floor(dailyRng() * sameCountry.length)]
              : rollRandomSquad(dailyRng, usedSquadIds);
        } else if (forcedYear) {
          // Find squad with same year but different country
          const sameYear = getAllSquads().filter(
            (s) => s.year === forcedYear && s.id !== currentSquad?.id
          );
          rolled =
            sameYear.length > 0
              ? sameYear[Math.floor(dailyRng() * sameYear.length)]
              : rollRandomSquad(dailyRng, usedSquadIds);
        } else {
          rolled = rollRandomSquad(dailyRng, usedSquadIds);
        }

        setCurrentSquad(rolled);
        setUsedSquadIds((prev) => [...prev, rolled.id]);
        setIsRolling(false);
      }, 350);
    },
    [dailyRng, usedSquadIds, currentSquad]
  );

  // Initialize draft when mode or difficulty changes
  useEffect(() => {
    setRerollsRemaining(DIFFICULTIES[difficulty].rerolls);
    setDraftedPicks([]);
    setSelectedSlot(null);
    setUsedSquadIds([]);
    setTournamentState(null);
    setActiveMatchResult(null);
    setGamePhase('drafting');
    rollNewSquad();
  }, [gameMode, difficulty]);

  // Handle Reroll actions
  const handleRerollAll = () => {
    if (rerollsRemaining <= 0 || isRolling || draftedPicks.length >= 11) return;
    setRerollsRemaining((prev) => prev - 1);
    rollNewSquad();
  };

  const handleRerollNation = () => {
    if (rerollsRemaining <= 0 || isRolling || draftedPicks.length >= 11) return;
    setRerollsRemaining((prev) => prev - 1);
    // Keep same year, pick another nation
    rollNewSquad(undefined, currentSquad?.year);
  };

  const handleRerollEdition = () => {
    if (rerollsRemaining <= 0 || isRolling || draftedPicks.length >= 11) return;
    setRerollsRemaining((prev) => prev - 1);
    // Keep same nation, pick another WC edition
    rollNewSquad(currentSquad?.country, undefined);
  };

  // Helper: check slot compatibility
  const isSlotCompatible = useCallback((slot: DraftSlotType, player: PlayerCard): boolean => {
    const slotDef = SLOTS_METADATA.find((s) => s.slot === slot);
    if (!slotDef) return false;
    return slotDef.expectedRoles.includes(player.role);
  }, []);

  // Compute budget
  const spentBudget = useMemo(() => {
    return draftedPicks.reduce((sum, p) => sum + p.player.cost, 0);
  }, [draftedPicks]);
  const remainingBudget = totalBudget - spentBudget;

  // Track drafted player canonical IDs (duplicate prevention across all years)
  const draftedCanonicalIds = useMemo(() => {
    return new Set(draftedPicks.map((p) => p.player.canonicalId));
  }, [draftedPicks]);

  // Find next open slot
  const getNextAvailableSlot = useCallback(
    (player: PlayerCard): DraftSlotType | null => {
      const filledSlots = new Set(draftedPicks.map((p) => p.slot));

      // 1. Try naturally compatible open slot
      for (const slotDef of SLOTS_METADATA) {
        if (!filledSlots.has(slotDef.slot) && slotDef.expectedRoles.includes(player.role)) {
          return slotDef.slot;
        }
      }

      // 2. Fall back to any open slot (out of position)
      for (const slotDef of SLOTS_METADATA) {
        if (!filledSlots.has(slotDef.slot)) {
          return slotDef.slot;
        }
      }

      return null;
    },
    [draftedPicks]
  );

  // Handle drafting a player card
  const handleDraftPlayer = (player: PlayerCard) => {
    if (!currentSquad || draftedPicks.length >= 11) return;

    if (draftedCanonicalIds.has(player.canonicalId)) {
      alert(`Cannot draft ${player.name}: already in your XI!`);
      return;
    }

    if (budgetEnabled && player.cost > remainingBudget) {
      alert(`Cannot draft ${player.name}: cost (${player.cost}) exceeds remaining budget (${remainingBudget})!`);
      return;
    }

    const targetSlot = selectedSlot || getNextAvailableSlot(player);
    if (!targetSlot) return;

    const compatible = isSlotCompatible(targetSlot, player);
    const isOutOfPosition = !compatible;

    const baseRating =
      player.role === 'Pace' || player.role === 'Spin'
        ? player.bowlingRating
        : player.battingRating;
    const effectiveRating = isOutOfPosition ? Math.round(baseRating * 0.75) : baseRating;

    const newPick: DraftedPick = {
      slot: targetSlot,
      player,
      country: currentSquad.country,
      year: currentSquad.year,
      isOutOfPosition,
      effectiveRating,
    };

    setDraftedPicks((prev) => [...prev.filter((p) => p.slot !== targetSlot), newPick]);
    setSelectedSlot(null);

    // Roll next squad if still picking
    if (draftedPicks.length + 1 < 11) {
      rollNewSquad();
    }
  };

  // Remove pick
  const handleRemovePick = (slot: DraftSlotType) => {
    setDraftedPicks((prev) => prev.filter((p) => p.slot !== slot));
    setSelectedSlot(slot);
  };

  // Start Tournament Campaign
  const handleStartSimulation = () => {
    const valid = validateRoster(draftedPicks);
    if (!valid.valid) {
      alert(valid.errors.join('\n'));
      return;
    }

    const tState = initializeTournament(dailyRng);
    setTournamentState(tState);
    setGamePhase('tournament');

    // Simulate Match 1
    simulateCurrentStageMatch(tState, 0);
  };

  // Simulate stage match
  const simulateCurrentStageMatch = (tState: TournamentState, stageIdx: number) => {
    const opponent = tState.opponentsByStage[stageIdx];
    const diffConfig = DIFFICULTIES[difficulty];

    const result = simulateMatch(draftedPicks, opponent, diffConfig, dailyRng);

    const matchMinimal = {
      matchNumber: stageIdx + 1,
      stageName: TOURNAMENT_STAGES[stageIdx].name,
      opponentSquadName: opponent.country,
      opponentYear: opponent.year,
      won: result.won,
      marginText: result.marginText,
      topRunScorer: result.topRunScorer,
      topWicketTaker: result.topWicketTaker,
    };

    setActiveMatchResult({
      minimal: matchMinimal,
      performances: result.userPlayerPerformances,
      isKnockout: TOURNAMENT_STAGES[stageIdx].isKnockout,
    });
  };

  // Continue after match
  const handleContinueAfterMatch = () => {
    if (!tournamentState || !activeMatchResult) return;

    const yearMap = new Map<string, WorldCupEdition>();
    draftedPicks.forEach((p) => yearMap.set(p.player.canonicalId, p.year));

    const nextState = processMatchOutcome(
      tournamentState,
      activeMatchResult.minimal,
      activeMatchResult.performances,
      yearMap
    );

    setTournamentState(nextState);
    setActiveMatchResult(null);

    if (nextState.isCompleted) {
      setGamePhase('summary');
    } else {
      simulateCurrentStageMatch(nextState, nextState.currentStageIndex);
    }
  };

  // Restart
  const handlePlayAgain = () => {
    setDraftedPicks([]);
    setSelectedSlot(null);
    setTournamentState(null);
    setActiveMatchResult(null);
    setGamePhase('drafting');
    setRerollsRemaining(DIFFICULTIES[difficulty].rerolls);
    rollNewSquad();
  };

  const scrollToDraftZone = () => {
    draftZoneRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // MVPs for summary
  const tournamentMVPs = useMemo(() => {
    if (!tournamentState) {
      return {
        topBatter: { name: 'Batter', runs: 0, year: 2023 as WorldCupEdition },
        topBowler: { name: 'Bowler', wickets: 0, year: 2023 as WorldCupEdition },
      };
    }
    return computeTournamentMVPs(tournamentState.userTournamentStats);
  }, [tournamentState]);

  return (
    <div className="min-h-screen bg-[#f5f4ef] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Nav Header */}
      <Header
        mode={gameMode}
        onModeChange={(m) => setGameMode(m)}
        difficulty={difficulty}
        onDifficultyChange={(d) => setDifficulty(d)}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        onOpenRules={() => setIsRulesModalOpen(true)}
        isDrafting={draftedPicks.length > 0}
        onLogoClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full pb-16">
        {/* 1. Hero Landing Section (Matching Screenshot 4) */}
        {gamePhase === 'drafting' && draftedPicks.length === 0 && (
          <HeroSection
            mode={gameMode}
            onModeChange={(m) => setGameMode(m)}
            difficulty={difficulty}
            onDifficultyChange={(d) => setDifficulty(d)}
            onStartDraft={scrollToDraftZone}
          />
        )}

        {/* 2. DRAFT ZONE: 3-Column Layout (Matching Screenshots 1, 2, 3) */}
        {gamePhase === 'drafting' && (
          <div ref={draftZoneRef} className="max-w-7xl mx-auto px-4 pt-6 space-y-4">
            {/* Draft Zone Title Bar (Matching Screenshot 1) */}
            <div className="border-b border-stone-200 dark:border-slate-800 pb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-slate-400 block">
                DRAFT ZONE / WORLD CUP CRICKET
              </span>
              <h2 className="font-headline text-3xl sm:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                PLAY THE CRICDRAFT RUN NOW
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-slate-400 mt-0.5">
                Lock in your 11 positions and chase an unbeaten championship run. Every turn gives you one squad, one decision, and one chance to keep the XI balanced.
              </p>
            </div>

            {/* 3-COLUMN CORE DRAFT DASHBOARD */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* LEFT COLUMN: DRAWN Squad Card + PICK A PLAYER List */}
              <div className="lg:col-span-4 space-y-4">
                <DrawnCard
                  squad={currentSquad}
                  isRolling={isRolling}
                  onRerollAll={handleRerollAll}
                  onRerollNation={handleRerollNation}
                  onRerollEdition={handleRerollEdition}
                  rerollsRemaining={rerollsRemaining}
                />

                <PlayerPickerList
                  squad={currentSquad}
                  onDraftPlayer={handleDraftPlayer}
                  draftedCanonicalIds={draftedCanonicalIds}
                  remainingBudget={remainingBudget}
                  budgetEnabled={budgetEnabled}
                  selectedSlot={selectedSlot}
                  isSlotCompatible={isSlotCompatible}
                />
              </div>

              {/* CENTER COLUMN: Vertical Cricket Ground Pitch */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <CricketPitchBoard
                  picks={draftedPicks}
                  selectedSlot={selectedSlot}
                  onSelectSlot={(slot) => setSelectedSlot(slot)}
                  onRemovePick={handleRemovePick}
                  isDraftLocked={false}
                />
              </div>

              {/* RIGHT COLUMN: SCORECARD + TEAM RATINGS + LINEUP CHECKLIST */}
              <div className="lg:col-span-3">
                <ScorecardPanel
                  picks={draftedPicks}
                  selectedSlot={selectedSlot}
                  onSelectSlot={(slot) => setSelectedSlot(slot)}
                  onStartSimulation={handleStartSimulation}
                  onOpenRules={() => setIsRulesModalOpen(true)}
                  budgetEnabled={budgetEnabled}
                  onToggleBudget={() => setBudgetEnabled(!budgetEnabled)}
                  remainingBudget={remainingBudget}
                  totalBudget={totalBudget}
                />
              </div>
            </div>
          </div>
        )}

        {/* Phase: Tournament Live Simulation */}
        {gamePhase === 'tournament' && tournamentState && (
          <div className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
            <div className="text-center space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-red font-mono">
                TOURNAMENT SIMULATION
              </span>
              <h2 className="font-headline text-4xl sm:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                WORLD CUP CAMPAIGN &middot; THE RUN
              </h2>
            </div>

            {/* 7-Match Ladder Progression */}
            <TournamentPath
              currentStageIndex={tournamentState.currentStageIndex}
              matchResults={tournamentState.matchResults}
              isCompleted={tournamentState.isCompleted}
              isChampion={tournamentState.isChampion}
            />

            {/* User XI Pitch Visualizer (Locked View) */}
            <div className="flex justify-center">
              <CricketPitchBoard
                picks={draftedPicks}
                selectedSlot={null}
                onSelectSlot={() => {}}
                onRemovePick={() => {}}
                isDraftLocked={true}
              />
            </div>
          </div>
        )}

        {/* Phase: Tournament Final Summary */}
        {gamePhase === 'summary' && tournamentState && (
          <FinalSummary
            picks={draftedPicks}
            matchResults={tournamentState.matchResults}
            isChampion={tournamentState.isChampion}
            isEliminated={tournamentState.isEliminated}
            eliminationStageName={tournamentState.eliminationStageName}
            mvp={tournamentMVPs}
            difficulty={difficulty}
            mode={gameMode}
            onPlayAgain={handlePlayAgain}
          />
        )}
      </main>

      {/* Strict Minimal Match Result Modal */}
      {activeMatchResult && (
        <MinimalMatchResult
          result={activeMatchResult.minimal}
          isKnockout={activeMatchResult.isKnockout}
          onContinue={handleContinueAfterMatch}
        />
      )}

      {/* Rules / How to play Modal */}
      <Modal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        title="CricDraft: Rules & Guide"
      >
        <div className="space-y-4 text-xs leading-relaxed text-stone-600 dark:text-slate-300">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1 flex items-center gap-1.5 font-headline uppercase tracking-wider">
              <span>Goal: The Unbeaten Run</span>
            </h4>
            <p>
              Modeled after the viral football drafting game. Every turn, you roll a random World Cup squad (strictly 2003, 2007, 2011, 2015, 2019, 2023). Pick ONE player to build your 11, then simulate a 7-match tournament path.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1 font-headline uppercase tracking-wider">
              11 Roster Positions
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>2 Openers, 3 Middle Order, 1 Wicketkeeper, 2 All-Rounders, 3 Bowlers.</li>
              <li>Out-of-position placement is allowed with a <strong>0.75x rating penalty</strong> marked with <span className="text-amber-500 font-mono font-bold">~</span>.</li>
              <li>Must have at least 1 Wicketkeeper and at least 5 bowling options.</li>
              <li>No duplicate players in your XI, even from different World Cup editions.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1 font-headline uppercase tracking-wider">
              Authentic Tournament Stats
            </h4>
            <p>
              Ratings are computed strictly from that player's performance in that specific tournament edition:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li><strong>Batters:</strong> 30% Average, 25% Strike Rate, 20% Runs, 25% Big-Match performance.</li>
              <li><strong>Bowlers:</strong> 30% Wickets, 25% Economy (inverted), 20% Bowling Average (inverted), 25% Big-Match wickets.</li>
            </ul>
          </div>
        </div>
      </Modal>

      {/* Footer */}
      <footer className="border-t border-stone-200 dark:border-slate-800 bg-[#f5f4ef] dark:bg-slate-950 py-4 text-center text-xs text-stone-500 dark:text-slate-500">
        <p>CricDraft &bull; World Cup Cricket Run &bull; ODI World Cups (2003&ndash;2023)</p>
      </footer>
    </div>
  );
}

export default App;
