# Story 5.4: Implement Tier-Specific Inflation Tracking

**Story ID:** 5.4
**Story Key:** 5-4-implement-tier-specific-inflation-tracking
**Epic:** Epic 5 - Core Inflation Engine
**Status:** Ready for Review

---

## Story

As a **developer**,
I want to calculate inflation rates for player tiers (Elite, Mid, Lower),
So that the "run on bank" theory is accurately modeled.

---

## Acceptance Criteria

**Given** players are assigned to tiers (Elite, Mid, Lower) based on projected value thresholds
**When** I call `calculateTierInflation(draftedPlayers, projections)`
**Then** the function returns inflation rates for each tier: `{ ELITE: 15%, MID: 22%, LOWER: -5% }`
**And** tier assignments are based on projected value percentiles (top 10% = Elite, 10-40% = Mid, 40%+ = Lower)
**And** tier inflation is calculated independently (Elite inflation doesn't directly affect Lower tier)
**And** the function handles the case where mid-tier players inflate faster than elite (as per PRD theory)
**And** the calculation completes in <100ms
**And** comprehensive tests cover all tier inflation scenarios

---

## Developer Context

### Story Foundation from Epic

From **Epic 5: Core Inflation Engine** (docs/epics-stories.md lines 637-652):

This story implements tier-specific inflation tracking based on the "run on bank" theory from the PRD. Mid-tier players often inflate faster than elite players because they represent the largest spending pool and owners compete heavily for perceived value.

**Core Responsibilities:**

- **Tier Classification:** Assign players to Elite (top 10%), Mid (10-40%), Lower (40%+) tiers
- **Tier-Specific Rates:** Calculate independent inflation for each tier
- **Theory Modeling:** Capture the "run on bank" effect where mid-tier inflates most
- **Performance:** <100ms calculation time

**Relationship to Epic 5:**

This is Story 4 of 8 in Epic 5. It depends on:
- **Story 5.1** (Complete): PlayerTier enum and TierInflationRate type
- **Story 5.2** (Complete): Basic inflation calculation pattern

It enables:
- **Story 5.6**: Dynamic adjusted values (uses tier rates)
- **Story 5.7**: Inflation store (stores tier rates)

### Technical Requirements

#### Tier Assignment Function

```typescript
export function assignPlayerTier(
  projectedValue: number,
  allProjections: PlayerProjection[]
): PlayerTier {
  const sortedValues = allProjections
    .map(p => p.projectedValue)
    .sort((a, b) => b - a);

  const percentile = getPercentile(projectedValue, sortedValues);

  if (percentile <= 10) return PlayerTier.ELITE;
  if (percentile <= 40) return PlayerTier.MID;
  return PlayerTier.LOWER;
}
```

#### Tier Inflation Function

```typescript
export function calculateTierInflation(
  draftedPlayers: DraftedPlayer[],
  projections: PlayerProjection[]
): TierInflationRate {
  // Returns { ELITE: number, MID: number, LOWER: number }
}
```

---

## Tasks / Subtasks

- [x] **Task 1: Implement Tier Assignment**
  - [x] Create `assignPlayerTier()` function
  - [x] Calculate percentile thresholds
  - [x] Top 10% = ELITE, 10-40% = MID, 40%+ = LOWER

- [x] **Task 2: Implement calculateTierInflation**
  - [x] Create function in inflationCalculations.ts
  - [x] Group drafted players by tier
  - [x] Calculate inflation rate per tier

- [x] **Task 3: Handle Edge Cases**
  - [x] Tier with no drafted players returns 0
  - [x] Very few players in pool
  - [x] Equal projected values (tie-breaking)

- [x] **Task 4: Document "Run on Bank" Theory**
  - [x] Add JSDoc explaining mid-tier inflation phenomenon
  - [x] Reference PRD requirements

- [x] **Task 5: Write Tests**
  - [x] Test tier assignment percentiles
  - [x] Test tier inflation calculation
  - [x] Test mid-tier > elite inflation scenario
  - [x] Test tier independence
  - [x] Performance test

---

## Dev Notes

### Implementation Approach

1. Create tier assignment function based on percentiles
2. Group drafted players by assigned tier
3. Calculate tier-specific inflation rates
4. Return TierInflationRate object

### "Run on Bank" Theory

The PRD describes how mid-tier players often inflate more than elite players:
- Elite players have fixed demand (only a few teams can afford)
- Mid-tier players attract competitive bidding from all teams
- Lower-tier players may deflate as teams preserve budget

---

## Dev Agent Record

### Implementation Plan

1. Added imports for TierInflationRate, createDefaultTierRates, PlayerTier, and PLAYER_TIERS to inflationCalculations.ts
2. Created TierDraftedPlayerInput and TierProjectionInput interfaces for type safety
3. Implemented getPercentile() helper function for percentile calculation
4. Implemented assignPlayerTier() function with percentile-based tier assignment
5. Implemented calculateTierInflation() function with tier-independent calculations
6. Added comprehensive JSDoc documentation explaining the "run on bank" theory
7. Exported new functions and types from the inflation module index

### Debug Log

- No issues encountered during implementation
- All 35 tier inflation tests pass
- Performance tests confirm <100ms execution for 300+ players
- Lint errors auto-fixed by prettier

### Completion Notes

Successfully implemented tier-specific inflation tracking:

- **getPercentile()**: Calculates percentile rank of a value within a sorted array
- **assignPlayerTier()**: Assigns players to ELITE (top 10%), MID (10-40%), or LOWER (40%+) tiers based on projected value percentiles
- **calculateTierInflation()**: Calculates inflation rates independently for each tier, modeling the "run on bank" theory where mid-tier players typically inflate fastest

Key features:

- O(n log n) complexity due to sorting, but still well under 100ms for 300+ players
- Tier independence: each tier's inflation calculated separately
- Handles edge cases: empty arrays, null values, pre-assigned tiers, ties
- Comprehensive JSDoc explaining the "run on bank" theory

---

## File List

### New Files

- tests/features/inflation/tierInflation.test.ts

### Modified Files

- src/features/inflation/utils/inflationCalculations.ts
- src/features/inflation/index.ts
- docs/sprint-artifacts/sprint-status.yaml

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-17 | Implemented tier-specific inflation tracking with getPercentile, assignPlayerTier, and calculateTierInflation functions | Dev Agent |
| 2025-12-17 | Added comprehensive test suite with 35 tests covering all tier inflation scenarios | Dev Agent |
| 2025-12-17 | Documented "run on bank" theory in JSDoc comments | Dev Agent |

---

**Status:** Ready for Review
**Epic:** 5 of 13
**Story:** 4 of 8 in Epic 5
