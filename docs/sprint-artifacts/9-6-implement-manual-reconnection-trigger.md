# Story 9.6: Implement Manual Reconnection Trigger

**Story ID:** 9.6
**Story Key:** 9-6-implement-manual-reconnection-trigger
**Epic:** Epic 9 - Couch Managers Integration & Sync
**Status:** Ready for Review

---

## Story

As a **user**,
I want to manually trigger a reconnection attempt when sync fails,
So that I can try to restore the connection without waiting for the next automatic poll.

---

## Acceptance Criteria

**Given** the connection status shows "Disconnected" or "Reconnecting"
**When** I click the "Retry Connection" button
**Then** an immediate sync attempt is triggered (bypasses polling interval)
**And** a loading indicator displays: "Reconnecting..."
**And** if successful, status updates to "Connected" and last sync timestamp updates
**And** if failed, an error message displays with retry guidance
**And** the button is only enabled when status is not "Connected"

---

## Developer Context

### Story Foundation from Epic

From **Epic 9: Couch Managers Integration & Sync** (docs/epics-stories.md lines 1261-1276):

This story implements a manual reconnection button that allows users to immediately retry sync when automatic polling fails. The button bypasses the normal polling interval and provides instant feedback on connection restoration.

**Core Responsibilities:**

- **Retry Button Component:** Create button that triggers immediate sync
- **Loading State:** Show spinner during reconnection attempt
- **Success Feedback:** Update status and timestamp on success
- **Error Feedback:** Display error message with retry guidance
- **Conditional Rendering:** Only show button when status is Disconnected or Reconnecting
- **Integration:** Add button near connection status badge

**Relationship to Epic 9:**

This is Story 6 of 7 in Epic 9. It depends on:
- **Story 9.3** (Required): Automatic API polling (uses same sync logic)
- **Story 9.4** (Required): Connection status indicators (determines when button shows)

---

## Tasks / Subtasks

- [x] **Task 1: Update useDraftSync Hook**
  - [x] Add manualSync function that calls syncDraft immediately
  - [x] Return manualSync from hook
  - [x] Add isSyncing state for loading indicator

- [x] **Task 2: Create RetryConnectionButton Component**
  - [x] Accept status and manualSync props
  - [x] Show button only if status is 'disconnected' or 'reconnecting'
  - [x] Show loading spinner when syncing
  - [x] Call manualSync on click
  - [x] Display toast on success/error

- [x] **Task 3: Integrate with Draft Page**
  - [x] Add button near connection status badge
  - [x] Connect to useDraftSync hook

- [x] **Task 4: Write Tests**
  - [x] Test button only shows when disconnected/reconnecting
  - [x] Test button triggers manual sync
  - [x] Test loading state
  - [x] Test success/error feedback

- [x] **Task 5: Update Sprint Status**

---

## Dev Agent Record

### Implementation Plan
- Leveraged existing `triggerSync` function and `isSyncing` state from useDraftSync hook (Task 1 already complete from Story 9.3)
- Created RetryConnectionButton component with conditional rendering based on connection state
- Integrated with DraftPage, placing button near ConnectionStatusBadge
- Added toast notifications via useToast hook for success/error feedback

### Debug Log
- All tests pass (18 component tests + 2051 total suite)
- Linter passes for new RetryConnectionButton component
- Pre-existing prettier warnings in DraftPage not related to this story

### Completion Notes
- **Task 1:** useDraftSync hook already had `triggerSync` and `syncStatus.isSyncing` from Story 9.3
- **Task 2:** Created RetryConnectionButton with yellow styling for disconnected/reconnecting states
- **Task 3:** Integrated button in DraftPage header alongside ConnectionStatusBadge
- **Task 4:** 18 comprehensive tests covering visibility, click behavior, loading state, accessibility
- **Task 5:** Sprint status updated to review

### Key Decisions
- Button uses yellow/warning color scheme to differentiate from normal sync button
- Toast shows lastError if available, otherwise shows exception message
- Regular "Sync" button only shows when connected, RetryConnectionButton shows when disconnected/reconnecting

---

## File List

**Files Created:**
- `src/features/draft/components/RetryConnectionButton.tsx`
- `tests/features/draft/RetryConnectionButton.test.tsx`

**Files Modified:**
- `src/features/draft/pages/DraftPage.tsx` - Added RetryConnectionButton import and integration

---

## Change Log

- 2025-12-21: Story implemented - Created RetryConnectionButton component with conditional visibility, loading state, and toast feedback. Integrated with DraftPage. Added 18 comprehensive tests. All tests pass (2051 total).

---

**Status:** Ready for Review
**Epic:** 9 of 13
**Story:** 6 of 7 in Epic 9
