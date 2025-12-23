# Story 9.7: Implement Catch-Up Sync After Connection Restore

**Story ID:** 9.7
**Story Key:** 9-7-implement-catch-up-sync-after-connection-restore
**Epic:** Epic 9 - Couch Managers Integration & Sync
**Status:** Ready for Review

---

## Story

As a **developer**,
I want to automatically fetch all missed picks when connection restores,
So that users don't lose draft data during temporary outages.

---

## Acceptance Criteria

**Given** the connection was lost and has now been restored
**When** the next sync succeeds
**Then** the system fetches all picks since the last successful sync timestamp
**And** all missed picks are processed and added to the drafted players list
**And** inflation is recalculated based on all newly synced picks
**And** the catch-up sync completes within 15 seconds (NFR-I6)
**And** the user sees a notification: "Synced 8 missed picks"
**And** the draft state is fully updated (no data loss per NFR-R4)

---

## Developer Context

### Story Foundation from Epic

From **Epic 9: Couch Managers Integration & Sync** (docs/epics-stories.md lines 1277-1293):

This story implements catch-up sync logic that automatically fetches all missed draft picks when connection is restored after an outage. It ensures no data loss by using the lastSyncTimestamp to fetch only picks that occurred during the disconnection period.

**Core Responsibilities:**

- **Catch-Up Logic:** Automatically handled by existing lastSyncTimestamp parameter
- **Notification:** Display toast showing number of missed picks synced
- **Inflation Recalculation:** Trigger inflation engine update after catch-up
- **Performance:** Ensure catch-up completes within 15 seconds (NFR-I6)
- **Data Integrity:** Verify all missed picks are added (no data loss per NFR-R4)

**Relationship to Epic 9:**

This is Story 7 of 7 in Epic 9. It depends on:
- **Story 9.1** (Required): Edge Function supports lastSyncTimestamp parameter
- **Story 9.3** (Required): Polling sends lastSyncTimestamp (already enables catch-up)
- **Story 9.5** (Required): Inflation store for recalculation

**Key Insight:**

Catch-up sync is mostly already implemented in Story 9.3 via the lastSyncTimestamp parameter. This story adds:
1. Notification when multiple picks are synced
2. Inflation recalculation trigger
3. Performance validation (15 second timeout)

---

## Tasks / Subtasks

- [x] **Task 1: Add Notification for Catch-Up Sync**
  - [x] Modify useDraftSync to detect catch-up (multiple picks returned)
  - [x] Show toast: "Synced X missed picks" when catch-up occurs
  - [x] Only show if picks count > threshold (e.g., 3+ picks)

- [x] **Task 2: Trigger Inflation Recalculation**
  - [x] After addDraftedPlayers, call inflation store recalculate
  - [x] Ensure inflation updates based on new picks

- [x] **Task 3: Add Performance Validation**
  - [x] Add 15 second timeout to catch-up sync
  - [x] Log warning if catch-up exceeds 15 seconds
  - [x] Test with large number of missed picks

- [x] **Task 4: Write Tests**
  - [x] Test catch-up sync with multiple missed picks
  - [x] Test notification display
  - [x] Test inflation recalculation
  - [x] Test no data loss (all picks added)

- [x] **Task 5: Update Sprint Status**

---

## Dev Agent Record

### Implementation Plan

Enhanced the `useDraftSync` hook to implement catch-up sync functionality with:
1. Toast notification when 3+ picks are synced (catch-up scenario)
2. Automatic inflation recalculation via `useInflationStore.updateInflation()`
3. 15-second timeout warning for performance monitoring (NFR-I6)

### Technical Decisions

- **Notification Threshold:** Set to 3+ picks to distinguish catch-up from normal sync
- **Toast Library:** Used sonner (already integrated) for notifications
- **Inflation Recalculation:** Calls `updateInflation()` with drafted players and budget context
- **Timeout Implementation:** Uses setTimeout to log warning if sync exceeds 15 seconds

### Completion Notes

- All 5 tasks completed successfully
- Added 5 new tests for catch-up sync scenarios
- All 2056 tests pass with no regressions
- Implementation follows red-green-refactor cycle

---

## File List

**Files Modified:**
- `src/features/draft/hooks/useDraftSync.ts` - Added catch-up notification, inflation recalculation, timeout warning

**Files Added:**
- (Tests added to existing file) `tests/features/draft/useDraftSync.test.tsx` - Added 5 new tests for Story 9.7

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-21 | Implemented catch-up sync notification, inflation recalculation, and timeout validation | Dev Agent |

---

**Status:** Ready for Review
**Epic:** 9 of 13
**Story:** 7 of 7 in Epic 9
