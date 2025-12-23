# Story 5.3: Implement Position-Specific Inflation Tracking

**Story ID:** 5.3
**Story Key:** 5-3-implement-position-specific-inflation-tracking
**Epic:** Epic 5 - Core Inflation Engine
**Status:** Done

---

## Story

As a **developer**,
I want to calculate inflation rates independently for each position (C, 1B, 2B, SS, 3B, OF, SP, RP, UT),
So that position scarcity is accurately modeled.

---

## Acceptance Criteria

**Given** players are drafted at different positions
**When** I call `calculatePositionInflation(draftedPlayers, projections)`
**Then** the function returns an object mapping each position to its inflation rate
**And** positions with no drafted players return 0% inflation
**And** the function handles multi-position players by apportioning inflation across eligible positions
**And** the calculation is independent for each position (OF inflation doesn't affect SS inflation)
**And** the function completes in <100ms
**And** tests validate position-specific rates against mock draft data

---

## Developer Context

### Story Foundation from Epic

From **Epic 5: Core Inflation Engine** (docs/epics-stories.md lines 619-634):

This story implements position-specific inflation tracking, allowing the system to model position scarcity accurately. Different positions inflate at different rates based on supply and demand during the draft.

**Core Responsibilities:**

- **Position-Specific Rates:** Calculate independent inflation for each of 9 positions (added UT for Utility/DH)
- **Multi-Position Handling:** Apportion inflation for players eligible at multiple positions
- **Independence:** Position rates don't affect each other
- **Performance:** <100ms calculation time

**Relationship to Epic 5:**

This is Story 3 of 8 in Epic 5. It depends on:
- **Story 5.1** (Complete): Position type and PositionInflationRate type
- **Story 5.2** (Complete): Basic inflation calculation pattern

It enables:
- **Story 5.6**: Dynamic adjusted values (uses position rates)
- **Story 5.7**: Inflation store (stores position rates)

### Technical Requirements

#### Core Function Signature

```typescript
export function calculatePositionInflation(
  draftedPlayers: PositionDraftedPlayerInput[],
  projections: PositionProjectionInput[]
): PositionInflationRate {
  // Returns Record<Position, number> with inflation rate per position
}
```

#### Multi-Position Player Handling

```typescript
// For players with multiple positions (e.g., 2B/SS)
// Split their value equally across eligible positions
const positions = player.positions; // ['2B', 'SS']
const valuePerPosition = player.auctionPrice / positions.length;
```

---

## Tasks / Subtasks

- [x] **Task 1: Implement calculatePositionInflation**
  - [x] Create function in `src/features/inflation/utils/inflationCalculations.ts`
  - [x] Group drafted players by position
  - [x] Calculate inflation rate per position

- [x] **Task 2: Handle All 9 Positions**
  - [x] C, 1B, 2B, SS, 3B, OF, SP, RP, UT
  - [x] Initialize all positions to 0
  - [x] Return complete PositionInflationRate object

- [x] **Task 3: Multi-Position Player Logic**
  - [x] Detect multi-position players
  - [x] Split value across eligible positions
  - [x] Document apportioning strategy

- [x] **Task 4: Handle Edge Cases**
  - [x] Position with no drafted players returns 0
  - [x] Empty projections for position
  - [x] Players with unknown positions

- [x] **Task 5: Write Tests**
  - [x] Test single-position player inflation
  - [x] Test multi-position player inflation
  - [x] Test position independence
  - [x] Test empty position handling
  - [x] Performance test with large dataset

---

## Dev Notes

### Implementation Approach

1. Group players by position
2. For each position, calculate position-specific inflation
3. Handle multi-position players by splitting values
4. Return complete PositionInflationRate object

### Multi-Position Strategy

Players with multiple positions have their actual/projected values split equally across all eligible positions. This prevents double-counting while still reflecting their impact on each position's market.

---

## Dev Agent Record

### Implementation Plan

1. Extended Position type to include UT (Utility) for DH/flex positions per user request
2. Created `PositionDraftedPlayerInput` and `PositionProjectionInput` interfaces that extend base types with `positions` array
3. Implemented `calculatePositionInflation` function with:
   - O(n) complexity using Map for projection lookups
   - Position filtering using `isPosition` type guard
   - Equal value splitting for multi-position players
   - Division-by-zero protection returning 0

### Debug Log

- No issues encountered during implementation
- All 19 new tests pass
- Updated existing type tests from 8 to 9 positions for UT addition

### Completion Notes

- Added UT (Utility) position to cover DH and flex positions
- Updated `POSITIONS` array and `createDefaultPositionRates()` factory function
- Created comprehensive test suite with 19 test cases covering:
  - Basic position-specific inflation (3 tests)
  - All 9 positions handling (3 tests)
  - Multi-position player handling (4 tests)
  - Edge cases (5 tests)
  - Position independence (2 tests)
  - Performance (<100ms with 300+ players) (2 tests)
- All 55 inflation-related tests pass

---

## File List

### New Files

- `tests/features/inflation/positionInflation.test.ts` - 19 test cases for position-specific inflation

### Modified Files

- `src/features/inflation/types/inflation.types.ts` - Added UT position, updated POSITIONS array and createDefaultPositionRates
- `src/features/inflation/utils/inflationCalculations.ts` - Added calculatePositionInflation function and input types
- `tests/features/inflation/types.test.ts` - Updated tests for 9 positions instead of 8

---

## Change Log

- **2025-12-17**: Implemented position-specific inflation calculation with UT position support and comprehensive tests
- **2025-12-17**: Code review fixes applied:
  - Added missing exports (`calculatePositionInflation`, `PositionDraftedPlayerInput`, `PositionProjectionInput`) to module index
  - Fixed prettier linting error in inflationCalculations.ts
  - Updated test imports to use public module API instead of internal files
  - Added console warning for data quality issues (actual spending with $0 projected value)

---

**Status:** Done
**Epic:** 5 of 13
**Story:** 3 of 8 in Epic 5
