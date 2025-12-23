# Story 6.10: Implement Mobile-Responsive Design

**Story ID:** 6.10
**Story Key:** 6-10-implement-mobile-responsive-design
**Epic:** Epic 6 - Live Draft Experience - Player Discovery & Tracking
**Status:** review

---

## Story

As a **user**,
I want the PlayerQueue to work identically on mobile and desktop,
So that I can draft from any device without feature loss.

---

## Acceptance Criteria

**Given** I access the PlayerQueue on mobile (<768px screen width)
**When** the component renders
**Then** the table uses horizontal scroll with sticky first column (player name always visible)
**And** all features work identically (search, sort, filter, value display)
**And** touch targets meet 44px minimum size requirement
**And** the adjusted value column remains visible alongside player names
**And** scrolling maintains 60fps performance (NFR-P6)
**And** the layout matches UX requirements for mobile-desktop parity (NFR: identical feature sets)

---

## Developer Context

### Story Foundation from Epic

From **Epic 6: Live Draft Experience - Player Discovery & Tracking** (docs/epics-stories.md lines 880-896):

This story ensures the PlayerQueue component works perfectly on mobile devices. Many users draft from their phones or tablets, so mobile-desktop feature parity is critical.

**Core Responsibilities:**

- **Horizontal Scroll:** Table scrolls horizontally on narrow screens
- **Sticky Columns:** Player name always visible
- **Touch Targets:** 44px minimum for all interactive elements
- **Performance:** 60fps scrolling maintained

**Relationship to Epic 6:**

This is Story 10 of 11 in Epic 6. It depends on:
- **Story 6.2**: PlayerQueue component (base component)
- All previous Epic 6 stories (features to make responsive)

### Technical Requirements

#### Responsive Breakpoints

```typescript
// Tailwind breakpoints
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px

// Mobile: < 768px
// Tablet: 768px - 1024px
// Desktop: > 1024px
```

#### Sticky Column CSS

```css
.sticky-first-column {
  position: sticky;
  left: 0;
  z-index: 10;
  background: inherit;
}

.scroll-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
```

#### Touch Target Requirements

```typescript
// Minimum 44x44px touch targets
const touchTargetClasses = 'min-h-[44px] min-w-[44px]';
```

---

## Tasks / Subtasks

- [x] **Task 1: Implement Horizontal Scroll Container**
  - [x] Wrap table in scroll container
  - [x] Enable smooth scrolling on touch
  - [x] Test overflow behavior

- [x] **Task 2: Make First Column Sticky**
  - [x] Apply sticky positioning to player name column
  - [x] Set z-index for layering
  - [x] Add background to prevent see-through

- [x] **Task 3: Make Value Column Sticky (Optional)**
  - [x] Consider making adjusted value sticky
  - [x] Test with 2-column sticky if viable
  - [x] Fallback to single column if performance issue

- [x] **Task 4: Ensure Touch Targets**
  - [x] Audit all clickable elements
  - [x] Apply 44px minimum height/width
  - [x] Add padding where needed

- [x] **Task 5: Test Feature Parity**
  - [x] Test search on mobile
  - [x] Test sort on mobile
  - [x] Test filter on mobile
  - [x] Test row click/tap

- [x] **Task 6: Optimize Scroll Performance**
  - [x] Test 60fps scrolling
  - [x] Use will-change for GPU acceleration
  - [x] Profile on real devices

- [x] **Task 7: Responsive Filter Controls**
  - [x] Stack controls vertically on mobile
  - [x] Full-width search input
  - [x] Compact filter buttons

- [x] **Task 8: Write Responsive Tests**
  - [x] Test at 320px width (small mobile)
  - [x] Test at 375px width (iPhone)
  - [x] Test at 768px width (tablet)
  - [x] Test at 1024px width (desktop)

---

## Dev Notes

### Implementation Approach

1. Add horizontal scroll wrapper around table
2. Apply sticky positioning to first column
3. Audit and fix touch targets
4. Test on real devices for performance

### CSS Strategy

```tsx
<div className="overflow-x-auto -mx-4 px-4">
  <table className="min-w-[800px]">
    <thead>
      <tr>
        <th className="sticky left-0 bg-slate-950 z-10">Name</th>
        <!-- other columns -->
      </tr>
    </thead>
  </table>
</div>
```

### Performance Tips

- Use `transform: translateZ(0)` for GPU acceleration
- Avoid box-shadow on sticky elements (expensive)
- Keep DOM simple within scroll container

---

**Status:** Review
**Epic:** 6 of 13
**Story:** 10 of 11 in Epic 6

---

## Dev Agent Record

### Implementation Summary
- Added horizontal scroll container with touch-friendly scrolling (-webkit-overflow-scrolling: touch)
- Made first column (player name) sticky with z-index, background, and border
- Added GPU acceleration (transform-gpu) for smooth scrolling
- Updated all touch targets to meet 44px minimum size requirement
- Made filter controls stack vertically on mobile (flex-col sm:flex-row)
- Set minimum table width (800px) for proper horizontal scrolling

### Files Modified
- src/features/draft/components/PlayerQueue.tsx - Enhanced scroll container and sticky columns
- src/features/draft/components/PlayerQueueWithSearch.tsx - Responsive filter layout
- src/features/draft/components/StatusFilter.tsx - 44px touch targets, full-width on mobile
- src/features/draft/components/PlayerSearch.tsx - 44px input height
- src/features/draft/components/ClearFiltersButton.tsx - 44px touch target
- tests/features/draft/PlayerQueue.test.tsx - Updated for TierBadge changes

### Files Created
- tests/features/draft/PlayerQueue.responsive.test.tsx - 10 passing responsive tests

### Test Results
- 10 responsive tests passing
- 29 existing PlayerQueue tests passing

### Implementation Date
December 19, 2025