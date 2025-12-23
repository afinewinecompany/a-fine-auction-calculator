# Story 8.5: Display Tier-Specific Inflation Breakdown

**Story ID:** 8.5
**Story Key:** 8-5-display-tier-specific-inflation-breakdown
**Epic:** Epic 8 - Live Draft Experience - Variance & Inflation Insights
**Status:** ready-for-dev

---

## Story

As a **user**,
I want to view inflation rates for each tier (Elite, Mid, Lower),
So that I can understand which player tiers are inflating faster.

---

## Acceptance Criteria

**Given** the inflation engine calculates tier-specific rates
**When** the InflationTracker renders tier breakdown (optional toggle or expandable section)
**Then** I see inflation for each tier: "Elite (T1): +8%", "Mid (T2): +15%", "Lower (T3): -2%"
**And** the tier with highest inflation is highlighted
**And** this data uses progressive disclosure (hidden by default, revealed on click/tap)
**And** a tooltip explains: "Mid-tier players are selling 15% above their projections"
**And** the breakdown updates after each inflation recalculation

---

## Developer Context

### Story Foundation from Epic

From **Epic 8: Live Draft Experience - Variance & Inflation Insights** (docs/epics-stories.md lines 1122-1137):

This story adds tier-specific inflation breakdown to the InflationTracker component using progressive disclosure. It's the fifth story in the Epic 8 sequence.

**Status:** ready-for-dev
**Epic:** 8 of 13
**Story:** 5 of 7 in Epic 8
