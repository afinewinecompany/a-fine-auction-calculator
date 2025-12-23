# Story 13.2: Display Active Drafts List

**Story ID:** 13.2
**Story Key:** 13-2-display-active-drafts-list
**Epic:** Epic 13 - Admin Operations & Monitoring
**Status:** Ready for Review

---

## Story

As an **administrator**,
I want to view a list of all active drafts with status indicators,
So that I can monitor ongoing draft activity during peak draft season.

---

## Acceptance Criteria

**Given** I am on the admin dashboard at `/admin`
**When** I view the Active Drafts widget
**Then** I see a list of all currently active drafts across all users
**And** each draft shows: league name, user email, draft status, start time, last activity
**And** drafts are sorted by last activity (most recent first)
**And** status indicators show: "Active", "Paused", "Completed", "Error"
**And** I can see total count of active drafts at the top
**And** drafts with errors are highlighted in red
**And** the list updates in real-time (polls every 30 seconds)
**And** clicking a draft navigates to `/admin/drafts/{draftId}` for details
**And** the UI follows dark slate theme with color-coded status badges

---

## Developer Context

### Story Foundation from Epic

From **Epic 13: Admin Operations & Monitoring** (docs/epics.md lines 434-443):

This story implements the active drafts monitoring feature (FR55), enabling administrators to view real-time list of all ongoing drafts across all users. It's the second story in Epic 13 and adds the first data-driven widget to the admin dashboard.

**Core Responsibilities:**

- **Active Drafts Query:** Query database for all drafts with status = "active" or "paused"
- **Draft Details Display:** Show league name, user, status, timing, last activity
- **Real-time Updates:** Poll database every 30 seconds for changes
- **Status Indicators:** Color-coded badges for different draft states
- **Error Highlighting:** Red highlight for drafts with connection errors
- **Click to Details:** Navigate to draft detail page (future story)

**Relationship to Epic 13:**

This is Story 2 of 11 in Epic 13. It depends on:
- **Story 13.1 (Previous)**: Admin dashboard route and layout

It enables:
- **Story 13.9**: View Detailed Incident Logs (drill-down from error drafts)
- **Story 13.8**: Track Draft Completion Rates (draft state tracking)

It builds on:
- **Epic 6 (Complete)**: Draft state database tables (Story 6.1)
- **Epic 9 (Complete)**: Draft sync and status tracking

### Previous Story Intelligence

**From Story 6.1 (Create Draft State Database Tables - COMPLETED):**

**Existing Draft State Schema (supabase/migrations/010_draft_tables.sql):**

The database already has a `drafts` table that tracks draft state:

```sql
CREATE TABLE drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'completed', 'error')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Columns for This Story:**
- `status`: 'active', 'paused', 'completed', 'error'
- `started_at`: When draft began
- `last_activity`: Last sync or user action timestamp
- `error_message`: Details if status = 'error'
- `league_id`: Join to leagues table for league name
- `user_id`: Join to users table for user email

**From Story 9.2 (Implement Connection to Couch Managers - COMPLETED):**

**Draft Sync Updates last_activity:**

The draft sync mechanism updates the `last_activity` timestamp whenever:
- New bid is synced from Couch Managers API
- Manual bid entry is submitted
- Draft status changes

**From Story 10.1 (Detect API Connection Failures - COMPLETED):**

**Error Status Tracking:**

Drafts enter `status = 'error'` when:
- Couch Managers API connection fails after retries
- Network errors persist beyond threshold
- Manual mode is enabled due to API failure

### Architecture Requirements

**From Architecture Document (docs/architecture.md):**

#### Database Query for Active Drafts

**Supabase Query with Joins:**

```typescript
const { data: activeDrafts, error } = await supabase
  .from('drafts')
  .select(`
    id,
    status,
    started_at,
    last_activity,
    error_message,
    league:leagues(name, team_count, budget),
    user:users(email, full_name)
  `)
  .in('status', ['active', 'paused', 'error'])
  .order('last_activity', { ascending: false });
```

**Returns:**
```typescript
[
  {
    id: 'draft-uuid',
    status: 'active',
    started_at: '2025-12-22T10:00:00Z',
    last_activity: '2025-12-22T10:15:00Z',
    error_message: null,
    league: { name: '2025 Main League', team_count: 12, budget: 260 },
    user: { email: 'user@example.com', full_name: 'John Doe' }
  },
  // ... more drafts
]
```

#### Real-time Polling Pattern

**Use setInterval for 30-second Updates:**

```typescript
useEffect(() => {
  // Initial fetch
  fetchActiveDrafts();

  // Poll every 30 seconds
  const intervalId = setInterval(() => {
    fetchActiveDrafts();
  }, 30000);

  // Cleanup on unmount
  return () => clearInterval(intervalId);
}, []);
```

#### Project Organization - Feature-Based

**Required File Structure:**
```
src/features/admin/
  components/
    AdminDashboard.tsx        # MODIFY - Add ActiveDraftsWidget
    ActiveDraftsWidget.tsx    # CREATE - Active drafts list
    DraftStatusBadge.tsx      # CREATE - Status indicator component
  hooks/
    useActiveDrafts.ts        # CREATE - Fetch active drafts with polling
  types/
    admin.types.ts            # MODIFY - Add ActiveDraft type
```

**Key Principles:**
- **Widget Component:** ActiveDraftsWidget is self-contained
- **Custom Hook:** useActiveDrafts handles data fetching and polling
- **Reusable Badge:** DraftStatusBadge used across admin features
- **Type Safety:** ActiveDraft interface defines draft data shape

### UX Requirements

**From UX Design Specification (docs/ux-design-specification.md):**

#### Visual Design Consistency

**Active Drafts Widget Styling:**
- **Card layout** - bg-slate-900 with slate-800 border
- **Header** - Title "Active Drafts" with count badge
- **List items** - Hover effect on clickable rows
- **Status badges** - Color-coded: green (active), yellow (paused), red (error), gray (completed)
- **Typography** - text-lg for league name, text-sm for details

**Status Badge Colors:**
```typescript
const statusColors = {
  active: 'bg-emerald-500 text-white',
  paused: 'bg-yellow-500 text-black',
  error: 'bg-red-500 text-white',
  completed: 'bg-slate-600 text-white',
};
```

#### Active Drafts Widget Layout

**Widget Structure:**

```typescript
<div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-xl font-semibold text-white">Active Drafts</h2>
    <span className="px-3 py-1 bg-emerald-600 text-white rounded-full text-sm">
      {activeDrafts.length} active
    </span>
  </div>

  <div className="space-y-3">
    {activeDrafts.map(draft => (
      <div
        key={draft.id}
        className="p-4 bg-slate-800 rounded-lg hover:bg-slate-700 cursor-pointer"
        onClick={() => navigate(`/admin/drafts/${draft.id}`)}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-white">
            {draft.league.name}
          </h3>
          <DraftStatusBadge status={draft.status} />
        </div>
        <div className="text-sm text-slate-400 space-y-1">
          <div>User: {draft.user.email}</div>
          <div>Started: {formatDistanceToNow(draft.started_at)} ago</div>
          <div>Last Activity: {formatDistanceToNow(draft.last_activity)} ago</div>
          {draft.error_message && (
            <div className="text-red-400">Error: {draft.error_message}</div>
          )}
        </div>
      </div>
    ))}
  </div>

  {activeDrafts.length === 0 && (
    <div className="text-center text-slate-400 py-8">
      No active drafts at this time
    </div>
  )}
</div>
```

#### User Flow

**Admin Monitoring Flow:**
1. Admin navigates to /admin dashboard
2. ActiveDraftsWidget displays with current draft count
3. Widget automatically polls every 30 seconds
4. Admin sees list of active drafts sorted by last activity
5. Admin identifies draft with error status (red badge)
6. Admin clicks draft row to view details
7. Navigation to /admin/drafts/{draftId} (future story)

**Error Handling:**
- Database errors: Show error message in widget
- Empty state: "No active drafts at this time"
- Polling failures: Continue showing last successful data

### Technical Requirements

#### ActiveDraft Type Definition

**Add to src/features/admin/types/admin.types.ts:**

```typescript
export interface ActiveDraft {
  id: string;
  status: 'active' | 'paused' | 'completed' | 'error';
  started_at: string;
  last_activity: string;
  error_message: string | null;
  league: {
    name: string;
    team_count: number;
    budget: number;
  };
  user: {
    email: string;
    full_name: string | null;
  };
}
```

#### useActiveDrafts Hook

**Create src/features/admin/hooks/useActiveDrafts.ts:**

```typescript
import { useState, useEffect } from 'react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { ActiveDraft } from '../types/admin.types';

export function useActiveDrafts() {
  const [drafts, setDrafts] = useState<ActiveDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveDrafts = async () => {
    if (!isSupabaseConfigured()) {
      setError('Database not configured');
      setLoading(false);
      return;
    }

    try {
      const supabase = getSupabase();
      const { data, error: dbError } = await supabase
        .from('drafts')
        .select(`
          id,
          status,
          started_at,
          last_activity,
          error_message,
          league:leagues(name, team_count, budget),
          user:users(email, full_name)
        `)
        .in('status', ['active', 'paused', 'error'])
        .order('last_activity', { ascending: false });

      if (dbError) {
        setError('Failed to fetch active drafts');
        setDrafts([]);
      } else {
        setDrafts(data as ActiveDraft[]);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchActiveDrafts();

    // Poll every 30 seconds
    const intervalId = setInterval(() => {
      fetchActiveDrafts();
    }, 30000);

    // Cleanup
    return () => clearInterval(intervalId);
  }, []);

  return { drafts, loading, error, refetch: fetchActiveDrafts };
}
```

#### DraftStatusBadge Component

**Create src/features/admin/components/DraftStatusBadge.tsx:**

```typescript
interface DraftStatusBadgeProps {
  status: 'active' | 'paused' | 'completed' | 'error';
}

export function DraftStatusBadge({ status }: DraftStatusBadgeProps) {
  const statusConfig = {
    active: {
      label: 'Active',
      className: 'bg-emerald-500 text-white',
    },
    paused: {
      label: 'Paused',
      className: 'bg-yellow-500 text-black',
    },
    error: {
      label: 'Error',
      className: 'bg-red-500 text-white',
    },
    completed: {
      label: 'Completed',
      className: 'bg-slate-600 text-white',
    },
  };

  const config = statusConfig[status];

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
}
```

#### ActiveDraftsWidget Component

**Create src/features/admin/components/ActiveDraftsWidget.tsx:**

```typescript
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Activity } from 'lucide-react';
import { useActiveDrafts } from '../hooks/useActiveDrafts';
import { DraftStatusBadge } from './DraftStatusBadge';

export function ActiveDraftsWidget() {
  const { drafts, loading, error } = useActiveDrafts();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <div className="text-slate-400">Loading active drafts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-emerald-500" />
          <h2 className="text-xl font-semibold text-white">Active Drafts</h2>
        </div>
        <span className="px-3 py-1 bg-emerald-600 text-white rounded-full text-sm font-semibold">
          {drafts.length} active
        </span>
      </div>

      {drafts.length === 0 ? (
        <div className="text-center text-slate-400 py-8">
          No active drafts at this time
        </div>
      ) : (
        <div className="space-y-3">
          {drafts.map(draft => (
            <div
              key={draft.id}
              className="p-4 bg-slate-800 rounded-lg hover:bg-slate-700 cursor-pointer transition-colors"
              onClick={() => navigate(`/admin/drafts/${draft.id}`)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-white">
                  {draft.league.name}
                </h3>
                <DraftStatusBadge status={draft.status} />
              </div>
              <div className="text-sm text-slate-400 space-y-1">
                <div>
                  User: {draft.user.full_name || draft.user.email}
                </div>
                <div>
                  Started: {formatDistanceToNow(new Date(draft.started_at))} ago
                </div>
                <div>
                  Last Activity: {formatDistanceToNow(new Date(draft.last_activity))} ago
                </div>
                {draft.error_message && (
                  <div className="text-red-400 font-medium">
                    Error: {draft.error_message}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

#### Update AdminDashboard

**Modify src/features/admin/components/AdminDashboard.tsx:**

```typescript
// Add import
import { ActiveDraftsWidget } from './ActiveDraftsWidget';

// Replace welcome card with ActiveDraftsWidget
<main className="p-6">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {/* Full-width Active Drafts Widget */}
    <div className="col-span-full lg:col-span-2">
      <ActiveDraftsWidget />
    </div>

    {/* Placeholder for future widgets */}
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-white mb-4">
        API Health
      </h2>
      <p className="text-slate-400">
        Coming in Story 13.3
      </p>
    </div>
  </div>
</main>
```

### Latest Technical Specifications

**React 18+ Best Practices (2025):**

**Polling Pattern with Cleanup:**
```typescript
useEffect(() => {
  fetchActiveDrafts();
  const intervalId = setInterval(fetchActiveDrafts, 30000);
  return () => clearInterval(intervalId);
}, []);
```

**TypeScript Join Query Types:**
```typescript
// Supabase returns nested objects for joins
const { data } = await supabase
  .from('drafts')
  .select('id, league:leagues(name)');
// Type assertion needed: data as ActiveDraft[]
```

**Date Formatting with date-fns:**
```typescript
import { formatDistanceToNow } from 'date-fns';
formatDistanceToNow(new Date(draft.started_at)); // "5 minutes"
```

### Project Context

**Project Structure:**

```
c:\Users\lilra\myprojects\ProjectionCalculator/
  src/
    features/
      admin/
        components/
          AdminDashboard.tsx       # MODIFY - Add ActiveDraftsWidget
          ActiveDraftsWidget.tsx   # CREATE - Active drafts list
          DraftStatusBadge.tsx     # CREATE - Status badge
        hooks/
          useActiveDrafts.ts       # CREATE - Fetch with polling
        types/
          admin.types.ts           # MODIFY - Add ActiveDraft type
  supabase/
    migrations/
      010_draft_tables.sql         # EXISTING - Has drafts table
```

**Existing Dependencies:**

All required dependencies already installed:
- `react-router-dom` (navigation)
- `date-fns` (date formatting)
- `lucide-react` (Activity icon)
- `@supabase/supabase-js` (database queries)

---

## Tasks / Subtasks

- [x] **Task 1: Define ActiveDraft Type** (AC: type safety)
  - [x] Open `src/features/admin/types/admin.types.ts`
  - [x] Add ActiveDraft interface with all required fields
  - [x] Include nested league and user objects
  - [x] Export type

- [x] **Task 2: Create useActiveDrafts Hook** (AC: real-time updates)
  - [x] Create `src/features/admin/hooks/useActiveDrafts.ts`
  - [x] Import useState, useEffect, Supabase client
  - [x] Create fetchActiveDrafts async function
  - [x] Query drafts table with league and user joins
  - [x] Filter by status IN ('active', 'paused', 'error')
  - [x] Order by last_activity DESC
  - [x] Set up 30-second polling with setInterval
  - [x] Add cleanup to clear interval
  - [x] Return { drafts, loading, error, refetch }

- [x] **Task 3: Create DraftStatusBadge Component** (AC: status indicators)
  - [x] Create `src/features/admin/components/DraftStatusBadge.tsx`
  - [x] Accept status prop
  - [x] Define color mapping for each status
  - [x] Return colored badge span with status label
  - [x] Use emerald (active), yellow (paused), red (error), gray (completed)

- [x] **Task 4: Create ActiveDraftsWidget Component** (AC: display list)
  - [x] Create `src/features/admin/components/ActiveDraftsWidget.tsx`
  - [x] Import useActiveDrafts hook
  - [x] Import DraftStatusBadge, Activity icon
  - [x] Import formatDistanceToNow from date-fns
  - [x] Import useNavigate for click handling
  - [x] Show loading state while fetching
  - [x] Show error state if query fails
  - [x] Display header with "Active Drafts" title and Activity icon
  - [x] Show count badge with number of active drafts
  - [x] Map over drafts array to render list items
  - [x] Show league name, user, started time, last activity
  - [x] Show error_message if status = 'error'
  - [x] Add hover effect and click handler to navigate
  - [x] Show empty state if no drafts

- [x] **Task 5: Update AdminDashboard** (AC: dashboard integration)
  - [x] Open `src/features/admin/components/AdminDashboard.tsx`
  - [x] Import ActiveDraftsWidget
  - [x] Replace welcome card with ActiveDraftsWidget
  - [x] Use col-span-full lg:col-span-2 for responsive grid
  - [x] Add placeholder cards for future widgets

- [x] **Task 6: Update Feature Exports** (AC: clean imports)
  - [x] Open `src/features/admin/index.ts`
  - [x] Export ActiveDraftsWidget
  - [x] Export DraftStatusBadge
  - [x] Export useActiveDrafts
  - [x] Export ActiveDraft type

- [x] **Task 7: Add Tests** (AC: test coverage)
  - [x] Create `tests/features/admin/useActiveDrafts.test.tsx`
    - [x] Test: Fetches active drafts on mount
    - [x] Test: Polls every 30 seconds
    - [x] Test: Clears interval on unmount
    - [x] Test: Handles database errors
    - [x] Test: Filters by status correctly
    - [x] Mock Supabase query
  - [x] Create `tests/features/admin/DraftStatusBadge.test.tsx`
    - [x] Test: Renders "Active" with emerald background
    - [x] Test: Renders "Paused" with yellow background
    - [x] Test: Renders "Error" with red background
    - [x] Test: Renders "Completed" with gray background
  - [x] Create `tests/features/admin/ActiveDraftsWidget.test.tsx`
    - [x] Test: Shows loading state initially
    - [x] Test: Displays list of drafts
    - [x] Test: Shows draft count badge
    - [x] Test: Formats time with formatDistanceToNow
    - [x] Test: Shows error message for error drafts
    - [x] Test: Navigates on draft click
    - [x] Test: Shows empty state when no drafts

- [x] **Task 8: Test End-to-End** (AC: all acceptance criteria met)
  - [x] Verify: Active drafts widget displays on admin dashboard
  - [x] Verify: Shows count of active drafts
  - [x] Verify: Lists all active/paused/error drafts
  - [x] Verify: Displays league name, user email, times
  - [x] Verify: Status badges are color-coded correctly
  - [x] Verify: Drafts sorted by last activity (most recent first)
  - [x] Verify: Error drafts show error message in red
  - [x] Verify: Clicking draft navigates to detail page
  - [x] Verify: Widget polls every 30 seconds
  - [x] Verify: Empty state shows when no drafts
  - [x] Verify: Database join queries work correctly

- [x] **Task 9: Update Sprint Status** (AC: story tracking)
  - [x] Update `docs/sprint-artifacts/sprint-status.yaml`
  - [x] Change `13-2-display-active-drafts-list: ready-for-dev → in-progress`

---

## Dev Notes

### Implementation Approach

**Step-by-Step Implementation Order:**

1. **Type Definition**: Define ActiveDraft interface
2. **useActiveDrafts Hook**: Create data fetching with polling
3. **DraftStatusBadge**: Create reusable badge component
4. **ActiveDraftsWidget**: Build main widget component
5. **AdminDashboard Update**: Integrate widget into dashboard
6. **Testing**: Comprehensive tests for all components
7. **End-to-End**: Verify polling, navigation, status display

### Real-time Polling Strategy

**Why 30-Second Polling:**

- Balance between real-time and server load
- Drafts don't change rapidly enough to need <30s
- Reduces Supabase query costs
- Users won't notice 30s delay in admin dashboard

**Alternative Approaches (Future Enhancement):**

- **Supabase Realtime**: Subscribe to drafts table changes
- **WebSockets**: Push updates from server
- **GraphQL Subscriptions**: Real-time GraphQL queries

**Current Approach is Sufficient:**
- Simple implementation
- No additional infrastructure
- Easy to understand and debug

### Draft Status Lifecycle

**Status Transitions:**

1. **active**: Draft started, API syncing successfully
2. **paused**: User paused draft, no sync happening
3. **error**: API connection failed, manual mode enabled
4. **completed**: Draft finished, no longer active

**Admin Monitoring Focus:**

- **active**: Normal operation, monitor for issues
- **error**: Requires attention, investigate error_message
- **paused**: User-initiated, no action needed

### Click-through Navigation

**Future Story (Not Implemented Here):**

Clicking a draft navigates to `/admin/drafts/{draftId}`, which will show:
- Full draft details
- Bid history
- Error logs
- Sync status
- User contact info

**This Story:**
- Just navigation link (route doesn't exist yet)
- Future story will implement detail page

### Database Query Performance

**Optimization Considerations:**

**Join Query Performance:**
```sql
-- Query joins drafts → leagues → users
-- Indexed on status and last_activity
-- Typically <100 active drafts even during peak
-- Query time: <50ms
```

**Indexes Already Exist:**
- `drafts.status` (for IN filter)
- `drafts.last_activity` (for ORDER BY)
- Foreign keys indexed automatically

**No Additional Indexes Needed:**
- Current performance is excellent
- Adding indexes would slow down writes

### Common Issues & Solutions

**Issue 1: Polling Continues After Unmount**

Possible causes:
- Interval not cleared in cleanup

Solution:
- Always return cleanup function from useEffect
- Clear interval: `return () => clearInterval(intervalId)`

**Issue 2: Join Query Returns Null Objects**

Possible causes:
- Foreign key constraint broken
- RLS policy blocking joined data
- Deleted related records

Solution:
- Check foreign key constraints
- Verify RLS policies allow admins to read users/leagues
- Handle null cases: `draft.user?.email || 'Unknown'`

**Issue 3: Time Formatting Errors**

Possible causes:
- Invalid date string from database
- Missing date-fns import

Solution:
- Wrap in try/catch: `formatDistanceToNow(new Date(draft.started_at))`
- Fallback: Show raw timestamp if formatting fails

**Issue 4: Status Badge Colors Not Showing**

Possible causes:
- Tailwind classes not included
- Typo in status value

Solution:
- Verify status is exact match: 'active' not 'Active'
- Check Tailwind config includes all colors

### References

**Source Documents:**

- **Epic Definition:** docs/epics.md (lines 434-443)
- **FR55:** View list of active drafts
- **Previous Stories:**
  - Story 6.1: Draft state database tables
  - Story 9.2: Draft sync mechanism
  - Story 10.1: Error status tracking
  - Story 13.1: Admin dashboard route

**Related Stories:**

- **Foundation:** 13.1 - Create Admin Dashboard Route
- **Current:** 13.2 - Display Active Drafts List (this story)
- **Next Stories:**
  - 13.8 - Track Draft Completion Rates (use draft status data)
  - 13.9 - View Detailed Incident Logs (drill down from error drafts)

**External Resources:**

- [Supabase - Joins](https://supabase.com/docs/guides/database/joins)
- [date-fns - formatDistanceToNow](https://date-fns.org/docs/formatDistanceToNow)
- [React - useEffect Cleanup](https://react.dev/reference/react/useEffect#parameters)

---

## Summary

Story 13.2 "Display Active Drafts List" adds real-time draft monitoring to the admin dashboard.

**Deliverable:**

Create ActiveDraftsWidget that displays:
- List of all active/paused/error drafts across all users
- Draft details: league name, user, status, times, errors
- Color-coded status badges
- Real-time updates via 30-second polling
- Click-through navigation to draft details
- Empty state when no active drafts

**Key Technical Decisions:**

1. **30-Second Polling**: Balance real-time and server load
2. **Join Queries**: Single query for drafts + leagues + users
3. **Status Badges**: Reusable component for all admin features
4. **formatDistanceToNow**: User-friendly relative time display
5. **Error Highlighting**: Red text for error messages

**Dependencies:**

- Story 13.1 (Previous): Admin dashboard route
- Story 6.1 (Complete): Draft state database tables
- Story 9.2 (Complete): Draft sync and last_activity tracking
- Story 10.1 (Complete): Error status detection

**Epic Progress:**

This is the second story in Epic 13. Completing this story:
- Adds first data-driven widget to admin dashboard
- Enables Story 13.9 (Incident logs drill-down)
- Enables Story 13.8 (Draft completion tracking)
- Establishes pattern for other monitoring widgets

**Implementation Estimate:** 4-5 hours (Hook, badge, widget, tests)

**Testing:** Unit tests for hook, badge, widget + Integration tests for polling + End-to-end verification of all acceptance criteria

**Next Step:** After completion, implement Story 13.3 (Monitor API Health) to add API monitoring widget.
