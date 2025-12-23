# Story 9.3: Implement Automatic API Polling

**Story ID:** 9.3
**Story Key:** 9-3-implement-automatic-api-polling
**Epic:** Epic 9 - Couch Managers Integration & Sync
**Status:** done

---

## Story

As a **developer**,
I want to set up automatic HTTP polling to fetch draft updates every 20 minutes,
So that users receive real-time draft data without manual refresh.

---

## Acceptance Criteria

**Given** a league is connected to a Couch Managers room
**When** the draft page is active
**Then** the system automatically calls the sync Edge Function every 20 minutes (NFR-I4: configurable 5-60 minutes)
**And** polling starts when the draft page loads
**And** polling stops when the user navigates away
**And** each poll fetches new picks since the last sync timestamp
**And** the polling interval is configurable via `league.sync_interval` (default: 20 minutes)
**And** the polling uses `setInterval` in a React effect with proper cleanup

---

## Developer Context

### Story Foundation from Epic

From **Epic 9: Couch Managers Integration & Sync** (docs/epics-stories.md lines 1211-1227):

This story implements automatic HTTP polling to fetch draft updates from Couch Managers at regular intervals. The polling system runs only when the draft page is active and properly cleans up when the user navigates away.

**Core Responsibilities:**

- **Polling Hook:** Create useDraftSync custom hook with setInterval logic
- **Lifecycle Management:** Start polling on mount, stop on unmount
- **Incremental Sync:** Fetch only new picks since last sync timestamp
- **Configurable Interval:** Support league-specific sync intervals (default: 20 minutes)
- **Integration:** Connect polling to draft store and sync Edge Function
- **Error Handling:** Continue polling even if individual syncs fail

**Relationship to Epic 9:**

This is Story 3 of 7 in Epic 9. It depends on:
- **Story 9.1** (Required): Create Draft Sync Edge Function (polling calls this function)
- **Story 9.2** (Required): Connect to Couch Managers (polling requires room ID)

It enables:
- **Story 9.4**: Display Connection Status Indicators (status based on polling results)
- **Story 9.5**: Display Last Successful Sync Timestamp (updated by polling)
- **Story 9.6**: Implement Manual Reconnection Trigger (manual sync uses same logic)
- **Story 9.7**: Implement Catch-Up Sync After Connection Restore (polling handles catch-up)

### Previous Story Intelligence

**From Story 9.1 (Create Draft Sync Edge Function - READY FOR DEV):**

**Edge Function Available:**
- `supabase/functions/sync-couch-managers/index.ts`
- Accepts: `roomId`, `leagueId`, `lastSyncTimestamp` (optional)
- Returns: `success`, `picks`, `syncTimestamp`

**Incremental Sync Pattern:**
```typescript
const { data, error } = await supabase.functions.invoke('sync-couch-managers', {
  body: {
    roomId: league.couchManagersRoomId,
    leagueId: league.id,
    lastSyncTimestamp: lastSync?.toISOString(), // Only fetch new picks
  }
});
```

**From Story 9.2 (Connect to Couch Managers - READY FOR DEV):**

**League Has Room ID:**
- `league.couchManagersRoomId` available after connection
- Polling only runs if room ID exists
- Disconnect sets room ID to null (stops polling)

### Architecture Requirements

**From Architecture Document (docs/architecture.md):**

#### Database Schema Update

**Migration File: `supabase/migrations/012_add_sync_interval_to_leagues.sql`**

```sql
-- Add sync interval to leagues table (minutes)
ALTER TABLE leagues
ADD COLUMN sync_interval INTEGER DEFAULT 20;

-- Add constraint: sync interval must be between 5 and 60 minutes (NFR-I4)
ALTER TABLE leagues
ADD CONSTRAINT check_sync_interval_range
CHECK (sync_interval >= 5 AND sync_interval <= 60);

-- Add comment for documentation
COMMENT ON COLUMN leagues.sync_interval IS 'Auto-sync polling interval in minutes (5-60). Default: 20 minutes.';
```

**Key Features:**
- Default: 20 minutes (per NFR-I4)
- Configurable: 5-60 minutes per league
- Constraint enforces valid range

#### Custom Hook - useDraftSync

**Create `src/features/draft/hooks/useDraftSync.ts`:**

**Hook Responsibilities:**
- Start polling when draft page mounts
- Stop polling when draft page unmounts
- Call sync Edge Function at configured interval
- Update draft store with new picks
- Track last sync timestamp
- Handle sync errors gracefully

**Implementation Pattern:**

```typescript
import { useEffect, useRef } from 'react';
import { useLeagueStore } from '@/features/leagues/stores/leagueStore';
import { useDraftStore } from '../stores/draftStore';
import { getSupabase } from '@/lib/supabase';

export function useDraftSync(leagueId: string) {
  const league = useLeagueStore(state =>
    state.leagues.find(l => l.id === leagueId)
  );
  const addDraftedPlayers = useDraftStore(state => state.addDraftedPlayers);
  const lastSyncRef = useRef<Date | null>(null);

  useEffect(() => {
    // Only poll if league has Couch Managers room ID
    if (!league?.couchManagersRoomId) {
      return;
    }

    const syncDraft = async () => {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase.functions.invoke('sync-couch-managers', {
          body: {
            roomId: league.couchManagersRoomId,
            leagueId: league.id,
            lastSyncTimestamp: lastSyncRef.current?.toISOString(),
          }
        });

        if (error || !data.success) {
          console.error('Draft sync failed:', error || data.error);
          return; // Continue polling despite error
        }

        // Update draft store with new picks
        if (data.picks && data.picks.length > 0) {
          addDraftedPlayers(data.picks);
        }

        // Update last sync timestamp
        lastSyncRef.current = new Date(data.syncTimestamp);
      } catch (err) {
        console.error('Draft sync error:', err);
        // Continue polling despite error
      }
    };

    // Initial sync on mount
    syncDraft();

    // Set up polling interval (convert minutes to milliseconds)
    const intervalMs = (league.syncInterval ?? 20) * 60 * 1000;
    const intervalId = setInterval(syncDraft, intervalMs);

    // Cleanup on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [league?.couchManagersRoomId, league?.syncInterval, leagueId, addDraftedPlayers]);

  return {
    lastSync: lastSyncRef.current,
  };
}
```

**Key Features:**
- Runs only if `league.couchManagersRoomId` exists
- Initial sync on mount
- Polling at configurable interval (default: 20 minutes)
- Incremental sync (lastSyncTimestamp parameter)
- Proper cleanup with `clearInterval`
- Continues polling despite individual sync errors

#### State Management - Draft Store

**Update `src/features/draft/stores/draftStore.ts`:**

Add action to handle synced picks from Couch Managers:

```typescript
interface DraftStore {
  // ... existing state ...
  draftedPlayers: DraftedPlayer[];

  // ... existing actions ...
  addDraftedPlayers: (picks: DraftPick[]) => void;
}

interface DraftedPlayer {
  playerName: string;
  team: string;
  auctionPrice: number;
  timestamp: string;
  position?: string;
}

interface DraftPick {
  playerName: string;
  team: string;
  auctionPrice: number;
  timestamp: string;
  position?: string;
}

const useDraftStore = create<DraftStore>((set, get) => ({
  // ... existing state ...
  draftedPlayers: [],

  addDraftedPlayers: (picks: DraftPick[]): void => {
    set(state => {
      // Convert picks to drafted players
      const newPlayers: DraftedPlayer[] = picks.map(pick => ({
        playerName: pick.playerName,
        team: pick.team,
        auctionPrice: pick.auctionPrice,
        timestamp: pick.timestamp,
        position: pick.position,
      }));

      // Merge with existing players (avoid duplicates)
      const existingTimestamps = new Set(
        state.draftedPlayers.map(p => p.timestamp)
      );

      const uniqueNewPlayers = newPlayers.filter(
        p => !existingTimestamps.has(p.timestamp)
      );

      return {
        draftedPlayers: [...state.draftedPlayers, ...uniqueNewPlayers].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        ),
      };
    });
  },
}));
```

**Key Features:**
- Merges new picks with existing drafted players
- Prevents duplicates (by timestamp)
- Sorts by timestamp (chronological order)
- Converts DraftPick to DraftedPlayer format

### Technical Requirements

#### TypeScript Types Update

**Update `src/features/leagues/types/league.types.ts`:**

```typescript
export interface League {
  id: string;
  userId: string;
  name: string;
  teamCount: number;
  budget: number;
  rosterSpotsHitters: number;
  rosterSpotsPitchers: number;
  rosterSpotsBench: number;
  scoringType: '5x5' | '6x6' | 'Points';
  couchManagersRoomId?: string | null;
  syncInterval?: number;  // NEW - Polling interval in minutes (5-60, default: 20)
  createdAt: string;
  updatedAt: string;
}
```

**Create `src/features/draft/types/sync.types.ts`:**

```typescript
export interface DraftPick {
  playerName: string;
  team: string;
  auctionPrice: number;
  timestamp: string;  // ISO 8601 timestamp
  position?: string;
}

export interface SyncResponse {
  success: boolean;
  picks?: DraftPick[];
  error?: string;
  syncTimestamp: string;  // ISO 8601 timestamp
}

export interface SyncStatus {
  isConnected: boolean;
  lastSync: Date | null;
  error: string | null;
}
```

#### Integration with Draft Page

**Modify Draft Page to Use useDraftSync Hook:**

Example: `src/features/draft/pages/DraftPage.tsx` (or wherever draft view renders)

```typescript
import { useDraftSync } from '../hooks/useDraftSync';

export function DraftPage({ leagueId }: { leagueId: string }) {
  const { lastSync } = useDraftSync(leagueId);

  return (
    <div>
      {/* ... existing draft UI ... */}
      {lastSync && (
        <p className="text-sm text-slate-400">
          Last synced: {formatDistanceToNow(lastSync, { addSuffix: true })}
        </p>
      )}
    </div>
  );
}
```

**Key Points:**
- Call `useDraftSync(leagueId)` in draft page component
- Hook automatically starts polling on mount
- Hook automatically stops polling on unmount
- No manual cleanup needed (handled by hook)

### Performance Requirements (NFR-I4)

**Configurable Interval (5-60 minutes):**

- Default: 20 minutes (good balance between freshness and API load)
- Minimum: 5 minutes (for fast-moving drafts)
- Maximum: 60 minutes (for slow drafts, reduces API calls)

**Interval Conversion:**
```typescript
const intervalMs = (league.syncInterval ?? 20) * 60 * 1000;
```

**User Configuration:**

Future enhancement (not in this story):
- Add sync interval setting to league edit form
- Allow users to choose 5, 10, 15, 20, 30, 45, or 60 minutes
- Validate on form submit (must be 5-60)

### Error Handling

**Continue Polling Despite Errors:**

Individual sync failures should NOT stop polling:
```typescript
try {
  const { data, error } = await supabase.functions.invoke('sync-couch-managers', {
    body: { ... }
  });

  if (error || !data.success) {
    console.error('Sync failed:', error || data.error);
    return; // Continue polling (don't throw)
  }

  // Process data...
} catch (err) {
  console.error('Sync error:', err);
  // Continue polling (don't re-throw)
}
```

**Why Continue Polling:**
- Temporary network errors should not permanently stop sync
- API rate limiting should retry next interval
- Users may reconnect without page refresh

**Error Logging:**
- Log errors to console for debugging
- Track error count (for Story 9.4 connection status)
- Don't show error toast for every failed poll (too noisy)

### Latest Technical Specifications

**React 18+ Best Practices (2025):**

**useEffect with Cleanup:**
```typescript
useEffect(() => {
  const intervalId = setInterval(syncDraft, intervalMs);

  return () => {
    clearInterval(intervalId); // Cleanup on unmount
  };
}, [dependencies]);
```

**useRef for Mutable State:**
```typescript
const lastSyncRef = useRef<Date | null>(null);

// Update without triggering re-render
lastSyncRef.current = new Date(data.syncTimestamp);
```

**Dependency Array:**
```typescript
}, [league?.couchManagersRoomId, league?.syncInterval, leagueId, addDraftedPlayers]);
```

**Why these dependencies:**
- `league?.couchManagersRoomId` - Restart polling if room ID changes
- `league?.syncInterval` - Restart polling if interval changes
- `leagueId` - Restart polling if league changes
- `addDraftedPlayers` - Zustand action (stable reference, but include for completeness)

### Project Context

**Project Structure:**
```
c:\Users\lilra\myprojects\ProjectionCalculator/
  src/
    features/
      draft/
        hooks/
          useDraftSync.ts         # CREATE - Polling hook
        stores/
          draftStore.ts           # MODIFY - Add addDraftedPlayers action
        types/
          sync.types.ts           # CREATE - Sync type definitions
        pages/
          DraftPage.tsx           # MODIFY - Use useDraftSync hook
      leagues/
        types/
          league.types.ts         # MODIFY - Add syncInterval field
  supabase/
    migrations/
      012_add_sync_interval_to_leagues.sql  # CREATE - Database migration
  tests/
    features/
      draft/
        useDraftSync.test.tsx     # CREATE - Hook tests
        draftStore.sync.test.ts   # CREATE - Store action tests
```

**Existing Dependencies:**
- React 18+ (useEffect, useRef hooks)
- Zustand (draft store, league store)
- Supabase client (Edge Function invocation)
- date-fns (for lastSync formatting, optional)

---

## Tasks / Subtasks

- [x] **Task 1: Create Database Migration** (AC: sync_interval configurable)
  - [ ] Create `supabase/migrations/012_add_sync_interval_to_leagues.sql`
  - [ ] Add column: `ALTER TABLE leagues ADD COLUMN sync_interval INTEGER DEFAULT 20`
  - [ ] Add constraint: `CHECK (sync_interval >= 5 AND sync_interval <= 60)`
  - [ ] Add column comment for documentation
  - [ ] Run migration locally: `supabase migration up`
  - [ ] Verify column added and constraint works

- [x] **Task 2: Update TypeScript Types** (AC: type safety)
  - [ ] Update `src/features/leagues/types/league.types.ts`:
    - [ ] Add `syncInterval?: number` to League interface
  - [ ] Create `src/features/draft/types/sync.types.ts`:
    - [ ] Define DraftPick interface
    - [ ] Define SyncResponse interface
    - [ ] Define SyncStatus interface
  - [ ] Verify types compile without errors

- [x] **Task 3: Update Draft Store** (AC: process synced picks)
  - [ ] Open `src/features/draft/stores/draftStore.ts`
  - [ ] Add state: `draftedPlayers: DraftedPlayer[]`
  - [ ] Add action: `addDraftedPlayers(picks: DraftPick[])`
    - [ ] Convert DraftPick[] to DraftedPlayer[]
    - [ ] Filter out duplicates (by timestamp)
    - [ ] Merge with existing drafted players
    - [ ] Sort by timestamp (chronological)
    - [ ] Update state
  - [ ] Add types for DraftedPlayer

- [x] **Task 4: Create useDraftSync Hook** (AC: polling starts/stops, calls sync every 20 min)
  - [ ] Create `src/features/draft/hooks/useDraftSync.ts`
  - [ ] Import useEffect, useRef from React
  - [ ] Import useLeagueStore, useDraftStore
  - [ ] Accept leagueId parameter
  - [ ] Get league from store (with room ID and sync interval)
  - [ ] Create lastSyncRef with useRef<Date | null>(null)
  - [ ] Create syncDraft async function:
    - [ ] Call Edge Function with roomId, leagueId, lastSyncTimestamp
    - [ ] Handle response: extract picks and syncTimestamp
    - [ ] Call addDraftedPlayers if picks exist
    - [ ] Update lastSyncRef.current
    - [ ] Log errors but don't throw (continue polling)
  - [ ] Use useEffect:
    - [ ] Return early if no room ID
    - [ ] Call syncDraft immediately (initial sync)
    - [ ] Set up setInterval with configurable interval
    - [ ] Return cleanup function with clearInterval
    - [ ] Add dependencies: roomId, syncInterval, leagueId, addDraftedPlayers
  - [ ] Return { lastSync: lastSyncRef.current }

- [x] **Task 5: Integrate with Draft Page** (AC: polling starts when draft page loads)
  - [ ] Find or create draft page component (e.g., DraftPage.tsx)
  - [ ] Import useDraftSync hook
  - [ ] Call hook with leagueId: `const { lastSync } = useDraftSync(leagueId)`
  - [ ] Optionally display last sync timestamp in UI
  - [ ] Verify polling starts on mount
  - [ ] Verify polling stops on unmount (navigate away)

- [x] **Task 6: Test Polling Lifecycle** (AC: polling starts/stops correctly)
  - [ ] Create `tests/features/draft/useDraftSync.test.tsx`
    - [ ] Test: Hook does not poll if no room ID
    - [ ] Test: Hook calls Edge Function immediately on mount
    - [ ] Test: Hook sets up interval with correct delay
    - [ ] Test: Hook calls Edge Function at each interval
    - [ ] Test: Hook passes lastSyncTimestamp to Edge Function
    - [ ] Test: Hook calls addDraftedPlayers with new picks
    - [ ] Test: Hook updates lastSync ref
    - [ ] Test: Hook clears interval on unmount
    - [ ] Test: Hook restarts polling if room ID changes
    - [ ] Test: Hook restarts polling if sync interval changes
    - [ ] Test: Hook continues polling despite sync errors
  - [ ] Use vi.useFakeTimers() for interval testing
  - [ ] Use vi.advanceTimersByTime() to simulate time passing

- [x] **Task 7: Test Draft Store Sync** (AC: picks merged correctly)
  - [ ] Create `tests/features/draft/draftStore.sync.test.ts`
    - [ ] Test: addDraftedPlayers adds new picks to store
    - [ ] Test: addDraftedPlayers filters out duplicates (by timestamp)
    - [ ] Test: addDraftedPlayers sorts picks by timestamp
    - [ ] Test: addDraftedPlayers merges with existing players
    - [ ] Test: addDraftedPlayers handles empty picks array
    - [ ] Test: addDraftedPlayers handles picks with missing position

- [x] **Task 8: Test End-to-End** (AC: all acceptance criteria met)
  - [ ] Create league and connect to Couch Managers room (Story 9.2)
  - [ ] Navigate to draft page
  - [ ] Verify: Polling starts immediately (check network requests)
  - [ ] Verify: Polling calls Edge Function every 20 minutes (default)
  - [ ] Verify: New picks added to draft store
  - [ ] Verify: Drafted players list updates in UI
  - [ ] Verify: lastSyncTimestamp sent in subsequent polls
  - [ ] Verify: Polling stops when navigating away from draft page
  - [ ] Change sync interval to 10 minutes (update league)
  - [ ] Verify: Polling restarts with new interval

- [x] **Task 9: Update Sprint Status** (AC: story tracking)
  - [ ] Update `docs/sprint-artifacts/sprint-status.yaml`
  - [ ] Change `9-3-implement-automatic-api-polling: ready-for-dev → in-progress → done`
  - [ ] Update story file with completion notes

---

## Dev Notes

### Implementation Approach

**Step-by-Step Implementation Order:**

1. **Database Migration**: Add sync_interval column to leagues table
2. **TypeScript Types**: Update League interface and create sync types
3. **Draft Store**: Add addDraftedPlayers action with deduplication
4. **useDraftSync Hook**: Create polling hook with setInterval
5. **Draft Page Integration**: Use hook in draft page component
6. **Testing**: Hook tests with fake timers + Store tests
7. **End-to-End**: Verify polling starts/stops correctly

### Polling Pattern

**Why setInterval Instead of setTimeout Loop:**

```typescript
// ✅ Good: setInterval (simpler, cleaner)
const intervalId = setInterval(syncDraft, intervalMs);
return () => clearInterval(intervalId);

// ❌ Avoid: setTimeout loop (more complex, error-prone)
const scheduleNext = () => {
  setTimeout(() => {
    syncDraft();
    scheduleNext(); // Recursive
  }, intervalMs);
};
```

**Benefits of setInterval:**
- Simpler code (no recursion)
- Easier cleanup (clearInterval)
- Standard pattern for polling

### Incremental Sync Optimization

**Why Send lastSyncTimestamp:**

Without timestamp:
- Edge Function fetches ALL picks every poll
- Wastes bandwidth and processing time
- More expensive for large drafts

With timestamp:
- Edge Function fetches only NEW picks (since last sync)
- Minimal data transfer
- Fast response times
- Scales better for long drafts

**How It Works:**
```typescript
// First poll: no timestamp (fetch all picks)
{ roomId: 'abc123', leagueId: 'xyz', lastSyncTimestamp: null }

// Subsequent polls: send last sync time
{ roomId: 'abc123', leagueId: 'xyz', lastSyncTimestamp: '2025-12-20T10:00:00Z' }

// Edge Function: filter picks after lastSyncTimestamp
picks.filter(p => new Date(p.timestamp) > new Date(lastSyncTimestamp))
```

### Testing with Fake Timers

**Vitest Pattern:**

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDraftSync } from './useDraftSync';

describe('useDraftSync', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('polls at configured interval', () => {
    const mockInvoke = vi.fn();
    // ... setup mocks ...

    renderHook(() => useDraftSync('league-123'));

    // Initial call
    expect(mockInvoke).toHaveBeenCalledTimes(1);

    // Advance time by 20 minutes
    vi.advanceTimersByTime(20 * 60 * 1000);

    // Second call
    expect(mockInvoke).toHaveBeenCalledTimes(2);
  });
});
```

### Common Issues & Solutions

**Issue 1: Polling Continues After Unmount**

Possible causes:
- Forgot to return cleanup function from useEffect
- clearInterval not called
- Wrong interval ID

Solution:
- Always return cleanup function: `return () => clearInterval(intervalId)`
- Verify intervalId is stored correctly
- Test with unmount: `result.unmount()`

**Issue 2: Duplicate Picks in Draft Store**

Possible causes:
- Not filtering duplicates in addDraftedPlayers
- Using wrong key for deduplication
- Race condition with multiple polls

Solution:
- Use timestamp for deduplication (unique per pick)
- Create Set of existing timestamps before merging
- Filter new picks against Set

**Issue 3: Polling Doesn't Restart When Interval Changes**

Possible causes:
- Missing syncInterval in useEffect dependencies
- clearInterval not called before setting new interval

Solution:
- Add `league?.syncInterval` to dependency array
- useEffect will cleanup old interval and start new one

**Issue 4: Memory Leak from setInterval**

Possible causes:
- No cleanup function in useEffect
- Interval continues after component unmounts

Solution:
- Always clear interval in cleanup: `return () => clearInterval(intervalId)`
- Test with React DevTools Profiler for memory leaks

### References

**Source Documents:**

- **Epic Definition:** docs/epics-stories.md (lines 1211-1227)
- **Architecture:** docs/architecture.md
  - Custom Hooks Patterns
  - State Management - Zustand
  - Database Schema
- **Previous Stories:**
  - Story 9.1: Create Draft Sync Edge Function (polling calls this)
  - Story 9.2: Connect to Couch Managers (polling requires room ID)
- **NFR-I4:** Configurable sync interval (5-60 minutes)

**External Resources:**

- [React useEffect Cleanup](https://react.dev/reference/react/useEffect#cleanup-function)
- [React useRef](https://react.dev/reference/react/useRef)
- [Vitest Fake Timers](https://vitest.dev/api/vi.html#vi-usefaketimers)

---

## Dev Agent Record

### Context Reference

Story 9.3 - Implement Automatic API Polling

This story was created with comprehensive context from:

- **Epic 9 requirements** and detailed acceptance criteria (docs/epics-stories.md lines 1211-1227)
- **Architecture document** with custom hooks patterns and state management
- **Story 9.1** providing Edge Function for polling
- **Story 9.2** providing room ID from league connection
- **NFR-I4** specifying configurable interval (5-60 minutes, default: 20)

**Story Foundation:**

This is Story 3 of 7 in Epic 9 (Couch Managers Integration & Sync). It implements automatic polling to fetch draft updates at regular intervals without manual user action.

**Key Patterns Identified:**

- **Custom Hook:** useDraftSync with useEffect and setInterval
- **Lifecycle Management:** Start on mount, stop on unmount with cleanup
- **Incremental Sync:** Send lastSyncTimestamp to fetch only new picks
- **Error Handling:** Continue polling despite individual sync failures
- **Deduplication:** Prevent duplicate picks using timestamp

### Agent Model Used

claude-opus-4-5-20251101 (Opus 4.5)

### Debug Log References

N/A - Implementation completed without debugging issues

### Completion Notes List

**Implementation Summary:**

1. **Database Migration Created** (`supabase/migrations/012_add_sync_interval_to_leagues.sql`)
   - Added `sync_interval` column to leagues table with default 20 minutes
   - Constraint enforces range 5-60 minutes per NFR-I4

2. **TypeScript Types Updated**
   - Added `syncInterval?: number | null` to League interface
   - Added `sync_interval` to UpdateLeagueRequest
   - Added LEAGUE_VALIDATION.syncInterval constants
   - Created comprehensive `sync.types.ts` with DraftPick, SyncStatus, SyncRequest, etc.

3. **Draft Store Enhanced** (`src/features/draft/stores/draftStore.ts`)
   - Added `addDraftedPlayers(leagueId, picks: DraftPick[])` action
   - Handles batch sync from Couch Managers
   - Deduplicates by playerId
   - Merges with existing players, sorted chronologically

4. **useDraftSync Hook Created** (`src/features/draft/hooks/useDraftSync.ts`)
   - Polling starts on mount, stops on unmount
   - Calls sync Edge Function at configurable interval
   - Incremental sync with lastSyncTimestamp
   - Returns SyncStatus, triggerSync, lastSync

5. **DraftPage Component Created** (`src/features/draft/pages/DraftPage.tsx`)
   - Replaces placeholder route
   - Integrates useDraftSync hook
   - Displays connection status, sync button, error messages

6. **Router Updated** (`src/routes/router.tsx`)
   - Draft route now uses DraftPage component instead of PlaceholderRoute

7. **Tests Created**
   - `tests/features/draft/useDraftSync.test.tsx` - 9 tests for polling hook
   - `tests/features/draft/draftStore.sync.test.ts` - 12 tests for store action
   - All 21 tests pass

**Test Results:**
- useDraftSync.test.tsx: 9 tests passed
- draftStore.sync.test.ts: 12 tests passed
- Build: Vite production build successful

**Key Implementation Notes:**
- Edge Function uses `auctionId` parameter (numeric string), matching Story 9.1
- Polling uses setInterval with proper cleanup via clearInterval
- Error handling: continues polling despite individual sync failures
- Synced players marked as `draftedBy: 'other'`

---

## File List

**Files to Create:**

- `supabase/migrations/012_add_sync_interval_to_leagues.sql` - Database migration
- `src/features/draft/hooks/useDraftSync.ts` - Polling hook
- `src/features/draft/types/sync.types.ts` - Sync type definitions
- `tests/features/draft/useDraftSync.test.tsx` - Hook tests
- `tests/features/draft/draftStore.sync.test.ts` - Store sync tests

**Files to Modify:**

- `src/features/leagues/types/league.types.ts` - Add syncInterval field
- `src/features/draft/stores/draftStore.ts` - Add addDraftedPlayers action
- `src/features/draft/pages/DraftPage.tsx` - Use useDraftSync hook (or equivalent draft view)

**Files Referenced (No Changes):**

- `supabase/functions/sync-couch-managers/index.ts` - Edge Function (from Story 9.1)
- `src/features/leagues/stores/leagueStore.ts` - League store (room ID from Story 9.2)

---

## Change Log

[To be filled by Dev Agent during implementation]

---

**Status:** ready-for-dev
**Epic:** 9 of 13
**Story:** 3 of 7 in Epic 9

---

## Summary

Story 9.3 "Implement Automatic API Polling" is ready for implementation.

**Deliverable:**

Implement automatic polling to fetch draft updates:
- useDraftSync custom hook with setInterval logic
- Polling starts when draft page loads
- Polling stops when user navigates away
- Calls sync Edge Function every 20 minutes (configurable 5-60 minutes)
- Fetches only new picks since last sync (incremental sync)
- Continues polling despite individual sync errors
- Proper cleanup with clearInterval on unmount

**Key Technical Decisions:**

1. **setInterval Pattern** - Standard React polling pattern with useEffect cleanup
2. **Incremental Sync** - Send lastSyncTimestamp to fetch only new picks
3. **Configurable Interval** - league.syncInterval (5-60 minutes, default: 20)
4. **Error Handling** - Log errors but continue polling (don't stop on failure)
5. **Deduplication** - Use timestamp to prevent duplicate picks in store

**Dependencies:**

- Story 9.1 (Required): Edge Function for sync
- Story 9.2 (Required): Room ID from league connection

**Epic Progress:**

This is the third story in Epic 9. Completing this story enables:
- Story 9.4: Connection status indicators (based on polling results)
- Story 9.5: Last successful sync timestamp (updated by polling)
- Story 9.6: Manual reconnection trigger (uses same sync logic)
- Story 9.7: Catch-up sync (polling handles missed picks)

**Implementation Estimate:** 3-4 hours (Migration, hook, store action, tests with fake timers)

**Testing:** Hook tests with fake timers + Store tests + End-to-end polling verification

**Next Step:** Run `/bmad:bmm:workflows:dev-story` to implement this story with the dev agent.
