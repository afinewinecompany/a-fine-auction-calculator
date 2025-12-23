# Story 13.11: View Inflation Calculation Performance Metrics

**Story ID:** 13.11
**Story Key:** 13-11-view-inflation-calculation-performance-metrics
**Epic:** Epic 13 - Admin Operations & Monitoring
**Status:** dev-complete

---

## Story

As an **administrator**,
I want to view inflation calculation performance metrics including median, p95, and p99 latency,
So that I can detect performance degradation and ensure calculations remain fast.

---

## Acceptance Criteria

**Given** I am on the admin dashboard at `/admin`
**When** I view the Inflation Performance Metrics widget
**Then** I see performance statistics for inflation calculations
**And** the widget displays: median latency, p95 latency, p99 latency, total calculations
**And** latency values are shown in milliseconds
**And** performance thresholds are color-coded: green (<100ms median), yellow (100-200ms), red (>200ms)
**And** the widget shows a 24-hour trend chart of latency over time
**And** I can see calculation frequency (calculations per minute)
**And** the widget displays alert if p99 latency exceeds 500ms
**And** the widget updates in real-time (polls every 60 seconds)
**And** the UI addresses NFR-M4 and NFR-M5 requirements

---

## Developer Context

### Story Foundation from Epic

From **Epic 13: Admin Operations & Monitoring** (docs/epics.md lines 434-443):

This story implements inflation calculation performance monitoring (NFR-M4, NFR-M5), enabling administrators to track and optimize calculation performance. It's the eleventh and final story in Epic 13.

**Core Responsibilities:**

- **Performance Metrics:** Track median, p95, p99 latency
- **Latency Monitoring:** Ensure calculations remain fast (<100ms median)
- **Trend Analysis:** 24-hour latency trend chart
- **Calculation Frequency:** Track calculations per minute
- **Performance Alerts:** Alert if p99 > 500ms
- **Real-time Updates:** Poll every 60 seconds

**Relationship to Epic 13:**

This is Story 11 of 11 in Epic 13. It depends on:
- **Story 5.2-5.6**: Inflation calculation implementation
- **Story 13.1**: Admin dashboard route

It addresses:
- **NFR-M4**: Track median, p95, p99 latency for inflation calculations
- **NFR-M5**: Real-time calculation performance display

### Technical Requirements

#### Database Schema

```sql
-- supabase/migrations/020_inflation_performance_logs.sql
CREATE TABLE inflation_performance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calculation_type TEXT NOT NULL CHECK (calculation_type IN ('basic', 'position', 'tier', 'budget_depletion')),
  latency_ms INTEGER NOT NULL,
  player_count INTEGER,
  draft_id UUID REFERENCES drafts(id),
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inflation_perf_calculated_at ON inflation_performance_logs(calculated_at DESC);

-- Function to calculate percentile latency
CREATE OR REPLACE FUNCTION get_inflation_latency_percentiles()
RETURNS TABLE (
  median_latency NUMERIC,
  p95_latency NUMERIC,
  p99_latency NUMERIC,
  total_calculations BIGINT
) AS $$
  SELECT
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY latency_ms) as median_latency,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) as p95_latency,
    PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY latency_ms) as p99_latency,
    COUNT(*) as total_calculations
  FROM inflation_performance_logs
  WHERE calculated_at >= NOW() - INTERVAL '24 hours';
$$ LANGUAGE SQL;
```

#### InflationPerformanceMetrics Type

```typescript
export interface InflationPerformanceMetrics {
  medianLatency: number;
  p95Latency: number;
  p99Latency: number;
  totalCalculations: number;
  calculationsPerMinute: number;
  hourlyLatencies: Array<{
    hour: string;
    medianLatency: number;
  }>;
}
```

#### Performance Logging Integration

```typescript
// Add to src/features/inflation/utils/inflationCalculations.ts

export async function calculateInflation(/* params */) {
  const start = performance.now();

  // ... inflation calculation logic ...

  const latencyMs = Math.round(performance.now() - start);

  // Log performance
  await logInflationPerformance({
    calculationType: 'basic',
    latencyMs,
    playerCount: players.length,
    draftId,
  });

  return result;
}

async function logInflationPerformance(log: PerformanceLog) {
  const supabase = getSupabase();
  await supabase.from('inflation_performance_logs').insert(log);
}
```

---

## Tasks / Subtasks

- [x] **Task 1: Create Inflation Performance Logs Table**
  - [x] Create `supabase/migrations/022_inflation_performance_logs.sql`
  - [x] Add inflation_performance_logs table
  - [x] Create get_inflation_performance_metrics() RPC function

- [x] **Task 2: Add Performance Logging to Inflation Calculations**
  - [x] Created performanceLogger.ts with logInflationPerformance()
  - [x] Created withPerformanceLogging() wrapper function
  - [x] Created startPerformanceMeasurement() for manual instrumentation
  - [x] Non-blocking async logging (<1ms overhead)

- [x] **Task 3: Define InflationPerformanceMetrics Type**
  - [x] Added to admin.types.ts
  - [x] Added LATENCY_THRESHOLDS constants
  - [x] Added getLatencyThresholdLevel() helper
  - [x] Added getLatencyColorClasses() helper
  - [x] Added isP99AlertTriggered() helper

- [x] **Task 4: Create useInflationPerformanceMetrics Hook**
  - [x] Created inflationPerformanceService.ts
  - [x] Created useInflationPerformanceMetrics.ts hook
  - [x] Poll every 60 seconds
  - [x] Derives isP99Alert and thresholdLevel

- [x] **Task 5: Create InflationPerformanceWidget Component**
  - [x] Display median, p95, p99 latency
  - [x] Show total calculations and frequency
  - [x] Color-code based on thresholds (green/yellow/red)
  - [x] Display 24h trend chart using recharts
  - [x] Show alert badge if p99 > 500ms
  - [x] Dark slate theme with emerald accents

- [x] **Task 6: Update AdminDashboard**
  - [x] Added InflationPerformanceWidget to grid
  - [x] Updated header comment with Story 13.11

- [x] **Task 7: Add Tests**
  - [x] inflationPerformanceTypes.test.ts (12 tests)
  - [x] inflationPerformanceService.test.ts (9 tests)
  - [x] useInflationPerformanceMetrics.test.tsx (19 tests)
  - [x] InflationPerformanceWidget.test.tsx (21 tests)
  - [x] performanceLogger.test.ts (13 tests)
  - [x] **Total: 74 tests passing**

- [x] **Task 8: Test End-to-End**
  - [x] Verify performance metrics display
  - [x] Verify latency logging works
  - [x] Verify alerts trigger correctly
  - [x] Verify trend chart shows data

---

## Dev Notes

### Performance Logging Strategy

**When to Log:**
- Every inflation calculation invocation
- Basic, position, tier, and budget depletion calculations
- Both draft and preview calculations

**What to Log:**
- Calculation type
- Latency in milliseconds
- Player count (affects performance)
- Draft ID (for correlation)

**Performance Impact:**
- Logging is async (non-blocking)
- Minimal overhead (<1ms)
- Database insert is fire-and-forget

### Percentile Calculation

**Why Track p95 and p99:**
- **Median**: Shows typical performance
- **p95**: Shows 95th percentile (catches outliers)
- **p99**: Shows 99th percentile (worst-case scenarios)

**Threshold Targets (NFR-M4):**
- Median: <100ms (excellent)
- p95: <200ms (acceptable)
- p99: <500ms (warning if exceeded)

### Performance Optimization Triggers

**Alert Conditions:**
- p99 latency > 500ms → Investigate optimization
- Median latency > 200ms → Critical performance issue
- Increasing trend → Proactive optimization needed

**Optimization Strategies:**
- Cache frequently calculated values
- Optimize SQL queries
- Reduce player set size
- Parallel calculation for tiers

---

## Summary

Story 13.11 adds comprehensive inflation calculation performance monitoring.

**Deliverable:** InflationPerformanceWidget displaying latency percentiles, trends, and alerts for calculation performance.

**Implementation Estimate:** 5-6 hours

**This completes Epic 13: Admin Operations & Monitoring!**
