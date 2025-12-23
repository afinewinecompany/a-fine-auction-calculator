# Story 9.5: Display Last Successful Sync Timestamp

**Story ID:** 9.5
**Story Key:** 9-5-display-last-successful-sync-timestamp
**Epic:** Epic 9 - Couch Managers Integration & Sync
**Status:** Ready for Review

---

## Story

As a **user**,
I want to see when the last successful sync occurred,
So that I know how current my draft data is.

---

## Acceptance Criteria

**Given** draft data has been synced from Couch Managers
**When** I view the draft dashboard
**Then** I see a timestamp: "Last synced: 2 minutes ago"
**And** the timestamp is formatted using date-fns with relative time (2 minutes ago, 18 minutes ago)
**And** hovering shows the absolute timestamp: "Dec 12, 2025 3:42 PM"
**And** the timestamp updates every minute
**And** if sync lag exceeds 30 minutes, a warning is displayed (NFR-I5)

---

## Developer Context

### Story Foundation from Epic

From **Epic 9: Couch Managers Integration & Sync** (docs/epics-stories.md lines 1245-1260):

This story implements a timestamp display that shows when draft data was last successfully synced from Couch Managers. It uses relative time formatting ("2 minutes ago") with an absolute timestamp on hover, and warns users if data becomes stale.

**Core Responsibilities:**

- **Timestamp Component:** Display last sync time in relative format
- **Auto-Update:** Refresh timestamp display every minute
- **Tooltip:** Show absolute timestamp on hover
- **Stale Data Warning:** Display warning if sync lag exceeds 30 minutes (NFR-I5)
- **Integration:** Add timestamp to draft dashboard

**Relationship to Epic 9:**

This is Story 5 of 7 in Epic 9. It depends on:
- **Story 9.3** (Required): Automatic API polling (provides lastSync timestamp)

It works alongside:
- **Story 9.4**: Connection status badge (complementary sync information)

---

## Tasks / Subtasks

- [x] **Task 1: Create LastSyncTimestamp Component**
  - [x] Accept lastSync: Date | null prop
  - [x] Format with formatDistanceToNow from date-fns
  - [x] Add tooltip with absolute timestamp (format with date-fns)
  - [x] Detect if sync lag > 30 minutes, show warning badge

- [x] **Task 2: Implement Auto-Update**
  - [x] Use setInterval to update every minute
  - [x] Force re-render by updating state
  - [x] Clean up interval on unmount

- [x] **Task 3: Integrate with Draft Dashboard**
  - [x] Add timestamp component to draft page
  - [x] Pass lastSync from useDraftSync hook

- [x] **Task 4: Write Tests**
  - [x] Test timestamp formatting
  - [x] Test tooltip with absolute time
  - [x] Test warning for stale data (> 30 minutes)
  - [x] Test auto-update mechanism

- [x] **Task 5: Update Sprint Status**

---

## Dev Agent Record

### Implementation Plan

Implemented LastSyncTimestamp component with the following features:
1. Displays relative time using date-fns `formatDistanceToNow` (e.g., "2 minutes ago")
2. Shows absolute timestamp in tooltip on hover using date-fns `format` (e.g., "Dec 12, 2025 3:42 PM")
3. Auto-updates every minute using setInterval with proper cleanup on unmount
4. Displays "Stale" warning badge when sync lag exceeds 30 minutes (NFR-I5)
5. Integrated into DraftPage header alongside ConnectionStatusBadge

### Debug Log

- All 13 unit tests pass
- Build successful
- Linting passes for new files

### Completion Notes

✅ Created LastSyncTimestamp component with all acceptance criteria:
- Relative time formatting with date-fns
- Tooltip with absolute timestamp
- Auto-update every minute
- Stale data warning (>30 minutes)
- Proper accessibility with role="status" and aria-label
- Clock icon for visual indication
- Amber color scheme for stale warning

---

## File List

**Files Created:**
- `src/features/draft/components/LastSyncTimestamp.tsx`
- `tests/features/draft/LastSyncTimestamp.test.tsx`

**Files Modified:**
- `src/features/draft/pages/DraftPage.tsx`

---

## Change Log

| Date | Change |
|------|--------|
| 2025-12-20 | Story implementation completed - all tasks done |

---

**Status:** Ready for Review
**Epic:** 9 of 13
**Story:** 5 of 7 in Epic 9
