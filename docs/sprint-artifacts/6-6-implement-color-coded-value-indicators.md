# Story 6.6: Implement Color-Coded Value Indicators

**Story ID:** 6.6
**Story Key:** 6-6-implement-color-coded-value-indicators
**Epic:** Epic 6 - Live Draft Experience - Player Discovery & Tracking
**Status:** done

---

## Story

As a **user**,
I want players color-coded based on value (green for steals, yellow for fair, red for overpays),
So that I can instantly identify undervalued opportunities.

---

## Acceptance Criteria

**Given** players have both projected and adjusted values
**When** the PlayerQueue renders
**Then** each player row has a subtle background tint based on value
**And** green background (emerald-900/20) indicates "steal" (actual price < adjusted value by >10%)
**And** yellow background (yellow-900/20) indicates "fair value" (within ±10% of adjusted value)
**And** orange/red background (red-900/20) indicates "overpay" (actual price > adjusted value by >10%)
**And** undrafted players show no background tint (only show indicators after being drafted)
**And** the color coding follows universal fantasy sports conventions (green = good)
**And** color is paired with text labels for accessibility (not color-only communication)

---

## Developer Context

### Story Foundation from Epic

From **Epic 6: Live Draft Experience - Player Discovery & Tracking** (docs/epics-stories.md lines 812-829):

This story implements color-coded value indicators for drafted players. After a player is drafted, users can instantly see whether they got a steal, fair value, or overpaid based on the visual coloring.

**Core Responsibilities:**

- **Steal Indicator:** Green for >10% under adjusted value
- **Fair Value:** Yellow for within ±10% of adjusted value
- **Overpay Indicator:** Red for >10% over adjusted value
- **Accessibility:** Text labels accompany colors

**Relationship to Epic 6:**

This is Story 6 of 11 in Epic 6. It depends on:
- **Story 6.5**: Value display styling (consistent styling)
- **Story 6.7**: Draft status (only show for drafted players)

### Technical Requirements

#### Value Classification

```typescript
type ValueClassification = 'steal' | 'fair' | 'overpay' | 'none';

const classifyValue = (
  actualPrice: number | undefined,
  adjustedValue: number
): ValueClassification => {
  if (actualPrice === undefined) return 'none';

  const difference = actualPrice - adjustedValue;
  const percentDiff = (difference / adjustedValue) * 100;

  if (percentDiff < -10) return 'steal';
  if (percentDiff > 10) return 'overpay';
  return 'fair';
};
```

#### Background Colors

```typescript
const valueBackgroundColors: Record<ValueClassification, string> = {
  steal: 'bg-emerald-900/20',
  fair: 'bg-yellow-900/20',
  overpay: 'bg-red-900/20',
  none: ''
};
```

---

## Tasks / Subtasks

- [x] **Task 1: Create Value Classification Logic**
  - [x] Create classifyValue utility function
  - [x] Calculate percentage difference
  - [x] Return classification category

- [x] **Task 2: Create Value Indicator Component**
  - [x] Create `ValueIndicator.tsx` component
  - [x] Accept actualPrice and adjustedValue props
  - [x] Apply background color based on classification

- [x] **Task 3: Implement Background Colors**
  - [x] Define color constants for each classification
  - [x] Use opacity for subtle effect (20%)
  - [x] Test visibility on dark background

- [x] **Task 4: Add Text Labels**
  - [x] Show "Steal", "Fair", "Overpay" labels
  - [x] Display price vs value: "$35 (adj: $45)" (optional via showPriceComparison prop)
  - [x] Ensure accessibility without color

- [x] **Task 5: Integrate with PlayerQueue**
  - [x] Apply background to TableRow
  - [x] Only show for drafted players
  - [x] Pass auction price to component

- [x] **Task 6: Handle Edge Cases**
  - [x] Zero adjusted value (avoid division by zero)
  - [x] Very small differences
  - [x] Undrafted players (no indicator)

- [x] **Task 7: Write Tests**
  - [x] Test steal classification (>10% under)
  - [x] Test fair classification (within ±10%)
  - [x] Test overpay classification (>10% over)
  - [x] Test undrafted players (no classification)
  - [x] Test edge cases

---

## Dev Notes

### Implementation Approach

1. Calculate percentage difference between price and adjusted value
2. Classify into steal/fair/overpay categories
3. Apply subtle background tint to row
4. Add text label for accessibility

### Color Guidelines

| Classification | Background | Label |
|---------------|------------|-------|
| Steal | emerald-900/20 | "Steal" |
| Fair | yellow-900/20 | "Fair Value" |
| Overpay | red-900/20 | "Overpay" |
| Undrafted | none | - |

### Accessibility

- Never use color alone to communicate information
- Always pair with text labels
- Ensure sufficient contrast ratios

---

## Dev Agent Record

### Implementation Plan

1. Created `classifyValue` utility with percentage-based classification logic
2. Implemented `ValueIndicator` component with text labels and accessibility support
3. Integrated value backgrounds and indicators into `PlayerQueue` rows
4. Added `auctionPrice` field to `Player` type for tracking draft prices
5. Comprehensive test coverage for all classification scenarios

### Completion Notes

- All acceptance criteria met:
  - ✅ Green background (emerald-900/20) for steals (>10% under)
  - ✅ Yellow background (yellow-900/20) for fair value (±10%)
  - ✅ Red background (red-900/20) for overpays (>10% over)
  - ✅ No background for undrafted players
  - ✅ Text labels ("Steal", "Fair Value", "Overpay") for accessibility
  - ✅ ARIA labels with full context for screen readers
- Added 87 new tests (44 for classifyValue, 27 for ValueIndicator, 16 for PlayerQueue integration)
- All tests pass

### Code Review Fixes (2025-12-19)

- ✅ Added `ValueIndicatorProps` type export to barrel file
- ✅ Fixed non-null assertion usage in ValueIndicator.tsx with proper type guard
- ✅ Moved `getValueRowBackground` to classifyValue.ts to fix lint warning (re-exported for backwards compatibility)

---

## File List

### New Files

- `src/features/draft/utils/classifyValue.ts` - Value classification logic and constants
- `src/features/draft/components/ValueIndicator.tsx` - Visual indicator component
- `tests/features/draft/classifyValue.test.ts` - Classification utility tests
- `tests/features/draft/ValueIndicator.test.tsx` - Component tests
- `tests/features/draft/PlayerQueue.valueIndicator.test.tsx` - Integration tests

### Modified Files

- `src/features/draft/types/player.types.ts` - Added `auctionPrice` field
- `src/features/draft/components/PlayerQueue.tsx` - Integrated value backgrounds and indicators
- `src/features/draft/index.ts` - Exported new utilities and components
- `tests/features/draft/PlayerQueue.test.tsx` - Updated column count (7 → 8)

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-19 | Implemented color-coded value indicators with full test coverage | Dev Agent |
| 2025-12-19 | Code review fixes: type exports, type guards, lint warning | Code Review |

---

**Status:** done
**Epic:** 6 of 13
**Story:** 6 of 11 in Epic 6
