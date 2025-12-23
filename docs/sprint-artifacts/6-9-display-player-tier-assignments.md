# Story 6.9: Display Player Tier Assignments

**Story ID:** 6.9
**Story Key:** 6-9-display-player-tier-assignments
**Epic:** Epic 6 - Live Draft Experience - Player Discovery & Tracking
**Status:** review

---

## Story

As a **user**,
I want to view tier assignments (Elite, Mid, Lower) for each player in the queue,
So that I understand how inflation is being calculated.

---

## Acceptance Criteria

**Given** players have been assigned to tiers by the inflation engine
**When** the PlayerQueue renders
**Then** each player displays their tier badge (T1 = Elite, T2 = Mid, T3 = Lower)
**And** tier badges use consistent styling (small badge component from shadcn/ui)
**And** the tier is visible without requiring row expansion (always shown)
**And** hovering over the tier badge shows a tooltip explaining tier criteria
**And** tier assignments follow the percentile thresholds from Epic 5 (top 10% = Elite, etc.)

---

## Developer Context

### Story Foundation from Epic

From **Epic 6: Live Draft Experience - Player Discovery & Tracking** (docs/epics-stories.md lines 864-879):

This story implements tier badge display for players in the queue. Tiers (Elite/Mid/Lower) are used in inflation calculations, and users benefit from understanding which tier each player belongs to.

**Core Responsibilities:**

- **Tier Badge:** Display T1/T2/T3 for each player
- **Consistent Styling:** Use shadcn/ui Badge component
- **Tooltip:** Explain tier criteria on hover
- **Always Visible:** No row expansion needed

**Relationship to Epic 6:**

This is Story 9 of 11 in Epic 6. It depends on:
- **Story 6.2**: PlayerQueue component (displays tiers)
- **Epic 5 Stories 5.4**: Tier-specific inflation (provides tier data)

### Technical Requirements

#### Tier Types

```typescript
type PlayerTier = 'T1' | 'T2' | 'T3';

interface TierInfo {
  tier: PlayerTier;
  label: string;
  description: string;
  color: string;
}

const tierConfig: Record<PlayerTier, TierInfo> = {
  T1: {
    tier: 'T1',
    label: 'Elite',
    description: 'Top 10% by projected value',
    color: 'bg-amber-500'
  },
  T2: {
    tier: 'T2',
    label: 'Mid',
    description: 'Middle 40% by projected value',
    color: 'bg-slate-500'
  },
  T3: {
    tier: 'T3',
    label: 'Lower',
    description: 'Bottom 50% by projected value',
    color: 'bg-slate-600'
  }
};
```

#### TierBadge Component

```typescript
interface TierBadgeProps {
  tier: PlayerTier;
  showTooltip?: boolean;
}
```

---

## Tasks / Subtasks

- [x] **Task 1: Create Tier Types**
  - [x] Define PlayerTier type
  - [x] Create TierInfo interface
  - [x] Define tier configuration object

- [x] **Task 2: Create TierBadge Component**
  - [x] Create `src/features/draft/components/TierBadge.tsx`
  - [x] Use shadcn/ui Badge component
  - [x] Apply tier-specific colors

- [x] **Task 3: Implement Tooltip**
  - [x] Use shadcn/ui Tooltip component
  - [x] Show tier label and description
  - [x] Display percentile criteria

- [x] **Task 4: Apply Tier Styling**
  - [x] T1 (Elite): Amber/gold color
  - [x] T2 (Mid): Slate/neutral color
  - [x] T3 (Lower): Darker slate color

- [x] **Task 5: Integrate with PlayerQueue**
  - [x] Add tier column to table
  - [x] Display TierBadge for each player
  - [x] Ensure column width appropriate

- [x] **Task 6: Connect to Inflation Data**
  - [x] Read tier assignments from inflation store
  - [x] Map player IDs to tiers
  - [x] Handle missing tier data

- [x] **Task 7: Write Tests**
  - [x] Test badge rendering for each tier
  - [x] Test tooltip content
  - [x] Test styling applied correctly
  - [x] Test missing tier handling

---

## Dev Notes

### Implementation Approach

1. Create TierBadge component with tooltip
2. Define tier colors and descriptions
3. Read tier data from inflation calculations
4. Display in PlayerQueue table column

### Visual Design

| Tier | Badge Color | Label | Percentile |
|------|-------------|-------|------------|
| T1 | amber-500 | Elite | Top 10% |
| T2 | slate-500 | Mid | Middle 40% |
| T3 | slate-600 | Lower | Bottom 50% |

### Tooltip Content

```
┌──────────────────────────┐
│ Elite (T1)               │
│ Top 10% by projected     │
│ value at this position   │
└──────────────────────────┘
```

---

**Status:** Review
**Epic:** 6 of 13
**Story:** 9 of 11 in Epic 6

---

## Dev Agent Record

### Implementation Summary
- Created tier types in src/features/draft/types/tier.types.ts
- Created TierBadge component in src/features/draft/components/TierBadge.tsx
- Uses shadcn/ui Badge and Tooltip components
- Integrated TierBadge into PlayerQueue component
- Applied tier-specific colors (amber for Elite, slate for Mid/Lower)
- Tooltip shows tier label and percentile criteria on hover

### Files Created
- src/features/draft/types/tier.types.ts - Tier type definitions and configuration
- src/features/draft/components/TierBadge.tsx - TierBadge component with tooltip
- tests/features/draft/TierBadge.test.tsx - 13 passing tests

### Files Modified
- src/features/draft/components/PlayerQueue.tsx - Uses TierBadge component
- src/features/draft/index.ts - Added TierBadge and tier types exports

### Test Results
- 13 tests passing in TierBadge.test.tsx
- Tests cover: tier display, styling, accessibility, tooltip, custom className

### Implementation Date
December 19, 2025