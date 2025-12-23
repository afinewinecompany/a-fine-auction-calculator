# Story 5.8: Integrate Inflation Engine with Draft State

**Story ID:** 5.8
**Story Key:** 5-8-integrate-inflation-engine-with-draft-state
**Epic:** Epic 5 - Core Inflation Engine
**Status:** done

---

## Story

As a **developer**,
I want to automatically trigger inflation recalculation whenever new players are drafted,
So that adjusted values update in real-time.

---

## Acceptance Criteria

**Given** the draft store tracks drafted players and the inflation store manages calculations
**When** a new player is marked as drafted (via API sync or manual entry)
**Then** the `updateInflation()` action is called automatically
**And** all inflation rates (overall, position, tier) are recalculated
**And** all remaining player adjusted values are updated
**And** the recalculation completes in <2 seconds (NFR-P1)
**And** the UI reflects updated values immediately without blocking user interactions (NFR-P8)
**And** the integration uses Zustand subscriptions to react to draft state changes

---

## Developer Context

### Story Foundation from Epic

From **Epic 5: Core Inflation Engine** (docs/epics-stories.md lines 706-718):

This story integrates the inflation engine with the draft state, creating the reactive system that updates inflation calculations whenever the draft progresses. This enables real-time inflation tracking during live drafts.

**Core Responsibilities:**

- **Reactive Updates:** Automatically recalculate when draft state changes
- **Store Integration:** Connect draft store to inflation store
- **Performance:** Complete recalculation in <2 seconds
- **Non-Blocking UI:** Updates happen without freezing the interface

**Relationship to Epic 5:**

This is Story 8 of 8 in Epic 5. It depends on:
- **Story 5.7** (Complete): Inflation store with updateInflation action
- **Draft store** (from Epic 6): Tracks drafted players

It enables:
- **Epic 6**: Live draft experience (real-time inflation updates)
- **Epic 8**: Variance and inflation insights

### Technical Requirements

#### Draft Store Subscription

```typescript
// In draft store or separate integration file
import { useInflationStore } from '@/features/inflation/stores/inflationStore';

// Subscribe to draft state changes
const unsubscribe = useDraftStore.subscribe(
  (state) => state.draftedPlayers,
  (draftedPlayers, previousDraftedPlayers) => {
    // Only recalculate if players changed
    if (draftedPlayers.length !== previousDraftedPlayers.length) {
      const projections = useDraftStore.getState().projections;
      useInflationStore.getState().updateInflation(draftedPlayers, projections);
    }
  }
);
```

#### Integration Hook

```typescript
export function useInflationIntegration() {
  const draftedPlayers = useDraftStore(state => state.draftedPlayers);
  const projections = useDraftStore(state => state.projections);
  const updateInflation = useInflationStore(state => state.updateInflation);

  // Trigger recalculation when drafted players change
  useEffect(() => {
    if (projections.length > 0) {
      updateInflation(draftedPlayers, projections);
    }
  }, [draftedPlayers.length, projections, updateInflation]);
}
```

#### Non-Blocking Updates

```typescript
// Use requestIdleCallback or setTimeout for non-blocking updates
const updateInflation = (draftedPlayers, projections) => {
  requestIdleCallback(() => {
    // Perform calculations during idle time
    calculateAndUpdateInflation(draftedPlayers, projections);
  });
};
```

---

## Tasks / Subtasks

- [x] **Task 1: Create Draft Store Integration**
  - [x] Create `src/features/inflation/hooks/useInflationIntegration.ts`
  - [x] Subscribe to draft store changes
  - [x] Trigger inflation updates on player draft

- [x] **Task 2: Implement Zustand Subscription**
  - [x] Use Zustand subscribe API
  - [x] Compare previous and current state
  - [x] Only recalculate when players change

- [x] **Task 3: Ensure Non-Blocking Updates**
  - [x] Use requestIdleCallback or similar
  - [x] Don't block UI during calculation
  - [x] Show loading indicator if needed

- [x] **Task 4: Handle Draft Store Dependency**
  - [x] Create placeholder draft store if needed
  - [x] Define DraftedPlayer interface
  - [x] Connect to actual draft store when available

- [x] **Task 5: Performance Optimization**
  - [x] Debounce rapid updates
  - [x] Memoize unchanged projections
  - [x] Verify <2 second recalculation

- [x] **Task 6: Write Tests**
  - [x] Test automatic recalculation on draft
  - [x] Test subscription setup/teardown
  - [x] Test non-blocking behavior
  - [x] Performance test
  - [x] Test edge cases (empty draft, full draft)

---

## Dev Notes

### Implementation Approach

1. Create integration hook that connects stores
2. Set up Zustand subscription for draft changes
3. Ensure non-blocking updates using requestIdleCallback
4. Add debouncing for rapid successive updates
5. Write integration tests

### Store Connection Pattern

The inflation store doesn't directly depend on the draft store. Instead, an integration layer connects them:

```
Draft Store  -->  Integration Hook  -->  Inflation Store
     |                  |                      |
  draftedPlayers    useEffect          updateInflation()
     change         triggers               recalculates
```

### Non-Blocking Strategy

For large player pools, calculations can take time. Use browser scheduling APIs to prevent UI freezes:

```typescript
// Prefer requestIdleCallback for non-urgent updates
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => updateInflation(...));
} else {
  // Fallback to setTimeout
  setTimeout(() => updateInflation(...), 0);
}
```

### Debouncing Rapid Updates

During fast-paced drafts, multiple players may be drafted in quick succession:

```typescript
const debouncedUpdate = useMemo(
  () => debounce((players, projections) => {
    updateInflation(players, projections);
  }, 100), // 100ms debounce
  [updateInflation]
);
```

---

**Status:** Ready for Implementation
**Epic:** 5 of 13
**Story:** 8 of 8 in Epic 5
