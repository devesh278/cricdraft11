# CricDraft - World Cup Cricket Draft & Tournament Run

A complete, solo playable web game modeled after the viral football drafting game style, built specifically for **ODI Cricket World Cups (strictly 2003–2023)**.

Players roll random countries and World Cup editions, draft an authentic XI from 15-man tournament squads, and attempt to simulate an undefeated **World Cup championship run**.

---

## 🏏 Core Features & Mechanics

1. **Random Squad Rolls (2003–2023 Only)**:
   - Every roll selects a country and an edition from **2003, 2007, 2011, 2015, 2019, 2023**. Pre-2003 editions are never included.
   - Suspenseful slot-machine animated reveal with country colors and edition tags.

2. **11-Slot Roster Drafting**:
   - **2 Openers**, **3 Middle-Order**, **1 Wicketkeeper**, **2 All-Rounders**, **3 Bowlers** (Pace or Spin).
   - **Out-of-position placement penalty**: Players can be placed in non-native slots, but incur an effective rating reduction of **0.75x** with a `~` visual penalty badge.
   - **Validation checks**: XI must have $\ge 1$ Wicketkeeper and $\ge 5$ bowling options (Bowlers + All-rounders) before simulating.
   - **Duplicate prevention**: A player can appear across multiple tournaments (e.g. Virat Kohli in 2011, 2015, 2019, 2023) as distinct cards, but the same player cannot be drafted twice in one XI.

3. **Difficulty System**:
   - **Easy**: 5 Rerolls, 0.90x opponent strength, low upset volatility.
   - **Medium**: 3 Rerolls, 1.00x opponent strength, balanced tournament challenge.
   - **Hard**: 1 Reroll, 1.08x opponent strength, aggressive AI.
   - **Legend**: 0 Rerolls, 1.15x opponent strength, high upset factor for the ultimate trial.

4. **Optional Team Rating Cap (Budget System)**:
   - Each player card has a cost from **60–99** derived from their rating.
   - Default budget cap (850 points, customizable). Blocks picks that exceed remaining budget and renders a visual progress bar.

5. **Tournament-Specific Performance Ratings (60–99)**:
   - Computed **strictly from that player's performance in that specific tournament edition** (not career stats).
   - **Batters**: 30% Average, 25% Strike Rate, 20% Total Runs, 25% Big-Match composite.
   - **Bowlers**: 30% Wickets, 25% Economy (inverted), 20% Bowling Average (inverted), 25% Big-Match wickets.
   - Minimum sample filters: Batters need $\ge 3$ innings, Bowlers need $\ge 20$ overs.

6. **Match Simulation & Strict Minimal Output**:
   - Simulates team batting and bowling strengths with toss, pitch condition, and chasing dynamics.
   - Handles ties with a **Super Over** tie-break.
   - Output strictly satisfies the minimal requirement:
     1. **Result & Margin** (e.g. *"Won by 34 runs"* or *"Won by 4 wickets"*)
     2. **Highest run-scorer of the match** (Name + runs)
     3. **Highest wicket-taker of the match** (Name + wickets)

7. **7-Match Tournament Path**:
   - 4 Group Matches + Quarter-Final + Semi-Final + World Cup Final.
   - Losing any knockout terminates the run. A perfect 7-match victory triggers celebratory fireworks and the **World Cup Champion** glory.
   - **Summary Screen**: Shows matches won, total campaign outcome, and user XI tournament MVPs (Top Run-Scorer & Top Wicket-Taker).

---

## 🗂 Architecture & Directory Structure

```text
cricdraft-11/
├── index.html                    # Single Page Application HTML shell
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript compiler configuration
├── tsconfig.node.json
├── vite.config.ts                # Vite configuration
├── tailwind.config.js            # Tailwind custom colors & turf styling
├── postcss.config.js             # PostCSS setup
├── scripts/
│   ├── compute_ratings.js        # Dataset parser & rating normalization script
│   └── raw_data/                 # Raw match scorecards (2003, 2007, 2011, 2015, 2019, 2023)
├── src/
│   ├── main.tsx                  # App entry point
│   ├── App.tsx                   # Main game orchestrator & state machine
│   ├── index.css                 # Global CSS + Tailwind directives + turf pattern
│   ├── types/
│   │   └── game.ts               # Core TypeScript definitions
│   ├── config/
│   │   ├── ratingWeights.ts      # Config object for weights, bounds, sample filters
│   │   └── difficulties.ts       # Difficulty presets & budget constants
│   ├── data/
│   │   ├── squads.json           # Seed dataset (48 squads, 720 player cards)
│   │   └── squadService.ts       # Squad rolls and lookup utilities
│   ├── engine/
│   │   ├── simulation.ts         # Match simulation engine
│   │   ├── simulation.test.ts    # Comprehensive unit tests (Vitest)
│   │   ├── tournament.ts         # 7-match progression state manager
│   │   └── seededRandom.ts       # Deterministic PRNG for Daily Challenge mode
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.tsx        # Mode toggle, theme toggle, difficulty, rules
│   │   │   ├── Modal.tsx         # Accessible dialog component
│   │   │   └── Badge.tsx         # Role, rating, and out-of-position badges
│   │   ├── draft/
│   │   │   ├── RollAnimation.tsx # Suspenseful animated reveal for Country + WC Edition
│   │   │   ├── BudgetBar.tsx     # Budget cap meter with danger threshold
│   │   │   ├── PlayerCard.tsx    # Card displaying WC performance stats & ratings
│   │   │   ├── SquadList.tsx     # 15-player squad list with search & role filters
│   │   │   ├── DraftBoard.tsx    # Responsive cricket field formation graphic
│   │   │   └── RosterValidation.tsx # XI validator & Start Campaign action
│   │   ├── match/
│   │   │   └── MinimalMatchResult.tsx # Strict minimal result dialog
│   │   └── tournament/
│   │       ├── TournamentPath.tsx   # 7-match progression ladder
│   │       └── FinalSummary.tsx     # End-game recap, MVPs, and Canvas share card
│   └── utils/
│       └── share.ts              # HTML5 Canvas PNG card generator
└── README.md
```

---

## ⚡ Quick Start & Setup

### Prerequisites
- Node.js (v18 or v20+)
- npm

### 1. Installation
```bash
cd /Users/deveshyadav/.gemini/antigravity/scratch/cricdraft-11
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000` to play the game!

### 3. Run Unit Tests
```bash
npm test
```
Executes the Vitest test suite verifying:
- Roster validation (11 players, $\ge 1$ WK, $\ge 5$ bowlers, no duplicate player)
- Out-of-position penalty calculation (`0.75x`)
- Minimal match output compliance (Result, Top Scorer, Top Wicket-taker)
- Deterministic simulation under seeded PRNG

### 4. Build for Production
```bash
npm run build
```

---

## 📊 Dataset & Rating Formula

### Sourcing Advice
The raw scorecard data comes from ball-by-ball records of ICC Men's Cricket World Cups. For further expansion:
- **Cricsheet** (`cricsheet.org`): Complete ball-by-ball YAML/JSON files for all ODIs since 2002.
- **ESPNcricinfo Statsguru**: Useful for verifying tournament averages, big-match breakdowns, and official player squads.

### Big-Match Criteria
Tournament formats differed over the 20-year span. Big matches are defined as:
- **2003**: Super Six matches, semi-finals, final.
- **2007**: Super Eight matches, semi-finals, final.
- **2011 & 2015**: Knockouts (quarter-finals onward) + group games against other eventual quarter-finalists.
- **2019 & 2023**: Semi-finals, final + league games between eventual top-four teams.

### Recomputing Ratings
To re-run the rating computation across all raw match data and rebuild `squads.json`:
```bash
npm run compute:ratings
```
Configurable weights and sample sizes live in `scripts/compute_ratings.js` and `src/config/ratingWeights.ts`.

---

## 🛡 Trademarks & Branding
CricDraft 11 is an independent game concept. It uses generic cricket colors and no official ICC logos, copyrighted badges, or trademarked tournament branding.
