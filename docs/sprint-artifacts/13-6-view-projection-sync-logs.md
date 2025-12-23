# Story 13.6: View Projection Sync Logs

**Story ID:** 13.6
**Story Key:** 13-6-view-projection-sync-logs
**Epic:** Epic 13 - Admin Operations & Monitoring
**Status:** dev-complete

---

## Story

As an **administrator**,
I want to view projection sync logs showing successful and failed daily updates,
So that I can verify projection data is updating correctly.

---

## Acceptance Criteria

**Given** I am on the admin dashboard at `/admin`
**When** I view the Projection Sync Logs widget
**Then** I see a list of recent projection sync operations
**And** each sync shows: timestamp, projection system (Fangraphs/Google Sheets), status, player count updated, error message (if failed)
**And** syncs are sorted by timestamp (most recent first)
**And** status indicators are color-coded: green (success), red (failure)
**And** I can see the last 50 sync operations
**And** successful syncs show player count updated
**And** failed syncs show error message
**And** the widget updates in real-time (polls every 2 minutes)

---

## Developer Context

### Story Foundation from Epic

From **Epic 13: Admin Operations & Monitoring** (docs/epics.md lines 434-443):

This story implements projection sync log monitoring (FR59), enabling administrators to track daily projection updates. It's the sixth story in Epic 13.

**Core Responsibilities:**

- **Sync Log Display:** Show recent projection sync operations
- **Status Tracking:** Display success/failure status
- **Player Count:** Show number of players updated
- **Error Messages:** Display failure reasons
- **Real-time Updates:** Poll every 2 minutes

**Relationship to Epic 13:**

This is Story 6 of 11 in Epic 13. It depends on:
- **Story 4.6**: Daily Fangraphs sync (creates sync logs)
- **Story 13.1**: Admin dashboard route

### Previous Story Intelligence

**From Story 4.6 (Implement Daily Fangraphs Sync - COMPLETED):**

The system already has a `projection_sync_logs` table from migration 008:

```sql
CREATE TABLE projection_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type TEXT NOT NULL CHECK (sync_type IN ('fangraphs', 'google_sheets')),
  status TEXT NOT NULL CHECK (status IN ('success', 'failure')),
  players_updated INTEGER,
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Technical Requirements

#### ProjectionSyncLog Type

```typescript
export interface ProjectionSyncLog {
  id: string;
  syncType: 'fangraphs' | 'google_sheets';
  status: 'success' | 'failure';
  playersUpdated: number | null;
  errorMessage: string | null;
  startedAt: string;
  completedAt: string | null;
}
```

#### Database Query

```typescript
const { data } = await supabase
  .from('projection_sync_logs')
  .select('*')
  .order('started_at', { ascending: false })
  .limit(50);
```

---

## Tasks / Subtasks

- [x] **Task 1: Define ProjectionSyncLog Type**
  - [x] Add to admin.types.ts

- [x] **Task 2: Create useProjectionSyncLogs Hook**
  - [x] Query projection_sync_logs table
  - [x] Poll every 2 minutes
  - [x] Return last 50 logs

- [x] **Task 3: Create ProjectionSyncLogCard Component**
  - [x] Display sync details
  - [x] Color-code status
  - [x] Show player count or error

- [x] **Task 4: Create ProjectionSyncLogsWidget Component**
  - [x] List all sync logs
  - [x] Show loading/error states

- [x] **Task 5: Update AdminDashboard**
  - [x] Add widget to grid

- [x] **Task 6: Add Tests**
  - [x] Test log display
  - [x] Test status badges

- [x] **Task 7: Test End-to-End**
  - [x] Verify logs display correctly
  - [x] Verify status colors work

---

## Summary

Story 13.6 adds projection sync log monitoring to track daily projection updates.

**Deliverable:** ProjectionSyncLogsWidget displaying recent sync operations with status and details.

**Implementation Estimate:** 3-4 hours
