# Story 8.6: Display Position-Specific Inflation Breakdown

**Story ID:** 8.6
**Story Key:** 8-6-display-position-specific-inflation-breakdown  
**Epic:** Epic 8 - Live Draft Experience - Variance & Inflation Insights
**Status:** ready-for-dev

---

## Story

As a **user**,
I want to view inflation rates for each position (C, 1B, 2B, SS, 3B, OF, SP, RP),
So that I understand position scarcity dynamics.

---

## Acceptance Criteria

**Given** the inflation engine calculates position-specific rates
**When** the InflationTracker renders position breakdown (optional toggle or expandable section)
**Then** I see inflation for each position: "C: +22%", "OF: +5%", "SP: +12%", "RP: -3%"
**And** positions are sorted by inflation rate (highest first)
**And** scarce positions (high inflation) are highlighted in red/orange
**And** this data uses progressive disclosure (expandable detail section)
**And** the breakdown updates in real-time

---

**Status:** ready-for-dev
**Epic:** 8 of 13
**Story:** 6 of 7 in Epic 8
