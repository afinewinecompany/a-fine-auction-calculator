# Story 9.4: Display Connection Status Indicators

**Story ID:** 9.4
**Story Key:** 9-4-display-connection-status-indicators
**Epic:** Epic 9 - Couch Managers Integration & Sync
**Status:** ready-for-dev

---

## Story

As a **user**,
I want to view connection status indicators (connected, reconnecting, disconnected),
So that I know if the system is successfully syncing data.

---

## Acceptance Criteria

**Given** I am in a draft with Couch Managers sync enabled
**When** the draft page renders
**Then** I see a status badge in the header: "Connected" (green), "Reconnecting" (yellow), or "Disconnected" (red)
**And** "Connected" indicates successful API sync within the last polling interval
**And** "Reconnecting" indicates a failed sync attempt with automatic retry in progress
**And** "Disconnected" indicates multiple failed attempts (triggers Manual Sync Mode)
**And** hovering over the badge shows more details: "Last sync: 2 minutes ago"
**And** the status updates in real-time based on sync results

---

## Developer Context

### Story Foundation from Epic

From **Epic 9: Couch Managers Integration & Sync** (docs/epics-stories.md lines 1228-1244):

This story implements visual connection status indicators that inform users whether draft data is successfully syncing from Couch Managers. The status badge uses color-coded states (green, yellow, red) to communicate sync health at a glance.

**Core Responsibilities:**

- **Status Badge Component:** Create ConnectionStatusBadge with three states (Connected, Reconnecting, Disconnected)
- **State Logic:** Determine status based on sync results and failure count
- **Visual Design:** Color-coded badges (green, yellow, red) with icons
- **Tooltip Details:** Show last sync time on hover
- **Real-Time Updates:** Update badge when sync succeeds or fails
- **Integration:** Add badge to draft page header

**Relationship to Epic 9:**

This is Story 4 of 7 in Epic 9. It depends on:
- **Story 9.3** (Required): Automatic API polling (provides sync results)

It works alongside:
- **Story 9.5**: Display last sync timestamp (shows in tooltip)
- **Story 9.6**: Manual reconnection trigger (button shown when Disconnected/Reconnecting)

### Technical Requirements

#### Connection Status Badge Component

**Create `src/features/draft/components/ConnectionStatusBadge.tsx`**

Component accepts status and lastSync props, renders color-coded badge with tooltip showing last sync time.

---

## Tasks / Subtasks

- [x] **Task 1: Update useDraftSync Hook** (AC: status updates in real-time)
  - [x] Add state: syncStatus and consecutiveFailures
  - [x] Track failures: increment on error, reset on success
  - [x] Return status from hook

- [x] **Task 2: Create ConnectionStatusBadge Component** (AC: status badge)
  - [x] Create component with three status states
  - [x] Green (connected), yellow (reconnecting), red (disconnected)
  - [x] Add icons and tooltip with last sync time

- [x] **Task 3: Integrate with Draft Page**
  - [x] Add badge to draft page header
  - [x] Connect to useDraftSync hook

- [x] **Task 4: Write Tests**
  - [x] Test all three status states
  - [x] Test tooltip content

- [x] **Task 5: Update Sprint Status**

---

## Dev Agent Record

### Implementation Plan

- Added `ConnectionState` type and `getConnectionState()` helper to sync.types.ts
- Enhanced useDraftSync hook to expose `connectionState` derived from `syncStatus.failureCount`
- Rewrote ConnectionStatusBadge component with three states (connected/reconnecting/disconnected)
- Used color-coded badges: green (emerald), yellow, red with appropriate Lucide icons
- Added Radix UI Tooltip showing last sync time on hover
- Integrated badge into DraftPage header replacing the old simple status display
- Updated LeagueDetail component to use new badge props

### Debug Log

- Fixed test failures with SVG className access using `getAttribute('class')` instead of `.className`
- Fixed tooltip tests using `findAllByText` for elements duplicated by accessibility features

### Completion Notes

- All 28 ConnectionStatusBadge tests pass
- Full test suite (2020 tests) passes with no regressions
- DISCONNECTED_FAILURE_THRESHOLD set to 3 consecutive failures
- Real-time status updates work via syncStatus state changes in useDraftSync hook

---

## File List

**Files Created:**

- `tests/features/draft/ConnectionStatusBadge.test.tsx`

**Files Modified:**

- `src/features/draft/components/ConnectionStatusBadge.tsx` (enhanced with three states)
- `src/features/draft/types/sync.types.ts` (added ConnectionState type and getConnectionState helper)
- `src/features/draft/hooks/useDraftSync.ts` (added connectionState to return value)
- `src/features/draft/pages/DraftPage.tsx` (integrated ConnectionStatusBadge)
- `src/features/leagues/components/LeagueDetail.tsx` (updated to new badge props)

---

## Change Log

- 2025-12-20: Implemented connection status indicators with three states (Story 9.4)

---

**Status:** Ready for Review
**Epic:** 9 of 13
**Story:** 4 of 7 in Epic 9
