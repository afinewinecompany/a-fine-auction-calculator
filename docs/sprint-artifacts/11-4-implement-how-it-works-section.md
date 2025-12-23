# Story 11.4: Implement "How It Works" Section

**Story ID:** 11.4
**Story Key:** 11-4-implement-how-it-works-section
**Epic:** Epic 11 - User Onboarding & Discovery
**Status:** ready-for-dev

---

## Story

As a **user**,
I want to understand the workflow in 4 simple steps,
So that I know how to use the product.

---

## Acceptance Criteria

**Given** I scroll to the "How It Works" section
**When** the section renders
**Then** I see a 4-step workflow with numbered steps
**And** Step 1: "Create your league and import projections"
**And** Step 2: "Connect to Couch Managers draft room"
**And** Step 3: "Monitor inflation-adjusted values in real-time"
**And** Step 4: "Dominate your draft with competitive intelligence"
**And** each step includes an icon and brief explanation
**And** the section uses a horizontal timeline layout (vertical on mobile)

---

## Developer Context

### Story Foundation from Epic

From **Epic 11: User Onboarding & Discovery** (docs/epics-stories.md lines 1487-1503):

This story implements the "How It Works" section that explains the product workflow in 4 simple steps.

**Core Responsibilities:**

- **4-Step Workflow:** Display numbered steps with icons
- **Step Titles:** Exact text as per acceptance criteria
- **Icons:** Lucide icons for visual representation
- **Timeline Layout:** Horizontal on desktop, vertical on mobile
- **Visual Connectors:** Lines or arrows connecting steps

**The 4 Steps:**

1. **Create your league and import projections** - Set up league parameters and load player data
2. **Connect to Couch Managers draft room** - Link to live draft data source
3. **Monitor inflation-adjusted values in real-time** - Track value changes during draft
4. **Dominate your draft with competitive intelligence** - Make winning decisions

---

## Tasks / Subtasks

- [x] **Task 1: Define Steps Data Structure**
  - [x] Create steps array with 4 objects
  - [x] Each object: { number, icon, title, description }
  - [x] Use appropriate Lucide icons

- [x] **Task 2: Update HowItWorksSection Component**
  - [x] Open src/features/landing/components/HowItWorksSection.tsx
  - [x] Replace placeholder with step cards
  - [x] Add section heading "How It Works"

- [x] **Task 3: Create Step Component**
  - [x] Create numbered circle badge (1-4)
  - [x] Add Lucide icon
  - [x] Add step title
  - [x] Add brief explanation text

- [x] **Task 4: Implement Timeline Layout**
  - [x] Horizontal layout on desktop (flex-row)
  - [x] Vertical layout on mobile (flex-col)
  - [x] Add connecting lines/arrows between steps
  - [x] Ensure proper spacing

- [x] **Task 5: Add Visual Styling**
  - [x] Emerald accent for step numbers
  - [x] Dark slate card backgrounds
  - [x] White titles, slate-400 descriptions
  - [x] Subtle hover effects

---

## Dev Notes

### Steps Data

```tsx
const steps = [
  {
    number: 1,
    icon: Settings,
    title: "Create your league and import projections",
    description: "Set up your league parameters and load player projection data from Google Sheets or Fangraphs."
  },
  {
    number: 2,
    icon: Link,
    title: "Connect to Couch Managers draft room",
    description: "Enter your Couch Managers room ID to automatically sync draft picks in real-time."
  },
  {
    number: 3,
    icon: BarChart3,
    title: "Monitor inflation-adjusted values in real-time",
    description: "Watch as player values adjust based on remaining budget and draft activity."
  },
  {
    number: 4,
    icon: Trophy,
    title: "Dominate your draft with competitive intelligence",
    description: "Make informed decisions with tier-specific and position-aware inflation insights."
  }
];
```

---

## Dev Agent Record

### Implementation Plan

- Component already implemented at src/features/landing/components/HowItWorksSection.tsx
- Comprehensive test suite already exists at tests/features/landing/HowItWorksSection.test.tsx
- Implementation uses responsive grid layout (mobile → tablet → desktop)
- All 4 steps with exact titles from acceptance criteria
- Lucide icons (Settings, Link, BarChart3, Trophy)
- Timeline connectors for desktop layout
- Emerald accent styling throughout

### Completion Notes

✅ All acceptance criteria verified:

- 4-step workflow with numbered steps (lines 88-97)
- Exact step titles match requirements
- Icons and brief explanations included
- Responsive timeline layout (horizontal desktop, vertical mobile)
- Emerald accents, dark slate backgrounds, proper text styling
- 24 comprehensive tests passing
- No lint errors
- Implementation already exists and meets all requirements

### Debug Log

- 2025-12-22: Verified existing implementation against acceptance criteria
- All tasks already complete, tests passing
- Story ready for review

---

## File List

- src/features/landing/components/HowItWorksSection.tsx
- tests/features/landing/HowItWorksSection.test.tsx

---

## Change Log

- 2025-12-22: Story validation complete - implementation already existed and meets all acceptance criteria

---

## Summary

Story 11.4 implements the "How It Works" section with a 4-step workflow timeline.

**Deliverable:** Responsive timeline showing product workflow in 4 clear steps with icons.

---

## Status

Ready for Review
