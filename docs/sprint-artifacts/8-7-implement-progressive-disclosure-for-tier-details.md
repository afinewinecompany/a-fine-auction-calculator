# Story 8.7: Implement Progressive Disclosure for Tier Details

**Story ID:** 8.7
**Story Key:** 8-7-implement-progressive-disclosure-for-tier-details
**Epic:** Epic 8 - Live Draft Experience - Variance & Inflation Insights
**Status:** ready-for-dev

---

## Story

As a **user**,
I want to tap/click to reveal detailed tier assignment rationale,
So that I can understand why a player is assigned to a specific tier.

---

## Acceptance Criteria

**Given** players have tier assignments in the PlayerQueue
**When** I click/tap on a player's tier badge
**Then** an inline detail panel expands showing tier criteria
**And** the panel explains: "Elite tier = top 10% by projected value (>$35)"
**And** the panel shows the player's tier assignment: "This player: $42 projected → Elite"
**And** the panel shows tier-specific inflation: "Elite tier inflating at +8%"
**And** clicking again or clicking elsewhere collapses the panel
**And** this follows UX requirements for progressive disclosure pattern

---

**Status:** ready-for-dev
**Epic:** 8 of 13
**Story:** 7 of 7 in Epic 8
