# Story 13.5: View Connection Success Metrics

**Story ID:** 13.5
**Story Key:** 13-5-view-connection-success-metrics
**Epic:** Epic 13 - Admin Operations & Monitoring
**Status:** dev-complete

---

## Story

As an **administrator**,
I want to view connection success metrics and historical reliability trends,
So that I can assess overall API reliability and identify patterns.

---

## Acceptance Criteria

**Given** I am on the admin dashboard at `/admin`
**When** I view the Connection Success Metrics widget
**Then** I see success rate percentages for all API integrations over the last 7 days
**And** each API shows: success rate, total calls, successful calls, failed calls
**And** the widget displays a 7-day trend chart showing daily success rates
**And** success rates are color-coded: green (>=95%), yellow (90-95%), red (<90%)
**And** the chart uses recharts library for visualization
**And** clicking a data point shows that day's details
**And** the widget updates in real-time (polls every 2 minutes)
**And** the UI follows dark slate theme with emerald accents

---

## Developer Context

### Story Foundation from Epic

From **Epic 13: Admin Operations & Monitoring** (docs/epics.md lines 434-443):

This story implements connection success metrics monitoring (FR58), enabling administrators to view historical reliability trends. It's the fifth story in Epic 13.

**Core Responsibilities:**

- **7-Day Success Metrics:** Calculate success rates from api_health_logs
- **Trend Visualization:** Display daily success rates on a chart
- **Color-Coded Rates:** Visual indicators for reliability levels
- **Historical Analysis:** Show patterns and trends over time
- **Real-time Updates:** Poll every 2 minutes
- **Interactive Chart:** Click data points for details

**Relationship to Epic 13:**

This is Story 5 of 11 in Epic 13. It depends on:
- **Story 13.3**: API health monitoring and api_health_logs table

### Technical Requirements

#### ConnectionMetrics Type

```typescript
export interface ConnectionMetrics {
  apiName: string;
  successRate7d: number;
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  dailyRates: Array<{
    date: string;
    successRate: number;
  }>;
}
```

#### Database Query

```sql
-- Get 7-day success metrics
SELECT
  api_name,
  COUNT(*) FILTER (WHERE status = 'healthy') * 100.0 / COUNT(*) as success_rate,
  COUNT(*) as total_calls,
  COUNT(*) FILTER (WHERE status = 'healthy') as successful_calls,
  COUNT(*) FILTER (WHERE status IN ('degraded', 'down')) as failed_calls
FROM api_health_logs
WHERE checked_at >= NOW() - INTERVAL '7 days'
GROUP BY api_name;
```

---

## Tasks / Subtasks

- [x] **Task 1: Create Connection Metrics Database Functions**
  - [x] Create `supabase/migrations/017_connection_metrics.sql`
  - [x] Add get_connection_metrics_7d() RPC function
  - [x] Add get_daily_success_rates() RPC function for chart data
  - [x] Add get_daily_connection_details() RPC function for drill-down

- [x] **Task 2: Define ConnectionMetrics Type**
  - [x] Add ConnectionMetrics interface
  - [x] Add DailySuccessRate interface
  - [x] Add DailyConnectionDetails interface
  - [x] Export from admin.types.ts

- [x] **Task 3: Create Connection Metrics Service**
  - [x] Create `src/features/admin/services/connectionMetricsService.ts`
  - [x] Implement getConnectionMetrics() function
  - [x] Implement getDailyConnectionDetails() function
  - [x] Implement getSuccessRateColor() helper
  - [x] Define SUCCESS_THRESHOLDS constants

- [x] **Task 4: Create useConnectionMetrics Hook**
  - [x] Create hook with 2-minute polling
  - [x] Return metrics and chart data
  - [x] Add selectDate() for drill-down
  - [x] Track lowSuccessCount

- [x] **Task 5: Create ConnectionMetricsWidget Component**
  - [x] Display success rate percentages
  - [x] Integrate recharts for trend visualization
  - [x] Color-code based on thresholds (green/yellow/red)
  - [x] Add interactive chart with click-to-drill-down
  - [x] Create DailyDetailsModal for date selection
  - [x] Add refresh button and polling status

- [x] **Task 6: Update AdminDashboard**
  - [x] Add ConnectionMetricsWidget to grid
  - [x] Update Upcoming Features list
  - [x] Export from admin/index.ts

- [x] **Task 7: Add Tests**
  - [x] Test connectionMetricsService (22 tests)
  - [x] Test useConnectionMetrics hook (12 tests)
  - [x] Test ConnectionMetricsWidget (33 tests)

- [x] **Task 8: Test End-to-End**
  - [x] Verify 7-day metrics display
  - [x] Verify trend chart shows correctly
  - [x] Verify color coding works
  - [x] All 67 new tests passing

---

## Summary

Story 13.5 adds historical connection success metrics with trend visualization.

**Deliverable:** ConnectionMetricsWidget displaying 7-day success rates and trend charts for all APIs.

**Implementation Estimate:** 4-5 hours
