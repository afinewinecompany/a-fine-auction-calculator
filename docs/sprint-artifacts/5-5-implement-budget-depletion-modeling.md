# Story 5.5: Implement Budget Depletion Modeling

**Story ID:** 5.5
**Story Key:** 5-5-implement-budget-depletion-modeling
**Epic:** Epic 5 - Core Inflation Engine
**Status:** done

---

## Story

As a **developer**,
I want to model how budget depletion affects late-draft valuations,
So that player values adjust as available money decreases.

---

## Acceptance Criteria

**Given** draft progress data (total budget, money spent, players remaining)
**When** I call `calculateBudgetDepletionFactor(totalBudget, spent, playersRemaining)`
**Then** the function returns a depletion multiplier that reduces values as budgets run low
**And** early in the draft (10% spent), the multiplier is near 1.0 (no adjustment)
**And** late in the draft (90% spent), the multiplier is <1.0 (values deflate)
**And** the function accounts for roster spots remaining vs. budget remaining
**And** the calculation prevents negative adjusted values
**And** the function completes in <10ms

---

## Developer Context

### Story Foundation from Epic

From **Epic 5: Core Inflation Engine** (docs/epics-stories.md lines 655-670):

This story implements budget depletion modeling, which adjusts player values based on how much money remains in the draft. As teams exhaust their budgets, remaining players' effective values decrease because there's less money available to bid.

**Core Responsibilities:**

- **Depletion Factor:** Calculate a 0.0-1.0+ multiplier based on budget state
- **Draft Progress Awareness:** Consider money spent vs. roster spots filled
- **Value Protection:** Prevent negative adjusted values
- **Performance:** <10ms calculation time

**Relationship to Epic 5:**

This is Story 5 of 8 in Epic 5. It depends on:
- **Story 5.1** (Complete): BudgetDepletionFactor type
- **Story 5.2** (Complete): Basic calculation patterns

It enables:
- **Story 5.6**: Dynamic adjusted values (uses depletion factor)
- **Story 5.7**: Inflation store (stores depletion data)

### Technical Requirements

#### Core Function Signature

```typescript
export function calculateBudgetDepletionFactor(
  totalBudget: number,
  spent: number,
  playersRemaining: number,
  totalRosterSpots: number
): BudgetDepletionFactor {
  // Returns { multiplier, spent, remaining, slotsRemaining }
}
```

#### Depletion Formula

```typescript
// Calculate budget per remaining player
const budgetRemaining = totalBudget - spent;
const slotsRemaining = totalRosterSpots - playersDrafted;
const avgBudgetPerSlot = totalBudget / totalRosterSpots;
const currentBudgetPerSlot = budgetRemaining / slotsRemaining;

// Depletion factor: ratio of current to average budget per slot
// >1.0 means more money available than average (values should increase)
// <1.0 means less money available than average (values should decrease)
const multiplier = currentBudgetPerSlot / avgBudgetPerSlot;
```

---

## Tasks / Subtasks

- [x] **Task 1: Define BudgetDepletionFactor Interface**
  - [x] Verify interface exists in inflation.types.ts
  - [x] Add multiplier, spent, remaining, slotsRemaining fields

- [x] **Task 2: Implement calculateBudgetDepletionFactor**
  - [x] Create function in inflationCalculations.ts
  - [x] Calculate budget remaining
  - [x] Calculate slots remaining
  - [x] Compute depletion multiplier

- [x] **Task 3: Handle Edge Cases**
  - [x] No slots remaining (end of draft)
  - [x] No budget remaining
  - [x] Zero division protection
  - [x] Negative values prevention

- [x] **Task 4: Implement Multiplier Bounds**
  - [x] Cap multiplier at reasonable bounds (e.g., 0.1 to 2.0)
  - [x] Document why bounds exist

- [x] **Task 5: Write Tests**
  - [x] Test early draft (10% spent) near 1.0
  - [x] Test late draft (90% spent) < 1.0
  - [x] Test mid-draft scenarios
  - [x] Test edge cases
  - [x] Performance test (<10ms)

---

## Dev Notes

### Implementation Approach

1. Calculate remaining budget and roster slots
2. Compare current budget-per-slot to average
3. Return depletion multiplier with bounds
4. Ensure no negative values possible

### Depletion Scenarios

- **Early Draft (10% spent):** Multiplier ~1.0, values unchanged
- **Mid Draft (50% spent):** Multiplier depends on spending pace
- **Late Draft (90% spent):** Multiplier <1.0, values deflate
- **Over-budget pace:** Multiplier >1.0 temporarily

---

**Status:** Ready for Implementation
**Epic:** 5 of 13
**Story:** 5 of 8 in Epic 5
