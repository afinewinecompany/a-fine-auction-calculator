# Story 7.3: Display Money Spent Breakdown by Position

**Story ID:** 7.3
**Story Key:** 7-3-display-money-spent-breakdown-by-position
**Epic:** Epic 7 - Live Draft Experience - Budget & Roster Management
**Status:** ready-for-dev

---

## Story

As a **user**,
I want to view my spending breakdown across roster positions,
So that I can see where my budget has been allocated.

---

## Acceptance Criteria

**Given** I have drafted players at various positions
**When** the RosterPanel renders the spending breakdown
**Then** I see spending grouped by position category: Hitters, Pitchers, Bench
**And** each position shows: total spent and number of players (e.g., "OF: $42 (3 players)")
**And** the breakdown uses a compact list format
**And** the totals sum correctly to match total spent
**And** the breakdown updates in real-time as players are drafted

---

## Developer Context

### Story Foundation from Epic

From **Epic 7: Live Draft Experience - Budget & Roster Management** (docs/epics-stories.md lines 954-969):

This story adds a detailed spending breakdown by position within the Budget Summary section. Users need to understand where their money went to make informed decisions about remaining budget allocation.

**Core Responsibilities:**

- **Position Grouping:** Group spending by Hitters, Pitchers, Bench categories
- **Per-Position Details:** Show spending and player count per position
- **Compact Format:** Use space-efficient list format
- **Real-Time Updates:** Update breakdown when players are drafted
- **Sum Validation:** Ensure position totals sum to total spent

**Relationship to Epic 7:**

This is Story 3 of 8 in Epic 7. It depends on:
- **Story 7.1**: RosterPanel Component Foundation (provides container)
- **Story 7.2**: Display Real-Time Budget Tracking (budget context)

It relates to:
- **Story 7.5**: Display Roster Composition by Position (similar position grouping)

### Technical Requirements

#### Spending Breakdown Component

```typescript
interface SpendingBreakdownProps {
  roster: {
    hitters: DraftedPlayer[];
    pitchers: DraftedPlayer[];
    bench: DraftedPlayer[];
  };
}

interface DraftedPlayer {
  playerId: string;
  name: string;
  position: Position;
  auctionPrice: number;
}
```

#### Display Format

```
Hitters
  C: $25 (1 player)
  1B: $18 (1 player)
  OF: $42 (3 players)

Pitchers
  SP: $35 (2 players)
  RP: $12 (1 player)

Bench
  (No bench players yet)
```

---

## Tasks / Subtasks

- [ ] **Task 1: Create SpendingBreakdown Component**
  - [ ] Create `src/features/draft/components/SpendingBreakdown.tsx`
  - [ ] Define `SpendingBreakdownProps` interface
  - [ ] Add component header comments

- [ ] **Task 2: Calculate Position Spending**
  - [ ] Group players by position
  - [ ] Sum spending per position
  - [ ] Count players per position
  - [ ] Handle multi-position players (assign to primary position)

- [ ] **Task 3: Implement Category Grouping**
  - [ ] Create "Hitters" category header
  - [ ] Create "Pitchers" category header
  - [ ] Create "Bench" category header
  - [ ] Apply slate-300 styling to category headers

- [ ] **Task 4: Implement Position Line Items**
  - [ ] Format each position: "OF: $42 (3 players)"
  - [ ] Use slate-400 color for position labels
  - [ ] Use slate-200 color for amounts
  - [ ] Handle singular/plural: "1 player" vs "3 players"

- [ ] **Task 5: Handle Empty Categories**
  - [ ] Show "(No hitters drafted yet)" when category is empty
  - [ ] Use italic, slate-500 styling for empty state
  - [ ] Test empty state rendering

- [ ] **Task 6: Implement Sum Validation**
  - [ ] Calculate sum of all position spending
  - [ ] Compare to total spent from budget
  - [ ] Log warning if mismatch detected (for debugging)

- [ ] **Task 7: Connect to Draft Store**
  - [ ] Subscribe to roster state from draft store
  - [ ] Ensure updates trigger re-render
  - [ ] Memoize calculations to prevent excess computation

- [ ] **Task 8: Integrate with RosterPanel**
  - [ ] Import SpendingBreakdown into RosterPanel
  - [ ] Place below BudgetDisplay in Budget Summary section
  - [ ] Pass roster data from store

- [ ] **Task 9: Create Component Tests**
  - [ ] Create `tests/features/draft/SpendingBreakdown.test.tsx`
  - [ ] Test correct position grouping
  - [ ] Test correct spending calculations
  - [ ] Test empty state handling
  - [ ] Test sum validation logic

---

## Dev Notes

### Implementation Approach

1. Create utility function to calculate spending by position
2. Build category-based display with collapsible sections
3. Handle edge cases (empty categories, multi-position players)
4. Connect to Zustand store for real-time updates
5. Integrate into RosterPanel Budget Summary section

### Position to Category Mapping

```typescript
const HITTER_POSITIONS: Position[] = ['C', '1B', '2B', 'SS', '3B', 'OF'];
const PITCHER_POSITIONS: Position[] = ['SP', 'RP'];

const getCategory = (position: Position): 'Hitters' | 'Pitchers' | 'Bench' => {
  if (HITTER_POSITIONS.includes(position)) return 'Hitters';
  if (PITCHER_POSITIONS.includes(position)) return 'Pitchers';
  return 'Bench';
};
```

### Multi-Position Players

For players with multiple position eligibility, use the primary position (first in their positions array) for spending categorization.

---

**Status:** Ready for Implementation
**Epic:** 7 of 13
**Story:** 3 of 8 in Epic 7
