# Story 13.4: View Error Rates with Automated Alerts

**Story ID:** 13.4
**Story Key:** 13-4-view-error-rates-with-automated-alerts
**Epic:** Epic 13 - Admin Operations & Monitoring
**Status:** Ready for Review

---

## Story

As an **administrator**,
I want to view error rates for API integrations with automated alert thresholds,
So that I can be notified when error rates exceed 5% and take immediate action.

---

## Acceptance Criteria

**Given** I am on the admin dashboard at `/admin`
**When** I view the Error Rates widget
**Then** I see error rate percentages for all API integrations over the last 24 hours
**And** error rates are calculated from api_health_logs table
**And** error rates exceeding 5% threshold trigger visual alert (red background)
**And** each API shows: current error rate, 24h trend (up/down arrow), alert status
**And** the widget displays a summary count of APIs above threshold
**And** clicking an API navigates to detailed error logs (Story 13.10)
**And** the widget updates in real-time (polls every 60 seconds)
**And** the UI uses color coding: green (<5%), red (>=5%)

---

## Developer Context

### Story Foundation from Epic

From **Epic 13: Admin Operations & Monitoring** (docs/epics.md lines 434-443):

This story implements error rate monitoring with automated alerts (FR57), enabling administrators to track API reliability and receive alerts when error thresholds are exceeded. It's the fourth story in Epic 13.

**Core Responsibilities:**

- **Error Rate Calculation:** Query last 24h of api_health_logs for error percentage
- **Threshold Alerts:** Visual alerts when error rate >= 5% (NFR-M2)
- **Trend Indicators:** Show if error rate is increasing or decreasing
- **Alert Summary:** Count of APIs above threshold
- **Real-time Updates:** Poll every 60 seconds
- **Click to Details:** Navigate to error log drill-down

**Relationship to Epic 13:**

This is Story 4 of 11 in Epic 13. It depends on:
- **Story 13.3 (Previous)**: API health monitoring and api_health_logs table

It enables:
- **Story 13.10**: Drill Down into Error Logs (detailed view)

### Architecture Requirements

**Database Query for 24h Error Rates:**

```sql
-- Get error rate for last 24 hours
SELECT
  api_name,
  COUNT(*) FILTER (WHERE status IN ('degraded', 'down')) * 100.0 / COUNT(*) as error_rate_24h,
  COUNT(*) FILTER (WHERE status IN ('degraded', 'down')) as error_count,
  COUNT(*) as total_checks
FROM api_health_logs
WHERE checked_at >= NOW() - INTERVAL '24 hours'
GROUP BY api_name;
```

**Trend Calculation:**

```typescript
// Compare last 1h vs previous 23h
const last1hErrorRate = getErrorRate(last1h);
const previous23hErrorRate = getErrorRate(previous23h);
const trend = last1hErrorRate > previous23hErrorRate ? 'up' : 'down';
```

**Required File Structure:**

```
src/features/admin/
  components/
    ErrorRatesWidget.tsx       # CREATE - Error rate monitoring
    ErrorRateCard.tsx          # CREATE - Individual API error rate
  hooks/
    useErrorRates.ts           # CREATE - Fetch error rates with polling
  services/
    errorRateService.ts        # CREATE - Error rate calculations
  types/
    admin.types.ts             # MODIFY - Add ErrorRate type
```

### Technical Requirements

#### ErrorRate Type Definition

```typescript
export interface ErrorRate {
  apiName: string;
  errorRate24h: number;
  errorCount: number;
  totalChecks: number;
  trend: 'up' | 'down' | 'stable';
  isAboveThreshold: boolean;
}
```

#### Error Rate Service

```typescript
// src/features/admin/services/errorRateService.ts
import { getSupabase } from '@/lib/supabase';

const ERROR_THRESHOLD = 5; // 5%

export async function getErrorRates(): Promise<ErrorRate[]> {
  const supabase = getSupabase();

  // Get 24h error rates
  const { data: rates24h } = await supabase.rpc('get_error_rates_24h');

  // Get 1h error rates for trend
  const { data: rates1h } = await supabase.rpc('get_error_rates_1h');

  return rates24h.map(rate => {
    const rate1h = rates1h.find(r => r.api_name === rate.api_name);
    const trend = calculateTrend(rate.error_rate_24h, rate1h?.error_rate_1h);

    return {
      apiName: rate.api_name,
      errorRate24h: rate.error_rate_24h,
      errorCount: rate.error_count,
      totalChecks: rate.total_checks,
      trend,
      isAboveThreshold: rate.error_rate_24h >= ERROR_THRESHOLD,
    };
  });
}

function calculateTrend(rate24h: number, rate1h: number | undefined): 'up' | 'down' | 'stable' {
  if (!rate1h) return 'stable';
  const diff = rate1h - rate24h;
  if (Math.abs(diff) < 1) return 'stable';
  return diff > 0 ? 'up' : 'down';
}
```

#### Database RPC Functions

```sql
-- supabase/migrations/016_error_rate_functions.sql

CREATE OR REPLACE FUNCTION get_error_rates_24h()
RETURNS TABLE (
  api_name TEXT,
  error_rate_24h NUMERIC,
  error_count BIGINT,
  total_checks BIGINT
) AS $$
  SELECT
    api_name,
    ROUND(
      COUNT(*) FILTER (WHERE status IN ('degraded', 'down')) * 100.0 /
      NULLIF(COUNT(*), 0),
      2
    ) as error_rate_24h,
    COUNT(*) FILTER (WHERE status IN ('degraded', 'down')) as error_count,
    COUNT(*) as total_checks
  FROM api_health_logs
  WHERE checked_at >= NOW() - INTERVAL '24 hours'
  GROUP BY api_name;
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION get_error_rates_1h()
RETURNS TABLE (
  api_name TEXT,
  error_rate_1h NUMERIC
) AS $$
  SELECT
    api_name,
    ROUND(
      COUNT(*) FILTER (WHERE status IN ('degraded', 'down')) * 100.0 /
      NULLIF(COUNT(*), 0),
      2
    ) as error_rate_1h
  FROM api_health_logs
  WHERE checked_at >= NOW() - INTERVAL '1 hour'
  GROUP BY api_name;
$$ LANGUAGE SQL;
```

---

## Tasks / Subtasks

- [x] **Task 1: Create Error Rate Database Functions** (AC: error rate calculation)
  - [x] Create `supabase/migrations/016_error_rate_functions.sql`
  - [x] Add get_error_rates_24h() RPC function
  - [x] Add get_error_rates_1h() RPC function
  - [x] Test functions return correct data

- [x] **Task 2: Define ErrorRate Type** (AC: type safety)
  - [x] Open `src/features/admin/types/admin.types.ts`
  - [x] Add ErrorRate interface with all fields
  - [x] Export type

- [x] **Task 3: Create Error Rate Service** (AC: error rate logic)
  - [x] Create `src/features/admin/services/errorRateService.ts`
  - [x] Implement getErrorRates() function
  - [x] Call RPC functions for 24h and 1h rates
  - [x] Implement calculateTrend() helper
  - [x] Determine isAboveThreshold flag
  - [x] Export service

- [x] **Task 4: Create useErrorRates Hook** (AC: real-time polling)
  - [x] Create `src/features/admin/hooks/useErrorRates.ts`
  - [x] Import errorRateService
  - [x] Implement 60-second polling
  - [x] Calculate alertCount (APIs above threshold)
  - [x] Return { errorRates, loading, error, alertCount, refetch }

- [x] **Task 5: Create ErrorRateCard Component** (AC: individual API display)
  - [x] Create `src/features/admin/components/ErrorRateCard.tsx`
  - [x] Display API name and error rate
  - [x] Show trend arrow (up/down/stable)
  - [x] Highlight red if above threshold
  - [x] Show error count / total checks
  - [x] Add click handler for drill-down

- [x] **Task 6: Create ErrorRatesWidget Component** (AC: error rate widget)
  - [x] Create `src/features/admin/components/ErrorRatesWidget.tsx`
  - [x] Import useErrorRates hook
  - [x] Display header with alert count badge
  - [x] Map error rates to ErrorRateCard components
  - [x] Show loading and error states

- [x] **Task 7: Update AdminDashboard** (AC: dashboard integration)
  - [x] Open `src/features/admin/components/AdminDashboard.tsx`
  - [x] Import ErrorRatesWidget
  - [x] Add to dashboard grid

- [x] **Task 8: Add Tests** (AC: test coverage)
  - [x] Test error rate calculation
  - [x] Test trend determination
  - [x] Test threshold alerts
  - [x] Test polling mechanism

- [x] **Task 9: Test End-to-End** (AC: all acceptance criteria met)
  - [x] Verify error rates display correctly
  - [x] Verify 5% threshold triggers alert
  - [x] Verify trend indicators show correctly
  - [x] Verify widget polls every 60 seconds

- [x] **Task 10: Update Sprint Status**
  - [x] Update `docs/sprint-artifacts/sprint-status.yaml`
  - [x] Change `13-4-view-error-rates-with-automated-alerts: in-progress → review`

---

## Dev Agent Record

### Implementation Plan

Implemented error rate monitoring following the story specification:
1. Created database RPC functions for 24h and 1h error rate calculations
2. Added ErrorRate and ErrorRateTrend types to admin.types.ts
3. Created errorRateService.ts with getErrorRates() and trend calculation logic
4. Created useErrorRates hook with 60-second polling interval
5. Created ErrorRateCard component with threshold-based styling (green <5%, red >=5%)
6. Created ErrorRatesWidget component with alert count badge and status indicators
7. Integrated ErrorRatesWidget into AdminDashboard

### Debug Log

- All 70 tests pass (errorRateService.test.ts, useErrorRates.test.tsx, ErrorRateCard.test.tsx, ErrorRatesWidget.test.tsx)
- No TypeScript errors
- Lint passes (only pre-existing warnings in other files)

### Completion Notes

- ✅ Error rates calculated from api_health_logs table via RPC functions
- ✅ 5% threshold triggers visual alert (red background, ALERT badge)
- ✅ Trend indicators (up/down/stable) with color coding
- ✅ Alert count badge showing APIs above threshold
- ✅ 60-second polling interval for real-time updates
- ✅ Click handler prepared for Story 13.10 navigation (not yet implemented)
- ✅ Color coding: green (<5%), red (>=5%)

---

## File List

### New Files

- `supabase/migrations/016_error_rate_functions.sql` - Database RPC functions for error rates
- `src/features/admin/services/errorRateService.ts` - Error rate calculation service
- `src/features/admin/hooks/useErrorRates.ts` - Hook with 60-second polling
- `src/features/admin/components/ErrorRateCard.tsx` - Individual API error rate card
- `src/features/admin/components/ErrorRatesWidget.tsx` - Error rates dashboard widget
- `tests/features/admin/errorRateService.test.ts` - Service tests (17 tests)
- `tests/features/admin/useErrorRates.test.tsx` - Hook tests (9 tests)
- `tests/features/admin/ErrorRateCard.test.tsx` - Component tests (23 tests)
- `tests/features/admin/ErrorRatesWidget.test.tsx` - Widget tests (22 tests)

### Modified Files

- `src/features/admin/types/admin.types.ts` - Added ErrorRate and ErrorRateTrend types
- `src/features/admin/components/AdminDashboard.tsx` - Added ErrorRatesWidget to dashboard
- `src/features/admin/index.ts` - Exported new components, hooks, services, and types
- `docs/sprint-artifacts/sprint-status.yaml` - Updated story status

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-23 | Implemented Story 13.4 - Error Rates with Automated Alerts | Dev Agent |

---

## Summary

Story 13.4 adds error rate monitoring with automated 5% threshold alerts.

**Deliverable:** ErrorRatesWidget displaying 24h error rates for all APIs with visual alerts when thresholds are exceeded.

**Implementation Estimate:** 3-4 hours
