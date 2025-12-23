# Story 7.2: Display Real-Time Budget Tracking

**Story ID:** 7.2
**Story Key:** 7-2-display-real-time-budget-tracking
**Epic:** Epic 7 - Live Draft Experience - Budget & Roster Management
**Status:** ready-for-dev

---

## Story

As a **user**,
I want to monitor my remaining auction budget in real-time,
So that I know how much money I have left to spend.

---

## Acceptance Criteria

**Given** I am in an active draft
**When** the RosterPanel renders
**Then** I see my remaining budget prominently displayed: "$185 Remaining"
**And** I see total budget: "of $260 total"
**And** I see money spent: "$75 Spent"
**And** the budget updates immediately (<100ms) when I draft a player (NFR-P7)
**And** the remaining budget uses large, bold text (emerald-400 color)
**And** low budget triggers a visual warning (red color when <$20 remaining)

---

## Developer Context

### Story Foundation from Epic

From **Epic 7: Live Draft Experience - Budget & Roster Management** (docs/epics-stories.md lines 937-953):

This story implements the core budget tracking display within the RosterPanel. Users need to see their remaining budget at a glance during fast-paced auction drafts. The display must update instantly (<100ms) to maintain real-time awareness.

**Core Responsibilities:**

- **Prominent Budget Display:** Large, readable budget remaining text
- **Complete Budget Context:** Show total, spent, and remaining amounts
- **Real-Time Updates:** <100ms update latency after drafting a player
- **Visual Warnings:** Red color when budget is critically low (<$20)
- **Emerald Accent Styling:** Use emerald-400 for primary budget numbers

**Relationship to Epic 7:**

This is Story 2 of 8 in Epic 7. It depends on:
- **Story 7.1**: RosterPanel Component Foundation (provides container)

It enables:
- **Story 7.3**: Display Money Spent Breakdown by Position (extends budget section)
- **Story 7.4**: Display Spending Pace Indicator (uses budget data)

### Technical Requirements

#### Budget Display Component

```typescript
interface BudgetDisplayProps {
  total: number;
  spent: number;
  remaining: number;
}

// Component renders:
// "$185 Remaining" - Large, bold, emerald-400
// "of $260 total" - Smaller, slate-400
// "$75 Spent" - Medium, slate-300
```

#### Performance Requirement (NFR-P7)

Budget display must update in <100ms after a player is drafted. This requires:
- Direct subscription to draft store state
- Memoized components to prevent unnecessary re-renders
- No debouncing on budget calculations

#### Low Budget Warning

```typescript
const isLowBudget = remaining < 20;
const budgetColor = isLowBudget ? 'text-red-500' : 'text-emerald-400';
```

---

## Tasks / Subtasks

- [ ] **Task 1: Create BudgetDisplay Component**
  - [ ] Create `src/features/draft/components/BudgetDisplay.tsx`
  - [ ] Define `BudgetDisplayProps` interface
  - [ ] Add component header comments

- [ ] **Task 2: Implement Remaining Budget Display**
  - [ ] Display remaining budget with large, bold text
  - [ ] Apply emerald-400 color for positive budget
  - [ ] Format currency: "$185 Remaining"
  - [ ] Use responsive font sizes (text-3xl on desktop, text-2xl on mobile)

- [ ] **Task 3: Implement Total Budget Display**
  - [ ] Display total budget below remaining
  - [ ] Format: "of $260 total"
  - [ ] Use smaller text size (text-sm)
  - [ ] Apply slate-400 color

- [ ] **Task 4: Implement Spent Display**
  - [ ] Display money spent
  - [ ] Format: "$75 Spent"
  - [ ] Use medium text size (text-base)
  - [ ] Apply slate-300 color

- [ ] **Task 5: Implement Low Budget Warning**
  - [ ] Detect low budget condition (remaining < $20)
  - [ ] Change remaining text to red-500 when low
  - [ ] Optional: Add warning icon or animation
  - [ ] Test threshold behavior

- [ ] **Task 6: Connect to Draft Store**
  - [ ] Subscribe to budget state from draft store (Zustand)
  - [ ] Ensure updates trigger re-render
  - [ ] Memoize component to prevent excess re-renders

- [ ] **Task 7: Verify Performance**
  - [ ] Measure update latency after draft action
  - [ ] Ensure <100ms update time (NFR-P7)
  - [ ] Profile component with React DevTools

- [ ] **Task 8: Integrate with RosterPanel**
  - [ ] Import BudgetDisplay into RosterPanel
  - [ ] Place in Budget Summary section
  - [ ] Pass budget props from store

- [ ] **Task 9: Create Component Tests**
  - [ ] Create `tests/features/draft/BudgetDisplay.test.tsx`
  - [ ] Test correct currency formatting
  - [ ] Test low budget warning threshold
  - [ ] Test color changes based on budget state
  - [ ] Test prop type safety

---

## Dev Notes

### Implementation Approach

1. Create standalone BudgetDisplay component
2. Connect to Zustand draft store for real-time state
3. Implement conditional styling for low budget warning
4. Verify performance meets <100ms requirement
5. Integrate into RosterPanel Budget Summary section

### Currency Formatting

Use `Intl.NumberFormat` for consistent currency display:

```typescript
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
```

### Low Budget Threshold

The $20 threshold is based on typical auction draft dynamics where most players can be acquired for $1-$5 at the end of the draft. This threshold may be configurable in future iterations.

---

**Status:** Ready for Implementation
**Epic:** 7 of 13
**Story:** 2 of 8 in Epic 7
