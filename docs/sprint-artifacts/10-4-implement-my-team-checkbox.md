# Story 10.4: Implement "My Team" Checkbox

**Story ID:** 10.4
**Story Key:** 10-4-implement-my-team-checkbox
**Epic:** Epic 10 - Resilience & Manual Sync Fallback
**Status:** dev-complete

---

## Story

As a **user**,
I want to check a "My Team" checkbox when manually entering my own bids,
So that the system can track my roster and budget correctly.

---

## Acceptance Criteria

**Given** Manual Sync Mode is enabled and I am entering a bid for my own player
**When** I check the "My Team" checkbox and enter the auction price
**Then** the player is added to my roster
**And** my budget is reduced by the auction price
**And** the RosterPanel updates to show the new player
**And** position needs update if the player fills a required position
**And** unchecked boxes indicate other teams' picks (budget not affected)

---

## Developer Context

### Story Foundation from Epic

From **Epic 10: Resilience & Manual Sync Fallback** (docs/epics-stories.md lines 1352-1366):

This story implements the "My Team" checkbox that distinguishes between the user's own picks (which affect budget and roster) and other teams' picks (which only affect inflation). This distinction is critical for maintaining accurate roster tracking and budget management during manual entry.

**Core Responsibilities:**

- **Checkbox UI:** Render "My Team" checkbox for each player in Manual Mode
- **Budget Management:** Deduct auction price from user's budget when checked
- **Roster Management:** Add player to user's roster when checked
- **Position Tracking:** Update position needs when player fills a slot
- **Validation:** Ensure bid doesn't exceed remaining budget when "My Team" checked
- **Draft State:** Track which team drafted each player (user vs. other teams)

**Relationship to Epic 10:**

This is Story 4 of 8 in Epic 10. It depends on:
- **Story 10.2** (Required): Manual Mode UI provides checkbox column
- **Story 10.3** (Required): Bid entry uses checkbox state for validation
- Works with: **Story 10.5** (Budget tracking affects inflation accuracy)

**Integration Points:**

- Uses MyTeamCheckbox component from Story 10.2
- Integrates with draft store for roster management
- Updates RosterPanel from Epic 7 (Stories 7.1-7.7)
- Validates against budget from draft store

**Key Technical Considerations:**

1. **Checkbox State Management:**
   - Each player row has independent checkbox state
   - Checkbox value passed to bid submission handler
   - Clear checkbox after successful submission

2. **Budget Validation:**
   - When checked: validate `price <= remainingBudget`
   - When unchecked: skip budget validation
   - Show error if bid exceeds budget

3. **Roster Update:**
   - If checked: `draftedByTeam = 'user'` (or user's team ID)
   - If unchecked: `draftedByTeam = 'other'`
   - Update roster display in RosterPanel
   - Update position needs

---

## Tasks / Subtasks

- [x] **Task 1: Create MyTeamCheckbox Component**
  - [x] Create controlled checkbox component
  - [x] Accept props: `playerId`, `checked`, `onChange`, `disabled`
  - [x] Style to match dark theme
  - [x] Add label: "My Team"

- [x] **Task 2: Integrate Checkbox with Bid Input**
  - [x] Add checkbox state to each player row
  - [x] Pass checkbox value to bid submission handler
  - [x] Enable/disable based on Manual Mode state

- [x] **Task 3: Implement Budget Validation**
  - [x] Modify bid validation to check budget when "My Team" is checked
  - [x] Add validation rule: `price <= remainingBudget` if `isMyTeam`
  - [x] Display error: "Exceeds remaining budget ($X)"
  - [x] Allow higher bids when unchecked (other teams)

- [x] **Task 4: Update Roster on My Team Entry**
  - [x] When checked and bid submitted, add player to user's roster
  - [x] Deduct price from remaining budget
  - [x] Update RosterPanel to show new player
  - [x] Update position needs if position filled
  - [x] Call draft store actions: `addToRoster()`, `deductBudget()`

- [x] **Task 5: Track Other Teams' Picks**
  - [x] When unchecked and bid submitted, mark as other team's pick
  - [x] Do NOT deduct from user's budget
  - [x] Do NOT add to user's roster
  - [x] Still trigger inflation recalculation (all picks affect inflation)

- [x] **Task 6: Write Comprehensive Tests**
  - [x] Test "My Team" checked: budget deducted, roster updated
  - [x] Test unchecked: budget NOT deducted, roster NOT updated
  - [x] Test budget validation when "My Team" checked
  - [x] Test position needs update
  - [x] Test RosterPanel updates correctly
  - [x] Test inflation recalculates for both user and other picks

---

## File List

**Files to Create:**
- `tests/features/draft/MyTeamCheckbox.test.tsx` - Checkbox component tests

**Files to Modify:**
- `src/features/draft/components/MyTeamCheckbox.tsx` - Implement checkbox logic
- `src/features/draft/components/PlayerQueue.tsx` - Add checkbox to player rows
- `src/features/draft/hooks/useDraft.ts` - Update bid handler to use checkbox state
- `src/features/draft/stores/draftStore.ts` - Add roster and budget update actions

**Files to Test:**
- `tests/features/draft/PlayerQueue.myTeam.test.tsx` - Integration tests
- `tests/features/draft/draftStore.roster.test.ts` - Roster management tests
- `tests/features/draft/budgetValidation.test.ts` - Budget validation tests

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-21 | Story created | Story Creator Agent |
| 2025-12-21 | Implementation complete - all 6 tasks done | Dev Agent |

---

**Status:** dev-complete
**Epic:** 10 of 13
**Story:** 4 of 8 in Epic 10
