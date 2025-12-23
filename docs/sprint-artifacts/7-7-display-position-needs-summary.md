# Story 7.7: Display Position Needs Summary

**Story ID:** 7.7
**Story Key:** 7-7-display-position-needs-summary
**Epic:** Epic 7 - Live Draft Experience - Budget & Roster Management
**Status:** ready-for-dev

---

## Story

As a **user**,
I want to see which positions I still need to fill ("Still Needed"),
So that I can prioritize my remaining draft picks.

---

## Acceptance Criteria

**Given** league roster requirements specify positions needed
**When** the RosterPanel renders the position needs section
**Then** I see a list of unfilled positions with counts: "C: 1", "OF: 2", "SP: 3"
**And** positions that are filled are not shown in the "Still Needed" list
**And** the list uses badge/chip components (shadcn/ui Badge)
**And** the list updates immediately as positions are filled
**And** the section shows "All positions filled!" when roster is complete

---

## Developer Context

### Story Foundation from Epic

From **Epic 7: Live Draft Experience - Budget & Roster Management** (docs/epics-stories.md lines 1017-1032):

This story implements the Position Needs section of the RosterPanel. Users need to quickly see which positions they still need to draft to make informed decisions during the fast-paced auction.

**Core Responsibilities:**

- **Position Needs List:** Show unfilled positions with counts
- **Badge Display:** Use shadcn/ui Badge components
- **Hide Filled:** Don't show positions that are complete
- **Real-Time Updates:** Update as players are drafted
- **Completion State:** Show success message when roster complete

**Relationship to Epic 7:**

This is Story 7 of 8 in Epic 7. It depends on:
- **Story 7.1**: RosterPanel Component Foundation (provides container)
- **Story 7.5**: Display Roster Composition by Position (roster data)
- **Story 7.6**: Display Filled vs. Remaining Roster Slots (slot tracking)

### Technical Requirements

#### Position Needs Component

```typescript
interface PositionNeedsProps {
  roster: {
    hitters: DraftedPlayer[];
    pitchers: DraftedPlayer[];
    bench: DraftedPlayer[];
  };
  positionRequirements: PositionRequirements;
}

interface PositionRequirements {
  C: number;   // e.g., 1
  '1B': number; // e.g., 1
  '2B': number; // e.g., 1
  SS: number;  // e.g., 1
  '3B': number; // e.g., 1
  OF: number;  // e.g., 5
  SP: number;  // e.g., 5
  RP: number;  // e.g., 3
  UTIL?: number; // e.g., 1 (optional)
  BN?: number;  // bench slots
}

interface PositionNeed {
  position: Position;
  needed: number;
}
```

#### Badge Display

```typescript
// Using shadcn/ui Badge
<Badge variant="outline" className="bg-slate-800 border-emerald-400/50">
  C: 1
</Badge>
```

---

## Tasks / Subtasks

- [ ] **Task 1: Create PositionNeeds Component**
  - [ ] Create `src/features/draft/components/PositionNeeds.tsx`
  - [ ] Define `PositionNeedsProps` interface
  - [ ] Define `PositionRequirements` interface
  - [ ] Define `PositionNeed` interface
  - [ ] Add component header comments

- [ ] **Task 2: Calculate Position Needs**
  - [ ] Count players at each position in roster
  - [ ] Compare to position requirements
  - [ ] Calculate remaining needs per position
  - [ ] Handle multi-position eligibility

- [ ] **Task 3: Filter Filled Positions**
  - [ ] Remove positions where needs are fulfilled (needed = 0)
  - [ ] Only show positions that still need players
  - [ ] Sort by position order: C, 1B, 2B, SS, 3B, OF, SP, RP

- [ ] **Task 4: Implement Badge Display**
  - [ ] Import shadcn/ui Badge component
  - [ ] Create badge for each unfilled position
  - [ ] Format as "C: 1", "OF: 2", etc.
  - [ ] Apply slate-800 background, emerald-400/50 border

- [ ] **Task 5: Implement Badge Layout**
  - [ ] Use flex-wrap layout for badges
  - [ ] Apply gap spacing between badges
  - [ ] Ensure badges wrap on small screens

- [ ] **Task 6: Implement Completion State**
  - [ ] Detect when all positions are filled
  - [ ] Display "All positions filled!" message
  - [ ] Use green checkmark icon
  - [ ] Apply emerald-400 text color

- [ ] **Task 7: Handle Edge Cases**
  - [ ] No position requirements defined: show "No requirements set"
  - [ ] No players drafted yet: show all requirements
  - [ ] UTIL/BN slots that accept any position

- [ ] **Task 8: Connect to Draft Store**
  - [ ] Subscribe to roster state from draft store
  - [ ] Subscribe to position requirements from league settings
  - [ ] Ensure updates trigger re-render
  - [ ] Memoize need calculations

- [ ] **Task 9: Integrate with RosterPanel**
  - [ ] Import PositionNeeds into RosterPanel
  - [ ] Place in Position Needs section
  - [ ] Pass roster and requirements props

- [ ] **Task 10: Create Component Tests**
  - [ ] Create `tests/features/draft/PositionNeeds.test.tsx`
  - [ ] Test correct need calculations
  - [ ] Test filled positions are hidden
  - [ ] Test badge rendering
  - [ ] Test completion state
  - [ ] Test edge cases

---

## Dev Notes

### Implementation Approach

1. Create need calculation utility functions
2. Build badge display with shadcn/ui Badge
3. Implement filtering logic for filled positions
4. Add completion state display
5. Handle edge cases and multi-position players
6. Connect to Zustand store for real-time updates
7. Integrate into RosterPanel Position Needs section

### Position Counting with Multi-Position Players

Multi-position players should count toward their primary position by default:

```typescript
const countPlayerAtPosition = (roster: DraftedPlayer[], position: Position): number => {
  return roster.filter(player => player.position === position).length;
};
```

For flexible slot assignment (UTIL), count any player that has the position in their eligibility list.

### Default Position Requirements

Standard fantasy baseball roster requirements:

```typescript
const DEFAULT_POSITION_REQUIREMENTS: PositionRequirements = {
  C: 1,
  '1B': 1,
  '2B': 1,
  SS: 1,
  '3B': 1,
  OF: 5,
  SP: 5,
  RP: 3,
};
```

---

## Dev Agent Record

### Implementation Summary

**Completed:** 2025-12-20

#### Files Created/Modified

**New Files:**

- `src/features/draft/components/PositionNeeds.tsx` - Component for displaying unfilled position needs
- `tests/features/draft/PositionNeeds.test.tsx` - Component tests (18 tests)

**Modified Files:**

- `src/features/draft/components/RosterPanel.tsx` - Integrated PositionNeeds component

#### Key Implementation Details

1. **PositionNeeds Component** - Displays unfilled positions with badge components
2. **Position Badges** - Uses shadcn/ui Badge with slate-800 background and emerald-400/50 border
3. **Position Counting** - Calculates needs by comparing roster to requirements
4. **Hide Filled Positions** - Only shows positions that still need players
5. **Position Ordering** - Displays in standard order (C, 1B, 2B, SS, 3B, OF, SP, RP)
6. **Completion State** - Shows "All positions filled!" with checkmark when complete
7. **Edge Cases** - Handles empty requirements, no players drafted, zero requirement values

#### Tasks Completed

- [x] Task 1: Create PositionNeeds Component
- [x] Task 2: Calculate Position Needs
- [x] Task 3: Filter Filled Positions
- [x] Task 4: Implement Badge Display
- [x] Task 5: Implement Badge Layout
- [x] Task 6: Implement Completion State
- [x] Task 7: Handle Edge Cases
- [x] Task 8: Connect to Draft Store (via RosterPanel integration)
- [x] Task 9: Integrate with RosterPanel
- [x] Task 10: Create Component Tests

---

**Status:** In Review
**Epic:** 7 of 13
**Story:** 7 of 8 in Epic 7
