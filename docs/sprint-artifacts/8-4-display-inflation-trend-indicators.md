# Story 8.4: Display Inflation Trend Indicators

**Story ID:** 8.4
**Story Key:** 8-4-display-inflation-trend-indicators
**Epic:** Epic 8 - Live Draft Experience - Variance & Inflation Insights
**Status:** ready-for-dev

---

## Story

As a **user**,
I want to see if inflation is trending up or down (market heating/cooling),
So that I can anticipate whether to bid more aggressively or conservatively.

---

## Acceptance Criteria

**Given** inflation has been calculated over multiple picks
**When** the InflationTracker displays trend indicators
**Then** I see an arrow icon indicating trend: ↑ "Heating" (inflation increasing), ↓ "Cooling" (inflation decreasing), → "Stable"
**And** the trend is calculated by comparing inflation rate now vs. 10 picks ago
**And** "Heating" is indicated with red/orange color (market is getting more expensive)
**And** "Cooling" is indicated with blue color (market is deflating)
**And** "Stable" is indicated with gray (inflation change < ±2%)
**And** a tooltip explains: "Inflation has increased 3% in the last 10 picks"

---

## Developer Context

### Story Foundation from Epic

From **Epic 8: Live Draft Experience - Variance & Inflation Insights** (docs/epics-stories.md lines 1105-1121):

This story adds trend indicators to the InflationTracker component, showing whether inflation is heating up, cooling down, or remaining stable. It's the fourth story in the Epic 8 sequence.

**Core Responsibilities:**

- **Trend Calculation:** Compare current inflation rate to rate from 10 picks ago
- **Arrow Icons:** Display directional arrows (↑ ↓ →) using lucide-react
- **Color Coding:** Red/orange for heating, blue for cooling, gray for stable
- **Threshold Logic:** ±2% change defines heating/cooling vs. stable
- **Tooltip:** Explain trend with numerical change over last 10 picks
- **Real-time Updates:** Trend updates as more players are drafted

**Relationship to Epic 8:**

This is Story 4 of 7 in Epic 8. It depends on:
- **Story 8.1** (Ready): InflationTracker component foundation
- **Story 8.2** (Ready): Display current inflation rate percentage
- **Epic 5** (Complete): Core Inflation Engine provides inflation calculations

It enables:
- Better strategic bidding decisions based on market momentum
- **Story 8.5**: Display tier-specific inflation breakdown
- **Story 8.6**: Display position-specific inflation breakdown

### Previous Story Intelligence

**From Story 8.1 (Create InflationTracker Component - READY):**

**Existing InflationTracker Component (src/features/draft/components/InflationTracker.tsx):**
- Has 2x2 metrics grid layout
- Current inflation rate displayed in top-left card
- Accepts props: `inflationRate`, `positionRates`, `tierRates`, `variance`
- Uses dark slate theme with emerald accents
- Ready for trend indicator enhancement

**From Story 8.2 (Display Current Inflation Rate Percentage - READY):**

**Enhanced Inflation Display:**
- Inflation rate displayed prominently with large, bold text
- Color coding: emerald for positive, red for negative
- Tooltip support with explanatory text
- Real-time updates when inflation recalculates

**Pattern to Follow:**
```typescript
<Tooltip>
  <TooltipTrigger>
    <div className="flex items-center gap-1">
      <TrendIcon className="h-4 w-4" />
      <span>{inflationRate > 0 ? '+' : ''}{inflationRate.toFixed(1)}%</span>
    </div>
  </TooltipTrigger>
  <TooltipContent>Inflation has increased 3% in the last 10 picks</TooltipContent>
</Tooltip>
```

**From Epic 5 (Core Inflation Engine - COMPLETED):**

**Existing Inflation Store (src/features/inflation/stores/inflationStore.ts):**
- Provides `inflationRate` as number
- Tracks inflation history (needed for trend calculation)
- Updates automatically when players are drafted

**Trend Calculation Pattern:**
```typescript
// Store needs to track inflation history
interface InflationState {
  inflationRate: number;
  inflationHistory: Array<{ pickNumber: number; rate: number }>;
  // ... other fields
}

// Calculate trend
function calculateTrend(history: InflationHistory[], currentPick: number): TrendDirection {
  const current = history.find(h => h.pickNumber === currentPick)?.rate ?? 0;
  const tenPicksAgo = history.find(h => h.pickNumber === currentPick - 10)?.rate ?? 0;
  const change = current - tenPicksAgo;

  if (Math.abs(change) < 2) return 'stable';
  return change > 0 ? 'heating' : 'cooling';
}
```

### Architecture Requirements

**From Architecture Document (docs/architecture.md):**

#### State Management - Zustand Store

**Inflation History Tracking (Enhancement Needed):**

The Zustand store needs to track inflation history to calculate trends:

```typescript
// In src/features/inflation/stores/inflationStore.ts

interface InflationHistoryEntry {
  pickNumber: number;
  rate: number;
  timestamp: number;
}

interface InflationState {
  inflationRate: number;
  inflationHistory: InflationHistoryEntry[];
  // ... existing fields
}

// Add to store actions
addInflationSnapshot: (pickNumber: number, rate: number) => {
  set(state => ({
    inflationHistory: [
      ...state.inflationHistory,
      { pickNumber, rate, timestamp: Date.now() }
    ]
  }));
}
```

**Trend Calculation Utility:**

```typescript
// In src/features/inflation/utils/trendCalculations.ts

export type TrendDirection = 'heating' | 'cooling' | 'stable';

export interface TrendResult {
  direction: TrendDirection;
  change: number; // Percentage change
  pickWindow: number; // Number of picks compared (typically 10)
}

export function calculateInflationTrend(
  history: InflationHistoryEntry[],
  currentPick: number,
  windowSize: number = 10
): TrendResult {
  // Find current rate
  const currentEntry = history.find(h => h.pickNumber === currentPick);
  const currentRate = currentEntry?.rate ?? 0;

  // Find rate from windowSize picks ago
  const pastPick = currentPick - windowSize;
  const pastEntry = history.find(h => h.pickNumber === pastPick);
  const pastRate = pastEntry?.rate ?? currentRate; // If not enough history, assume stable

  // Calculate change
  const change = currentRate - pastRate;

  // Determine direction
  let direction: TrendDirection;
  if (Math.abs(change) < 2) {
    direction = 'stable';
  } else {
    direction = change > 0 ? 'heating' : 'cooling';
  }

  return {
    direction,
    change,
    pickWindow: windowSize
  };
}
```

#### shadcn/ui Components

**Icons from lucide-react:**

```typescript
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// Usage
const TrendIcon = trend.direction === 'heating' ? TrendingUp
  : trend.direction === 'cooling' ? TrendingDown
  : Minus;
```

**Tooltip Component:**

```typescript
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>
      <TrendIcon className={getTrendColor(trend.direction)} />
    </TooltipTrigger>
    <TooltipContent>
      Inflation has {trend.direction === 'heating' ? 'increased' : 'decreased'} {Math.abs(trend.change).toFixed(1)}% in the last {trend.pickWindow} picks
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

#### Project Organization - Feature-Based

**Required File Structure:**
```
src/features/inflation/
  utils/
    trendCalculations.ts    # NEW - Trend calculation logic
    inflationCalculations.ts # EXISTING - Basic inflation calculations
  stores/
    inflationStore.ts       # MODIFY - Add inflation history tracking
  types/
    inflation.types.ts      # MODIFY - Add TrendDirection, TrendResult types

src/features/draft/
  components/
    InflationTracker.tsx    # MODIFY - Add trend display
```

**Testing Pattern:**
```
tests/features/inflation/
  trendCalculations.test.ts # NEW - Test trend calculation logic
  inflationStore.test.ts    # MODIFY - Test history tracking

tests/features/draft/
  InflationTracker.test.tsx # MODIFY - Test trend display
```

#### TypeScript/React Naming Conventions

**Type Definitions:**
- `TrendDirection`: Union type for trend states
- `TrendResult`: Interface for trend calculation results
- `InflationHistoryEntry`: Interface for history tracking

**Functions:**
- `calculateInflationTrend()`: Main trend calculation function
- `getTrendColor()`: Helper to get color based on trend direction
- `getTrendIcon()`: Helper to get icon based on trend direction
- `formatTrendTooltip()`: Helper to format tooltip text

### Technical Requirements

#### InflationTracker Component Modifications

**Add Trend Display to Inflation Card:**

**1. Import Dependencies:**
```typescript
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { calculateInflationTrend } from '@/features/inflation/utils/trendCalculations';
import { useInflationStore } from '@/features/inflation/stores/inflationStore';
import { useDraftStore } from '@/features/draft/stores/draftStore';
```

**2. Calculate Trend:**
```typescript
export function InflationTracker({ inflationRate, positionRates, tierRates, variance }: Props) {
  const inflationHistory = useInflationStore(state => state.inflationHistory);
  const currentPick = useDraftStore(state => state.draftedPlayers.length);

  const trend = calculateInflationTrend(inflationHistory, currentPick, 10);

  // ... rest of component
}
```

**3. Render Trend Indicator:**
```typescript
// Helper functions
function getTrendIcon(direction: TrendDirection) {
  switch (direction) {
    case 'heating': return TrendingUp;
    case 'cooling': return TrendingDown;
    case 'stable': return Minus;
  }
}

function getTrendColor(direction: TrendDirection): string {
  switch (direction) {
    case 'heating': return 'text-orange-500';
    case 'cooling': return 'text-blue-500';
    case 'stable': return 'text-slate-400';
  }
}

function getTrendLabel(direction: TrendDirection): string {
  switch (direction) {
    case 'heating': return 'Heating';
    case 'cooling': return 'Cooling';
    case 'stable': return 'Stable';
  }
}

function formatTrendTooltip(trend: TrendResult): string {
  const action = trend.direction === 'heating' ? 'increased'
    : trend.direction === 'cooling' ? 'decreased'
    : 'remained stable';

  if (trend.direction === 'stable') {
    return `Inflation has ${action} in the last ${trend.pickWindow} picks`;
  }

  return `Inflation has ${action} ${Math.abs(trend.change).toFixed(1)}% in the last ${trend.pickWindow} picks`;
}

// In the component
<div className="p-3 bg-slate-800 rounded-lg">
  <div className="text-xs text-slate-400 mb-1">Inflation</div>
  <div className="flex items-center justify-between">
    <div className={`text-3xl font-bold ${
      inflationRate > 0 ? 'text-emerald-500' : 'text-red-500'
    }`}>
      {inflationRate > 0 ? '+' : ''}{inflationRate.toFixed(1)}%
    </div>

    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col items-end">
            {React.createElement(getTrendIcon(trend.direction), {
              className: `h-5 w-5 ${getTrendColor(trend.direction)}`
            })}
            <span className={`text-xs ${getTrendColor(trend.direction)}`}>
              {getTrendLabel(trend.direction)}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-slate-900 border-slate-700">
          <p className="text-slate-200">{formatTrendTooltip(trend)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
</div>
```

#### Inflation Store Modifications

**Add History Tracking:**

```typescript
// In src/features/inflation/stores/inflationStore.ts

interface InflationHistoryEntry {
  pickNumber: number;
  rate: number;
  timestamp: number;
}

interface InflationState {
  // ... existing fields
  inflationHistory: InflationHistoryEntry[];

  // ... existing actions
  addInflationSnapshot: (pickNumber: number, rate: number) => void;
  clearHistory: () => void;
}

const useInflationStore = create<InflationState>()(
  persist(
    (set, get) => ({
      // ... existing state
      inflationHistory: [],

      // ... existing actions

      addInflationSnapshot: (pickNumber: number, rate: number) => {
        set(state => ({
          inflationHistory: [
            ...state.inflationHistory,
            { pickNumber, rate, timestamp: Date.now() }
          ]
        }));
      },

      clearHistory: () => {
        set({ inflationHistory: [] });
      },

      // Modify updateInflation to call addInflationSnapshot
      updateInflation: (draftedPlayers, projections) => {
        // ... existing calculation logic
        const newRate = calculateOverallInflation(draftedPlayers, projections);

        set({ inflationRate: newRate });

        // Add snapshot to history
        get().addInflationSnapshot(draftedPlayers.length, newRate);
      }
    }),
    {
      name: 'inflation-store',
      // ... existing persist config
    }
  )
);
```

### UX Requirements

**From UX Design Specification (docs/ux-design-specification.md):**

#### Visual Design Consistency

**Trend Indicator Styling:**
- **Icon Size:** h-5 w-5 for trend icons
- **Label Text:** text-xs for "Heating", "Cooling", "Stable" labels
- **Color Coding:**
  - Heating: text-orange-500 or text-red-500 (market getting more expensive)
  - Cooling: text-blue-500 (market deflating)
  - Stable: text-slate-400 (neutral)
- **Position:** Right side of inflation card, vertically centered
- **Tooltip:** Dark slate background (bg-slate-900) with slate border

**Layout:**
```
┌─────────────────────────────────┐
│ Inflation              ↑        │
│ +12.5%                Heating   │
└─────────────────────────────────┘
```

#### User Flow

**Trend Display Flow:**
1. User views InflationTracker component in sidebar
2. Inflation card shows current rate prominently
3. Trend indicator (arrow + label) displayed on right side
4. User hovers over trend indicator
5. Tooltip appears: "Inflation has increased 3.0% in the last 10 picks"
6. Trend updates automatically as more players are drafted

**Trend Calculation Logic:**
- Compare current inflation rate to rate 10 picks ago
- Change ≥ +2%: Heating (↑ orange/red)
- Change ≤ -2%: Cooling (↓ blue)
- Change between -2% and +2%: Stable (→ gray)

**Early Draft Behavior:**
- If fewer than 10 picks have been made, display "Stable" with gray
- Tooltip: "Not enough draft history to calculate trend"
- Once 10+ picks, calculate trend normally

#### Accessibility

**Trend Indicator Accessibility:**
- aria-label on trend icon: "Inflation trend: Heating"
- Tooltip provides additional context for screen readers
- Color is not the only indicator (icon shape also conveys meaning)
- Keyboard accessible tooltip (focus on trigger)

### Latest Technical Specifications

**React 18+ Best Practices (2025):**

**Dynamic Icon Rendering:**
```typescript
// Use React.createElement for dynamic icon selection
const TrendIcon = getTrendIcon(trend.direction);

<TrendIcon className={getTrendColor(trend.direction)} />
```

**Conditional Tooltip Content:**
```typescript
// Show different tooltip based on draft progress
const tooltipContent = currentPick < 10
  ? "Not enough draft history to calculate trend"
  : formatTrendTooltip(trend);

<TooltipContent>
  <p>{tooltipContent}</p>
</TooltipContent>
```

**Memoization for Performance:**
```typescript
import { useMemo } from 'react';

const trend = useMemo(() => {
  return calculateInflationTrend(inflationHistory, currentPick, 10);
}, [inflationHistory, currentPick]);
```

### Project Context

**Project Structure:**

```
c:\Users\lilra\myprojects\ProjectionCalculator/
  src/
    features/
      inflation/
        utils/
          trendCalculations.ts       # NEW - Trend calculation logic
          inflationCalculations.ts   # EXISTING
        stores/
          inflationStore.ts          # MODIFY - Add history tracking
        types/
          inflation.types.ts         # MODIFY - Add trend types
      draft/
        components/
          InflationTracker.tsx       # MODIFY - Add trend display
        stores/
          draftStore.ts              # EXISTING - Provides pick count
    components/
      ui/
        tooltip.tsx                  # EXISTING - shadcn/ui Tooltip
  tests/
    features/
      inflation/
        trendCalculations.test.ts  # NEW - Test trend calculations
        inflationStore.test.ts     # MODIFY - Test history tracking
      draft/
        InflationTracker.test.tsx  # MODIFY - Test trend display
```

**Existing Dependencies:**

All required dependencies already installed:
- `react` v18+ (with useMemo hook)
- `zustand` v5.0.9 (state management with persist)
- `lucide-react` (TrendingUp, TrendingDown, Minus icons)
- `shadcn/ui` components (Tooltip)

**No new dependencies needed!**

---

## Tasks / Subtasks

- [ ] **Task 1: Create Trend Calculation Utility** (AC: trend calculated)
  - [ ] Create `src/features/inflation/utils/trendCalculations.ts`
  - [ ] Define `TrendDirection` type: 'heating' | 'cooling' | 'stable'
  - [ ] Define `TrendResult` interface: { direction, change, pickWindow }
  - [ ] Implement `calculateInflationTrend()` function:
    - [ ] Accept inflationHistory, currentPick, windowSize (default 10)
    - [ ] Find current rate and rate from windowSize picks ago
    - [ ] Calculate change: currentRate - pastRate
    - [ ] Determine direction based on ±2% threshold
    - [ ] Return TrendResult object
  - [ ] Add helper functions: getTrendIcon(), getTrendColor(), getTrendLabel(), formatTrendTooltip()
  - [ ] Export all functions and types

- [ ] **Task 2: Update Inflation Types** (AC: type definitions)
  - [ ] Open `src/features/inflation/types/inflation.types.ts`
  - [ ] Add `InflationHistoryEntry` interface:
    - [ ] pickNumber: number
    - [ ] rate: number
    - [ ] timestamp: number
  - [ ] Import and re-export TrendDirection and TrendResult from trendCalculations
  - [ ] Update exports

- [ ] **Task 3: Modify Inflation Store for History Tracking** (AC: history tracked)
  - [ ] Open `src/features/inflation/stores/inflationStore.ts`
  - [ ] Import InflationHistoryEntry type
  - [ ] Add `inflationHistory: InflationHistoryEntry[]` to state (default: [])
  - [ ] Add `addInflationSnapshot` action:
    - [ ] Accept pickNumber and rate parameters
    - [ ] Append new entry to inflationHistory array
  - [ ] Add `clearHistory` action to reset history
  - [ ] Modify `updateInflation` action:
    - [ ] After calculating new inflation rate
    - [ ] Call addInflationSnapshot with pick count and new rate
  - [ ] Ensure inflationHistory is included in persist config

- [ ] **Task 4: Modify InflationTracker Component** (AC: trend displayed)
  - [ ] Open `src/features/draft/components/InflationTracker.tsx`
  - [ ] Import trend calculation utilities and types
  - [ ] Import TrendingUp, TrendingDown, Minus icons from lucide-react
  - [ ] Import Tooltip components from @/components/ui/tooltip
  - [ ] Get inflationHistory from useInflationStore
  - [ ] Get currentPick from useDraftStore (draftedPlayers.length)
  - [ ] Calculate trend using useMemo:
    - [ ] Call calculateInflationTrend(inflationHistory, currentPick, 10)
  - [ ] Modify inflation card to include trend indicator:
    - [ ] Add flex container with justify-between
    - [ ] Keep inflation rate on left (existing)
    - [ ] Add trend indicator on right (new)
  - [ ] Implement trend indicator:
    - [ ] Render trend icon with dynamic color
    - [ ] Render trend label below icon
    - [ ] Wrap in Tooltip with TooltipProvider
    - [ ] Format tooltip content based on trend and draft progress
  - [ ] Handle early draft case (< 10 picks)
  - [ ] Test trend display renders correctly

- [ ] **Task 5: Add Trend Calculation Tests** (AC: test coverage)
  - [ ] Create `tests/features/inflation/trendCalculations.test.ts`
  - [ ] Test: calculateInflationTrend returns 'heating' when rate increases > 2%
  - [ ] Test: calculateInflationTrend returns 'cooling' when rate decreases > 2%
  - [ ] Test: calculateInflationTrend returns 'stable' when rate changes < ±2%
  - [ ] Test: calculateInflationTrend handles insufficient history (< 10 picks)
  - [ ] Test: calculateInflationTrend calculates correct percentage change
  - [ ] Test: getTrendIcon returns correct icon for each direction
  - [ ] Test: getTrendColor returns correct color for each direction
  - [ ] Test: getTrendLabel returns correct label for each direction
  - [ ] Test: formatTrendTooltip formats correctly for each direction
  - [ ] Mock inflationHistory data for test cases

- [ ] **Task 6: Add Inflation Store History Tests** (AC: store tests)
  - [ ] Modify `tests/features/inflation/inflationStore.test.ts`
  - [ ] Test: addInflationSnapshot adds entry to inflationHistory
  - [ ] Test: addInflationSnapshot includes correct pickNumber, rate, timestamp
  - [ ] Test: clearHistory resets inflationHistory to empty array
  - [ ] Test: updateInflation calls addInflationSnapshot automatically
  - [ ] Test: inflationHistory persists to localStorage
  - [ ] Test: inflationHistory accumulates over multiple inflation updates

- [ ] **Task 7: Add InflationTracker Trend Display Tests** (AC: component tests)
  - [ ] Modify `tests/features/draft/InflationTracker.test.tsx`
  - [ ] Test: Trend indicator renders when history is available
  - [ ] Test: TrendingUp icon displayed when inflation is heating
  - [ ] Test: TrendingDown icon displayed when inflation is cooling
  - [ ] Test: Minus icon displayed when inflation is stable
  - [ ] Test: Correct color applied to trend icon and label
  - [ ] Test: Tooltip displays correct message for heating trend
  - [ ] Test: Tooltip displays correct message for cooling trend
  - [ ] Test: Tooltip displays correct message for stable trend
  - [ ] Test: "Not enough history" shown when < 10 picks
  - [ ] Test: Trend updates when inflationHistory changes
  - [ ] Mock inflationHistory and currentPick in tests

- [ ] **Task 8: Test End-to-End** (AC: all acceptance criteria met)
  - [ ] Verify: Trend indicator appears in InflationTracker
  - [ ] Verify: Arrow icon matches trend direction (↑ heating, ↓ cooling, → stable)
  - [ ] Verify: Color coding correct (red/orange heating, blue cooling, gray stable)
  - [ ] Verify: Trend label displays ("Heating", "Cooling", "Stable")
  - [ ] Verify: Tooltip shows percentage change over last 10 picks
  - [ ] Verify: Trend calculation compares current to 10 picks ago
  - [ ] Verify: ±2% threshold determines stable vs. heating/cooling
  - [ ] Verify: Trend updates in real-time as players are drafted
  - [ ] Verify: Early draft (< 10 picks) shows "Stable" with appropriate tooltip
  - [ ] Verify: Keyboard navigation works (focus tooltip trigger, read content)
  - [ ] Verify: Mobile responsive (trend visible on small screens)

- [ ] **Task 9: Update Sprint Status** (AC: story tracking)
  - [ ] Update `docs/sprint-artifacts/sprint-status.yaml`
  - [ ] Change `8-4-display-inflation-trend-indicators: backlog → ready-for-dev → in-progress → completed`
  - [ ] Update story file with completion notes

---

## Dev Notes

### Implementation Approach

**Step-by-Step Implementation Order:**

1. **Create Trend Calculation Utility**: Pure functions for trend logic
2. **Update Inflation Types**: Add necessary type definitions
3. **Modify Inflation Store**: Add history tracking with automatic snapshots
4. **Update InflationTracker Component**: Display trend with icon, label, and tooltip
5. **Testing**: Comprehensive tests for calculations, store, and component
6. **End-to-End**: Verify all acceptance criteria

### Trend Calculation Logic

**Key Algorithm:**

```typescript
function calculateInflationTrend(
  history: InflationHistoryEntry[],
  currentPick: number,
  windowSize: number = 10
): TrendResult {
  // 1. Get current rate
  const currentEntry = history.find(h => h.pickNumber === currentPick);
  const currentRate = currentEntry?.rate ?? 0;

  // 2. Get past rate (windowSize picks ago)
  const pastPick = currentPick - windowSize;
  const pastEntry = history.find(h => h.pickNumber === pastPick);
  const pastRate = pastEntry?.rate ?? currentRate; // Default to stable if no history

  // 3. Calculate change
  const change = currentRate - pastRate;

  // 4. Determine direction based on ±2% threshold
  let direction: TrendDirection;
  if (Math.abs(change) < 2) {
    direction = 'stable';
  } else {
    direction = change > 0 ? 'heating' : 'cooling';
  }

  return { direction, change, pickWindow: windowSize };
}
```

**Example Scenarios:**

1. **Heating Market:**
   - Current rate: 15.5%
   - Rate 10 picks ago: 12.0%
   - Change: +3.5%
   - Direction: 'heating' (change > +2%)
   - Display: ↑ Heating (orange/red)
   - Tooltip: "Inflation has increased 3.5% in the last 10 picks"

2. **Cooling Market:**
   - Current rate: 8.2%
   - Rate 10 picks ago: 12.5%
   - Change: -4.3%
   - Direction: 'cooling' (change < -2%)
   - Display: ↓ Cooling (blue)
   - Tooltip: "Inflation has decreased 4.3% in the last 10 picks"

3. **Stable Market:**
   - Current rate: 10.8%
   - Rate 10 picks ago: 11.2%
   - Change: -0.4%
   - Direction: 'stable' (|change| < 2%)
   - Display: → Stable (gray)
   - Tooltip: "Inflation has remained stable in the last 10 picks"

4. **Early Draft (< 10 picks):**
   - Current pick: 5
   - Window size: 10
   - Not enough history
   - Direction: 'stable' (default)
   - Display: → Stable (gray)
   - Tooltip: "Not enough draft history to calculate trend"

### Inflation History Tracking

**How History Accumulates:**

```typescript
// When draft starts
inflationHistory: []

// After 1st pick
inflationHistory: [
  { pickNumber: 1, rate: 0.0, timestamp: 1702500000000 }
]

// After 5th pick
inflationHistory: [
  { pickNumber: 1, rate: 0.0, timestamp: 1702500000000 },
  { pickNumber: 2, rate: 2.5, timestamp: 1702500120000 },
  { pickNumber: 3, rate: 4.8, timestamp: 1702500240000 },
  { pickNumber: 4, rate: 6.2, timestamp: 1702500360000 },
  { pickNumber: 5, rate: 7.5, timestamp: 1702500480000 }
]

// After 15th pick (can calculate trend)
inflationHistory: [
  // ... picks 1-14
  { pickNumber: 15, rate: 12.3, timestamp: 1702501680000 }
]
// Trend compares pick 15 (12.3%) to pick 5 (7.5%) = +4.8% → Heating
```

**Store Integration:**

```typescript
// updateInflation is called automatically when player is drafted
updateInflation: (draftedPlayers, projections) => {
  // Calculate new inflation rate
  const newRate = calculateOverallInflation(draftedPlayers, projections);

  set({ inflationRate: newRate });

  // Automatically add snapshot to history
  get().addInflationSnapshot(draftedPlayers.length, newRate);
}
```

### Visual Design Details

**Inflation Card Layout:**

```
┌─────────────────────────────────┐
│ Inflation                       │
│                                 │
│ +12.5%              ↑           │
│                   Heating       │
└─────────────────────────────────┘
```

**Component Structure:**

```typescript
<div className="p-3 bg-slate-800 rounded-lg">
  {/* Header */}
  <div className="text-xs text-slate-400 mb-1">Inflation</div>

  {/* Content: Rate on left, Trend on right */}
  <div className="flex items-center justify-between">
    {/* Inflation Rate (left) */}
    <div className="text-3xl font-bold text-emerald-500">
      +12.5%
    </div>

    {/* Trend Indicator (right) */}
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col items-end">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            <span className="text-xs text-orange-500">Heating</span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-slate-900 border-slate-700">
          <p className="text-slate-200">
            Inflation has increased 3.5% in the last 10 picks
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
</div>
```

### Testing Strategy

**Trend Calculation Tests:**

```typescript
describe('calculateInflationTrend', () => {
  const mockHistory: InflationHistoryEntry[] = [
    { pickNumber: 1, rate: 0, timestamp: 1000 },
    { pickNumber: 5, rate: 5.0, timestamp: 2000 },
    { pickNumber: 10, rate: 8.5, timestamp: 3000 },
    { pickNumber: 15, rate: 12.0, timestamp: 4000 },
    { pickNumber: 20, rate: 11.8, timestamp: 5000 },
  ];

  it('returns heating when rate increases > 2%', () => {
    const trend = calculateInflationTrend(mockHistory, 15, 10);

    expect(trend.direction).toBe('heating');
    expect(trend.change).toBe(3.5); // 12.0 - 8.5
  });

  it('returns cooling when rate decreases > 2%', () => {
    const trend = calculateInflationTrend(mockHistory, 20, 10);

    expect(trend.direction).toBe('cooling');
    expect(trend.change).toBe(-0.2); // Actually stable in this case
  });

  it('returns stable when change < ±2%', () => {
    const trend = calculateInflationTrend(mockHistory, 20, 10);

    expect(trend.direction).toBe('stable');
  });

  it('handles insufficient history gracefully', () => {
    const earlyHistory = mockHistory.slice(0, 1);
    const trend = calculateInflationTrend(earlyHistory, 5, 10);

    expect(trend.direction).toBe('stable');
    expect(trend.change).toBe(0);
  });
});
```

**Component Tests:**

```typescript
describe('InflationTracker - Trend Display', () => {
  it('displays heating trend with TrendingUp icon', () => {
    mockInflationStore({
      inflationRate: 12.5,
      inflationHistory: [
        { pickNumber: 10, rate: 8.0, timestamp: 1000 },
        { pickNumber: 20, rate: 12.5, timestamp: 2000 }
      ]
    });
    mockDraftStore({ draftedPlayers: Array(20).fill({}) });

    render(<InflationTracker />);

    expect(screen.getByText('Heating')).toBeInTheDocument();
    // Verify TrendingUp icon is rendered (test icon presence)
  });

  it('shows correct tooltip on hover', async () => {
    // ... setup

    const trendTrigger = screen.getByText('Heating');
    await userEvent.hover(trendTrigger);

    expect(screen.getByText(/increased 4.5% in the last 10 picks/i)).toBeInTheDocument();
  });
});
```

### Common Issues & Solutions

**Issue 1: Trend Not Updating After Draft Picks**

Possible causes:
- inflationHistory not being updated in store
- Component not re-rendering when history changes
- useMemo dependencies incorrect

Solution:
- Ensure updateInflation calls addInflationSnapshot
- Verify inflationHistory is in useMemo dependencies
- Check Zustand subscription is working

```typescript
const trend = useMemo(() => {
  return calculateInflationTrend(inflationHistory, currentPick, 10);
}, [inflationHistory, currentPick]); // Include both dependencies
```

**Issue 2: "Not Enough History" Always Showing**

Possible causes:
- inflationHistory array is empty
- pickNumber not matching currentPick
- History entries not being found

Solution:
- Verify addInflationSnapshot is being called on each inflation update
- Ensure pickNumber matches draftedPlayers.length
- Add logging to confirm history entries exist

```typescript
console.log('Current pick:', currentPick);
console.log('History entries:', inflationHistory.length);
console.log('History:', inflationHistory);
```

**Issue 3: Wrong Trend Direction Displayed**

Possible causes:
- ±2% threshold calculation incorrect
- Change calculation using wrong values
- Direction logic inverted

Solution:
- Verify change = currentRate - pastRate (not reversed)
- Test threshold logic with known values
- Add unit tests for all edge cases (exactly +2%, exactly -2%)

**Issue 4: Tooltip Not Showing**

Possible causes:
- TooltipProvider not wrapping component
- Tooltip trigger not properly wrapped with asChild
- Dark theme styling hiding tooltip

Solution:
- Ensure TooltipProvider wraps the entire trend indicator
- Use asChild prop on TooltipTrigger
- Verify tooltip styling matches dark slate theme

```typescript
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild> {/* asChild is critical */}
      <div>...</div>
    </TooltipTrigger>
    <TooltipContent className="bg-slate-900 border-slate-700">
      ...
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### References

**Source Documents:**

- **Epic Definition:** docs/epics-stories.md (lines 1105-1121)
- **Architecture:** docs/architecture.md
  - State Management - Zustand (lines 380-410)
  - Project Organization (lines 650-725)
- **Previous Stories:**
  - Story 8.1: docs/sprint-artifacts/8-1-create-inflationtracker-component.md
  - Story 8.2: docs/sprint-artifacts/8-2-display-current-inflation-rate-percentage.md
  - Epic 5: Core Inflation Engine (completed)

**Related Stories:**

- **Foundation:**
  - 8.1 - Create InflationTracker Component (provides component foundation)
  - 8.2 - Display Current Inflation Rate Percentage (provides prominent display)
  - Epic 5 - Core Inflation Engine (provides inflation calculations)
- **Current:** 8.4 - Display Inflation Trend Indicators (this story)
- **Next Stories:**
  - 8.5 - Display Tier-Specific Inflation Breakdown
  - 8.6 - Display Position-Specific Inflation Breakdown

**External Resources:**

- [Lucide Icons - TrendingUp, TrendingDown, Minus](https://lucide.dev/)
- [shadcn/ui Tooltip](https://ui.shadcn.com/docs/components/tooltip)
- [Zustand - Persist Middleware](https://zustand-demo.pmnd.rs/)

---

**Status:** ready-for-dev
**Epic:** 8 of 13
**Story:** 4 of 7 in Epic 8

---

## Summary

Story 8.4 "Display Inflation Trend Indicators" is ready for implementation.

**Deliverable:**

Add trend indicators to InflationTracker component, enabling users to:
- See if inflation is heating (↑), cooling (↓), or stable (→)
- Understand market momentum by comparing current rate to 10 picks ago
- View color-coded trend: red/orange for heating, blue for cooling, gray for stable
- Hover for detailed tooltip explaining percentage change
- Make strategic bidding decisions based on market trend

**Key Technical Decisions:**

1. **Track Inflation History** - Store snapshot of inflation rate after each pick
2. **10-Pick Window** - Compare current rate to rate from 10 picks ago
3. **±2% Threshold** - Define stable vs. heating/cooling
4. **Icon + Label + Color** - Multiple visual cues for accessibility
5. **Tooltip for Context** - Explain numerical change to users

**Dependencies:**

- Story 8.1 (Ready): InflationTracker component foundation
- Story 8.2 (Ready): Current inflation rate display
- Epic 5 (Complete): Core Inflation Engine

**Epic Progress:**

This is the fourth story in Epic 8. Completing this story:
- Provides market momentum insights for strategic bidding
- Enables Story 8.5: Tier-specific inflation breakdown
- Enables Story 8.6: Position-specific inflation breakdown

**Implementation Estimate:** 4-5 hours (trend calculation, history tracking, component update, tests)

**Testing:** Unit tests for trend calculations + Store tests for history tracking + Component tests for trend display + End-to-end verification of all 7 acceptance criteria

**Next Step:** Implement this story to add trend indicators to InflationTracker.
