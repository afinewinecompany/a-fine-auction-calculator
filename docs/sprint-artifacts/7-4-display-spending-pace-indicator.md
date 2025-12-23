# Story 7.4: Display Spending Pace Indicator

**Story ID:** 7.4
**Story Key:** 7-4-display-spending-pace-indicator
**Epic:** Epic 7 - Live Draft Experience - Budget & Roster Management
**Status:** review

---

## Story

As a **user**,
I want to see my spending pace compared to target budget allocation,
So that I know if I'm spending too fast or too slow.

---

## Acceptance Criteria

**Given** I am partway through the draft
**When** the RosterPanel calculates spending pace
**Then** I see a pace indicator: "On Pace" (green), "Spending Fast" (yellow), "Spending Slow" (blue)
**And** the indicator compares: (money spent / roster spots filled) vs. (total budget / total roster spots)
**And** "On Pace" means within 10% of target pace
**And** the indicator updates after each player drafted
**And** a tooltip explains the calculation on hover

---

## Developer Context

### Story Foundation from Epic

From **Epic 7: Live Draft Experience - Budget & Roster Management** (docs/epics-stories.md lines 970-985):

This story adds a spending pace indicator to help users understand if they're allocating budget appropriately relative to roster completion. Spending too fast early can leave insufficient budget for later picks; spending too slow may result in unused budget.

**Core Responsibilities:**

- **Pace Calculation:** Compare actual spend rate vs. target spend rate
- **Visual Indicator:** Color-coded status (green/yellow/blue)
- **Tolerance Band:** "On Pace" within 10% of target
- **Real-Time Updates:** Update after each draft pick
- **Explanation Tooltip:** Help users understand the calculation

**Relationship to Epic 7:**

This is Story 4 of 8 in Epic 7. It depends on:
- **Story 7.1**: RosterPanel Component Foundation (provides container)
- **Story 7.2**: Display Real-Time Budget Tracking (budget data)

### Technical Requirements

#### Pace Calculation Formula

```typescript
// Target spend per slot
const targetPacePerSlot = totalBudget / totalRosterSpots;

// Actual spend per slot (if any spots filled)
const actualPacePerSlot = spotsFilled > 0
  ? moneySpent / spotsFilled
  : 0;

// Pace ratio (1.0 = exactly on pace)
const paceRatio = actualPacePerSlot / targetPacePerSlot;

// Status determination
const getPaceStatus = (paceRatio: number): PaceStatus => {
  if (paceRatio >= 0.9 && paceRatio <= 1.1) return 'ON_PACE';
  if (paceRatio > 1.1) return 'SPENDING_FAST';
  return 'SPENDING_SLOW';
};
```

#### Pace Status Component

```typescript
type PaceStatus = 'ON_PACE' | 'SPENDING_FAST' | 'SPENDING_SLOW';

interface PaceIndicatorProps {
  totalBudget: number;
  moneySpent: number;
  spotsFilled: number;
  totalRosterSpots: number;
}
```

#### Status Colors

- **On Pace:** `text-green-400` / `bg-green-400/20`
- **Spending Fast:** `text-yellow-400` / `bg-yellow-400/20`
- **Spending Slow:** `text-blue-400` / `bg-blue-400/20`

---

## Tasks / Subtasks

- [x] **Task 1: Create PaceIndicator Component**
  - [x] Create `src/features/draft/components/PaceIndicator.tsx`
  - [x] Define `PaceIndicatorProps` interface
  - [x] Define `PaceStatus` type
  - [x] Add component header comments

- [x] **Task 2: Implement Pace Calculation**
  - [x] Calculate target pace per slot
  - [x] Calculate actual pace per slot
  - [x] Calculate pace ratio
  - [x] Handle edge case: no spots filled yet (show "Not Started")

- [x] **Task 3: Implement Status Determination**
  - [x] Create `getPaceStatus` function
  - [x] Apply 10% tolerance band for "On Pace"
  - [x] Return appropriate PaceStatus enum value

- [x] **Task 4: Implement Visual Display**
  - [x] Create Badge/Chip component for status
  - [x] Apply status-specific colors (green/yellow/blue)
  - [x] Display text: "On Pace", "Spending Fast", "Spending Slow"
  - [x] Add icon for visual clarity (optional)

- [x] **Task 5: Implement Tooltip**
  - [x] Add shadcn/ui Tooltip component
  - [x] Display calculation explanation on hover
  - [x] Format: "Spending $X per slot (target: $Y per slot)"
  - [x] Show pace ratio percentage

- [x] **Task 6: Handle Edge Cases**
  - [x] No spots filled: show "Draft Not Started"
  - [x] All spots filled: show final pace summary
  - [x] Zero budget: handle gracefully

- [x] **Task 7: Connect to Draft Store**
  - [x] Subscribe to budget and roster state from draft store
  - [x] Ensure updates trigger re-render after each draft pick
  - [x] Memoize calculations

- [x] **Task 8: Integrate with RosterPanel**
  - [x] Import PaceIndicator into RosterPanel
  - [x] Place in Budget Summary section (below spending breakdown)
  - [x] Pass required props from store

- [x] **Task 9: Create Component Tests**
  - [x] Create `tests/features/draft/PaceIndicator.test.tsx`
  - [x] Test On Pace within 10% tolerance
  - [x] Test Spending Fast above 110%
  - [x] Test Spending Slow below 90%
  - [x] Test edge cases (no spots, all spots, zero budget)
  - [x] Test tooltip content

---

## Dev Notes

### Implementation Approach

1. Create pace calculation utility functions
2. Build visual indicator with color-coded status
3. Add informative tooltip with calculation details
4. Handle all edge cases gracefully
5. Integrate into RosterPanel Budget Summary section

### Pace Ratio Examples

| Scenario | Target | Actual | Ratio | Status |
|----------|--------|--------|-------|--------|
| $260 budget, 23 spots, $50 spent, 5 filled | $11.30/slot | $10.00/slot | 0.88 | Spending Slow |
| $260 budget, 23 spots, $60 spent, 5 filled | $11.30/slot | $12.00/slot | 1.06 | On Pace |
| $260 budget, 23 spots, $80 spent, 5 filled | $11.30/slot | $16.00/slot | 1.42 | Spending Fast |

### UX Considerations

- Green (On Pace) is reassuring - user is managing budget well
- Yellow (Spending Fast) is cautionary - user should be more conservative
- Blue (Spending Slow) is informational - user has room to be aggressive

---

## Dev Agent Record

### Implementation Summary

Implemented PaceIndicator component that displays spending pace relative to target budget allocation.

### Files Created/Modified

- `src/features/draft/components/PaceIndicator.tsx` - New component with pace calculation and color-coded status badge
- `src/features/draft/types/roster.types.ts` - Added PaceIndicatorProps, PaceStatus type, and PACE_TOLERANCE constant
- `src/features/draft/components/RosterPanel.tsx` - Integrated PaceIndicator into Budget Summary section
- `tests/features/draft/PaceIndicator.test.tsx` - Comprehensive tests (38 tests)
- `tests/setup.ts` - Added ResizeObserver mock for Radix UI tooltip testing

### Key Implementation Details

- **Pace Calculation**: `calculatePaceRatio()` computes actual vs target spend per slot
- **Status Determination**: `getPaceStatus()` applies 10% tolerance band (0.9-1.1 = ON_PACE)
- **Visual Indicator**: Color-coded badge with icons (green/yellow/blue/slate)
- **Tooltip**: Shows actual/target pace, percentage, and spots filled on hover
- **Edge Cases**: Handles zero spots, zero budget, and all spots filled gracefully
- **Performance**: Component is memoized with `React.memo()`, calculations are memoized with `useMemo()`

### Test Results

- 38 tests passing
- Tests cover all pace status scenarios, edge cases, tooltip content, and accessibility

---

**Status:** Review
**Epic:** 7 of 13
**Story:** 4 of 8 in Epic 7
