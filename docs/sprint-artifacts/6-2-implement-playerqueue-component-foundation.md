# Story 6.2: Implement PlayerQueue Component Foundation

**Story ID:** 6.2
**Story Key:** 6-2-implement-playerqueue-component-foundation
**Epic:** Epic 6 - Live Draft Experience - Player Discovery & Tracking
**Status:** done

---

## Story

As a **developer**,
I want to create the PlayerQueue component structure with shadcn/ui Table,
So that the player list UI foundation is established.

---

## Acceptance Criteria

**Given** shadcn/ui Table component is available
**When** I create `src/features/draft/components/PlayerQueue.tsx`
**Then** the component renders a responsive table with columns: Player Name, Positions, Team, Projected Value, Adjusted Value, Tier, Status
**And** the table uses dark slate theme (slate-950 background) per UX requirements
**And** the component accepts props: `players` (array), `onPlayerSelect` (function)
**And** the table is responsive with horizontal scroll on mobile (sticky first column for player names)
**And** 44px minimum touch targets are maintained on mobile (NFR touch requirements)
**And** the component uses TypeScript with proper type definitions

---

## Developer Context

### Story Foundation from Epic

From **Epic 6: Live Draft Experience - Player Discovery & Tracking** (docs/epics-stories.md lines 742-758):

This story creates the foundational PlayerQueue component that displays the player list during drafts. It establishes the table structure that subsequent stories will enhance with search, sort, and filter capabilities.

**Core Responsibilities:**

- **Table Structure:** Create responsive table with all required columns
- **Dark Theme:** Use slate-950 background per UX specs
- **Touch Targets:** Ensure 44px minimum for mobile accessibility
- **TypeScript:** Proper type definitions for props and player data

**Relationship to Epic 6:**

This is Story 2 of 11 in Epic 6. It depends on:
- **Story 6.1**: Draft state database tables (data source)

It enables:
- **Story 6.3**: Instant player search (searches this table)
- **Story 6.4**: Sortable columns (sorts this table)
- **Story 6.5**: Adjusted value display (displayed in this table)

### Technical Requirements

#### Component Structure

```typescript
// src/features/draft/components/PlayerQueue.tsx
interface PlayerQueueProps {
  players: Player[];
  onPlayerSelect: (player: Player) => void;
}

interface Player {
  id: string;
  name: string;
  positions: string[];
  team: string;
  projectedValue: number;
  adjustedValue: number;
  tier: 'T1' | 'T2' | 'T3';
  status: 'available' | 'drafted' | 'my-team';
  draftedByTeam?: number;
}
```

#### Table Columns

| Column | Width | Description |
|--------|-------|-------------|
| Player Name | sticky | First column, always visible |
| Positions | auto | Comma-separated position list |
| Team | auto | MLB team abbreviation |
| Projected Value | 80px | Original projected value |
| Adjusted Value | 100px | Inflation-adjusted value (prominent) |
| Tier | 60px | T1/T2/T3 badge |
| Status | auto | Available/Drafted/My Team |

---

## Tasks / Subtasks

- [x] **Task 1: Create Player Type Definitions**
  - [x] Create `src/features/draft/types/player.types.ts`
  - [x] Define Player interface
  - [x] Define PlayerQueueProps interface
  - [x] Export types from feature index

- [x] **Task 2: Set Up Component Structure**
  - [x] Create `src/features/draft/components/PlayerQueue.tsx`
  - [x] Import shadcn/ui Table components
  - [x] Define component with TypeScript props
  - [x] Set up basic table structure

- [x] **Task 3: Implement Table Header**
  - [x] Create TableHeader with all columns
  - [x] Apply dark slate styling (slate-950 background)
  - [x] Make first column sticky for mobile

- [x] **Task 4: Implement Table Body**
  - [x] Map players to TableRow components
  - [x] Display all column data
  - [x] Add onClick handler for row selection

- [x] **Task 5: Apply Dark Theme Styling**
  - [x] Set slate-950 background
  - [x] Use slate-400 for secondary text
  - [x] Apply emerald accents per UX spec

- [x] **Task 6: Implement Responsive Behavior**
  - [x] Add horizontal scroll container
  - [x] Make first column sticky (player name)
  - [x] Ensure 44px minimum touch targets

- [x] **Task 7: Export from Feature Index**
  - [x] Update `src/features/draft/index.ts`
  - [x] Export PlayerQueue component
  - [x] Export player types

- [x] **Task 8: Write Component Tests**
  - [x] Test renders with player data
  - [x] Test onPlayerSelect callback
  - [x] Test responsive behavior
  - [x] Test accessibility (screen reader)

---

## Dev Notes

### Implementation Approach

1. Start with shadcn/ui Table as the foundation
2. Apply dark theme styling globally to table
3. Implement sticky first column using CSS position: sticky
4. Use Tailwind classes for responsive behavior

### Styling Guidelines

- Background: `bg-slate-950`
- Text primary: `text-slate-100`
- Text secondary: `text-slate-400`
- Accents: `text-emerald-400`
- Borders: `border-slate-800`

### Accessibility

- Use proper table semantics (thead, tbody, th, td)
- Ensure keyboard navigation works
- Add aria-labels for interactive elements

---

**Status:** Ready for Implementation
**Epic:** 6 of 13
**Story:** 2 of 11 in Epic 6
