# Story 7.6: Display Filled vs. Remaining Roster Slots

**Story ID:** 7.6
**Story Key:** 7-6-display-filled-vs-remaining-roster-slots
**Epic:** Epic 7 - Live Draft Experience - Budget & Roster Management
**Status:** ready-for-dev

---

## Story

As a **user**,
I want to see how many roster spots I've filled vs. how many remain,
So that I know how many more players I need to draft.

---

## Acceptance Criteria

**Given** league settings define total roster spots
**When** the RosterPanel renders
**Then** I see roster slot counts: "14 of 23 roster spots filled"
**And** I see a progress bar visualizing roster completion (60% filled)
**And** the counts update in real-time as players are drafted
**And** the display breaks down by position group: "Hitters: 9/14", "Pitchers: 5/9", "Bench: 0/0"

---

## Developer Context

### Story Foundation from Epic

From **Epic 7: Live Draft Experience - Budget & Roster Management** (docs/epics-stories.md lines 1002-1016):

This story adds roster slot tracking to help users understand their roster completion progress. The visual progress bar provides quick visual feedback on how close they are to completing their roster.

**Core Responsibilities:**

- **Slot Counting:** Track filled vs. total slots
- **Progress Bar:** Visual indicator of roster completion
- **Category Breakdown:** Show filled/total per category (Hitters, Pitchers, Bench)
- **Real-Time Updates:** Update after each draft pick
- **League Settings Integration:** Use league roster configuration

**Relationship to Epic 7:**

This is Story 6 of 8 in Epic 7. It depends on:
- **Story 7.1**: RosterPanel Component Foundation (provides container)
- **Story 7.5**: Display Roster Composition by Position (roster data)

It relates to:
- **Story 7.7**: Display Position Needs Summary (similar slot tracking)

### Technical Requirements

#### Slot Tracker Component

```typescript
interface SlotTrackerProps {
  roster: {
    hitters: DraftedPlayer[];
    pitchers: DraftedPlayer[];
    bench: DraftedPlayer[];
  };
  leagueSettings: {
    rosterSpotsHitters: number;
    rosterSpotsPitchers: number;
    rosterSpotsBench: number;
  };
}

// Calculated values
interface SlotCounts {
  hitters: { filled: number; total: number };
  pitchers: { filled: number; total: number };
  bench: { filled: number; total: number };
  overall: { filled: number; total: number };
}
```

#### Progress Bar Component

Use shadcn/ui Progress component with emerald color:

```typescript
<Progress
  value={(filled / total) * 100}
  className="bg-slate-700 [&>div]:bg-emerald-400"
/>
```

---

## Tasks / Subtasks

- [ ] **Task 1: Create SlotTracker Component**
  - [ ] Create `src/features/draft/components/SlotTracker.tsx`
  - [ ] Define `SlotTrackerProps` interface
  - [ ] Define `SlotCounts` interface
  - [ ] Add component header comments

- [ ] **Task 2: Calculate Slot Counts**
  - [ ] Count filled hitter slots
  - [ ] Count filled pitcher slots
  - [ ] Count filled bench slots
  - [ ] Calculate overall totals

- [ ] **Task 3: Implement Overall Display**
  - [ ] Display main count: "14 of 23 roster spots filled"
  - [ ] Use large, bold text for numbers
  - [ ] Apply emerald-400 color for filled count

- [ ] **Task 4: Implement Progress Bar**
  - [ ] Import shadcn/ui Progress component
  - [ ] Calculate completion percentage
  - [ ] Apply emerald-400 fill color
  - [ ] Apply slate-700 track color
  - [ ] Test 0%, 50%, 100% states

- [ ] **Task 5: Implement Category Breakdown**
  - [ ] Display "Hitters: 9/14"
  - [ ] Display "Pitchers: 5/9"
  - [ ] Display "Bench: 0/0"
  - [ ] Use smaller text (text-sm)
  - [ ] Align in horizontal row or compact grid

- [ ] **Task 6: Implement Visual Indicators**
  - [ ] Show checkmark when category is complete
  - [ ] Use green color for complete categories
  - [ ] Optional: animate progress bar updates

- [ ] **Task 7: Connect to Draft Store**
  - [ ] Subscribe to roster state from draft store
  - [ ] Subscribe to league settings from store
  - [ ] Ensure updates trigger re-render
  - [ ] Memoize slot calculations

- [ ] **Task 8: Integrate with RosterPanel**
  - [ ] Import SlotTracker into RosterPanel
  - [ ] Place in Roster Composition section (above RosterDisplay)
  - [ ] Pass roster and leagueSettings props

- [ ] **Task 9: Create Component Tests**
  - [ ] Create `tests/features/draft/SlotTracker.test.tsx`
  - [ ] Test correct slot counting
  - [ ] Test progress bar percentage calculation
  - [ ] Test category breakdown accuracy
  - [ ] Test complete category indicator

---

## Dev Notes

### Implementation Approach

1. Create slot counting utility functions
2. Build overall display with progress bar
3. Add category breakdown display
4. Implement completion indicators
5. Connect to Zustand store for real-time updates
6. Integrate into RosterPanel Roster Composition section

### Default League Settings

If no league settings provided, use standard roster configuration:

```typescript
const DEFAULT_ROSTER_SETTINGS = {
  rosterSpotsHitters: 14,  // C, 1B, 2B, SS, 3B, 5xOF, etc.
  rosterSpotsPitchers: 9,  // Multiple SP and RP slots
  rosterSpotsBench: 0,     // No bench by default (configurable)
};
```

### Progress Animation

Consider using CSS transitions for smooth progress bar updates:

```css
.progress-bar {
  transition: width 300ms ease-out;
}
```

---

## Dev Agent Record

### Implementation Summary

**Completed:** 2025-12-20

#### Files Created/Modified

**New Files:**

- `src/features/draft/components/SlotTracker.tsx` - Component for tracking roster slot completion
- `tests/features/draft/SlotTracker.test.tsx` - Component tests (19 tests)

**Modified Files:**

- `src/features/draft/components/RosterPanel.tsx` - Integrated SlotTracker component

#### Key Implementation Details

1. **SlotTracker Component** - Displays filled vs total roster slots
2. **Overall Count Display** - Shows "X of Y roster spots filled" with large bold numbers
3. **Progress Bar** - Visual indicator using shadcn/ui Progress with emerald-400 fill
4. **Percentage Display** - Shows completion percentage below progress bar
5. **Category Breakdown** - Hitters, Pitchers, Bench counts in horizontal layout
6. **Completion Indicators** - Checkmark icon when category is complete
7. **Edge Case Handling** - Handles zero slots and overfilled rosters gracefully

#### Tasks Completed

- [x] Task 1: Create SlotTracker Component
- [x] Task 2: Calculate Slot Counts
- [x] Task 3: Implement Overall Display
- [x] Task 4: Implement Progress Bar
- [x] Task 5: Implement Category Breakdown
- [x] Task 6: Implement Visual Indicators
- [x] Task 7: Connect to Draft Store (via RosterPanel integration)
- [x] Task 8: Integrate with RosterPanel
- [x] Task 9: Create Component Tests

---

**Status:** In Review
**Epic:** 7 of 13
**Story:** 6 of 8 in Epic 7
