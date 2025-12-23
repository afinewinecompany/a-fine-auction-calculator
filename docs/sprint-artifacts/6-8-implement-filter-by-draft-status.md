# Story 6.8: Implement Filter by Draft Status

**Story ID:** 6.8
**Story Key:** 6-8-implement-filter-by-draft-status
**Epic:** Epic 6 - Live Draft Experience - Player Discovery & Tracking
**Status:** done

---

## Story

As a **user**,
I want to filter players by draft status (all, available only, my team),
So that I can focus on relevant players.

---

## Acceptance Criteria

**Given** the PlayerQueue has filter controls
**When** I select a filter option from the dropdown
**Then** selecting "Available Only" shows only undrafted players
**And** selecting "My Team" shows only players I've drafted
**And** selecting "All Players" shows the complete player pool
**And** the active filter is visually indicated
**And** one-click "Clear Filters" button resets all filters
**And** filter state persists during the draft session
**And** multiple filters can be combined (e.g., "Available Only" + position filter)

---

## Developer Context

### Story Foundation from Epic

From **Epic 6: Live Draft Experience - Player Discovery & Tracking** (docs/epics-stories.md lines 846-863):

This story implements status filtering for the PlayerQueue. Users need to quickly filter the player list to focus on available players or review their own roster.

**Core Responsibilities:**

- **Status Filter:** Filter by available, my team, or all
- **Visual Indicator:** Show active filter state
- **Clear Filters:** One-click reset
- **Combinable:** Works with search and position filters

**Relationship to Epic 6:**

This is Story 8 of 11 in Epic 6. It depends on:
- **Story 6.7**: Draft status display (status data to filter)
- **Story 6.3**: Search functionality (combine with search)

It combines with:
- **Story 6.3**: Search filtering
- **Story 6.4**: Column sorting

### Technical Requirements

#### Filter State

```typescript
interface FilterState {
  status: 'all' | 'available' | 'my-team';
  position?: string;
  searchTerm: string;
}

const defaultFilters: FilterState = {
  status: 'available', // Default to showing available players
  position: undefined,
  searchTerm: ''
};
```

#### Filter Component

```typescript
interface StatusFilterProps {
  value: FilterState['status'];
  onChange: (status: FilterState['status']) => void;
  counts: {
    all: number;
    available: number;
    myTeam: number;
  };
}
```

---

## Tasks / Subtasks

- [x] **Task 1: Create Filter Types**
  - [x] Define FilterState interface
  - [x] Add to draft types file
  - [x] Define default filter values

- [x] **Task 2: Create StatusFilter Component**
  - [x] Create `src/features/draft/components/StatusFilter.tsx`
  - [x] Use shadcn/ui Select or ToggleGroup
  - [x] Display option counts

- [x] **Task 3: Implement Filter Logic**
  - [x] Create filterByStatus utility function
  - [x] Apply after search filter
  - [x] Handle each status option

- [x] **Task 4: Add Clear Filters Button**
  - [x] Create Clear Filters button
  - [x] Reset all filters to defaults
  - [x] Only show when filters active

- [x] **Task 5: Display Active Filter State**
  - [x] Highlight active filter option
  - [x] Show filter badge/indicator
  - [x] Update count displays

- [x] **Task 6: Persist in Zustand Store**
  - [x] Add filter state to draft store
  - [x] Create setFilter action
  - [x] Create clearFilters action

- [x] **Task 7: Integrate with PlayerQueue**
  - [x] Combine filters: search → status → position → sort
  - [x] Update result count
  - [x] Pass filter controls to toolbar

- [x] **Task 8: Write Tests**
  - [x] Test available filter
  - [x] Test my-team filter
  - [x] Test all filter
  - [x] Test clear filters
  - [x] Test filter combinations
  - [x] Test persistence

---

## Dev Notes

### Implementation Approach

1. Create filter state in Zustand store
2. Create StatusFilter component with toggle options
3. Apply filters in correct order in useMemo
4. Display filtered results with counts

### Filter Pipeline Order

```
players
  → filterBySearch(searchTerm)
  → filterByStatus(status)
  → filterByPosition(position) [future]
  → sortPlayers(sortState)
  → displayedPlayers
```

### UI Design

```
┌─────────────────────────────────────────────┐
│ [All (250)] [Available (180)] [My Team (8)] │
│                                 [Clear All] │
└─────────────────────────────────────────────┘
```

---

## Implementation Summary

**Completed:** 2025-12-19

### Files Created

- `src/features/draft/components/StatusFilter.tsx` - Toggle group for status filtering
- `src/features/draft/components/ClearFiltersButton.tsx` - Button to reset all filters
- `tests/features/draft/filterByStatus.test.ts` - Unit tests for filter functions
- `tests/features/draft/StatusFilter.test.tsx` - Component tests
- `tests/features/draft/ClearFiltersButton.test.tsx` - Component tests
- `tests/features/draft/draftStore.filter.test.ts` - Store filter state tests
- `tests/features/draft/PlayerQueueWithSearch.filter.test.tsx` - Integration tests

### Files Modified

- `src/features/draft/types/draft.types.ts` - Added FilterState, StatusFilter, FilterCounts types
- `src/features/draft/utils/filterPlayers.ts` - Added filterByStatus, getFilterCounts, hasActiveFilters
- `src/features/draft/stores/draftStore.ts` - Added filterState and filter actions
- `src/features/draft/components/PlayerQueueWithSearch.tsx` - Integrated status filtering
- `src/features/draft/index.ts` - Exported new components and types

### Test Results

- 81 new filter-related tests
- All 1559+ tests passing

---

**Status:** Done
**Epic:** 6 of 13
**Story:** 8 of 11 in Epic 6
