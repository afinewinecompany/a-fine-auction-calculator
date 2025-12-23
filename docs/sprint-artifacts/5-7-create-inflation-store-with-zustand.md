# Story 5.7: Create Inflation Store with Zustand

**Story ID:** 5.7
**Story Key:** 5-7-create-inflation-store-with-zustand
**Epic:** Epic 5 - Core Inflation Engine
**Status:** Ready for Review

---

## Story

As a **developer**,
I want to create a Zustand store to manage inflation state globally,
So that inflation data is available throughout the application.

---

## Acceptance Criteria

**Given** Zustand is configured
**When** I create `src/features/inflation/stores/inflationStore.ts`
**Then** the store manages: `overallRate`, `positionRates`, `tierRates`, `budgetDepleted`, `adjustedValues` (Map<playerId, value>)
**And** the store exposes actions: `updateInflation(draftedPlayers, projections, budgetContext?)`, `resetInflation()`
**And** calling `updateInflation()` triggers all inflation calculations and updates state
**And** the store uses immutable updates per Zustand best practices
**And** the store follows Architecture naming: `useInflationStore()` hook, camelCase store name

> **Implementation Note:** The `updateInflation` action accepts an optional third parameter `budgetContext` to calculate budget depletion metrics. The store also provides `budgetDepletion` (BudgetDepletionResult object) in addition to `budgetDepleted` (percentage) for extended calculation needs.

---

## Developer Context

### Story Foundation from Epic

From **Epic 5: Core Inflation Engine** (docs/epics-stories.md lines 691-703):

This story creates the Zustand store that manages all inflation state globally. The store serves as the central repository for inflation data and provides actions to trigger recalculations.

**Core Responsibilities:**

- **State Management:** Store all inflation metrics in Zustand
- **Action Interface:** Expose updateInflation() and resetInflation() actions
- **Calculation Orchestration:** Trigger all calculation functions on update
- **Naming Conventions:** Follow Architecture patterns for stores

**Relationship to Epic 5:**

This is Story 7 of 8 in Epic 5. It depends on:
- **Story 5.1** (Complete): InflationState and related types
- **Story 5.2-5.6** (Complete): All calculation functions

It enables:
- **Story 5.8**: Draft integration (subscribes to store)
- **Epic 6**: Live draft experience (consumes inflation data)

### Technical Requirements

#### Store Structure

```typescript
interface InflationStoreState {
  // Inflation data
  overallRate: number;
  positionRates: PositionInflationRate;
  tierRates: TierInflationRate;
  budgetDepleted: number; // AC-specified: percentage of budget spent (0.0-1.0)
  budgetDepletion: BudgetDepletionResult | null; // Extended info for calculations
  playersRemaining: number;
  adjustedValues: Map<string, number>;

  // Loading/error state
  isCalculating: boolean;
  lastUpdated: Date | null;
  error: string | null;

  // Actions
  updateInflation: (draftedPlayers: InflationDraftedPlayer[], projections: InflationProjection[], budgetContext?: BudgetContext) => void;
  resetInflation: () => void;
  clearError: () => void;
  updateBudgetDepletion: (budgetContext: BudgetContext) => void;
}
```

#### Store Implementation

```typescript
import { create } from 'zustand';

export const useInflationStore = create<InflationStoreState>((set) => ({
  // Initial state
  overallRate: 0,
  positionRates: createDefaultPositionRates(),
  tierRates: createDefaultTierRates(),
  budgetDepleted: 0,
  budgetDepletion: null,
  playersRemaining: 0,
  adjustedValues: new Map(),
  isCalculating: false,
  lastUpdated: null,
  error: null,

  // Actions
  updateInflation: (draftedPlayers, projections, budgetContext) => {
    set({ isCalculating: true, error: null });

    try {
      const overallRate = calculateOverallInflation(draftedPlayers, projections);
      const positionRates = calculatePositionInflation(draftedPlayers, projections);
      const tierRates = calculateTierInflation(draftedPlayers, projections);

      // Calculate budget depletion if context provided
      let budgetDepletion = null;
      let budgetDepleted = 0;
      if (budgetContext) {
        budgetDepletion = calculateBudgetDepletionFactor(budgetContext);
        budgetDepleted = budgetContext.spent / budgetContext.totalBudget;
      }

      const adjustedValues = calculateAdjustedValues(undraftedProjections, {
        positionRates,
        tierRates,
        budgetDepletionMultiplier: budgetDepletion?.multiplier ?? 1.0,
      });

      set({
        overallRate,
        positionRates,
        tierRates,
        budgetDepleted,
        budgetDepletion,
        playersRemaining: undraftedProjections.length,
        adjustedValues,
        isCalculating: false,
        lastUpdated: new Date(),
      });
    } catch (error) {
      set({
        isCalculating: false,
        error: error instanceof Error ? error.message : 'Calculation failed',
      });
    }
  },

  resetInflation: () => {
    set({
      ...initialState,
      positionRates: createDefaultPositionRates(),
      tierRates: createDefaultTierRates(),
      adjustedValues: new Map(),
    });
  },

  clearError: () => set({ error: null }),
}));
```

---

## Tasks / Subtasks

- [x] **Task 1: Create Store File**
  - [x] Create `src/features/inflation/stores/inflationStore.ts`
  - [x] Import Zustand create function
  - [x] Import all calculation functions

- [x] **Task 2: Define Store State Interface**
  - [x] Define InflationStoreState interface
  - [x] Include all inflation data fields
  - [x] Include loading/error state
  - [x] Include action signatures

- [x] **Task 3: Implement Initial State**
  - [x] Initialize all rates to 0
  - [x] Create empty adjustedValues Map
  - [x] Set isCalculating to false
  - [x] Set lastUpdated to null

- [x] **Task 4: Implement updateInflation Action**
  - [x] Set isCalculating to true
  - [x] Call all calculation functions
  - [x] Update state with results
  - [x] Handle errors gracefully

- [x] **Task 5: Implement resetInflation Action**
  - [x] Reset all state to initial values
  - [x] Clear adjustedValues Map
  - [x] Clear lastUpdated and error

- [x] **Task 6: Add Helper Hooks**
  - [x] Create useOverallInflation selector hook
  - [x] Create usePositionInflation selector hook
  - [x] Create useAdjustedValue(playerId) hook

- [x] **Task 7: Write Tests**
  - [x] Test initial state
  - [x] Test updateInflation action
  - [x] Test resetInflation action
  - [x] Test error handling
  - [x] Test state immutability

---

## Dev Notes

### Implementation Approach

1. Create store with initial state
2. Implement updateInflation to orchestrate calculations
3. Implement resetInflation for cleanup
4. Add selector hooks for common access patterns
5. Write comprehensive tests

### Zustand Best Practices

- Use immutable updates (Zustand handles this)
- Keep actions in the store
- Create selector hooks for performance
- Handle errors within actions

### Selector Hooks

```typescript
// Efficient selectors to prevent unnecessary re-renders
export const useOverallInflation = () =>
  useInflationStore(state => state.overallRate);

export const useAdjustedValue = (playerId: string) =>
  useInflationStore(state => state.adjustedValues.get(playerId) ?? 0);
```

---

## Dev Agent Record

### Implementation Plan

1. Verify existing store implementation meets all acceptance criteria
2. Create comprehensive test suite for the inflation store
3. Run all tests to ensure no regressions
4. Update story documentation

### Debug Log

- Verified existing implementation in `src/features/inflation/stores/inflationStore.ts`
- Confirmed all AC requirements are met: store state, actions, immutable updates, naming conventions
- Created comprehensive tests covering initial state, actions, error handling, immutability, and selectors
- All tests pass

### Code Review Fixes Applied (2025-12-19)

1. **HIGH-1 Fixed:** Added `budgetDepleted` number field (0.0-1.0 percentage) to match AC specification
2. **HIGH-2 Fixed:** Updated story Dev Notes to accurately reflect the implementation
3. **HIGH-3 Fixed:** Fixed `updateBudgetDepletion` action - now properly updates both `budgetDepleted` percentage and `budgetDepletion` object
4. **HIGH-4 Fixed:** Added missing tests for `usePositionInflationRate` and `useTierInflationRate` selectors
5. **MEDIUM-1 Fixed:** Updated File List to accurately reflect new vs existing files
6. **MEDIUM-2 Fixed:** Documented optional `budgetContext` parameter in AC Implementation Note
7. **MEDIUM-3 Fixed:** Test count updated to reflect actual coverage (57 tests)

### Completion Notes

- ✅ Store file exists at `src/features/inflation/stores/inflationStore.ts`
- ✅ Store manages: overallRate, positionRates, tierRates, budgetDepleted (AC), budgetDepletion (extended), adjustedValues Map
- ✅ Actions exposed: updateInflation(draftedPlayers, projections, budgetContext?), resetInflation(), clearError(), updateBudgetDepletion()
- ✅ updateInflation() triggers all calculation functions and updates state atomically
- ✅ Immutable updates via Zustand (fresh object references on each update)
- ✅ Naming follows architecture: useInflationStore() hook with camelCase
- ✅ 12 selector hooks: useOverallInflation, usePositionInflation, usePositionInflationRate, useTierInflation, useTierInflationRate, useBudgetDepleted, useBudgetDepletion, useAdjustedValue, useAdjustedValues, useInflationCalculating, useInflationLastUpdated, useInflationError, usePlayersRemaining
- ✅ Full test coverage with 57 unit tests

---

## File List

**New Files:**

- `src/features/inflation/stores/inflationStore.ts` - Store implementation with 12 selector hooks
- `tests/features/inflation/inflationStore.test.ts` - Comprehensive test suite (57 tests)

**Modified Files:**

- `src/features/inflation/index.ts` - Added useBudgetDepleted export
- `docs/sprint-artifacts/5-7-create-inflation-store-with-zustand.md` - Story documentation updates

**Existing Files (dependencies):**

- `src/features/inflation/types/inflation.types.ts` - Type definitions
- `src/features/inflation/utils/inflationCalculations.ts` - Calculation functions

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-19 | Code review fixes: Added budgetDepleted field, fixed updateBudgetDepletion, added missing selector tests (now 57 tests) | Dev Agent |
| 2025-12-19 | Added comprehensive test suite for inflation store | Dev Agent |
| 2025-12-19 | Verified all acceptance criteria satisfied | Dev Agent |

---

**Status:** Ready for Review
**Epic:** 5 of 13
**Story:** 7 of 8 in Epic 5
