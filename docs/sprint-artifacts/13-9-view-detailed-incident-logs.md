# Story 13.9: View Detailed Incident Logs

**Story ID:** 13.9
**Story Key:** 13-9-view-detailed-incident-logs
**Epic:** Epic 13 - Admin Operations & Monitoring
**Status:** Ready for Review

---

## Story

As an **administrator**,
I want to view detailed incident logs showing failures, affected users, recovery actions, and resolution times,
So that I can analyze and respond to system incidents effectively.

---

## Acceptance Criteria

**Given** I am on the admin dashboard at `/admin`
**When** I view the Incident Logs widget
**Then** I see a list of all incidents in the last 30 days
**And** each incident shows: timestamp, type, severity, affected users count, description, resolution time
**And** incidents are sorted by timestamp (most recent first)
**And** severity levels are color-coded: critical (red), high (orange), medium (yellow), low (blue)
**And** I can filter by incident type: API failure, draft error, sync failure
**And** clicking an incident shows full details including recovery actions taken
**And** the widget displays total incidents and average resolution time
**And** the widget updates in real-time (polls every 2 minutes)

---

## Developer Context

### Story Foundation from Epic

From **Epic 13: Admin Operations & Monitoring** (docs/epics.md lines 434-443):

This story implements detailed incident logging (FR62), enabling administrators to track and analyze system failures. It's the ninth story in Epic 13.

**Core Responsibilities:**

- **Incident Tracking:** Log all system failures with details
- **Severity Classification:** Critical, high, medium, low
- **Affected Users:** Count of users impacted by incident
- **Recovery Actions:** Log steps taken to resolve
- **Resolution Time:** Track time to resolution
- **Incident Filtering:** Filter by type and severity

**Relationship to Epic 13:**

This is Story 9 of 11 in Epic 13. It depends on:
- **Story 13.2**: Active drafts monitoring (draft errors)
- **Story 13.3**: API health monitoring (API failures)

### Technical Requirements

#### Database Schema

```sql
-- supabase/migrations/019_incident_logs.sql
CREATE TABLE incident_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_type TEXT NOT NULL CHECK (incident_type IN ('api_failure', 'draft_error', 'sync_failure', 'system_error')),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  affected_users_count INTEGER DEFAULT 0,
  recovery_actions TEXT[],
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolution_time_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_incident_logs_occurred_at ON incident_logs(occurred_at DESC);
```

#### IncidentLog Type

```typescript
export interface IncidentLog {
  id: string;
  incidentType: 'api_failure' | 'draft_error' | 'sync_failure' | 'system_error';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affectedUsersCount: number;
  recoveryActions: string[];
  occurredAt: string;
  resolvedAt: string | null;
  resolutionTimeMinutes: number | null;
}
```

---

## Tasks / Subtasks

- [x] **Task 1: Create Incident Logs Database Table**
  - [x] Create migration with incident_logs table

- [x] **Task 2: Define IncidentLog Type**
  - [x] Add to admin.types.ts

- [x] **Task 3: Create useIncidentLogs Hook**
  - [x] Query incident_logs for last 30 days
  - [x] Poll every 2 minutes
  - [x] Calculate total incidents and avg resolution time

- [x] **Task 4: Create IncidentLogCard Component**
  - [x] Display incident details
  - [x] Color-code severity
  - [x] Expandable recovery actions

- [x] **Task 5: Create IncidentLogsWidget Component**
  - [x] List all incidents
  - [x] Filter by type and severity
  - [x] Show summary stats

- [x] **Task 6: Update AdminDashboard**
  - [x] Add widget to grid

- [x] **Task 7: Add Tests**
  - [x] Test incident display
  - [x] Test filtering

- [x] **Task 8: Test End-to-End**
  - [x] Verify incidents display correctly
  - [x] Verify severity colors work

---

## Dev Agent Record

### Implementation Plan

Implemented incident logs feature following existing admin feature patterns:

1. Created database migration with incident_logs table including RLS policies
2. Added TypeScript types and helper functions for severity colors
3. Created useIncidentLogs hook with 30-day lookback and 2-minute polling
4. Built IncidentLogCard with expandable details and severity color-coding
5. Built IncidentLogsWidget with filtering by type/severity and summary stats
6. Integrated widget into AdminDashboard grid
7. Wrote comprehensive tests (85 tests passing)

### Completion Notes

✅ All 8 tasks completed successfully
✅ 85 unit tests passing for incident log components
✅ All incident log files pass linting with zero warnings
✅ Widget displays incidents sorted by timestamp (most recent first)
✅ Severity badges color-coded: critical (red), high (orange), medium (yellow), low (blue)
✅ Filter dropdowns for incident type and severity
✅ Summary stats show total incidents, avg resolution time, severity breakdown
✅ Expandable card details show description and recovery actions
✅ Auto-refresh every 2 minutes via polling

---

## File List

### New Files

- supabase/migrations/020_incident_logs.sql
- src/features/admin/hooks/useIncidentLogs.ts
- src/features/admin/components/IncidentLogCard.tsx
- src/features/admin/components/IncidentLogsWidget.tsx
- tests/features/admin/IncidentLogCard.test.tsx
- tests/features/admin/useIncidentLogs.test.tsx
- tests/features/admin/IncidentLogsWidget.test.tsx

### Modified Files

- src/features/admin/types/admin.types.ts
- src/features/admin/components/AdminDashboard.tsx
- src/features/admin/index.ts
- docs/sprint-artifacts/sprint-status.yaml

---

## Change Log

- 2025-12-23: Implemented Story 13.9 - View Detailed Incident Logs

---

## Summary

Story 13.9 adds comprehensive incident logging for tracking and analyzing system failures.

**Deliverable:** IncidentLogsWidget displaying detailed incident history with filtering and analytics.

**Implementation Estimate:** 4-5 hours
