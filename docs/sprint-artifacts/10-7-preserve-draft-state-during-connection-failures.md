# Story 10.7: Preserve Draft State During Connection Failures

**Story ID:** 10.7
**Story Key:** 10-7-preserve-draft-state-during-connection-failures
**Epic:** Epic 10 - Resilience & Manual Sync Fallback
**Status:** dev-complete

---

## Story

As a **developer**,
I want to preserve all draft state (roster, budget, inflation data) during connection failures,
So that users experience zero data loss.

---

## Acceptance Criteria

**Given** the draft is in progress and an API failure occurs
**When** the connection fails
**Then** all draft state is preserved in Zustand persist middleware (localStorage)
**And** the state includes: roster, budget remaining, drafted players, inflation metrics, last sync timestamp
**And** if the user refreshes the page, all state is restored from localStorage
**And** state is never lost regardless of failure type (NFR-R4: zero data loss)
**And** recovery from localStorage completes in <1 second

---

## Developer Context

### Story Foundation from Epic

From **Epic 10: Resilience & Manual Sync Fallback** (docs/epics-stories.md lines 1400-1414):

This story implements robust state persistence to ensure zero data loss during connection failures, meeting NFR-R4. All draft state must survive page refreshes, browser crashes, and API outages, allowing users to continue their draft without losing any progress.

**Core Responsibilities:**

- **State Persistence:** Save all critical draft state to localStorage
- **Zero Data Loss:** Ensure no state is lost during failures (NFR-R4)
- **Comprehensive Coverage:** Include roster, budget, drafted players, inflation data
- **Recovery Performance:** Restore state in <1 second on page load
- **Reliability:** Handle edge cases (browser storage limits, corrupted data)
- **Testing:** Validate state persistence across failure scenarios

**Relationship to Epic 10:**

This is Story 7 of 8 in Epic 10. It provides foundation for:
- **Story 10.1** (Related): Failure detection doesn't cause data loss
- **Story 10.2-10.4** (Related): Manual entries are persisted
- **Story 10.8** (Related): Graceful degradation maintains state

**Integration Points:**

- Uses Zustand persist middleware (already configured in Architecture)
- Extends draft store and inflation store with persistence
- May need to persist sync state (failure count, last sync timestamp)
- Integrates with browser localStorage API

**Key Technical Considerations:**

1. **State to Persist:**
   - Draft state: `leagueId`, `roster`, `budgetRemaining`, `draftedPlayers`
   - Inflation state: `overallRate`, `positionRates`, `tierRates`, `adjustedValues`
   - Sync state: `lastSyncTimestamp`, `failureCount`, `isManualMode`
   - Metadata: `draftStartTime`, `lastUpdateTime`

2. **Zustand Persist Middleware:**
   - Already configured per Architecture (Story 3.7)
   - Verify draft store uses persist
   - Verify inflation store uses persist
   - Configure storage key: `auction-projections-draft-{leagueId}`

3. **Edge Cases:**
   - Storage quota exceeded: Prune old draft data
   - Corrupted data: Fallback to empty state with error notification
   - Multiple tabs: Use storage events to sync state across tabs

---

## Tasks / Subtasks

- [x] **Task 1: Verify Draft Store Persistence**
  - [x] Review draft store configuration
  - [x] Ensure persist middleware is configured
  - [x] Verify all critical state is in persist whitelist
  - [x] Test state persists to localStorage on update

- [x] **Task 2: Verify Inflation Store Persistence**
  - [x] Review inflation store configuration
  - [x] Add persist middleware if not present
  - [x] Configure persist whitelist for inflation state
  - [x] Test inflation data persists correctly

- [x] **Task 3: Add Sync State Persistence**
  - [x] Create sync state in draft store or separate store
  - [x] Persist: `lastSyncTimestamp`, `failureCount`, `isManualMode`, `lastSyncError`
  - [x] Restore sync state on page load
  - [x] Test sync state survives refresh

- [x] **Task 4: Implement State Recovery on Load**
  - [x] On draft page mount, restore state from localStorage
  - [x] Validate restored state (check data integrity)
  - [x] Handle missing or corrupted data gracefully
  - [x] Log recovery success/failure
  - [x] Ensure recovery completes in <1 second

- [x] **Task 5: Handle Storage Edge Cases**
  - [x] Implement quota exceeded handler (prune old data)
  - [x] Implement corrupted data fallback (reset to empty)
  - [x] Add error logging for storage failures
  - [x] Test with localStorage disabled (private browsing)

- [x] **Task 6: Write Comprehensive Tests**
  - [x] Test state persists after drafted player added
  - [x] Test state persists after manual bid entry
  - [x] Test state persists during API failure
  - [x] Test state restored on page refresh
  - [x] Test recovery performance (<1 second)
  - [x] Test edge cases (quota exceeded, corrupted data)
  - [x] Test zero data loss across all failure types

---

## File List

**Files to Modify:**
- `src/features/draft/stores/draftStore.ts` - Verify/configure persist middleware
- `src/features/inflation/stores/inflationStore.ts` - Add persist middleware
- `src/features/draft/hooks/useDraft.ts` - Add state recovery on mount
- `src/features/draft/pages/DraftPage.tsx` - Implement recovery UI feedback

**Files to Test:**
- `tests/features/draft/draftStore.persistence.test.ts` - Draft state persistence tests
- `tests/features/inflation/inflationStore.persistence.test.ts` - Inflation state persistence tests
- `tests/features/draft/stateRecovery.test.tsx` - State recovery tests
- `tests/features/draft/persistenceEdgeCases.test.ts` - Edge case tests

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-21 | Story created | Story Creator Agent |

---

**Status:** dev-complete
**Epic:** 10 of 13
**Story:** 7 of 8 in Epic 10
