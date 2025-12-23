# Story 5.6: Calculate Dynamic Adjusted Player Values

**Story ID:** 5.6
**Story Key:** 5-6-calculate-dynamic-adjusted-player-values
**Epic:** Epic 5 - Core Inflation Engine
**Status:** done

---

## Story

As a **developer**,
I want to combine overall, position, tier, and budget depletion factors to produce adjusted values for all remaining players,
So that users see inflation-adjusted values in real-time.

---

## Acceptance Criteria

**Given** inflation state is calculated (overall, position, tier, budget depletion)
**When** I call `calculateAdjustedValues(players, inflationState)`
**Then** each remaining player receives an `adjustedValue` based on their projected value + relevant inflation factors
**And** the formula applies: `adjustedValue = projectedValue * (1 + positionInflation) * (1 + tierInflation) * budgetDepletionFactor`
**And** adjusted values are rounded to whole dollars
**And** the function processes 2000+ players in <2 seconds (NFR-P1)
**And** adjusted values are never negative
**And** tests validate adjusted value accuracy against known inflation scenarios

---

## Developer Context

### Story Foundation from Epic

From **Epic 5: Core Inflation Engine** (docs/epics-stories.md lines 673-688):

This story brings together all the inflation factors to calculate dynamic adjusted values for every player. This is the culmination of the inflation engine - producing the actionable values that users see during drafts.

**Core Responsibilities:**

- **Value Synthesis:** Combine position, tier, and depletion factors
- **Formula Application:** Apply multiplicative inflation formula
- **Performance:** Process 2000+ players in <2 seconds
- **Value Safety:** Ensure non-negative adjusted values

**Relationship to Epic 5:**

This is Story 6 of 8 in Epic 5. It depends on:
- **Story 5.1** (Complete): PlayerValue type and InflationState type
- **Story 5.2** (Complete): Overall inflation rate
- **Story 5.3** (Complete): Position-specific inflation rates
- **Story 5.4** (Complete): Tier-specific inflation rates
- **Story 5.5** (Complete): Budget depletion factor

It enables:
- **Story 5.7**: Inflation store (stores adjusted values)
- **Story 5.8**: Draft integration (displays adjusted values)

### Technical Requirements

#### Core Function Signature

```typescript
export function calculateAdjustedValues(
  players: PlayerProjection[],
  inflationState: InflationState
): Map<string, number> {
  // Returns Map<playerId, adjustedValue>
}
```

#### Adjusted Value Formula

```typescript
// For each undrafted player:
const positionInflation = inflationState.positionRates[player.position];
const tierInflation = inflationState.tierRates[player.tier];
const depletionFactor = calculateBudgetDepletionFactor(...);

const adjustedValue = Math.max(
  0, // Never negative
  Math.round(
    player.projectedValue
    * (1 + positionInflation)
    * (1 + tierInflation)
    * depletionFactor.multiplier
  )
);
```

---

## Tasks / Subtasks

- [x] **Task 1: Implement calculateAdjustedValues**
  - [x] Create function in inflationCalculations.ts
  - [x] Accept players array and inflation state
  - [x] Return Map<playerId, adjustedValue>

- [x] **Task 2: Apply Inflation Formula**
  - [x] Get position inflation for each player
  - [x] Get tier inflation for each player
  - [x] Get budget depletion factor
  - [x] Apply multiplicative formula

- [x] **Task 3: Handle Value Safety**
  - [x] Round to whole dollars
  - [x] Ensure non-negative values (Math.max(0, ...))
  - [x] Handle missing position/tier data

- [x] **Task 4: Performance Optimization**
  - [x] Use efficient Map structure
  - [x] Pre-calculate common factors
  - [x] Verify <2 seconds for 2000+ players

- [x] **Task 5: Multi-Position Player Handling**
  - [x] Use primary position for inflation lookup
  - [x] Or calculate average of all eligible positions

- [x] **Task 6: Write Tests**
  - [x] Test formula accuracy with known inputs
  - [x] Test non-negative constraint
  - [x] Test rounding behavior
  - [x] Performance test (2000+ players in <2s)
  - [x] Test edge cases (0 projected value, extreme inflation)

---

## Dev Notes

### Implementation Approach

1. Iterate through all undrafted players
2. Look up position and tier inflation rates
3. Apply multiplicative formula with depletion factor
4. Round and ensure non-negative
5. Return as Map for O(1) lookups

### Performance Considerations

- Pre-calculate depletion factor once (same for all players)
- Use Map for efficient storage and retrieval
- Consider batch processing if needed

### Formula Breakdown

```
adjustedValue = projectedValue
  * (1 + positionInflation)   // Position scarcity adjustment
  * (1 + tierInflation)       // Tier demand adjustment
  * depletionFactor           // Budget availability adjustment
```

---

**Status:** Ready for Implementation
**Epic:** 5 of 13
**Story:** 6 of 8 in Epic 5
