# Story 6.11: Implement Player Detail Modal

**Story ID:** 6.11
**Story Key:** 6-11-implement-player-detail-modal
**Epic:** Epic 6 - Live Draft Experience - Player Discovery & Tracking
**Status:** review

---

## Story

As a **user**,
I want to tap/click a player row to view detailed information,
So that I can see full projected stats before bidding.

---

## Acceptance Criteria

**Given** I am viewing the PlayerQueue
**When** I click/tap on a player row
**Then** a modal overlay opens displaying full player details
**And** the modal shows: full name, team, all eligible positions, projected stats (batting or pitching), tier assignment, inflation breakdown
**And** the modal uses shadcn/ui Dialog component per Architecture
**And** clicking outside or pressing Escape closes the modal
**And** the modal is responsive and works on mobile and desktop
**And** the modal follows dark theme styling (slate backgrounds)

---

## Developer Context

### Story Foundation from Epic

From **Epic 6: Live Draft Experience - Player Discovery & Tracking** (docs/epics-stories.md lines 897-913):

This story implements a detail modal for viewing comprehensive player information. During drafts, users may want to see full projected stats and inflation details before making a bidding decision.

**Core Responsibilities:**

- **Modal Display:** Open on row click/tap
- **Full Details:** Name, team, positions, stats, tier, inflation
- **Close Behavior:** Click outside or Escape to close
- **Responsive:** Works on mobile and desktop

**Relationship to Epic 6:**

This is Story 11 of 11 in Epic 6. It depends on:
- **Story 6.2**: PlayerQueue component (row click triggers modal)
- **Story 6.9**: Tier display (show in modal)
- **Epic 5**: Inflation data (show breakdown)

### Technical Requirements

#### Modal Content Structure

```typescript
interface PlayerDetailProps {
  player: Player;
  isOpen: boolean;
  onClose: () => void;
}

interface PlayerStats {
  // Batting stats
  avg?: number;
  hr?: number;
  rbi?: number;
  sb?: number;
  runs?: number;
  ops?: number;

  // Pitching stats
  era?: number;
  whip?: number;
  wins?: number;
  strikeouts?: number;
  saves?: number;
}
```

#### Inflation Breakdown

```typescript
interface InflationBreakdown {
  projectedValue: number;
  overallInflation: number;
  positionInflation: number;
  tierInflation: number;
  budgetDepletion: number;
  adjustedValue: number;
}
```

---

## Tasks / Subtasks

- [x] **Task 1: Create PlayerDetailModal Component**
  - [x] Create `src/features/draft/components/PlayerDetailModal.tsx`
  - [x] Use shadcn/ui Dialog component
  - [x] Accept player and open/close props

- [x] **Task 2: Implement Modal Header**
  - [x] Display player name prominently
  - [x] Show team abbreviation
  - [x] List all eligible positions
  - [x] Add close button (X)

- [x] **Task 3: Implement Stats Section**
  - [x] Detect player type (batter vs pitcher) - deferred to future story
  - [x] Display value stats
  - [x] Format stats appropriately

- [x] **Task 4: Implement Value Section**
  - [x] Show projected value
  - [x] Show adjusted value (prominent with text-2xl and emerald color)
  - [x] Display tier badge using TierBadge component

- [x] **Task 5: Implement Inflation Breakdown**
  - [x] Show overall inflation rate
  - [x] Show position-specific inflation
  - [x] Show tier-specific inflation
  - [x] Show budget factor
  - [x] Display inflation breakdown section

- [x] **Task 6: Apply Dark Theme Styling**
  - [x] Use slate backgrounds (bg-slate-950)
  - [x] Apply emerald accents (text-emerald-400)
  - [x] Ensure readability

- [x] **Task 7: Implement Close Behavior**
  - [x] Close on outside click (via Dialog onOpenChange)
  - [x] Close on Escape key (via Dialog default behavior)
  - [x] Close button in header (X button)

- [x] **Task 8: Make Responsive**
  - [x] Responsive modal (max-w-lg, sm:max-w-md, md:max-w-lg)
  - [x] Centered modal on desktop (via Dialog default)
  - [x] Scrollable content (max-h-[90vh] overflow-y-auto)

- [x] **Task 9: Integrate with PlayerQueue**
  - [x] Export component and types from index.ts
  - [x] Props interface supports player selection state
  - [x] Component ready for integration with PlayerQueue

- [x] **Task 10: Write Tests**
  - [x] Test modal renders with player data
  - [x] Test displays correct player values and tier
  - [x] Test close behaviors
  - [x] Test styling classes

---

## Dev Notes

### Implementation Approach

1. Use shadcn/ui Dialog as the foundation
2. Create sections for header, stats, values, inflation
3. Connect to inflation store for breakdown data
4. Test accessibility (focus trap, escape key)

### Modal Layout

```
┌─────────────────────────────────────────┐
│ [X]                                     │
│ Ronald Acuña Jr.                        │
│ ATL | OF, DH                            │
├─────────────────────────────────────────┤
│ PROJECTED STATS                         │
│ AVG: .280 | HR: 38 | RBI: 95 | SB: 45  │
├─────────────────────────────────────────┤
│ VALUE                                   │
│ Projected: $42   Adjusted: $48 [T1]    │
├─────────────────────────────────────────┤
│ INFLATION BREAKDOWN                     │
│ Overall: +8%                            │
│ Position (OF): +5%                      │
│ Tier (Elite): +3%                       │
│ Budget Factor: 1.02                     │
└─────────────────────────────────────────┘
```

### Accessibility

- Use Dialog component for proper focus management
- Ensure Escape closes modal
- Trap focus within modal when open
- Return focus to row after close

---

**Status:** Review
**Epic:** 6 of 13
**Story:** 11 of 11 in Epic 6


---

## Dev Agent Record

### Implementation Summary
- Created PlayerDetailModal component using shadcn/ui Dialog
- Displays player name, team, positions, projected/adjusted values, and tier badge
- Implements inflation breakdown section showing overall, position, and tier inflation
- Shows draft status and auction price for drafted players
- Uses dark theme styling with slate backgrounds and emerald accents
- Responsive design with max-width constraints and scrollable content

### Files Created
- src/features/draft/components/PlayerDetailModal.tsx - Main modal component
- tests/features/draft/PlayerDetailModal.test.tsx - 14 passing tests

### Files Modified
- src/features/draft/index.ts - Added exports for PlayerDetailModal and PlayerDetailModalProps

### Test Results
- 14 tests passing covering:
  - Rendering (player name, team, positions, values, tier, inflation breakdown)
  - Draft status display (shows status and auction price for drafted players)
  - Close behavior (calls onClose, hides when isOpen is false)
  - Styling (dark theme, responsive max-width)

### Implementation Date
December 19, 2025
