# Story 6.4: Implement Sortable Table Columns

**Story ID:** 6.4
**Story Key:** 6-4-implement-sortable-table-columns
**Epic:** Epic 6 - Live Draft Experience - Player Discovery & Tracking
**Status:** Ready for Review

---

## Story

As a **user**,
I want to sort players by any column (projected value, adjusted value, position, team),
So that I can organize the player list by different attributes.

---

## Acceptance Criteria

**Given** the PlayerQueue table is rendered
**When** I click on a column header
**Then** the table sorts by that column in ascending order
**And** clicking again toggles to descending order
**And** a visual indicator (arrow icon) shows the current sort column and direction
**And** the default sort is by adjusted value descending (highest values first)
**And** sorting completes instantly (<100ms) for 2000+ players
**And** the sort state persists during the draft session (stored in Zustand)
**And** numerical columns sort numerically, text columns sort alphabetically

---

## Developer Context

### Story Foundation from Epic

From **Epic 6: Live Draft Experience - Player Discovery & Tracking** (docs/epics-stories.md lines 777-794):

This story implements column sorting for the PlayerQueue table. Users need to quickly reorganize the player list by different attributes to find value or compare players.

**Core Responsibilities:**

- **Click-to-Sort:** Toggle sort direction on header click
- **Visual Indicator:** Show current sort column and direction
- **Default Sort:** Adjusted value descending
- **Performance:** Sort 2000+ players in <100ms

**Relationship to Epic 6:**

This is Story 4 of 11 in Epic 6. It depends on:
- **Story 6.2**: PlayerQueue component (table to sort)

It combines with:
- **Story 6.3**: Search filtering (sort filtered results)
- **Story 6.8**: Status filtering (sort filtered results)

### Technical Requirements

#### Sort State Interface

```typescript
interface SortState {
  column: 'name' | 'positions' | 'team' | 'projectedValue' | 'adjustedValue' | 'tier' | 'status';
  direction: 'asc' | 'desc';
}

// Default sort
const defaultSort: SortState = {
  column: 'adjustedValue',
  direction: 'desc'
};
```

#### Sort Logic

```typescript
const sortPlayers = (players: Player[], sort: SortState): Player[] => {
  return [...players].sort((a, b) => {
    const aValue = a[sort.column];
    const bValue = b[sort.column];

    // Numerical comparison for values
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sort.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }

    // String comparison for text
    const comparison = String(aValue).localeCompare(String(bValue));
    return sort.direction === 'asc' ? comparison : -comparison;
  });
};
```

---

## Tasks / Subtasks

- [x] **Task 1: Create Sort State Types**
  - [x] Define SortState interface
  - [x] Define SortColumn type
  - [x] Add to draft types file

- [x] **Task 2: Create Sortable Header Component**
  - [x] Create `SortableHeader.tsx` component
  - [x] Accept column and current sort state
  - [x] Handle click to toggle sort
  - [x] Display sort direction arrow

- [x] **Task 3: Implement Sort Logic**
  - [x] Create sortPlayers utility function
  - [x] Handle numerical sorting
  - [x] Handle alphabetical sorting
  - [x] Handle array fields (positions)

- [x] **Task 4: Add Sort Icons**
  - [x] Use Lucide icons (ChevronUp, ChevronDown)
  - [x] Show arrow only for active sort column
  - [x] Indicate direction with icon orientation

- [x] **Task 5: Integrate with PlayerQueue**
  - [x] Add sort state to component
  - [x] Apply sort after filtering
  - [x] Set default sort on mount

- [x] **Task 6: Persist Sort in Zustand**
  - [x] Add sort state to draft store
  - [x] Update sort action
  - [x] Persist during session

- [x] **Task 7: Optimize Performance**
  - [x] Use useMemo for sorted results
  - [x] Profile sort performance
  - [x] Ensure <100ms for 2000+ players

- [x] **Task 8: Write Tests**
  - [x] Test ascending sort
  - [x] Test descending sort
  - [x] Test toggle behavior
  - [x] Test numerical vs string sorting
  - [x] Test default sort applied

---

## Dev Notes

### Implementation Approach

1. Create reusable SortableHeader component
2. Manage sort state in Zustand store
3. Apply sort after search filter in useMemo
4. Use native Array.sort() for performance

### Sort Order

1. Apply search filter first
2. Apply status filter second
3. Apply sort last
4. Return sorted, filtered results

### Visual Design

- Active sort column: Highlighted header
- Sort icon: ChevronUp (asc) or ChevronDown (desc)
- Inactive columns: Subtle chevron on hover

---

## Dev Agent Record

### Implementation Notes

- Created `SortState` interface and `SortColumn` type in `sort.types.ts`
- Implemented `SortableHeader` component with Lucide icons (ChevronUp/ChevronDown)
- Created `sortPlayers` utility with numerical and string sorting support
- Updated `PlayerQueue` to conditionally render sortable headers while maintaining backward compatibility
- Added `sortState`, `setSort`, `toggleSort`, and `resetSort` to Zustand draft store
- Updated `PlayerQueueWithSearch` to use store sort state and apply sorting after filtering
- Performance validated: sorting 2000+ players completes in <100ms
- All 169 draft feature tests pass

### Completion Notes

Story 6.4 implementation complete. Sortable table columns are now fully functional:
- Click any column header to sort ascending
- Click again to toggle to descending
- Default sort is adjustedValue descending (highest values first)
- Sort state persists in Zustand during the draft session
- Visual arrow indicators show current sort column and direction
- Performance meets <100ms requirement for 2000+ players

---

## File List

### New Files
- `src/features/draft/types/sort.types.ts` - Sort state types and DEFAULT_SORT constant
- `src/features/draft/components/SortableHeader.tsx` - Reusable sortable header component
- `src/features/draft/utils/sortPlayers.ts` - Player sorting utility function
- `tests/features/draft/sortTypes.test.ts` - Sort types tests
- `tests/features/draft/SortableHeader.test.tsx` - SortableHeader component tests
- `tests/features/draft/sortPlayers.test.ts` - Sort utility tests
- `tests/features/draft/PlayerQueue.sort.test.tsx` - PlayerQueue sorting tests
- `tests/features/draft/draftStore.sort.test.ts` - Draft store sort state tests
- `tests/features/draft/sortPerformance.test.ts` - Performance validation tests
- `tests/features/draft/PlayerQueueWithSearch.sort.test.tsx` - Integration tests

### Modified Files
- `src/features/draft/types/player.types.ts` - Added sortState and onSortChange props
- `src/features/draft/types/draft.types.ts` - Added sortState and sort actions to store types
- `src/features/draft/stores/draftStore.ts` - Added sortState, setSort, toggleSort, resetSort
- `src/features/draft/components/PlayerQueue.tsx` - Added sortable header support
- `src/features/draft/components/PlayerQueueWithSearch.tsx` - Integrated sort state and sorting

---

## Change Log

- **2024-12-19**: Implemented sortable table columns for PlayerQueue (Story 6.4)
  - Added sort types, SortableHeader component, and sortPlayers utility
  - Integrated sort state with Zustand store for session persistence
  - Updated PlayerQueue and PlayerQueueWithSearch with sorting support
  - Added comprehensive tests including performance validation
  - All acceptance criteria satisfied

- **2024-12-19**: Code review fixes applied
  - **HIGH #1 FIXED**: Sort state now persists to localStorage (added `sortState` to Zustand `partialize`)
  - **HIGH #3 FIXED**: Inactive sort columns now show subtle hover chevron indicator (ChevronsUpDown icon)
  - **HIGH #4 FIXED**: Added tests for sort state persistence in `draftStore.sort.test.ts`
  - **MEDIUM #6 FIXED**: Added Space key keyboard accessibility test for SortableHeader
  - **MEDIUM #7 FIXED**: Added edge case tests for empty positions array and zero values
  - **LOW #10 FIXED**: Added `aria-sort` attribute to SortableHeader for WAI-ARIA compliance
  - All 41 sort-related tests pass

---

**Status:** Review Complete - Issues Fixed
**Epic:** 6 of 13
**Story:** 4 of 11 in Epic 6
