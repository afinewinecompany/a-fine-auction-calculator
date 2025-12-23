# Story 7.8: Track Overall Draft Progress

**Story ID:** 7.8
**Story Key:** 7-8-track-overall-draft-progress
**Epic:** Epic 7 - Live Draft Experience - Budget & Roster Management
**Status:** complete

---

## Story

As a **user**,
I want to see overall draft progress (players drafted league-wide, players remaining),
So that I understand how far along the draft is.

---

## Acceptance Criteria

**Given** the draft is in progress
**When** the RosterPanel renders draft progress
**Then** I see total players drafted league-wide: "85 of 276 players drafted"
**And** I see a progress bar showing draft completion percentage
**And** I see estimated time remaining (optional): "~45 minutes remaining"
**And** the progress updates in real-time as any team drafts players
**And** the data comes from the draft store (Zustand)

---

## Developer Context

### Story Foundation from Epic

From **Epic 7: Live Draft Experience - Budget & Roster Management** (docs/epics-stories.md lines 1033-1048):

This story adds draft-wide progress tracking to give users context on the overall draft state. Understanding how many players have been drafted league-wide helps users gauge pacing and remaining opportunities.

**Core Responsibilities:**

- **League-Wide Tracking:** Show total players drafted across all teams
- **Progress Bar:** Visual indicator of draft completion
- **Time Estimation:** Optional estimated time remaining
- **Real-Time Updates:** Update as any team drafts players
- **Zustand Integration:** Pull data from draft store

**Relationship to Epic 7:**

This is Story 8 of 8 in Epic 7. It depends on:
- **Story 7.1**: RosterPanel Component Foundation (provides container)

It integrates with Epic 9 (Couch Managers Integration) for real-time draft data from external sources.

### Technical Requirements

#### Draft Progress Component

```typescript
interface DraftProgressProps {
  playersDrafted: number;
  totalPlayers: number;
  averagePickTime?: number; // seconds per pick
  estimatedTimeRemaining?: number; // minutes
}
```

#### Progress Calculation

```typescript
// Total players in draft
const totalPlayers = teamCount * rosterSpotsPerTeam;

// Progress percentage
const progressPercent = (playersDrafted / totalPlayers) * 100;

// Estimated time remaining (if average pick time known)
const playersRemaining = totalPlayers - playersDrafted;
const estimatedMinutes = (playersRemaining * averagePickTimeSeconds) / 60;
```

---

## Tasks / Subtasks

- [x] **Task 1: Create DraftProgress Component**
  - [x] Create `src/features/draft/components/DraftProgress.tsx`
  - [x] Define `DraftProgressProps` interface
  - [x] Add component header comments

- [x] **Task 2: Calculate Total Players**
  - [x] Get team count from league settings
  - [x] Get roster spots per team from league settings
  - [x] Calculate total: teamCount * rosterSpotsPerTeam

- [x] **Task 3: Implement Main Display**
  - [x] Display: "85 of 276 players drafted"
  - [x] Use medium-bold text styling
  - [x] Apply slate-200 color for numbers

- [x] **Task 4: Implement Progress Bar**
  - [x] Import shadcn/ui Progress component
  - [x] Calculate progress percentage
  - [x] Apply emerald-400 fill color
  - [x] Apply slate-700 track color
  - [x] Differentiate from roster progress bar (slightly different styling)

- [x] **Task 5: Implement Time Estimation (Optional)**
  - [x] Calculate average time per pick (if data available)
  - [x] Calculate estimated minutes remaining
  - [x] Display: "~45 minutes remaining"
  - [x] Use italic, slate-400 styling
  - [x] Hide if no timing data available

- [x] **Task 6: Handle Edge Cases**
  - [x] Draft not started: show "0 of X players drafted"
  - [x] Draft complete: show "Draft Complete!" with checkmark
  - [x] No league settings: use default values

- [x] **Task 7: Connect to Draft Store**
  - [x] Subscribe to playersDrafted from draft store
  - [x] Subscribe to league settings (team count, roster spots)
  - [x] Subscribe to timing data (if available)
  - [x] Ensure real-time updates from all teams

- [x] **Task 8: Integrate with RosterPanel**
  - [x] Import DraftProgress into RosterPanel
  - [x] Place at bottom of panel (draft-wide context)
  - [x] Add section header: "Draft Progress"
  - [x] Pass props from store

- [x] **Task 9: Create Component Tests**
  - [x] Create `tests/features/draft/DraftProgress.test.tsx`
  - [x] Test correct total calculation
  - [x] Test progress bar percentage
  - [x] Test time estimation calculation
  - [x] Test edge cases (not started, complete)
  - [x] Test missing timing data handling

---

## Dev Notes

### Implementation Approach

1. Create progress calculation utility functions
2. Build main display with drafted/total counts
3. Add progress bar visualization
4. Implement optional time estimation
5. Handle edge cases gracefully
6. Connect to Zustand store for real-time updates
7. Integrate into RosterPanel as final section

### Time Estimation Algorithm

```typescript
const calculateEstimatedTimeRemaining = (
  playersDrafted: number,
  totalPlayers: number,
  draftStartTime: Date,
  currentTime: Date
): number | null => {
  if (playersDrafted === 0) return null; // Can't estimate without data

  const elapsedMinutes = (currentTime.getTime() - draftStartTime.getTime()) / 60000;
  const averageMinutesPerPick = elapsedMinutes / playersDrafted;
  const playersRemaining = totalPlayers - playersDrafted;

  return Math.ceil(playersRemaining * averageMinutesPerPick);
};
```

### Draft Store Integration

The draft store should expose:

```typescript
interface DraftState {
  playersDraftedTotal: number; // League-wide count
  draftStartTime: Date | null;
  leagueSettings: {
    teamCount: number;
    rosterSpotsPerTeam: number;
  };
}
```

### UX Considerations

- Time estimation is inherently imprecise; display with "~" prefix
- Hide time estimation early in draft when data is unreliable
- Consider showing time estimation only after 10+ picks

---

**Status:** Complete
**Epic:** 7 of 13
**Story:** 8 of 8 in Epic 7

---

## Dev Agent Record

### Implementation Details
- Created DraftProgress component in `src/features/draft/components/DraftProgress.tsx`
- Implemented progress calculation with edge case handling (0%, 100%, overflow)
- Added time estimation formatting supporting minutes and hours
- Integrated with RosterPanel at bottom of both desktop and mobile layouts
- Exported component and props from `src/features/draft/index.ts`
- Created comprehensive test suite with 12 passing tests

### Files Created
- `src/features/draft/components/DraftProgress.tsx`
- `tests/features/draft/DraftProgress.test.tsx`

### Files Modified
- `src/features/draft/index.ts` - Added exports
- `src/features/draft/components/RosterPanel.tsx` - Integrated DraftProgress

### Test Results
All 12 tests passing covering:
- Basic rendering
- Progress calculation (0%, 50%, 100%, overflow)
- Draft complete state with checkmark icon
- Time estimation display
- Accessibility (region role, aria-label)
- Custom className support
