# Story 6.7: Display Player Draft Status

**Story ID:** 6.7
**Story Key:** 6-7-display-player-draft-status
**Epic:** Epic 6 - Live Draft Experience - Player Discovery & Tracking
**Status:** done

---

## Story

As a **user**,
I want to see which players are available, drafted by other teams, or drafted by me,
So that I can filter the player pool appropriately.

---

## Acceptance Criteria

**Given** players have draft status in the system
**When** the PlayerQueue renders
**Then** each player displays status: "Available", "Drafted by Team {N}", or "My Team"
**And** my drafted players are highlighted with a distinct visual treatment (emerald border)
**And** unavailable players (drafted by others) are grayed out (opacity reduced)
**And** the player count updates: "Showing X available of Y total players"
**And** status updates immediately when players are drafted (real-time via Zustand store)

---

## Developer Context

### Story Foundation from Epic

From **Epic 6: Live Draft Experience - Player Discovery & Tracking** (docs/epics-stories.md lines 830-845):

This story implements draft status display for each player in the queue. Users need to quickly identify which players are still available versus already drafted.

**Core Responsibilities:**

- **Status Display:** Show Available, Drafted by Team X, or My Team
- **Visual Treatment:** Highlight my players, gray out unavailable
- **Count Display:** Show available vs total player count
- **Real-Time Updates:** Status changes via Zustand store

**Relationship to Epic 6:**

This is Story 7 of 11 in Epic 6. It depends on:
- **Story 6.1**: Draft state database (provides status data)
- **Story 6.2**: PlayerQueue component (displays status)

It enables:
- **Story 6.6**: Color-coded indicators (only for drafted)
- **Story 6.8**: Filter by status (filters on this status)

### Technical Requirements

#### Status Types

```typescript
type DraftStatus = 'available' | 'drafted' | 'my-team';

interface PlayerWithStatus extends Player {
  status: DraftStatus;
  draftedByTeam?: number;
  auctionPrice?: number;
}
```

#### Status Badge Component

```typescript
interface StatusBadgeProps {
  status: DraftStatus;
  teamNumber?: number;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, teamNumber }) => {
  switch (status) {
    case 'available':
      return <Badge variant="outline">Available</Badge>;
    case 'my-team':
      return <Badge className="bg-emerald-500">My Team</Badge>;
    case 'drafted':
      return <Badge variant="secondary">Team {teamNumber}</Badge>;
  }
};
```

---

## Tasks / Subtasks

- [x] **Task 1: Create Status Types**
  - [x] Define DraftStatus type
  - [x] Extend Player interface with status
  - [x] Add to draft types file

- [x] **Task 2: Create StatusBadge Component**
  - [x] Create `src/features/draft/components/StatusBadge.tsx`
  - [x] Use shadcn/ui Badge component
  - [x] Handle all three status types

- [x] **Task 3: Implement Row Styling**
  - [x] Add emerald border for my-team players
  - [x] Reduce opacity for drafted players
  - [x] Keep full opacity for available players

- [x] **Task 4: Add Player Count Display**
  - [x] Calculate available count
  - [x] Display "X available of Y total"
  - [x] Update dynamically

- [x] **Task 5: Connect to Zustand Store**
  - [x] Read drafted players from store
  - [x] Subscribe to status changes
  - [x] Trigger re-render on updates

- [x] **Task 6: Integrate with PlayerQueue**
  - [x] Add status column to table
  - [x] Apply row styling based on status
  - [x] Pass status props to components

- [x] **Task 7: Write Tests**
  - [x] Test available status display
  - [x] Test drafted status display
  - [x] Test my-team status display
  - [x] Test count calculation
  - [x] Test real-time updates

---

## Dev Notes

### Implementation Approach

1. Create StatusBadge component for status display
2. Apply row-level styling based on status
3. Calculate and display player counts
4. Subscribe to Zustand store for updates

### Visual Treatment

| Status | Badge | Row Style |
|--------|-------|-----------|
| Available | Outline badge | Normal |
| My Team | Emerald filled badge | Emerald left border |
| Drafted | Secondary badge | Opacity 60% |

### Real-Time Updates

- Use Zustand subscription to draftedPlayers
- Re-calculate status when draft state changes
- Updates should be <100ms per NFR

---

## Implementation Summary

### Files Created/Modified

1. **`src/features/draft/components/StatusBadge.tsx`** (NEW)
   - StatusBadge component with three status variants
   - Uses shadcn/ui Badge component
   - Full accessibility support with aria-labels

2. **`src/features/draft/components/PlayerQueue.tsx`** (MODIFIED)
   - Added StatusBadge integration
   - Added player count display header
   - Implemented row styling based on status:
     - Available: Normal styling
     - My Team: `border-l-4 border-l-emerald-500`
     - Drafted: `opacity-60`
   - Added `data-status` attribute for testing

3. **`src/features/draft/index.ts`** (MODIFIED)
   - Exported StatusBadge component
   - Exported StatusBadgeProps type

4. **`tests/features/draft/StatusBadge.test.tsx`** (NEW)
   - 11 tests covering all status types
   - Accessibility tests for aria-labels

5. **`tests/features/draft/PlayerQueue.draftStatus.test.tsx`** (NEW)
   - 16 tests for draft status integration
   - Row styling tests
   - Player count display tests
   - Mixed status display tests

### Test Results

- **StatusBadge.test.tsx**: 11 tests passing
- **PlayerQueue.draftStatus.test.tsx**: 16 tests passing
- **Total new tests**: 27 tests passing

---

**Status:** Done
**Epic:** 6 of 13
**Story:** 7 of 11 in Epic 6
**Completed:** 2024-12-19
