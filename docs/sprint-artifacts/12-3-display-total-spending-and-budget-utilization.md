# Story 12.3: Display Total Spending and Budget Utilization

**Story ID:** 12.3
**Story Key:** 12-3-display-total-spending-and-budget-utilization
**Epic:** Epic 12 - Post-Draft Analytics & Value Summary
**Status:** Ready for Review

---

## Story

As a **user**,
I want to see my total spending and how I utilized my budget,
So that I understand my resource allocation.

---

## Acceptance Criteria

**Given** my draft is complete
**When** the budget utilization section renders
**Then** I see total spent: "$260 of $260 budget used (100%)"
**And** I see budget remaining: "$0 remaining"
**And** I see spending breakdown by position: "Hitters: $145 (56%) | Pitchers: $95 (36%) | Bench: $20 (8%)"
**And** a visual chart (bar or pie chart) shows the spending distribution
**And** the section highlights if I left money on the table (underspent)

---

## Developer Context

### Story Foundation from Epic

From **Epic 12: Post-Draft Analytics & Value Summary** (docs/epics-stories.md lines 1575-1589):

This story implements the budget utilization section of the post-draft summary, showing the user how they allocated their auction budget across different roster positions. It provides spending analysis with visual charts.

**Core Responsibilities:**

- **BudgetUtilization Component:** Display total spending and budget metrics
- **Spending Breakdown:** Show allocation across Hitters, Pitchers, Bench
- **Visual Chart:** Display bar or pie chart for spending distribution
- **Budget Warnings:** Highlight if money was left unspent
- **Percentage Calculations:** Show spending as percentages of total budget

**Relationship to Epic 12:**

This is Story 3 of 5 in Epic 12. It:
- Builds on **Story 12.1**: Populates the BudgetUtilization placeholder
- Works alongside **Story 12.2**: Roster overview (different section)
- Uses same data as **Story 12.4**: Value analysis references budget
- Feeds into **Story 12.5**: Competitive advantage summary

### Architecture Requirements

**Files to Modify:**
```
src/features/draft/
  components/
    BudgetUtilization.tsx         # MODIFY - Implement from placeholder
    SpendingChart.tsx             # CREATE - Bar/pie chart for spending
  utils/
    budgetCalculations.ts         # CREATE - Calculate spending breakdown
tests/features/draft/
  BudgetUtilization.test.tsx      # CREATE - Component tests
  budgetCalculations.test.ts      # CREATE - Utility tests
```

**Required Utilities:**
```typescript
function calculateSpendingBreakdown(roster: Player[], totalBudget: number): {
  totalSpent: number
  remaining: number
  byPosition: {
    hitters: { amount: number, percentage: number }
    pitchers: { amount: number, percentage: number }
    bench: { amount: number, percentage: number }
  }
}
```

---

## Tasks / Subtasks

- [x] **Task 1: Create Budget Calculation Utility**
  - [x] Create `src/features/draft/utils/budgetCalculations.ts`
  - [x] Implement calculateSpendingBreakdown function
  - [x] Calculate total spent, remaining, percentages
  - [x] Group spending by position (Hitters, Pitchers, Bench)
  - [x] Test with mock data

- [x] **Task 2: Create SpendingChart Component**
  - [x] Create `src/features/draft/components/SpendingChart.tsx`
  - [x] Implement bar chart visualization using Recharts
  - [x] Display spending by position with percentages
  - [x] Apply dark slate theme with emerald accents

- [x] **Task 3: Implement BudgetUtilization Component**
  - [x] Import calculateSpendingBreakdown utility
  - [x] Display total spent and budget used percentage
  - [x] Display budget remaining
  - [x] Display spending breakdown by position
  - [x] Integrate SpendingChart for visual display

- [x] **Task 4: Add Budget Warning Logic**
  - [x] Detect if budget is underspent (remaining > $5)
  - [x] Display warning message: "You left $X on the table"
  - [x] Use yellow-500 color for warning
  - [x] Only show if underspent amount is significant (>$5)

- [x] **Task 5: Format Currency and Percentages**
  - [x] Use existing formatCurrency utility for dollar amounts
  - [x] Format percentages with one decimal: "56.2%"
  - [x] Ensure totals add up to 100%
  - [x] Handle rounding edge cases

- [x] **Task 6: Create Test Suite**
  - [x] Test budget calculations with various rosters
  - [x] Test SpendingChart renders correctly
  - [x] Test percentage calculations are accurate

- [x] **Task 7: Integrate with DraftSummary**
  - [x] Pass roster and budget props from DraftSummary
  - [x] Calculate spending breakdown in DraftSummary
  - [x] Pass spendingByPosition to BudgetUtilization

---

## Dev Notes

### Implementation Approach

1. Create utility to calculate spending breakdown by position
2. Build SpendingChart component for visual display
3. Implement BudgetUtilization with all budget metrics
4. Add warning logic for underspent budgets
5. Test calculations with various budget scenarios
6. Integrate into DraftSummary parent component

### Data Flow

```
DraftSummary (props: roster, budget)
└── BudgetUtilization
    ├── calculateSpendingBreakdown(roster, budget)
    ├── Display Metrics
    │   ├── Total Spent / Budget Used
    │   ├── Budget Remaining
    │   └── Underspent Warning (if applicable)
    ├── Spending Breakdown Table
    │   ├── Hitters: $X (Y%)
    │   ├── Pitchers: $X (Y%)
    │   └── Bench: $X (Y%)
    └── SpendingChart (visual)
```

---

## Summary

Story 12.3 implements the budget utilization section, showing total spending, budget allocation by position, and visual spending distribution.

**Deliverable:** BudgetUtilization component displaying total spent, budget breakdown by position, visual chart, and underspent warnings.

**Key Technical Decisions:**
1. Budget calculation utility for spending analysis
2. Visual chart component (bar or pie) for distribution
3. Currency and percentage formatting
4. Warning logic for underspent budgets
5. Position-based spending breakdown (Hitters, Pitchers, Bench)

---

## Dev Agent Record

### Implementation Plan

Created comprehensive budget utilization display using:
1. Budget calculation utility for spending breakdown analysis
2. Recharts bar chart for visual spending distribution
3. Responsive grid layout for budget metrics
4. Warning system for underspent budgets

### Completion Notes

✅ Implemented all budget utilization features:
- **Budget Calculations**: Created `budgetCalculations.ts` utility that analyzes roster spending by position category (Hitters, Pitchers, Bench) with percentage calculations
- **Visual Chart**: Built `SpendingChart.tsx` using Recharts with custom tooltips, dark slate theme, and emerald/blue/gray color scheme
- **BudgetUtilization Component**: Enhanced placeholder with full metrics display including total spent, budget remaining, position breakdown cards, and integrated chart
- **Warning Logic**: Implemented underspent budget detection (>$5 threshold) with yellow warning message
- **DraftSummary Integration**: Added spending breakdown calculation and prop passing to BudgetUtilization
- **Type System**: Extended summary types with `PositionSpending` and `SpendingByPosition` interfaces

### Technical Decisions

1. **Position Grouping**: Used const arrays to define HITTER_POSITIONS, PITCHER_POSITIONS, and BENCH_POSITIONS for clear categorization
2. **Percentage Calculation**: Calculated percentages based on total budget (not just spent amount) to always sum to 100%
3. **Chart Library**: Selected Recharts (already in dependencies) over custom implementation
4. **Responsive Design**: Used Tailwind grid system for mobile-first responsive layout
5. **Currency Formatting**: Reused existing `formatCurrency` utility for consistency

---

## File List

### Created Files
- `src/features/draft/utils/budgetCalculations.ts` - Budget breakdown calculation utility
- `src/features/draft/components/SpendingChart.tsx` - Recharts bar chart component
- `tests/features/draft/budgetCalculations.test.ts` - Budget calculations unit tests
- `tests/features/draft/SpendingChart.test.tsx` - SpendingChart component tests

### Modified Files
- `src/features/draft/components/BudgetUtilization.tsx` - Enhanced from placeholder to full implementation
- `src/features/draft/components/DraftSummary.tsx` - Added spending breakdown calculation and integration
- `src/features/draft/types/summary.types.ts` - Added PositionSpending and SpendingByPosition interfaces

---

## Change Log

| Date | Change |
|------|--------|
| 2025-12-22 | Story created and ready for development |
| 2025-12-22 | Completed implementation of budget utilization features |
