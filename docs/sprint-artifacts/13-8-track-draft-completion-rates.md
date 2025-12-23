# Story 13.8: Track Draft Completion Rates

**Story ID:** 13.8
**Story Key:** 13-8-track-draft-completion-rates
**Epic:** Epic 13 - Admin Operations & Monitoring
**Status:** complete

---

## Story

As an **administrator**,
I want to track draft completion rates to ensure no data loss,
So that I can verify drafts are completing successfully without errors.

---

## Acceptance Criteria

**Given** I am on the admin dashboard at `/admin`
**When** I view the Draft Completion Rates widget
**Then** I see completion statistics for all drafts in the last 30 days
**And** the widget displays: total drafts started, completed, abandoned, error rate
**And** completion rate percentage is calculated: (completed / total) * 100
**And** the widget shows a 30-day trend chart of completion rates
**And** completion rates are color-coded: green (>=80%), yellow (70-80%), red (<70%)
**And** clicking "View Details" shows breakdown by league or user
**And** the widget updates in real-time (polls every 5 minutes)
**And** the UI follows NFR-R3 target of >80% completion rate

---

## Developer Context

### Story Foundation from Epic

From **Epic 13: Admin Operations & Monitoring** (docs/epics.md lines 434-443):

This story implements draft completion tracking (FR64), ensuring no data loss and meeting NFR-R3 (>80% draft completion rate). It's the eighth story in Epic 13.

**Core Responsibilities:**

- **Completion Metrics:** Calculate draft completion rates
- **30-Day Trends:** Show historical completion patterns
- **Target Monitoring:** Track against NFR-R3 (>80% target)
- **Breakdown View:** Analyze by league or user
- **Real-time Updates:** Poll every 5 minutes

**Relationship to Epic 13:**

This is Story 8 of 11 in Epic 13. It depends on:
- **Story 6.1**: Draft state database tables
- **Story 13.2**: Active drafts monitoring

### Technical Requirements

#### Database Query

```sql
-- Get 30-day completion stats
SELECT
  COUNT(*) FILTER (WHERE status = 'completed') as completed_drafts,
  COUNT(*) FILTER (WHERE status = 'error') as error_drafts,
  COUNT(*) as total_drafts,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'completed') * 100.0 / COUNT(*),
    2
  ) as completion_rate
FROM drafts
WHERE started_at >= NOW() - INTERVAL '30 days';
```

#### DraftCompletionMetrics Type

```typescript
export interface DraftCompletionMetrics {
  totalDrafts: number;
  completedDrafts: number;
  abandonedDrafts: number;
  errorDrafts: number;
  completionRate: number;
  dailyRates: Array<{
    date: string;
    completionRate: number;
  }>;
}
```

---

## Tasks / Subtasks

- [x] **Task 1: Create Draft Completion Database Functions**
  - [x] Create get_draft_completion_metrics_30d() RPC (supabase/migrations/019_draft_completion_metrics.sql)
  - [x] Created drafts table with status tracking

- [x] **Task 2: Define DraftCompletionMetrics Type**
  - [x] Add to admin.types.ts (DraftCompletionMetrics, DailyCompletionRate, CompletionRateColor)
  - [x] Add getCompletionRateColor() function
  - [x] Add COMPLETION_RATE_THRESHOLDS constant (GREEN: 80%, YELLOW: 70%)

- [x] **Task 3: Create useDraftCompletionMetrics Hook**
  - [x] Query drafts table for 30-day stats (src/features/admin/hooks/useDraftCompletionMetrics.ts)
  - [x] Poll every 5 minutes (300000ms interval)
  - [x] Return isBelowTarget derived state

- [x] **Task 4: Create DraftCompletionWidget Component**
  - [x] Display completion statistics (src/features/admin/components/DraftCompletionWidget.tsx)
  - [x] Show 30-day trend chart using recharts AreaChart
  - [x] Color-code based on 80% threshold with green/yellow/red indicators
  - [x] Display stats grid: Total Drafts, Completed, Abandoned, Errors
  - [x] Show reference line at 80% target on chart

- [x] **Task 5: Update AdminDashboard**
  - [x] Add widget to grid (lg:col-span-2)
  - [x] Export from admin index.ts

- [x] **Task 6: Add Tests**
  - [x] Test completion rate calculation (tests/features/admin/completionRateColor.test.ts)
  - [x] Test threshold color coding (tests/features/admin/completionRateColor.test.ts)
  - [x] Test service (tests/features/admin/draftCompletionService.test.ts)
  - [x] Test hook (tests/features/admin/useDraftCompletionMetrics.test.tsx)
  - [x] Test widget (tests/features/admin/DraftCompletionWidget.test.tsx)

- [x] **Task 7: Test End-to-End**
  - [x] Verify completion metrics display in widget
  - [x] Verify 80% target monitoring with below-target badge

---

## Implementation Notes

### Files Created

- `supabase/migrations/019_draft_completion_metrics.sql` - Database migration with drafts table and RPC function
- `src/features/admin/services/draftCompletionService.ts` - Service layer for fetching metrics
- `src/features/admin/hooks/useDraftCompletionMetrics.ts` - React hook with 5-minute polling
- `src/features/admin/components/DraftCompletionWidget.tsx` - Dashboard widget with chart
- `tests/features/admin/draftCompletionService.test.ts` - Service unit tests
- `tests/features/admin/useDraftCompletionMetrics.test.tsx` - Hook unit tests
- `tests/features/admin/DraftCompletionWidget.test.tsx` - Component tests
- `tests/features/admin/completionRateColor.test.ts` - Color coding function tests

### Files Modified

- `src/types/database.types.ts` - Added drafts table type and RPC function type
- `src/features/admin/types/admin.types.ts` - Added DraftCompletionMetrics types
- `src/features/admin/index.ts` - Added exports
- `src/features/admin/components/AdminDashboard.tsx` - Added widget to grid

### Key Implementation Details

- Widget displays 4 stat cards: Total Drafts, Completed, Abandoned, Errors
- 30-day trend chart using recharts AreaChart with gradient fill
- Color coding: green (>=80%), yellow (70-80%), red (<70%)
- Reference line at 80% target on chart
- Below-target badge appears when completion rate drops below 80%
- Auto-refresh every 5 minutes (300000ms polling interval)
- Dark slate theme with emerald accents matching admin dashboard

---

## Summary

Story 13.8 adds draft completion rate tracking to ensure data integrity and meet NFR-R3 targets.

**Deliverable:** DraftCompletionWidget displaying 30-day completion statistics and trends.

**Completed:** 2025-12-23
