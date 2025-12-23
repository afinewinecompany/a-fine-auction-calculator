# Story 8.3: Display Variance Tracking for Drafted Players

**Story ID:** 8.3
**Story Key:** 8-3-display-variance-tracking-for-drafted-players
**Epic:** Epic 8 - Live Draft Experience - Variance & Inflation Insights
**Status:** ready-for-dev

---

## Story

As a **user**,
I want to view variance tracking showing which players were steals vs. overpays,
So that I can learn from the market and adjust my bidding strategy.

---

## Acceptance Criteria

**Given** players have been drafted with actual prices
**When** the InflationTracker renders variance data
**Then** I see a summary: "Steals: 12 players | Overpays: 8 players"
**And** "Steals" are players drafted below their adjusted value (green color)
**And** "Overpays" are players drafted above their adjusted value (red/orange color)
**And** clicking on the summary expands a list showing specific players and their variance
**And** variance is calculated as: (actual price - adjusted value) / adjusted value
**And** the display updates in real-time as more players are drafted

---

## Developer Context

### Story Foundation from Epic

From **Epic 8: Live Draft Experience - Variance & Inflation Insights** (docs/epics-stories.md lines 1089-1104):

This story implements variance tracking to help users identify which players were steals (drafted below adjusted value) versus overpays (drafted above adjusted value). It's the third story in the Epic 8 sequence.

**Core Responsibilities:**

- **Variance Summary:** Display count of steals vs. overpays
- **Color Coding:** Green for steals, red/orange for overpays
- **Expandable Details:** Click to see list of specific players and variance percentages
- **Variance Calculation:** (actual price - adjusted value) / adjusted value
- **Real-time Updates:** Counts update as more players drafted
- **Learning Tool:** Help users understand market dynamics and adjust strategy

**Relationship to Epic 8:**

This is Story 3 of 7 in Epic 8. It depends on:
- **Story 8.1** (Ready): InflationTracker component foundation
- **Story 8.2** (Ready): Enhanced inflation display
- **Epic 5** (Complete): Core Inflation Engine provides adjusted player values
- **Epic 6** (In-Progress): Draft state provides drafted players with actual prices

It enables:
- **Story 8.4**: Display inflation trend indicators
- Better bidding strategy through market feedback
- Post-draft analysis of value captures

### Previous Story Intelligence

**From Story 8.1 (Create InflationTracker Component - READY):**

**Existing InflationTracker Component (src/features/draft/components/InflationTracker.tsx):**
- Has 2x2 metrics grid layout
- Variance metric in top-right card (currently placeholder)
- Props include optional `variance?: { steals: number; overpays: number }`

**Current Variance Display (Placeholder):**
```typescript
<div className="p-3 bg-slate-800 rounded-lg">
  <div className="text-xs text-slate-400 mb-1">Variance</div>
  <div className="text-lg font-semibold text-white">
    {variance ? `${variance.steals}/${variance.overpays}` : '--'}
  </div>
</div>
```

**Enhancement Needed:**
- Calculate steals and overpays from drafted players
- Add expandable player list with individual variances
- Add click handler to expand/collapse details
- Color code steals (green) and overpays (red)

**From Epic 5 (Core Inflation Engine - COMPLETED):**

**Existing Inflation Calculations:**
- `adjustedValue` calculated for each player based on inflation
- Formula: `adjustedValue = baseValue * (1 + inflationRate)`
- Available in inflation store for all players

**Variance Calculation:**
```typescript
const variance = (actualPrice - adjustedValue) / adjustedValue;

// Steal: variance < -0.05 (5% below adjusted value)
// Overpay: variance > 0.05 (5% above adjusted value)
// Fair: -0.05 <= variance <= 0.05 (within 5% of adjusted value)
```

**From Epic 6 (Draft State - IN-PROGRESS):**

**Draft Store (src/features/draft/stores/draftStore.ts):**
- Tracks `draftedPlayers` array with actual draft prices
- Each drafted player has: `playerId`, `playerName`, `actualPrice`, `draftedBy`
- Updates in real-time as players are drafted

**Integration Pattern:**
```typescript
const draftedPlayers = useDraftStore(state => state.draftedPlayers);
const { calculateAdjustedValue } = useInflationStore();

const varianceData = calculateVariance(draftedPlayers, calculateAdjustedValue);
```

### Architecture Requirements

**From Architecture Document (docs/architecture.md):**

#### Variance Calculation Logic

**Calculate Variance from Drafted Players:**

```typescript
interface DraftedPlayer {
  playerId: string;
  playerName: string;
  actualPrice: number;
  adjustedValue: number;
  variance: number;
  isSteal: boolean;
  isOverpay: boolean;
}

const calculateVariance = (
  draftedPlayers: Array<{ playerId: string; actualPrice: number }>,
  getAdjustedValue: (playerId: string) => number
): { steals: DraftedPlayer[]; overpays: DraftedPlayer[]; fair: DraftedPlayer[] } => {
  const steals: DraftedPlayer[] = [];
  const overpays: DraftedPlayer[] = [];
  const fair: DraftedPlayer[] = [];

  draftedPlayers.forEach(player => {
    const adjustedValue = getAdjustedValue(player.playerId);
    const variance = (player.actualPrice - adjustedValue) / adjustedValue;

    const playerData = {
      ...player,
      adjustedValue,
      variance,
      isSteal: variance < -0.05,
      isOverpay: variance > 0.05,
    };

    if (variance < -0.05) {
      steals.push(playerData);
    } else if (variance > 0.05) {
      overpays.push(playerData);
    } else {
      fair.push(playerData);
    }
  });

  return { steals, overpays, fair };
};
```

#### Expandable Details Component

**Collapsible Player List:**

Use shadcn/ui Collapsible component for expandable details:
- `<Collapsible>` - Wrapper for collapsible section
- `<CollapsibleTrigger>` - Click to expand/collapse
- `<CollapsibleContent>` - Hidden content that expands

**May need to install shadcn/ui Collapsible:**
```bash
npx shadcn@latest add collapsible
```

**Expandable Variance Display:**

```typescript
import { useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function VarianceDisplay({ steals, overpays }: VarianceDisplayProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full p-3 bg-slate-800 rounded-lg hover:bg-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 mb-1">Variance</div>
            <div className="text-sm font-semibold text-white">
              <span className="text-green-500">{steals.length}</span> steals |{' '}
              <span className="text-orange-500">{overpays.length}</span> overpays
            </div>
          </div>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-2 p-3 bg-slate-800 rounded-lg space-y-2">
        <div className="text-xs font-semibold text-green-500 mb-1">Steals</div>
        {steals.map(player => (
          <div key={player.playerId} className="text-xs text-white">
            {player.playerName}: ${player.actualPrice} ({(player.variance * 100).toFixed(1)}%)
          </div>
        ))}

        <div className="text-xs font-semibold text-orange-500 mt-3 mb-1">Overpays</div>
        {overpays.map(player => (
          <div key={player.playerId} className="text-xs text-white">
            {player.playerName}: ${player.actualPrice} (+{(player.variance * 100).toFixed(1)}%)
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
```

#### Project Organization - Feature-Based

**Files to Create:**
```
src/features/draft/
  components/
    VarianceDisplay.tsx    # NEW - Expandable variance component
  utils/
    varianceCalculations.ts # NEW - Variance calculation logic
```

**Files to Modify:**
```
src/features/draft/
  components/
    InflationTracker.tsx   # MODIFY - Integrate VarianceDisplay
  hooks/
    useInflationTracker.ts # MODIFY - Add variance calculation
```

### Technical Requirements

#### Variance Calculation Utility

**1. Create Variance Calculation Utility:**

File: `src/features/draft/utils/varianceCalculations.ts`

```typescript
export interface DraftedPlayerWithVariance {
  playerId: string;
  playerName: string;
  actualPrice: number;
  adjustedValue: number;
  variance: number;
  isSteal: boolean;
  isOverpay: boolean;
}

export interface VarianceData {
  steals: DraftedPlayerWithVariance[];
  overpays: DraftedPlayerWithVariance[];
  fair: DraftedPlayerWithVariance[];
}

const STEAL_THRESHOLD = -0.05; // 5% below adjusted value
const OVERPAY_THRESHOLD = 0.05; // 5% above adjusted value

export const calculateVariance = (
  draftedPlayers: Array<{
    playerId: string;
    playerName: string;
    actualPrice: number;
  }>,
  getAdjustedValue: (playerId: string) => number
): VarianceData => {
  const steals: DraftedPlayerWithVariance[] = [];
  const overpays: DraftedPlayerWithVariance[] = [];
  const fair: DraftedPlayerWithVariance[] = [];

  draftedPlayers.forEach(player => {
    const adjustedValue = getAdjustedValue(player.playerId);
    const variance = (player.actualPrice - adjustedValue) / adjustedValue;

    const playerData: DraftedPlayerWithVariance = {
      ...player,
      adjustedValue,
      variance,
      isSteal: variance < STEAL_THRESHOLD,
      isOverpay: variance > OVERPAY_THRESHOLD,
    };

    if (variance < STEAL_THRESHOLD) {
      steals.push(playerData);
    } else if (variance > OVERPAY_THRESHOLD) {
      overpays.push(playerData);
    } else {
      fair.push(playerData);
    }
  });

  return { steals, overpays, fair };
};

export const formatVariancePercentage = (variance: number): string => {
  const percentage = (variance * 100).toFixed(1);
  return variance > 0 ? `+${percentage}%` : `${percentage}%`;
};
```

#### VarianceDisplay Component

**2. Create VarianceDisplay Component:**

File: `src/features/draft/components/VarianceDisplay.tsx`

```typescript
import { useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { DraftedPlayerWithVariance, formatVariancePercentage } from '../utils/varianceCalculations';

export interface VarianceDisplayProps {
  steals: DraftedPlayerWithVariance[];
  overpays: DraftedPlayerWithVariance[];
}

export function VarianceDisplay({ steals, overpays }: VarianceDisplayProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger
        className="w-full p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="text-left">
            <div className="text-xs text-slate-400 mb-1">Variance</div>
            <div className="text-sm font-semibold text-white">
              <span className="text-green-500">{steals.length}</span> steals |{' '}
              <span className="text-orange-500">{overpays.length}</span> overpays
            </div>
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-2">
        <div className="p-3 bg-slate-800 rounded-lg space-y-3">
          {steals.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-green-500 mb-2">Steals</div>
              {steals.map(player => (
                <div
                  key={player.playerId}
                  className="flex justify-between text-xs text-white mb-1"
                >
                  <span>{player.playerName}</span>
                  <span className="text-green-500">
                    ${player.actualPrice} ({formatVariancePercentage(player.variance)})
                  </span>
                </div>
              ))}
            </div>
          )}

          {overpays.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-orange-500 mb-2">Overpays</div>
              {overpays.map(player => (
                <div
                  key={player.playerId}
                  className="flex justify-between text-xs text-white mb-1"
                >
                  <span>{player.playerName}</span>
                  <span className="text-orange-500">
                    ${player.actualPrice} ({formatVariancePercentage(player.variance)})
                  </span>
                </div>
              ))}
            </div>
          )}

          {steals.length === 0 && overpays.length === 0 && (
            <div className="text-xs text-slate-400 text-center">
              No significant variance yet
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
```

#### Integration with InflationTracker

**3. Update InflationTracker Component:**

File: `src/features/draft/components/InflationTracker.tsx`

**Add Imports:**
```typescript
import { VarianceDisplay } from './VarianceDisplay';
import { calculateVariance, VarianceData } from '../utils/varianceCalculations';
```

**Update Props Interface:**
```typescript
export interface InflationTrackerProps {
  inflationRate: number;
  positionRates: Record<Position, number>;
  tierRates: Record<Tier, number>;
  draftedPlayers: Array<{
    playerId: string;
    playerName: string;
    actualPrice: number;
  }>;
  getAdjustedValue: (playerId: string) => number;
}
```

**Calculate Variance in Component:**
```typescript
export function InflationTracker({
  inflationRate,
  positionRates,
  tierRates,
  draftedPlayers,
  getAdjustedValue,
}: InflationTrackerProps) {
  const varianceData = calculateVariance(draftedPlayers, getAdjustedValue);

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white text-lg">Inflation Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Overall Inflation Metric (from Story 8.2) */}
          {/* ... */}

          {/* Variance Metric - Use VarianceDisplay component */}
          <VarianceDisplay steals={varianceData.steals} overpays={varianceData.overpays} />

          {/* Other metrics */}
          {/* ... */}
        </div>
      </CardContent>
    </Card>
  );
}
```

#### Integration Hook Update

**4. Update useInflationTracker Hook:**

File: `src/features/draft/hooks/useInflationTracker.ts`

```typescript
import { useInflationStore } from '@/features/inflation/stores/inflationStore';
import { useDraftStore } from '../stores/draftStore';

export function useInflationTracker() {
  const inflationRate = useInflationStore(state => state.inflationRate);
  const positionInflation = useInflationStore(state => state.positionInflation);
  const tierInflation = useInflationStore(state => state.tierInflation);
  const getAdjustedValue = useInflationStore(state => state.getAdjustedValue);

  const draftedPlayers = useDraftStore(state => state.draftedPlayers);

  return {
    inflationRate,
    positionRates: positionInflation,
    tierRates: tierInflation,
    draftedPlayers,
    getAdjustedValue,
  };
}
```

### UX Requirements

**From UX Design Specification (docs/ux-design-specification.md):**

#### Visual Design Consistency

**Variance Summary Display:**
- **Steals count:** text-green-500 (emerald/green)
- **Overpays count:** text-orange-500 (orange/red)
- **Format:** "12 steals | 8 overpays"
- **Clickable:** Hover shows bg-slate-700
- **Icon:** ChevronDown/ChevronUp to indicate expandable

**Expanded Player List:**
- **Steals section:** Green heading, green variance percentages
- **Overpays section:** Orange heading, orange variance percentages
- **Player format:** "Player Name: $25 (-12.5%)"
- **Scrollable:** If many players, max-height with scroll
- **Empty state:** "No significant variance yet"

#### Interaction Pattern

**Click to Expand:**
1. User sees summary: "12 steals | 8 overpays"
2. User clicks summary
3. Details expand smoothly below
4. User sees list of steals and overpays
5. User clicks again to collapse

**Responsive Behavior:**
- Desktop: Hover shows pointer cursor
- Mobile: Tap to expand/collapse
- Smooth animation (slide down/up)

#### Accessibility

**Collapsible Accessibility:**
- aria-expanded attribute on trigger
- Keyboard accessible (Enter/Space to toggle)
- Focus management (focus remains on trigger)
- Screen reader announces expanded/collapsed state

### Latest Technical Specifications

**React 18+ Best Practices (2025):**

**Collapsible Pattern:**
```typescript
const [isOpen, setIsOpen] = useState(false);

<Collapsible open={isOpen} onOpenChange={setIsOpen}>
  <CollapsibleTrigger>{/* Trigger */}</CollapsibleTrigger>
  <CollapsibleContent>{/* Content */}</CollapsibleContent>
</Collapsible>
```

**Variance Calculation:**
```typescript
const variance = (actualPrice - adjustedValue) / adjustedValue;

// Steal: variance < -0.05 (5% below)
// Overpay: variance > 0.05 (5% above)
// Fair: -0.05 <= variance <= 0.05
```

**Color Coding:**
```typescript
<span className="text-green-500">{steals.length}</span> steals |
<span className="text-orange-500">{overpays.length}</span> overpays
```

---

## Tasks / Subtasks

- [ ] **Task 1: Install shadcn/ui Collapsible Component** (AC: expandable list)
  - [ ] Run `npx shadcn@latest add collapsible`
  - [ ] Verify `src/components/ui/collapsible.tsx` created

- [ ] **Task 2: Create Variance Calculation Utility** (AC: variance calculation)
  - [ ] Create `src/features/draft/utils/varianceCalculations.ts`
  - [ ] Define DraftedPlayerWithVariance interface
  - [ ] Define VarianceData interface (steals, overpays, fair arrays)
  - [ ] Implement calculateVariance function:
    - [ ] Accept draftedPlayers array and getAdjustedValue function
    - [ ] For each player, calculate variance: (actualPrice - adjustedValue) / adjustedValue
    - [ ] Categorize as steal if variance < -0.05
    - [ ] Categorize as overpay if variance > 0.05
    - [ ] Return VarianceData object
  - [ ] Implement formatVariancePercentage helper:
    - [ ] Convert variance to percentage
    - [ ] Add + sign for positive variance
    - [ ] Format to 1 decimal place

- [ ] **Task 3: Create VarianceDisplay Component** (AC: expandable player list)
  - [ ] Create `src/features/draft/components/VarianceDisplay.tsx`
  - [ ] Define VarianceDisplayProps interface
  - [ ] Import Collapsible components
  - [ ] Import ChevronDown and ChevronUp icons from lucide-react
  - [ ] Add useState for isOpen state
  - [ ] Implement CollapsibleTrigger:
    - [ ] Show variance summary: "X steals | Y overpays"
    - [ ] Color steals count green (text-green-500)
    - [ ] Color overpays count orange (text-orange-500)
    - [ ] Show chevron icon (down when closed, up when open)
    - [ ] Add hover effect: hover:bg-slate-700
  - [ ] Implement CollapsibleContent:
    - [ ] Show steals section if steals.length > 0
    - [ ] Show overpays section if overpays.length > 0
    - [ ] Display each player with name, price, and variance percentage
    - [ ] Show empty state if no variance

- [ ] **Task 4: Update InflationTracker Component** (AC: integrate variance display)
  - [ ] Open `src/features/draft/components/InflationTracker.tsx`
  - [ ] Import VarianceDisplay component
  - [ ] Import calculateVariance utility
  - [ ] Update InflationTrackerProps to include:
    - [ ] draftedPlayers array
    - [ ] getAdjustedValue function
  - [ ] Calculate variance data: `calculateVariance(draftedPlayers, getAdjustedValue)`
  - [ ] Replace placeholder variance metric with VarianceDisplay component
  - [ ] Pass steals and overpays to VarianceDisplay

- [ ] **Task 5: Update useInflationTracker Hook** (AC: real-time updates)
  - [ ] Open `src/features/draft/hooks/useInflationTracker.ts`
  - [ ] Import useDraftStore
  - [ ] Extract draftedPlayers from draftStore
  - [ ] Extract getAdjustedValue from inflationStore
  - [ ] Return draftedPlayers and getAdjustedValue in hook result

- [ ] **Task 6: Update Feature Exports** (AC: clean imports)
  - [ ] Open `src/features/draft/index.ts`
  - [ ] Export VarianceDisplay component
  - [ ] Export variance calculation utilities
  - [ ] Export variance type definitions

- [ ] **Task 7: Add Tests** (AC: test coverage)
  - [ ] Create `tests/features/draft/varianceCalculations.test.ts`:
    - [ ] Test calculateVariance with no drafted players
    - [ ] Test calculateVariance with steals only
    - [ ] Test calculateVariance with overpays only
    - [ ] Test calculateVariance with mixed results
    - [ ] Test variance thresholds (-5% and +5%)
    - [ ] Test formatVariancePercentage
  - [ ] Create `tests/features/draft/VarianceDisplay.test.tsx`:
    - [ ] Test component renders summary
    - [ ] Test steals count displayed in green
    - [ ] Test overpays count displayed in orange
    - [ ] Test clicking expands player list
    - [ ] Test clicking again collapses list
    - [ ] Test steals section shows player details
    - [ ] Test overpays section shows player details
    - [ ] Test empty state when no variance
  - [ ] Update `tests/features/draft/InflationTracker.test.tsx`:
    - [ ] Test VarianceDisplay integrated into grid
    - [ ] Test updates when draftedPlayers changes

- [ ] **Task 8: Test End-to-End** (AC: all acceptance criteria met)
  - [ ] Verify: Variance summary displays "X steals | Y overpays"
  - [ ] Verify: Steals count shown in green color
  - [ ] Verify: Overpays count shown in orange/red color
  - [ ] Verify: Clicking summary expands player list
  - [ ] Verify: Player list shows names, prices, and variance percentages
  - [ ] Verify: Steals shown with green color and negative percentage
  - [ ] Verify: Overpays shown with orange color and positive percentage
  - [ ] Verify: Variance calculated correctly: (actual - adjusted) / adjusted
  - [ ] Verify: Updates in real-time as players drafted
  - [ ] Verify: Keyboard accessible (Enter/Space to expand)
  - [ ] Verify: Mobile tap to expand works
  - [ ] Verify: Empty state when no variance

---

## Dev Notes

### Implementation Approach

**Step-by-Step Implementation Order:**

1. **Install Collapsible Component**: Add shadcn/ui Collapsible
2. **Create Variance Utility**: Implement calculation logic
3. **Create VarianceDisplay Component**: Build expandable UI
4. **Integrate with InflationTracker**: Replace placeholder with VarianceDisplay
5. **Update Integration Hook**: Add draftedPlayers and getAdjustedValue
6. **Testing**: Add comprehensive tests
7. **End-to-End**: Verify real-time updates and interactions

### Variance Calculation Strategy

**Key Calculation Logic:**

**1. Variance Formula:**
```typescript
variance = (actualPrice - adjustedValue) / adjustedValue
```

**Examples:**
- Player drafted at $30, adjusted value $40: variance = -0.25 (25% steal)
- Player drafted at $50, adjusted value $40: variance = +0.25 (25% overpay)
- Player drafted at $40, adjusted value $40: variance = 0 (fair value)

**2. Categorization Thresholds:**
```typescript
const STEAL_THRESHOLD = -0.05;     // 5% below adjusted value
const OVERPAY_THRESHOLD = 0.05;    // 5% above adjusted value

if (variance < -0.05) {
  // Steal - drafted significantly below value
} else if (variance > 0.05) {
  // Overpay - drafted significantly above value
} else {
  // Fair - drafted within 5% of value
}
```

**3. Why 5% Threshold:**
- Small variance is normal market noise
- 5% represents meaningful value capture or overpay
- Helps users focus on significant deviations

### Expandable UI Pattern

**Collapsible Behavior:**

**Collapsed State:**
```
+-----------------------------------+
| Variance                       ▼  |
| 12 steals | 8 overpays            |
+-----------------------------------+
```

**Expanded State:**
```
+-----------------------------------+
| Variance                       ▲  |
| 12 steals | 8 overpays            |
+-----------------------------------+
| Steals                            |
| Mike Trout: $42 (-15.2%)          |
| Shohei Ohtani: $38 (-8.3%)        |
|                                   |
| Overpays                          |
| Juan Soto: $45 (+12.5%)           |
| Aaron Judge: $48 (+9.1%)          |
+-----------------------------------+
```

**Animation:**
- Smooth slide down/up transition
- ~200-300ms duration
- Respects prefers-reduced-motion

### Real-Time Updates Pattern

**How Updates Work:**

1. **Player Drafted** - Added to draftStore.draftedPlayers
2. **Hook Subscribes** - useInflationTracker subscribes to draftStore
3. **InflationTracker Re-renders** - Receives updated draftedPlayers
4. **Variance Recalculated** - calculateVariance runs with new data
5. **VarianceDisplay Updates** - Shows updated steals/overpays counts
6. **Expanded List Updates** - If open, shows new player in list

**Optimization:**
- Calculation runs only when draftedPlayers changes
- Memoization not needed initially (fast calculation)
- Consider useMemo if performance issues arise

### Testing Strategy

**Variance Calculation Tests:**

```typescript
// varianceCalculations.test.ts

describe('calculateVariance', () => {
  const mockGetAdjustedValue = (playerId: string) => {
    const values: Record<string, number> = {
      'player-1': 40,
      'player-2': 30,
      'player-3': 50,
    };
    return values[playerId] || 0;
  };

  it('categorizes steal correctly', () => {
    const draftedPlayers = [
      { playerId: 'player-1', playerName: 'Player 1', actualPrice: 30 }, // 25% below
    ];

    const result = calculateVariance(draftedPlayers, mockGetAdjustedValue);

    expect(result.steals).toHaveLength(1);
    expect(result.steals[0].variance).toBeCloseTo(-0.25);
    expect(result.steals[0].isSteal).toBe(true);
  });

  it('categorizes overpay correctly', () => {
    const draftedPlayers = [
      { playerId: 'player-2', playerName: 'Player 2', actualPrice: 36 }, // 20% above
    ];

    const result = calculateVariance(draftedPlayers, mockGetAdjustedValue);

    expect(result.overpays).toHaveLength(1);
    expect(result.overpays[0].variance).toBeCloseTo(0.20);
    expect(result.overpays[0].isOverpay).toBe(true);
  });

  it('handles multiple players', () => {
    const draftedPlayers = [
      { playerId: 'player-1', playerName: 'Player 1', actualPrice: 30 }, // Steal
      { playerId: 'player-2', playerName: 'Player 2', actualPrice: 36 }, // Overpay
      { playerId: 'player-3', playerName: 'Player 3', actualPrice: 51 }, // Fair
    ];

    const result = calculateVariance(draftedPlayers, mockGetAdjustedValue);

    expect(result.steals).toHaveLength(1);
    expect(result.overpays).toHaveLength(1);
    expect(result.fair).toHaveLength(1);
  });
});
```

**VarianceDisplay Component Tests:**

```typescript
// VarianceDisplay.test.tsx

describe('VarianceDisplay', () => {
  const mockSteals = [
    {
      playerId: '1',
      playerName: 'Mike Trout',
      actualPrice: 42,
      adjustedValue: 50,
      variance: -0.16,
      isSteal: true,
      isOverpay: false,
    },
  ];

  const mockOverpays = [
    {
      playerId: '2',
      playerName: 'Juan Soto',
      actualPrice: 45,
      adjustedValue: 40,
      variance: 0.125,
      isSteal: false,
      isOverpay: true,
    },
  ];

  it('renders variance summary', () => {
    render(<VarianceDisplay steals={mockSteals} overpays={mockOverpays} />);
    expect(screen.getByText(/1 steals/i)).toBeInTheDocument();
    expect(screen.getByText(/1 overpays/i)).toBeInTheDocument();
  });

  it('expands on click', async () => {
    render(<VarianceDisplay steals={mockSteals} overpays={mockOverpays} />);

    const trigger = screen.getByRole('button');
    await userEvent.click(trigger);

    expect(screen.getByText('Mike Trout')).toBeInTheDocument();
    expect(screen.getByText('Juan Soto')).toBeInTheDocument();
  });

  it('shows steals in green', () => {
    render(<VarianceDisplay steals={mockSteals} overpays={[]} />);
    const stealsCount = screen.getByText('1');
    expect(stealsCount).toHaveClass('text-green-500');
  });

  it('shows overpays in orange', () => {
    render(<VarianceDisplay steals={[]} overpays={mockOverpays} />);
    const overpaysCount = screen.getByText('1');
    expect(overpaysCount).toHaveClass('text-orange-500');
  });
});
```

### Common Issues & Solutions

**Issue 1: Variance Not Updating in Real-Time**

Possible causes:
- useInflationTracker not subscribed to draftStore
- InflationTracker not receiving updated draftedPlayers prop
- Variance calculation not running

Solution:
- Verify useInflationTracker extracts draftedPlayers from draftStore
- Check InflationTracker receives draftedPlayers prop
- Ensure calculateVariance runs on every render (or use useMemo if needed)

**Issue 2: Collapsible Not Expanding**

Possible causes:
- Collapsible component not installed
- isOpen state not managing correctly
- onOpenChange not connected to setIsOpen

Solution:
- Install shadcn/ui Collapsible component
- Use controlled state: `<Collapsible open={isOpen} onOpenChange={setIsOpen}>`
- Verify CollapsibleTrigger is clickable

**Issue 3: Incorrect Variance Calculation**

Possible causes:
- Wrong formula: (adjusted - actual) instead of (actual - adjusted)
- Division by zero if adjustedValue is 0
- Not using correct adjusted value for player

Solution:
- Use correct formula: `(actualPrice - adjustedValue) / adjustedValue`
- Guard against division by zero
- Verify getAdjustedValue returns correct value for each player

**Issue 4: Colors Not Showing**

Possible causes:
- Tailwind class not applied
- Wrong color classes
- Conditional rendering not evaluating

Solution:
- Use text-green-500 for steals, text-orange-500 for overpays
- Verify classes applied to correct elements
- Check conditional logic in component

### References

**Source Documents:**

- **Epic Definition:** docs/epics-stories.md (lines 1089-1104)
- **Story 8.1:** docs/sprint-artifacts/8-1-create-inflationtracker-component.md
- **Story 8.2:** docs/sprint-artifacts/8-2-display-current-inflation-rate-percentage.md
- **Architecture:** docs/architecture.md

**Related Stories:**

- **Foundation:**
  - 5.6 - Calculate Dynamic Adjusted Player Values (provides adjusted values)
  - 6.1 - Create Draft State Database Tables (provides draft state)
  - 8.1 - Create InflationTracker Component (provides component foundation)
  - 8.2 - Display Current Inflation Rate Percentage (establishes enhancement pattern)
- **Current:** 8.3 - Display Variance Tracking for Drafted Players (this story)
- **Next Stories:**
  - 8.4 - Display Inflation Trend Indicators
  - 8.5 - Display Tier-Specific Inflation Breakdown

**External Resources:**

- [shadcn/ui Collapsible](https://ui.shadcn.com/docs/components/collapsible)
- [Lucide Icons - Chevron](https://lucide.dev/icons/chevron-down)
- [Radix UI Collapsible](https://www.radix-ui.com/primitives/docs/components/collapsible)

---

## Dev Agent Record

### Context Reference

Story 8.3 - Display Variance Tracking for Drafted Players

This story was created with comprehensive context from:

- **Epic 8 requirements** and detailed acceptance criteria (docs/epics-stories.md lines 1089-1104)
- **Story 8.1** providing InflationTracker component foundation
- **Story 8.2** providing enhancement patterns
- **Epic 5** providing adjusted value calculations
- **Epic 6** providing draft state with drafted players

**Story Foundation:**

This is Story 3 of 7 in Epic 8. It implements variance tracking to show users which players were steals (drafted below adjusted value) versus overpays (drafted above adjusted value), helping them learn from the market and adjust bidding strategy.

**Key Patterns Identified:**

- **Variance Calculation:** (actual - adjusted) / adjusted with 5% thresholds
- **Expandable UI:** Collapsible component for player details
- **Color Coding:** Green for steals, orange for overpays
- **Real-time Updates:** Recalculates as players drafted
- **Learning Tool:** Helps users understand market dynamics

**Critical Implementation Notes:**

1. **Create variance calculation utility** - Separate business logic from UI
2. **Build VarianceDisplay component** - Collapsible player list
3. **Integrate with InflationTracker** - Replace variance placeholder
4. **Subscribe to draft state** - Real-time updates via draftStore
5. **5% variance threshold** - Focus on significant deviations

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

No debug issues anticipated for variance tracking implementation.

### Completion Notes List

**Implementation Pending**

This story is ready for development. No completion notes yet.

### Senior Developer Review (AI)

**Review Status:** Pending implementation

### File List

**Files to Create:**

- `src/features/draft/components/VarianceDisplay.tsx` - Expandable variance component
- `src/features/draft/utils/varianceCalculations.ts` - Variance calculation logic
- `src/components/ui/collapsible.tsx` - shadcn/ui Collapsible (if not exists)
- `tests/features/draft/VarianceDisplay.test.tsx` - Component tests
- `tests/features/draft/varianceCalculations.test.ts` - Utility tests

**Files to Modify:**

- `src/features/draft/components/InflationTracker.tsx` - Integrate VarianceDisplay
- `src/features/draft/hooks/useInflationTracker.ts` - Add draftedPlayers and getAdjustedValue
- `src/features/draft/index.ts` - Export new components and utilities
- `tests/features/draft/InflationTracker.test.tsx` - Add variance integration tests

---

**Status:** ready-for-dev
**Epic:** 8 of 13
**Story:** 3 of 7 in Epic 8

---

## Summary

Story 8.3 "Display Variance Tracking for Drafted Players" is ready for implementation.

**Deliverable:**

Implement variance tracking to show steals vs. overpays:
- Display summary: "12 steals | 8 overpays" with color coding
- Calculate variance: (actual price - adjusted value) / adjusted value
- Expandable player list showing individual variances
- Green color for steals (drafted below value)
- Orange color for overpays (drafted above value)
- Real-time updates as players drafted

**Key Technical Decisions:**

1. **Separate calculation utility** - Business logic in varianceCalculations.ts
2. **VarianceDisplay component** - Reusable collapsible UI component
3. **5% variance threshold** - Focus on significant deviations, ignore noise
4. **shadcn/ui Collapsible** - Accessible expandable section
5. **Subscribe to draft store** - Real-time updates via draftedPlayers array

**Dependencies:**

- Story 8.1 (Ready): InflationTracker component foundation
- Story 8.2 (Ready): Enhanced inflation display patterns
- Epic 5 (Complete): Adjusted value calculations
- Epic 6 (In-Progress): Draft state with drafted players

**Epic Progress:**

This is the third story in Epic 8. Completing this story:
- Helps users identify value captures and overpays
- Enables learning from market dynamics
- Provides foundation for Story 8.4 (trend indicators)

**Implementation Estimate:** 3-4 hours (calculation utility, component, integration, tests)

**Testing:** Utility tests for variance calculation + Component tests for UI + Integration tests for real-time updates

**Next Step:** Implement variance tracking, then proceed to Story 8.4 for trend indicators.
