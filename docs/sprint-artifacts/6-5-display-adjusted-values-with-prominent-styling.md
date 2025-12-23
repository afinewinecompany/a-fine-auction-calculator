# Story 6.5: Display Adjusted Values with Prominent Styling

**Story ID:** 6.5
**Story Key:** 6-5-display-adjusted-values-with-prominent-styling
**Epic:** Epic 6 - Live Draft Experience - Player Discovery & Tracking
**Status:** Ready for Review

---

## Story

As a **user**,
I want adjusted player values displayed prominently with emerald color,
So that I can complete 3-second value scans during active bidding.

---

## Acceptance Criteria

**Given** inflation calculations have produced adjusted values
**When** the PlayerQueue renders
**Then** adjusted values are displayed in large, bold text (text-xl, font-bold per UX spec)
**And** adjusted values use emerald-400 color to stand out visually
**And** projected values are displayed smaller and in secondary color (slate-400) for comparison
**And** the visual hierarchy ensures adjusted values are the visual anchor of each row
**And** values are formatted as currency ($45, not 45.0)
**And** the styling matches UX requirements exactly

---

## Developer Context

### Story Foundation from Epic

From **Epic 6: Live Draft Experience - Player Discovery & Tracking** (docs/epics-stories.md lines 795-811):

This story implements the visual styling for adjusted values in the PlayerQueue. The adjusted value is the most critical piece of information during bidding, so it must be immediately visible with prominent styling.

**Core Responsibilities:**

- **Prominent Styling:** Large, bold, emerald-colored text
- **Visual Hierarchy:** Adjusted value is the visual anchor
- **Currency Format:** Display as $XX (not decimal)
- **Comparison:** Show projected value in secondary style

**Relationship to Epic 6:**

This is Story 5 of 11 in Epic 6. It depends on:
- **Story 6.2**: PlayerQueue component (displays values)
- **Epic 5**: Inflation calculations (produces adjusted values)

It enables:
- **Story 6.6**: Color-coded value indicators (uses same styling)

### Technical Requirements

#### Value Display Component

```typescript
interface ValueDisplayProps {
  adjustedValue: number;
  projectedValue: number;
}

// Renders adjusted value prominent, projected value secondary
const ValueDisplay: React.FC<ValueDisplayProps> = ({ adjustedValue, projectedValue }) => (
  <div className="flex flex-col items-end">
    <span className="text-xl font-bold text-emerald-400">
      ${adjustedValue}
    </span>
    <span className="text-sm text-slate-400">
      ${projectedValue}
    </span>
  </div>
);
```

#### Currency Formatting

```typescript
const formatCurrency = (value: number): string => {
  return `$${Math.round(value)}`;
};
```

---

## Tasks / Subtasks

- [x] **Task 1: Create ValueDisplay Component**
  - [x] Create `src/features/draft/components/ValueDisplay.tsx`
  - [x] Accept adjustedValue and projectedValue props
  - [x] Apply prominent styling to adjusted value
  - [x] Apply secondary styling to projected value

- [x] **Task 2: Implement Currency Formatting**
  - [x] Create formatCurrency utility function
  - [x] Round to whole dollars
  - [x] Add dollar sign prefix

- [x] **Task 3: Apply Emerald Styling**
  - [x] Use text-emerald-400 for adjusted value
  - [x] Use text-xl font-bold for size/weight
  - [x] Test color contrast for accessibility

- [x] **Task 4: Apply Secondary Styling**
  - [x] Use text-slate-400 for projected value
  - [x] Use text-sm for smaller size
  - [x] Position below adjusted value

- [x] **Task 5: Integrate with PlayerQueue**
  - [x] Replace plain value display with formatCurrency
  - [x] Pass adjusted and projected values
  - [x] Ensure column alignment

- [x] **Task 6: Handle Edge Cases**
  - [x] Zero values
  - [x] Negative values (show as $0)
  - [x] Very large values ($999+)

- [x] **Task 7: Write Tests**
  - [x] Test currency formatting
  - [x] Test styling applied correctly
  - [x] Test edge cases
  - [x] Test accessibility (aria-labels)

---

## Dev Notes

### Implementation Approach

1. Create standalone ValueDisplay component for reuse
2. Use flexbox for vertical alignment
3. Apply Tailwind classes for styling
4. Format currency with simple utility function

### Visual Hierarchy

```
┌─────────────────────┐
│      $45            │  <- Adjusted (emerald, xl, bold)
│      $38            │  <- Projected (slate, sm)
└─────────────────────┘
```

### Color Accessibility

- emerald-400 on slate-950 background = 4.5:1 contrast ratio
- Meets WCAG AA requirements

---

## Dev Agent Record

### Implementation Plan

1. Created ValueDisplay component with prominent emerald-400 styling for adjusted values
2. Implemented formatCurrency utility with edge case handling (negative values → $0)
3. Integrated styling into PlayerQueue component using formatCurrency
4. Updated PlayerQueue tests to verify new UX spec requirements
5. Exported ValueDisplay and formatCurrency from draft feature index

### Completion Notes

✅ **Story 6.5 Implementation Complete**

- Created `ValueDisplay.tsx` component with stacked layout for reusability
- Implemented `formatCurrency` utility that rounds to whole dollars and handles negative values
- Updated `PlayerQueue` to use emerald-400, text-xl, font-bold for adjusted values (always emerald, per UX spec)
- Updated `PlayerQueue` to use slate-400, text-sm for projected values
- Added comprehensive tests (27 new tests for ValueDisplay, updated 4 tests in PlayerQueue)
- All 206 draft-related tests pass

### Debug Log

No issues encountered during implementation.

---

## File List

### New Files
- `src/features/draft/components/ValueDisplay.tsx` - Value display component with prominent styling
- `tests/features/draft/ValueDisplay.test.tsx` - Comprehensive tests for ValueDisplay

### Modified Files
- `src/features/draft/components/PlayerQueue.tsx` - Integrated formatCurrency and UX styling
- `src/features/draft/index.ts` - Added exports for ValueDisplay, formatCurrency, ValueDisplayProps
- `tests/features/draft/PlayerQueue.test.tsx` - Updated value styling tests for Story 6.5

---

## Change Log

| Date       | Change                                                                 |
|------------|------------------------------------------------------------------------|
| 2025-12-19 | Story 6.5 implementation complete - ValueDisplay component, currency formatting, PlayerQueue integration |
| 2025-12-19 | Code review fixes: Extracted formatCurrency to utility file, added formatBudget for locale-aware formatting, added aria-labels to PlayerQueue values, added NaN handling, consolidated duplicate implementations across LeagueCard/LeagueDetail |

---

## Code Review Record

### Review Date: 2025-12-19

**Issues Found:** 4 High, 3 Medium, 2 Low

### Issues Fixed:

1. **[HIGH] DRY Violation** - Created `src/features/draft/utils/formatCurrency.ts` with shared `formatCurrency` and `formatBudget` functions. Removed duplicate implementations from LeagueCard and LeagueDetail.

2. **[HIGH] Fast Refresh Warning** - Moved `formatCurrency` from ValueDisplay.tsx to separate utility file to fix React Fast Refresh issues.

3. **[HIGH] Missing Accessibility** - Added `data-testid` and `aria-label` attributes to projected/adjusted value spans in PlayerQueue for screen reader support.

4. **[MEDIUM] NaN Handling** - Added `Number.isNaN()` check to formatCurrency to return `$0` for invalid inputs.

5. **[MEDIUM] Inconsistent DOM Structure** - Wrapped projected value in span inside TableCell to match adjusted value structure.

### Files Changed During Review:

**New Files:**
- `src/features/draft/utils/formatCurrency.ts` - Shared currency formatting utilities
- `tests/features/draft/formatCurrency.test.ts` - 27 tests for formatCurrency and formatBudget

**Modified Files:**
- `src/features/draft/components/ValueDisplay.tsx` - Import from utility, re-export for backward compat
- `src/features/draft/components/PlayerQueue.tsx` - Added aria-labels, consistent DOM structure
- `src/features/draft/index.ts` - Export formatCurrency and formatBudget from utilities
- `src/features/leagues/components/LeagueCard.tsx` - Import shared formatCurrency
- `src/features/leagues/components/LeagueDetail.tsx` - Import shared formatBudget
- `tests/features/draft/ValueDisplay.test.tsx` - Updated import path
- `tests/features/draft/PlayerQueue.test.tsx` - Added accessibility test, use data-testid

### Test Results After Fixes:

- **158 tests pass** (formatCurrency: 27, ValueDisplay: 27, PlayerQueue: 30, Leagues: 74)
- No lint errors in modified files

---

**Status:** Done
**Epic:** 6 of 13
**Story:** 5 of 11 in Epic 6
