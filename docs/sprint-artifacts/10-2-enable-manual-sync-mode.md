# Story 10.2: Enable Manual Sync Mode

**Story ID:** 10.2
**Story Key:** 10-2-enable-manual-sync-mode
**Epic:** Epic 10 - Resilience & Manual Sync Fallback
**Status:** dev-complete

---

## Story

As a **user**,
I want to enable Manual Sync Mode when API sync fails,
So that I can manually enter auction prices to maintain inflation calculation accuracy.

---

## Acceptance Criteria

**Given** automatic sync has failed multiple times
**When** the system triggers Manual Sync Mode
**Then** a prominent notification displays: "API connection failed. Switched to Manual Sync Mode."
**And** the connection status badge shows "Manual Mode" (yellow)
**And** the PlayerQueue interface updates to show bid input fields for each player
**And** a "My Team" checkbox appears on each player row
**And** the transition to Manual Mode completes within 5 seconds (NFR-R7)
**And** a help link explains how to use Manual Sync Mode (FR51)

---

## Developer Context

### Story Foundation from Epic

From **Epic 10: Resilience & Manual Sync Fallback** (docs/epics-stories.md lines 1318-1333):

This story implements the UI transition that occurs when automatic sync fails, enabling users to manually enter draft data. The transition must be seamless and provide clear guidance on how to use Manual Sync Mode, ensuring users don't lose competitive advantage during API outages.

**Core Responsibilities:**

- **Mode Activation:** Automatically enable Manual Mode after failure threshold
- **UI Transformation:** Show bid input fields and "My Team" checkboxes in PlayerQueue
- **User Notification:** Display prominent toast explaining the mode switch
- **Status Indicator:** Update connection badge from "Connected" to "Manual Mode"
- **Help Documentation:** Provide inline help link explaining manual entry process
- **Performance:** Mode transition must complete within 5 seconds (NFR-R7)

**Relationship to Epic 10:**

This is Story 2 of 8 in Epic 10. It depends on:
- **Story 10.1** (Required): Failure detection triggers Manual Mode activation
- Enables: **Story 10.3** (Manual bid entry), **Story 10.4** (My Team checkbox)

**Integration Points:**

- Uses `isManualMode` state from Story 10.1
- Extends PlayerQueue component from Epic 6 (Story 6.2)
- Uses ConnectionStatusBadge from Epic 9 (Story 9.4)
- Integrates with draft store for mode state management

**Key Technical Considerations:**

1. **UI Conditional Rendering:**
   - When `isManualMode === true`, render bid input fields
   - Show "My Team" checkbox on each player row
   - Add manual entry column to PlayerQueue table

2. **Notification Strategy:**
   - Use toast notification (sonner library)
   - Include help link in toast message
   - Persist notification until user dismisses

3. **Help Documentation:**
   - Link to inline help text or modal
   - Explain: "Enter auction prices as players are nominated. Check 'My Team' for your picks."

---

## Tasks / Subtasks

- [x] **Task 1: Add Manual Mode UI State**
  - [x] Modify PlayerQueue to accept `isManualMode` prop
  - [x] Add conditional rendering for manual entry UI
  - [x] Show/hide columns based on mode

- [x] **Task 2: Add Bid Input Column to PlayerQueue**
  - [x] Add "Bid" column with input field (hidden when auto sync active)
  - [x] Add "My Team" checkbox column (hidden when auto sync active)
  - [x] Use native input validation (simpler than React Hook Form for inline fields)
  - [x] Style inputs to match dark theme

- [x] **Task 3: Implement Mode Transition Notification**
  - [x] Trigger toast when `isManualMode` changes to true
  - [x] Message: "API connection failed. Switched to Manual Sync Mode."
  - [x] Include help link: "How to use Manual Mode"
  - [x] Use yellow/warning styling for toast (persistent until dismissed)

- [x] **Task 4: Update Connection Status Badge**
  - [x] Modify ConnectionStatusBadge component
  - [x] Add "Manual Mode" status (yellow badge with Edit3 icon)
  - [x] Show when `isManualMode === true`
  - [x] Add tooltip: "Automatic sync failed. Enter bids manually."

- [x] **Task 5: Create Help Documentation Modal**
  - [x] Create ManualModeHelp component
  - [x] Explain manual entry workflow (3-step numbered guide)
  - [x] Include tips section for best practices
  - [x] Open from help link in toast via custom event

- [x] **Task 6: Write Tests**
  - [x] Test Manual Mode activation on failure threshold
  - [x] Test UI transformation (bid inputs appear)
  - [x] Test notification display
  - [x] Test status badge update
  - [x] Test mode transition performance (<5 seconds)

---

## File List

**Files to Create:**
- `src/features/draft/components/ManualModeHelp.tsx` - Help modal component
- `src/features/draft/components/BidInput.tsx` - Bid input field component
- `src/features/draft/components/MyTeamCheckbox.tsx` - Team checkbox component

**Files to Modify:**
- `src/features/draft/components/PlayerQueue.tsx` - Add manual mode columns
- `src/features/draft/components/ConnectionStatusBadge.tsx` - Add "Manual Mode" status
- `src/features/draft/hooks/useDraft.ts` - Add mode transition logic

**Files to Test:**
- `tests/features/draft/PlayerQueue.manualMode.test.tsx` - Manual mode UI tests
- `tests/features/draft/ConnectionStatusBadge.manualMode.test.tsx` - Badge tests
- `tests/features/draft/ManualModeHelp.test.tsx` - Help modal tests

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-21 | Story created | Story Creator Agent |
| 2025-12-21 | Implementation complete | Claude |

---

## Implementation Notes

### Files Created
- `src/features/draft/components/BidInput.tsx` - Number input component for manual bid entry with validation
- `src/features/draft/components/MyTeamCheckbox.tsx` - Checkbox component for marking players as "My Team"
- `src/features/draft/components/ManualModeHelp.tsx` - Help modal with 3-step instructions for using Manual Mode

### Files Modified
- `src/features/draft/components/PlayerQueue.tsx` - Added `isManualMode`, `onBidSubmit`, `onMyTeamToggle` props with conditional column rendering
- `src/features/draft/components/ConnectionStatusBadge.tsx` - Added "Manual Mode" status (yellow) with Edit3 icon and tooltip
- `src/features/draft/types/player.types.ts` - Extended PlayerQueueProps with manual mode callbacks
- `src/features/draft/types/sync.types.ts` - Added 'manual' to ConnectionState, updated getConnectionState()
- `src/features/draft/hooks/useDraftSync.ts` - Enhanced notification with help link action and persistent warning toast

### Test Files Created
- `tests/features/draft/PlayerQueue.manualMode.test.tsx` - 13 tests for manual mode UI
- `tests/features/draft/ConnectionStatusBadge.manualMode.test.tsx` - 10 tests for badge states
- `tests/features/draft/ManualModeHelp.test.tsx` - 15 tests for help modal
- `tests/features/draft/getConnectionState.test.ts` - 14 tests for state derivation

### Key Decisions
1. Used native HTML input instead of React Hook Form for simpler inline validation
2. Toast notification persists (`duration: Infinity`) until user dismisses
3. Help modal opens via custom event dispatched from toast action
4. Manual mode takes precedence in getConnectionState() over other states

### Test Results
- 52 tests passing across 4 test files

---

**Status:** dev-complete
**Epic:** 10 of 13
**Story:** 2 of 8 in Epic 10
