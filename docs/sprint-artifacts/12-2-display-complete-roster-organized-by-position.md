# Story 12.2: Display Complete Roster Organized by Position

**Story ID:** 12.2
**Story Key:** 12-2-display-complete-roster-organized-by-position
**Epic:** Epic 12 - Post-Draft Analytics & Value Summary
**Status:** Ready for Review

---

## Story

As a **user**,
I want to view my complete drafted roster organized by position,
So that I can review all the players I acquired.

---

## Acceptance Criteria

**Given** my draft is complete
**When** I view the post-draft summary
**Then** I see my full roster grouped by position: Hitters, Pitchers, Bench
**And** each player entry shows: name, position(s), auction price, projected stats
**And** the roster is formatted as a clean table or card list
**And** totals are shown for each position group

---

## Developer Context

### Story Foundation from Epic

From **Epic 12: Post-Draft Analytics & Value Summary** (docs/epics-stories.md lines 1560-1573):

This story implements the roster overview section of the post-draft summary, displaying the user's complete drafted roster organized by position groups (Hitters, Pitchers, Bench). It builds on the foundation from Story 12.1.

**Core Responsibilities:**

- **RosterOverview Component:** Display complete roster with position grouping
- **Player Cards:** Show each player with name, position(s), auction price, projected stats
- **Position Grouping:** Organize players into Hitters, Pitchers, Bench sections
- **Data Display:** Format roster data in clean, readable table or card format
- **Totals Calculation:** Show totals for each position group

**Relationship to Epic 12:**

This is Story 2 of 5 in Epic 12. It:
- Builds on **Story 12.1**: Populates the RosterOverview placeholder
- Works alongside **Story 12.3**: Budget utilization (different section)
- Complements **Story 12.4**: Value analysis uses same roster data
- Supports **Story 12.5**: Competitive advantage summary references roster

### Architecture Requirements

**Files to Modify:**
```
src/features/draft/
  components/
    RosterOverview.tsx            # MODIFY - Implement from placeholder
    PlayerCard.tsx                # CREATE - Individual player display card
  utils/
    rosterGrouping.ts             # CREATE - Helper to group players by position
tests/features/draft/
  RosterOverview.test.tsx         # CREATE - Component tests
  rosterGrouping.test.ts          # CREATE - Utility tests
```

**Required Utilities:**
```typescript
function groupPlayersByPosition(roster: Player[]): {
  hitters: Player[]
  pitchers: Player[]
  bench: Player[]
}
```

---

## Tasks / Subtasks

- [x] **Task 1: Create Roster Grouping Utility**
  - [x] Create `src/features/draft/utils/rosterGrouping.ts`
  - [x] Implement groupPlayersByPosition function
  - [x] Test with mock roster data
  - [x] Handle edge cases (empty roster, multi-position players)

- [x] **Task 2: Create PlayerCard Component**
  - [x] Create `src/features/draft/components/PlayerCard.tsx`
  - [x] Display player name, position(s), auction price
  - [x] Display projected value and variance
  - [x] Use card format with dark slate theme
  - [x] Apply emerald/red color coding for value

- [x] **Task 3: Implement RosterOverview Component**
  - [x] Import groupPlayersByPosition utility
  - [x] Group roster into Hitters, Pitchers, Bench
  - [x] Render three position group sections
  - [x] Use PlayerCard for each player
  - [x] Calculate and display totals per group

- [x] **Task 4: Add Position Group Headers**
  - [x] Create section headers: "Hitters", "Pitchers", "Bench"
  - [x] Show player count per section
  - [x] Show total spending per section
  - [x] Use emerald accents for headers

- [x] **Task 5: Create Test Suite**
  - [x] Test roster grouping logic (17 tests)
  - [x] Test PlayerCard renders correctly (19 tests)
  - [x] Test RosterOverview displays all groups (20 tests)
  - [x] Test totals calculation
  - [x] Test empty roster state
  - [x] 68 total tests passing

- [x] **Task 6: Integrate with DraftSummary**
  - [x] Pass roster prop from DraftSummary to RosterOverview
  - [x] Verify data flows correctly
  - [x] Update DraftSummary tests (12 tests passing)

---

## Dev Notes

### Implementation Approach

1. Create utility to group players by position (Hitters/Pitchers/Bench)
2. Build PlayerCard component for individual player display
3. Implement RosterOverview with three position group sections
4. Add totals calculation for each group
5. Test with mock roster data
6. Integrate into DraftSummary parent component

### Data Flow

```
DraftSummary (props.roster)
└── RosterOverview (roster prop)
    ├── groupPlayersByPosition(roster)
    ├── Hitters Section
    │   └── PlayerCard[] (map over hitters)
    ├── Pitchers Section
    │   └── PlayerCard[] (map over pitchers)
    └── Bench Section
        └── PlayerCard[] (map over bench)
```

---

## Summary

Story 12.2 implements the roster overview section, displaying the user's complete drafted roster organized by position groups.

**Deliverable:** RosterOverview component showing all drafted players grouped by Hitters, Pitchers, Bench with player details and group totals.

**Key Technical Decisions:**
1. Position grouping utility for data organization
2. PlayerCard component for consistent player display
3. Three-section layout (Hitters, Pitchers, Bench)
4. Totals calculation per position group
5. Clean table or card-based layout

---

## Dev Agent Record

### Implementation Plan

1. Created roster grouping utility with `groupPlayersByPosition` function
2. Built PlayerCard component for individual player display with variance color coding
3. Implemented full RosterOverview component with three position group sections
4. Added position group headers with player counts and spending totals
5. Created comprehensive test suites for all new code
6. Verified integration with existing DraftSummary component

### Completion Notes

All acceptance criteria have been satisfied:
- Roster grouped by Hitters, Pitchers, Bench sections ✅
- Each player shows name, position(s), auction price, projected value ✅
- Roster formatted as clean card layout with responsive grid ✅
- Totals shown for each position group ✅

### Debug Log

- Fixed vitest import issue (globals: true requires no explicit vitest imports)
- Updated DraftSummary test to match new RosterOverview behavior

---

## File List

**New Files:**
- `src/features/draft/utils/rosterGrouping.ts` - Position grouping utility
- `src/features/draft/components/PlayerCard.tsx` - Individual player card component
- `tests/features/draft/rosterGrouping.test.ts` - Utility tests (17 tests)
- `tests/features/draft/PlayerCard.test.tsx` - Component tests (19 tests)
- `tests/features/draft/RosterOverview.full.test.tsx` - Full component tests (20 tests)

**Modified Files:**
- `src/features/draft/components/RosterOverview.tsx` - Enhanced from placeholder
- `tests/features/draft/DraftSummary.test.tsx` - Updated test assertions

---

## Change Log

| Date | Change |
|------|--------|
| 2025-12-22 | Story created and ready for development |
| 2025-12-22 | Implemented roster grouping utility with tests |
| 2025-12-22 | Created PlayerCard component with variance display |
| 2025-12-22 | Enhanced RosterOverview with full position grouping |
| 2025-12-22 | All 68 tests passing, story ready for review |
