# Story 5.2: Implement Basic Inflation Calculation

**Story ID:** 5.2
**Story Key:** 5-2-implement-basic-inflation-calculation
**Epic:** Epic 5 - Core Inflation Engine
**Status:** Ready for Review

---

## Story

As a **developer**,
I want to implement the core inflation calculation algorithm,
So that overall inflation rate can be computed based on actual vs. projected spending.

---

## Acceptance Criteria

**Given** I have draft data with actual auction prices and projected values
**When** I call `calculateOverallInflation(draftedPlayers, projections)`
**Then** the function calculates: `totalActualSpent - totalProjectedSpent`
**And** the function returns the inflation rate as a percentage
**And** the function handles edge cases (no players drafted, division by zero)
**And** the calculation completes in <100ms for 200+ drafted players
**And** the function is in `src/features/inflation/utils/inflationCalculations.ts`
**And** the function has >90% test coverage per Architecture requirements

---

## Developer Context

### Story Foundation from Epic

From **Epic 5: Core Inflation Engine** (docs/epics-stories.md lines 607-616):

This story implements the core inflation calculation algorithm that computes overall inflation rate based on actual vs. projected spending. This is the foundation for all inflation calculations in the application.

**Core Responsibilities:**

- **Inflation Algorithm:** Calculate overall inflation as (actualSpent - projectedSpent) / projectedSpent
- **Performance:** Complete calculation in <100ms for 200+ players
- **Edge Cases:** Handle no players drafted, division by zero, negative values
- **Test Coverage:** >90% test coverage per Architecture requirements

**Relationship to Epic 5:**

This is Story 2 of 8 in Epic 5. It depends on:
- **Story 5.1** (Complete): InflationState and related types

It enables:
- **Story 5.3**: Position-specific inflation (extends this algorithm)
- **Story 5.4**: Tier-specific inflation (extends this algorithm)
- **Story 5.6**: Dynamic adjusted values (uses overall rate)
- **Story 5.7**: Inflation store (calls this function)

### Technical Requirements

#### Core Function Signature

```typescript
export function calculateOverallInflation(
  draftedPlayers: DraftedPlayer[],
  projections: PlayerProjection[]
): number {
  // Returns inflation rate as decimal (e.g., 0.15 = 15% inflation)
}
```

#### Calculation Formula

```typescript
// Basic inflation formula
const totalActualSpent = draftedPlayers.reduce((sum, p) => sum + p.auctionPrice, 0);
const totalProjectedSpent = draftedPlayers.reduce((sum, p) => {
  const projection = projections.find(proj => proj.playerId === p.playerId);
  return sum + (projection?.projectedValue ?? 0);
}, 0);

// Avoid division by zero
if (totalProjectedSpent === 0) return 0;

const inflationRate = (totalActualSpent - totalProjectedSpent) / totalProjectedSpent;
return inflationRate;
```

---

## Tasks / Subtasks

- [x] **Task 1: Create Utils Directory**
  - [x] Create `src/features/inflation/utils/` directory
  - [x] Create `src/features/inflation/utils/inflationCalculations.ts`

- [x] **Task 2: Define Supporting Types**
  - [x] Define `DraftedPlayerInput` interface (playerId, auctionPrice)
  - [x] Define `ProjectionInput` interface (playerId, projectedValue)

- [x] **Task 3: Implement calculateOverallInflation**
  - [x] Calculate total actual spent
  - [x] Calculate total projected spent
  - [x] Handle division by zero
  - [x] Return inflation rate as decimal

- [x] **Task 4: Handle Edge Cases**
  - [x] Empty draftedPlayers array returns 0
  - [x] Missing projection returns 0 for that player
  - [x] Negative values handled gracefully

- [x] **Task 5: Performance Optimization**
  - [x] Use efficient lookup (Map) for projections
  - [x] Verify <100ms for 200+ players (test passes in ~2ms)

- [x] **Task 6: Write Tests**
  - [x] Create `tests/features/inflation/inflationCalculations.test.ts`
  - [x] Test basic inflation calculation
  - [x] Test edge cases (empty array, division by zero)
  - [x] Test performance with large datasets
  - [x] Achieve >90% test coverage (14 tests covering all code paths)

---

## Dev Notes

### Implementation Approach

1. Create utility file structure
2. Define helper types
3. Implement core calculation
4. Add edge case handling
5. Optimize for performance
6. Write comprehensive tests

### Performance Considerations

- Use Map for O(1) projection lookups instead of array.find()
- Single-pass calculation where possible
- Memoize results if same inputs

---

## Dev Agent Record

### Implementation Plan

- Used red-green-refactor TDD approach
- Created minimal input interfaces (`DraftedPlayerInput`, `ProjectionInput`) for flexibility
- Optimized with Map for O(1) projection lookups instead of O(n) array.find()
- Comprehensive edge case handling for division by zero, null values, missing projections

### Debug Log

- Initial test failure: Vitest globals import issue (used `import { describe, it, expect } from 'vitest'` instead of relying on globals)
- Fixed by removing explicit vitest import and using globals as configured

### Completion Notes

✅ Implemented `calculateOverallInflation` function with full edge case handling
✅ Performance verified: <100ms for 200+ players (actual: ~2ms for 250 players)
✅ 14 comprehensive tests covering all code paths
✅ Exported from inflation module index for easy imports

---

## File List

### New Files
- `src/features/inflation/utils/inflationCalculations.ts` - Core inflation calculation utility
- `tests/features/inflation/inflationCalculations.test.ts` - Comprehensive test suite

### Modified Files
- `src/features/inflation/index.ts` - Added exports for new calculation function and types
- `src/features/inflation/types/inflation.types.ts` - Added DraftedPlayerInput and ProjectionInput interfaces

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-17 | Implemented basic inflation calculation with TDD | Dev Agent |
| 2025-12-17 | Code review fixes: moved types, added validation warnings, improved JSDoc | Code Review |

---

## Senior Developer Review (AI)

**Review Date:** 2025-12-17
**Reviewer:** Claude Code Review Agent
**Outcome:** ✅ APPROVED (with fixes applied)

### Issues Found & Fixed

| Severity | Issue | Resolution |
|----------|-------|------------|
| MEDIUM | M1: No validation for negative auction prices | Added console.warn for negative prices |
| MEDIUM | M2: Edge case return value ambiguity | Improved @returns JSDoc documentation |
| MEDIUM | M3: Missing @throws documentation | Added @remarks documenting no-throw behavior |
| MEDIUM | M4: Input types in wrong location | Moved to types/inflation.types.ts per architecture |

### Low Priority Items (Not Fixed)

| Severity | Issue | Notes |
|----------|-------|-------|
| LOW | L1: Null projections treated as 0 | Documented behavior, acceptable tradeoff |
| LOW | L2: Non-deterministic performance test | Math.random acceptable for perf tests |
| LOW | L3: No large number overflow test | Unlikely in practice |

### Verification

- ✅ All 14 tests passing
- ✅ 100% test coverage maintained
- ✅ Type checking passes
- ✅ Lint passes (no new warnings)
- ✅ All ACs verified implemented
- ✅ All tasks verified complete

---

**Status:** Done
**Epic:** 5 of 13
**Story:** 2 of 8 in Epic 5
