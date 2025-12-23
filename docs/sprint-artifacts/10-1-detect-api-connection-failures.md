# Story 10.1: Detect API Connection Failures

**Story ID:** 10.1
**Story Key:** 10-1-detect-api-connection-failures
**Epic:** Epic 10 - Resilience & Manual Sync Fallback
**Status:** dev-complete

---

## Story

As a **developer**,
I want to detect when API connections fail and track failure count,
So that the system can gracefully degrade to Manual Sync Mode.

---

## Acceptance Criteria

**Given** automatic sync is enabled
**When** an API call to Couch Managers fails
**Then** the failure is logged with timestamp and error details
**And** a retry counter is incremented
**And** after 3 consecutive failures (NFR-I3), the system triggers Manual Sync Mode
**And** transient failures (network timeout) trigger automatic retry with exponential backoff
**And** persistent failures (invalid room ID) immediately trigger Manual Sync Mode
**And** failure detection completes within 5 seconds (NFR-R7)

---

## Developer Context

### Story Foundation from Epic

From **Epic 10: Resilience & Manual Sync Fallback** (docs/epics-stories.md lines 1300-1316):

This story implements the detection layer that monitors API connection health and triggers graceful degradation when failures occur. It distinguishes between transient failures (temporary network issues) and persistent failures (configuration errors), applying appropriate recovery strategies for each.

**Core Responsibilities:**

- **Failure Detection:** Monitor sync Edge Function calls and detect failures
- **Failure Classification:** Distinguish transient vs. persistent failures
- **Retry Logic:** Implement exponential backoff for transient failures (max 3 retries)
- **Degradation Trigger:** Switch to Manual Sync Mode after 3 consecutive failures
- **Performance:** Failure detection must complete within 5 seconds (NFR-R7)
- **Logging:** Log all failures with timestamp, error details, and context

**Relationship to Epic 10:**

This is Story 1 of 8 in Epic 10. It establishes the foundation for graceful degradation:
- **Story 10.2** (Builds on): Uses failure detection to trigger Manual Sync Mode
- **Story 10.6** (Related): Uses failure classification to display appropriate error messages
- **Story 10.8** (Related): Implements graceful degradation pattern using this detection

**Integration Points:**

- Extends `useDraftSync` hook from Epic 9 (Story 9.3)
- Adds failure tracking state to draft store or sync store
- Integrates with existing Couch Managers Edge Function (Story 9.1)

**Key Technical Considerations:**

1. **Failure Classification:**
   - Transient: Network timeout, 5xx errors, rate limiting
   - Persistent: 401/403 errors, invalid room ID, 404 errors

2. **Retry Strategy:**
   - Exponential backoff: 5s, 10s, 20s delays
   - Max 3 consecutive failures before degradation
   - Reset counter on successful sync

3. **State Management:**
   - Track: `failureCount`, `lastFailureTimestamp`, `failureType`, `inManualMode`
   - Store in draft store or create dedicated sync state store

---

## Tasks / Subtasks

- [x] **Task 1: Add Failure Tracking State**
  - [x] Add to draft store: `syncFailureCount`, `lastSyncError`, `syncFailureType`, `isManualMode`
  - [x] Add actions: `incrementFailureCount()`, `resetFailureCount()`, `setSyncError()`, `enableManualMode()`
  - [x] Initialize state on draft start

- [x] **Task 2: Implement Failure Classification Logic**
  - [x] Create utility: `src/features/draft/utils/classifyError.ts`
  - [x] Classify transient errors (timeout, 5xx, network errors)
  - [x] Classify persistent errors (401, 403, 404, invalid room ID)
  - [x] Return error type and suggested retry behavior

- [x] **Task 3: Enhance useDraftSync Hook with Failure Detection**
  - [x] Wrap Edge Function call in try-catch
  - [x] On error, call classifyError utility
  - [x] Increment failure count for transient errors
  - [x] Trigger Manual Mode immediately for persistent errors
  - [x] Trigger Manual Mode after 3 consecutive failures
  - [x] Reset failure count on successful sync

- [x] **Task 4: Implement Exponential Backoff for Retries**
  - [x] Add retry delay calculation: `Math.min(5000 * Math.pow(2, failureCount), 20000)`
  - [x] Use setTimeout for retry delays
  - [x] Max 3 retries before triggering Manual Mode
  - [x] Log retry attempts with timestamp

- [x] **Task 5: Write Comprehensive Tests**
  - [x] Test transient failure detection and retry logic
  - [x] Test persistent failure immediate degradation
  - [x] Test 3 consecutive failures trigger Manual Mode
  - [x] Test exponential backoff timing
  - [x] Test failure count reset on success
  - [x] Test failure detection performance (<5 seconds)

---

## File List

**Files to Create:**
- `src/features/draft/utils/classifyError.ts` - Error classification utility

**Files to Modify:**
- `src/features/draft/stores/draftStore.ts` - Add failure tracking state
- `src/features/draft/hooks/useDraftSync.ts` - Add failure detection logic
- `src/features/draft/types/sync.types.ts` - Add error classification types

**Files to Test:**
- `tests/features/draft/classifyError.test.ts` - Error classification tests
- `tests/features/draft/draftStore.failureTracking.test.ts` - Failure state tests
- `tests/features/draft/useDraftSync.failureDetection.test.tsx` - Failure detection tests

---

## Change Log

| Date       | Change                                      | Author              |
|------------|---------------------------------------------|---------------------|
| 2025-12-21 | Story created                               | Story Creator Agent |
| 2025-12-21 | Implementation complete - all tasks done    | Dev Agent           |

---

**Status:** dev-complete
**Epic:** 10 of 13
**Story:** 1 of 8 in Epic 10
