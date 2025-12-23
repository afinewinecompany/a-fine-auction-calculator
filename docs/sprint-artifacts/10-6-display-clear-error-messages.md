# Story 10.6: Display Clear Error Messages

**Story ID:** 10.6
**Story Key:** 10-6-display-clear-error-messages
**Epic:** Epic 10 - Resilience & Manual Sync Fallback
**Status:** Ready for Review

---

## Story

As a **user**,
I want to view clear error messages explaining connection status and recovery options,
So that I understand what happened and how to proceed.

---

## Acceptance Criteria

**Given** an API connection failure has occurred
**When** the error is displayed to the user
**Then** the message clearly explains the issue: "Unable to connect to Couch Managers API. Please check your internet connection."
**And** the message provides recovery options: "1. Retry connection 2. Switch to Manual Sync Mode"
**And** the message uses plain language (avoid technical jargon)
**And** the message is dismissible but reappears if the issue persists
**And** different error types have tailored messages (network timeout vs. invalid room ID vs. rate limiting)

---

## Developer Context

### Story Foundation from Epic

From **Epic 10: Resilience & Manual Sync Fallback** (docs/epics-stories.md lines 1384-1398):

This story implements user-friendly error messaging that helps users understand connection failures and guides them toward recovery actions. Clear communication is critical for maintaining user confidence during technical issues and ensuring they know how to continue their draft.

**Core Responsibilities:**

- **Error Message Clarity:** Use plain language to explain failures
- **Tailored Messages:** Different messages for different error types
- **Recovery Guidance:** Provide actionable next steps
- **User Control:** Allow dismissal but persist if issue continues
- **UX Quality:** Follow UX requirements for error communication
- **Accessibility:** Ensure messages are accessible (screen readers, keyboard navigation)

**Relationship to Epic 10:**

This is Story 6 of 8 in Epic 10. It depends on:
- **Story 10.1** (Required): Error classification provides error types
- **Story 10.2** (Related): Manual Mode notification is one error message type
- Works with: All Epic 10 stories (provides user feedback for all failures)

**Integration Points:**

- Uses error classification from Story 10.1
- Displays notifications using toast library (sonner)
- May use Alert component from shadcn/ui for persistent errors
- Integrates with ConnectionStatusBadge for status display

**Key Technical Considerations:**

1. **Error Type Mapping:**
   - Network timeout: "Connection timed out. Please check your internet connection."
   - Invalid room ID: "Invalid draft room ID. Please check your league settings."
   - Rate limiting: "Too many requests. Retrying in X seconds..."
   - Server error (5xx): "Couch Managers API is temporarily unavailable. Retrying..."
   - Authentication error: "Authentication failed. Please reconnect your league."

2. **Message Components:**
   - **Headline:** Brief error description
   - **Explanation:** What happened in user terms
   - **Recovery Options:** Numbered list of actions
   - **Dismiss Option:** Allow user to close

3. **Notification Strategy:**
   - Transient errors: Toast notification (auto-dismiss after retry)
   - Persistent errors: Alert banner (dismissible but reappears)
   - Manual Mode trigger: Prominent toast with help link

---

## Tasks / Subtasks

- [x] **Task 1: Create Error Message Mapping**
  - [x] Create `src/features/draft/utils/errorMessages.ts`
  - [x] Map error types to user-friendly messages
  - [x] Include recovery options for each error type
  - [x] Follow plain language guidelines (avoid jargon)

- [x] **Task 2: Implement Error Notification Component**
  - [x] Create `ErrorNotification` component
  - [x] Accept props: `errorType`, `errorDetails`, `onRetry`, `onDismiss`
  - [x] Render appropriate message based on error type
  - [x] Display recovery options (buttons or list)
  - [x] Style with appropriate severity (warning, error, critical)

- [x] **Task 3: Integrate with Failure Detection**
  - [x] In useDraftSync, call error notification on failure
  - [x] Pass error type from classifyError utility
  - [x] Show retry button for transient errors
  - [x] Show Manual Mode link for persistent errors

- [x] **Task 4: Implement Persistent Error Banner**
  - [x] Create persistent Alert banner for unresolved errors
  - [x] Show at top of draft page
  - [x] Allow dismissal but reappear on next failure
  - [x] Include "Retry" and "Manual Mode" action buttons

- [x] **Task 5: Add Accessibility Features**
  - [x] Ensure messages announced by screen readers (ARIA live regions)
  - [x] Keyboard navigation for action buttons
  - [x] Focus management (auto-focus on error actions)
  - [x] Color is not the only indicator (use icons + text)

- [x] **Task 6: Write Tests**
  - [x] Test correct message displayed for each error type
  - [x] Test recovery options displayed
  - [x] Test dismissal and reappearance behavior
  - [x] Test accessibility (screen reader, keyboard)
  - [x] Test notification styling (warning vs. error)

---

## File List

**Files Created:**
- `src/features/draft/utils/errorMessages.ts` - Error message mapping with getErrorMessage, shouldErrorPersist utilities
- `src/features/draft/utils/showErrorToast.ts` - Toast notification utility for error display
- `src/features/draft/components/ErrorNotification.tsx` - Reusable error notification component
- `src/features/draft/components/PersistentErrorBanner.tsx` - Persistent alert banner for draft page

**Files Modified:**
- `src/features/draft/hooks/useDraftSync.ts` - Integrated error notifications on failure, added showErrorToast, showManualModeToast, and showConnectionRestoredToast
- `src/features/draft/pages/DraftPage.tsx` - Added PersistentErrorBanner component

**Test Files Created:**
- `tests/features/draft/errorMessages.test.ts` - 30 tests for message mapping
- `tests/features/draft/ErrorNotification.test.tsx` - 35 tests for notification component
- `tests/features/draft/PersistentErrorBanner.test.tsx` - 19 tests for banner component
- `tests/features/draft/errorAccessibility.test.tsx` - 21 tests for accessibility

**Test Files Modified:**
- `tests/features/draft/useDraftSync.test.tsx` - Updated to expect new user-friendly error messages

---

## Dev Agent Record

### Implementation Plan

1. Created structured error message mapping in `errorMessages.ts` with:
   - ErrorMessage interface with headline, explanation, recoveryOptions, severity, showRetry, showManualMode flags
   - Tailored messages for all 8 error types (TIMEOUT, NETWORK_ERROR, SCRAPE_ERROR, PARSE_ERROR, RATE_LIMITED, UNAUTHORIZED, LEAGUE_NOT_FOUND, VALIDATION_ERROR)
   - Plain language throughout (tested to avoid technical jargon)

2. Implemented ErrorNotification component with:
   - Severity-based styling (warning yellow, error red)
   - Icons with aria-hidden for visual indicators
   - Numbered recovery options list
   - Retry and Manual Mode action buttons
   - Full accessibility support (ARIA live regions, keyboard navigation)

3. Created showErrorToast utility to integrate with sonner toasts:
   - Automatic error/warning toast type based on severity
   - Persistent duration for error-level issues
   - Action buttons for recovery options

4. Integrated with useDraftSync hook:
   - Shows error toast on each failure
   - Shows manual mode toast when triggered
   - Shows connection restored toast on recovery

5. Created PersistentErrorBanner for DraftPage:
   - Shows for persistent errors and multiple transient failures
   - Dismissible but reappears on new error
   - Retry and Manual Mode buttons

### Completion Notes

All acceptance criteria satisfied:
- ✅ Clear error messages explain issues in plain language
- ✅ Recovery options provided (numbered list + action buttons)
- ✅ No technical jargon (tested via unit tests)
- ✅ Messages dismissible but reappear if issue persists
- ✅ Different error types have tailored messages

All tests pass: 119 tests across 5 test files

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-21 | Story created | Story Creator Agent |
| 2025-12-21 | Story implementation completed | Dev Agent |

---

**Status:** Ready for Review
**Epic:** 10 of 13
**Story:** 6 of 8 in Epic 10
