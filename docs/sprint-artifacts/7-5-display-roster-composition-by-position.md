# Story 7.5: Display Roster Composition by Position

**Story ID:** 7.5
**Story Key:** 7-5-display-roster-composition-by-position
**Epic:** Epic 7 - Live Draft Experience - Budget & Roster Management
**Status:** ready-for-dev

---

## Story

As a **user**,
I want to view my current roster organized by position (hitters, pitchers, bench),
So that I can see who I've drafted and which positions are filled.

---

## Acceptance Criteria

**Given** I have drafted players
**When** the RosterPanel renders the roster section
**Then** my roster is displayed in three groups: Hitters, Pitchers, Bench
**And** each player entry shows: name, position, auction price
**And** the roster is scrollable if it exceeds panel height
**And** empty positions show placeholder text: "No hitters drafted yet"
**And** the roster updates immediately when players are drafted

---

## Developer Context

### Story Foundation from Epic

From **Epic 7: Live Draft Experience - Budget & Roster Management** (docs/epics-stories.md lines 986-1001):

This story implements the Roster Composition section of the RosterPanel. Users need to see their drafted players organized by position category to understand their current team structure.

**Core Responsibilities:**

- **Position Grouping:** Organize roster into Hitters, Pitchers, Bench categories
- **Player Details:** Show name, position, and auction price for each player
- **Scrollable Content:** Handle long rosters with internal scrolling
- **Empty State:** Show placeholder when no players in a category
- **Real-Time Updates:** Update roster display when players are drafted

**Relationship to Epic 7:**

This is Story 5 of 8 in Epic 7. It depends on:
- **Story 7.1**: RosterPanel Component Foundation (provides container)

It enables:
- **Story 7.6**: Display Filled vs. Remaining Roster Slots (uses roster data)
- **Story 7.7**: Display Position Needs Summary (uses roster data)

### Technical Requirements

#### Roster Display Component

```typescript
interface RosterDisplayProps {
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
  Mike Trout - OF - $42
  Freddie Freeman - 1B - $35
  (more players...)

Pitchers
  Gerrit Cole - SP - $28
  Josh Hader - RP - $15

Bench
  (No bench players yet)
```

---

## Tasks / Subtasks

- [ ] **Task 1: Create RosterDisplay Component**
  - [ ] Create `src/features/draft/components/RosterDisplay.tsx`
  - [ ] Define `RosterDisplayProps` interface
  - [ ] Add component header comments

- [ ] **Task 2: Create PlayerEntry Subcomponent**
  - [ ] Create component for individual player row
  - [ ] Display: name, position, auction price
  - [ ] Format price as currency: "$42"
  - [ ] Apply slate-200 color for player name

- [ ] **Task 3: Implement Category Sections**
  - [ ] Create "Hitters" section with header
  - [ ] Create "Pitchers" section with header
  - [ ] Create "Bench" section with header
  - [ ] Apply emerald-400 color for section headers

- [ ] **Task 4: Implement Player List**
  - [ ] Map over players in each category
  - [ ] Render PlayerEntry for each player
  - [ ] Sort players by position or auction price (configurable)

- [ ] **Task 5: Implement Empty State**
  - [ ] Show "No hitters drafted yet" when category is empty
  - [ ] Show "No pitchers drafted yet" when category is empty
  - [ ] Show "No bench players yet" when bench is empty
  - [ ] Use italic, slate-500 styling for empty state

- [ ] **Task 6: Implement Scrollable Container**
  - [ ] Add max-height to roster section
  - [ ] Enable vertical scrolling when content overflows
  - [ ] Style scrollbar for dark theme
  - [ ] Test with 20+ players

- [ ] **Task 7: Connect to Draft Store**
  - [ ] Subscribe to roster state from draft store
  - [ ] Ensure updates trigger re-render when player drafted
  - [ ] Memoize player lists to prevent excess re-renders

- [ ] **Task 8: Integrate with RosterPanel**
  - [ ] Import RosterDisplay into RosterPanel
  - [ ] Place in Roster Composition section
  - [ ] Pass roster data from store

- [ ] **Task 9: Create Component Tests**
  - [ ] Create `tests/features/draft/RosterDisplay.test.tsx`
  - [ ] Test correct category grouping
  - [ ] Test player entry rendering
  - [ ] Test empty state handling
  - [ ] Test scrollable behavior

---

## Dev Notes

### Implementation Approach

1. Create PlayerEntry subcomponent for individual player rows
2. Build category sections with headers
3. Implement scrollable container for overflow
4. Handle empty states gracefully
5. Connect to Zustand store for real-time updates
6. Integrate into RosterPanel Roster Composition section

### Player Sorting Options

Within each category, players can be sorted by:
1. **Position** (default): C, 1B, 2B, SS, 3B, OF for hitters; SP, RP for pitchers
2. **Auction Price** (descending): Highest paid players first
3. **Draft Order**: Most recently drafted first

Start with position sort; add sort toggle in future iteration if needed.

### Scrollbar Styling

Use custom scrollbar for dark theme consistency:

```css
.roster-scroll::-webkit-scrollbar {
  width: 6px;
}
.roster-scroll::-webkit-scrollbar-track {
  background: #1e293b; /* slate-800 */
}
.roster-scroll::-webkit-scrollbar-thumb {
  background: #475569; /* slate-600 */
  border-radius: 3px;
}
```

---

## Dev Agent Record

### Implementation Summary

**Completed:** 2025-12-20

#### Files Created/Modified

**New Files:**

- `src/features/draft/components/RosterDisplay.tsx` - Main component for displaying roster composition
- `tests/features/draft/RosterDisplay.test.tsx` - Component tests (18 tests)

**Modified Files:**

- `src/features/draft/components/RosterPanel.tsx` - Integrated RosterDisplay component

#### Key Implementation Details

1. **RosterDisplay Component** - Displays roster organized by category (Hitters, Pitchers, Bench)
2. **PlayerEntry Subcomponent** - Individual player row with name, position, and auction price
3. **CategorySection** - Reusable section for each roster category with header and empty state
4. **Position Sorting** - Players sorted by position order (C, 1B, 2B, SS, 3B, OF for hitters; SP, RP for pitchers)
5. **Empty State Handling** - Shows "No {category} drafted yet" when category is empty
6. **Scrollable Container** - Max height with custom scrollbar styling for dark theme
7. **Accessibility** - Proper aria labels and region roles

#### Tasks Completed

- [x] Task 1: Create RosterDisplay Component
- [x] Task 2: Create PlayerEntry Subcomponent
- [x] Task 3: Implement Category Sections
- [x] Task 4: Implement Player List
- [x] Task 5: Implement Empty State
- [x] Task 6: Implement Scrollable Container
- [x] Task 7: Connect to Draft Store (via RosterPanel integration)
- [x] Task 8: Integrate with RosterPanel
- [x] Task 9: Create Component Tests

---

**Status:** In Review
**Epic:** 7 of 13
**Story:** 5 of 8 in Epic 7
