# Story 13.10: Drill Down into Error Logs

**Story ID:** 13.10
**Story Key:** 13-10-drill-down-into-error-logs
**Epic:** Epic 13 - Admin Operations & Monitoring
**Status:** completed

---

## Story

As an **administrator**,
I want to drill down into detailed error logs for specific connection failures,
So that I can diagnose and troubleshoot API integration issues.

---

## Acceptance Criteria

**Given** I am viewing API health or error rate widgets
**When** I click on an API with errors
**Then** I navigate to `/admin/errors/{apiName}` page
**And** I see a detailed error log table with columns: timestamp, status code, error message, request URL, response time
**And** error logs are sorted by timestamp (most recent first)
**And** I can filter logs by date range (last 24h, 7d, 30d, custom)
**And** I can search logs by error message or status code
**And** I can export logs as CSV for external analysis
**And** the page displays error frequency chart showing errors over time
**And** the page updates in real-time (polls every 60 seconds)

---

## Developer Context

### Story Foundation from Epic

From **Epic 13: Admin Operations & Monitoring** (docs/epics.md lines 434-443):

This story implements detailed error log drill-down (FR63), enabling administrators to diagnose specific API failures. It's the tenth story in Epic 13.

**Core Responsibilities:**

- **Detailed Error View:** Dedicated page for API error analysis
- **Error Log Table:** Timestamp, status, message, URL, response time
- **Date Range Filtering:** Last 24h, 7d, 30d, or custom range
- **Search Functionality:** Filter by message or status code
- **CSV Export:** Download logs for external analysis
- **Error Frequency Chart:** Visualize errors over time
- **Real-time Updates:** Poll every 60 seconds

**Relationship to Epic 13:**

This is Story 10 of 11 in Epic 13. It depends on:
- **Story 13.3**: API health monitoring (api_health_logs table)
- **Story 13.4**: Error rates widget (links to this page)

### Technical Requirements

#### Error Logs Page Route

```typescript
// src/routes/router.tsx
{
  element: <AdminRoute />,
  children: [
    { path: '/admin', element: <AdminDashboard /> },
    { path: '/admin/errors/:apiName', element: <ErrorLogsPage /> },
  ],
}
```

#### ErrorLog Type

```typescript
export interface ErrorLog {
  id: string;
  apiName: string;
  status: 'degraded' | 'down';
  statusCode: number | null;
  errorMessage: string;
  requestUrl: string;
  responseTimeMs: number | null;
  checkedAt: string;
}
```

#### Database Query

```typescript
const { data } = await supabase
  .from('api_health_logs')
  .select('*')
  .eq('api_name', apiName)
  .in('status', ['degraded', 'down'])
  .gte('checked_at', startDate)
  .lte('checked_at', endDate)
  .order('checked_at', { ascending: false })
  .limit(100);
```

---

## Tasks / Subtasks

- [x] **Task 1: Extend api_health_logs Table**
  - [x] Add columns: status_code, request_url if not present
  - [x] Create migration if needed

- [x] **Task 2: Create ErrorLogsPage Component**
  - [x] Route: /admin/errors/:apiName
  - [x] Display error log table
  - [x] Date range filter
  - [x] Search functionality

- [x] **Task 3: Create useErrorLogs Hook**
  - [x] Query api_health_logs filtered by apiName
  - [x] Support date range and search
  - [x] Poll every 60 seconds

- [x] **Task 4: Create ErrorLogTable Component**
  - [x] Display columns: timestamp, status, message, URL, response time
  - [x] Sortable columns
  - [x] Pagination

- [x] **Task 5: Create ErrorFrequencyChart Component**
  - [x] Use recharts to visualize error frequency
  - [x] Group errors by hour or day

- [x] **Task 6: Add CSV Export Functionality**
  - [x] Export button
  - [x] Generate CSV from error logs

- [x] **Task 7: Update API Widgets to Link to Error Logs**
  - [x] APIHealthWidget: Click API card → navigate to error logs
  - [x] ErrorRatesWidget: Click API → navigate to error logs

- [x] **Task 8: Add Tests**
  - [x] Test error logs page rendering
  - [x] Test filtering and search
  - [x] Test CSV export

- [x] **Task 9: Test End-to-End**
  - [x] Verify navigation from widgets
  - [x] Verify error logs display
  - [x] Verify filtering works
  - [x] Verify CSV export works

---

## Summary

Story 13.10 adds detailed error log drill-down for API troubleshooting.

**Deliverable:** ErrorLogsPage with detailed error table, filtering, search, and CSV export.

**Implementation Estimate:** 5-6 hours
