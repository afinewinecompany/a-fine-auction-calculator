# Story 7.1: Create RosterPanel Component Foundation

**Story ID:** 7.1
**Story Key:** 7-1-create-rosterpanel-component-foundation
**Epic:** Epic 7 - Live Draft Experience - Budget & Roster Management
**Status:** ready-for-dev

---

## Story

As a **developer**,
I want to create the RosterPanel component structure,
So that budget and roster tracking UI can be built.

---

## Acceptance Criteria

**Given** shadcn/ui Card component is available
**When** I create `src/features/draft/components/RosterPanel.tsx`
**Then** the component renders a panel with sections: Budget Summary, Roster Composition, Position Needs
**And** the panel uses dark slate backgrounds (slate-900) with emerald accents per UX
**And** the component accepts props: `budget`, `roster`, `leagueSettings`
**And** the panel is positioned as persistent sidebar (4-column grid on desktop per UX layout)
**And** on mobile, the panel is collapsible or accessible via bottom sheet
**And** the component uses TypeScript with proper types

---

## Developer Context

### Story Foundation from Epic

From **Epic 7: Live Draft Experience - Budget & Roster Management** (docs/epics-stories.md lines 916-1048):

This story creates the RosterPanel component foundation that will house budget tracking, roster composition, and position needs sections. The panel is a persistent context display during live drafts, enabling users to monitor their auction budget, roster state, and position requirements in real-time.

**Core Responsibilities:**

- **Component Structure:** Create the layout skeleton with three main sections
- **Dark Theme Styling:** Apply slate-900 backgrounds with emerald-400 accents per UX specifications
- **Responsive Layout:** Desktop sidebar (4-column grid) and mobile bottom sheet/collapsible
- **TypeScript Props:** Define proper type interfaces for budget, roster, and league settings
- **shadcn/ui Integration:** Use Card component for panel structure

**Relationship to Epic 7:**

This is Story 1 of 8 in Epic 7. It establishes the component foundation and enables:
- **Story 7.2**: Display Real-Time Budget Tracking (populates Budget Summary section)
- **Story 7.3**: Display Money Spent Breakdown by Position (extends Budget Summary)
- **Story 7.4**: Display Spending Pace Indicator (extends Budget Summary)
- **Story 7.5**: Display Roster Composition by Position (populates Roster Composition section)
- **Story 7.6**: Display Filled vs. Remaining Roster Slots (extends Roster Composition)
- **Story 7.7**: Display Position Needs Summary (populates Position Needs section)
- **Story 7.8**: Track Overall Draft Progress (adds draft-wide progress section)

### Technical Requirements

#### Component Props Interface

```typescript
interface RosterPanelProps {
  budget: {
    total: number;
    spent: number;
    remaining: number;
  };
  roster: {
    hitters: Player[];
    pitchers: Player[];
    bench: Player[];
  };
  leagueSettings: {
    teamCount: number;
    rosterSpotsHitters: number;
    rosterSpotsPitchers: number;
    rosterSpotsBench: number;
  };
}
```

#### Layout Structure

```typescript
// Desktop: 4-column grid with RosterPanel as persistent sidebar
// Grid: [PlayerQueue: 3 columns] [RosterPanel: 1 column]

// Mobile: Collapsible bottom sheet or accordion
```

---

## Tasks / Subtasks

- [ ] **Task 1: Create Component File**
  - [ ] Create `src/features/draft/components/RosterPanel.tsx`
  - [ ] Add component header comments

- [ ] **Task 2: Define TypeScript Interfaces**
  - [ ] Define `RosterPanelProps` interface
  - [ ] Define `BudgetData` interface
  - [ ] Define `RosterData` interface
  - [ ] Create `src/features/draft/types/roster.types.ts` for shared types

- [ ] **Task 3: Create Component Structure**
  - [ ] Import shadcn/ui Card component
  - [ ] Create main RosterPanel component with props
  - [ ] Add three section placeholders: Budget Summary, Roster Composition, Position Needs
  - [ ] Apply dark slate theme (slate-900 background, emerald-400 accents)

- [ ] **Task 4: Implement Desktop Layout**
  - [ ] Position panel as sidebar in 4-column grid
  - [ ] Make panel sticky/fixed during scroll
  - [ ] Set max-height with internal scroll for long content

- [ ] **Task 5: Implement Mobile Layout**
  - [ ] Add responsive breakpoint detection (< 768px)
  - [ ] Implement collapsible accordion or bottom sheet pattern
  - [ ] Ensure touch targets meet 44px minimum
  - [ ] Test mobile layout on various screen sizes

- [ ] **Task 6: Add Section Headers**
  - [ ] Create section header component/styling
  - [ ] Add "Budget Summary" header
  - [ ] Add "Roster Composition" header
  - [ ] Add "Position Needs" header
  - [ ] Use emerald-400 color for headers

- [ ] **Task 7: Add Placeholder Content**
  - [ ] Add placeholder text for Budget Summary section
  - [ ] Add placeholder text for Roster Composition section
  - [ ] Add placeholder text for Position Needs section
  - [ ] Use slate-400 color for placeholder text

- [ ] **Task 8: Export Component**
  - [ ] Export RosterPanel from component file
  - [ ] Add to `src/features/draft/index.ts` barrel export

- [ ] **Task 9: Create Component Tests**
  - [ ] Create `tests/features/draft/RosterPanel.test.tsx`
  - [ ] Test component renders with props
  - [ ] Test three sections are displayed
  - [ ] Test desktop vs. mobile layouts
  - [ ] Test TypeScript type safety

- [ ] **Task 10: Integrate with Draft Page**
  - [ ] Import RosterPanel in draft page
  - [ ] Pass budget, roster, leagueSettings props
  - [ ] Verify panel renders alongside PlayerQueue
  - [ ] Test 4-column grid layout on desktop

---

## Dev Notes

### Implementation Approach

1. Create TypeScript type definitions first
2. Build component structure with shadcn/ui Card
3. Implement desktop layout (4-column grid, sticky sidebar)
4. Implement mobile layout (collapsible/bottom sheet)
5. Add placeholder content for three sections
6. Test responsive behavior and type safety
7. Integrate with draft page

### UX Design References

**From UX Design Specification:**
- **Color Scheme:** Dark slate backgrounds (slate-900, slate-800), emerald accents (emerald-400)
- **Layout:** 4-column grid on desktop (PlayerQueue: 3 cols, RosterPanel: 1 col)
- **Mobile:** Collapsible panel or bottom sheet for space efficiency
- **Typography:** Large, bold text for critical numbers (budget, roster counts)

### Related Epic 6 Components

The RosterPanel complements the PlayerQueue component from Epic 6. Together they form the complete live draft interface:
- **PlayerQueue** (Epic 6): Player search, filter, sort, adjusted values
- **RosterPanel** (Epic 7): Budget tracking, roster composition, position needs

---

**Status:** Ready for Implementation
**Epic:** 7 of 13
**Story:** 1 of 8 in Epic 7
