# Story 13.3: Monitor API Health for Integrations

**Story ID:** 13.3
**Story Key:** 13-3-monitor-api-health-for-integrations
**Epic:** Epic 13 - Admin Operations & Monitoring
**Status:** dev-complete

---

## Story

As an **administrator**,
I want to monitor the health status of all API integrations,
So that I can quickly identify and respond to API failures during peak draft season.

---

## Acceptance Criteria

**Given** I am on the admin dashboard at `/admin`
**When** I view the API Health widget
**Then** I see real-time status for all three API integrations:
- Couch Managers API (draft sync)
- Fangraphs API (player projections)
- Google Sheets API (custom projections)
**And** each API shows status: "Healthy", "Degraded", "Down"
**And** status indicators are color-coded: green (healthy), yellow (degraded), red (down)
**And** each API displays: last successful call timestamp, response time, error rate
**And** the widget polls health status every 60 seconds
**And** clicking an API expands details showing recent error logs
**And** "Down" status triggers visual alert (red border on widget)
**And** the UI follows dark slate theme with status-based color coding

---

## Developer Context

### Story Foundation from Epic

From **Epic 13: Admin Operations & Monitoring** (docs/epics.md lines 434-443):

This story implements API health monitoring (FR56), enabling administrators to view real-time status of all API integrations. It's the third story in Epic 13 and adds critical infrastructure monitoring to the admin dashboard.

**Core Responsibilities:**

- **Health Check Queries:** Ping each API to verify availability
- **Status Indicators:** Display green/yellow/red status for each API
- **Metrics Display:** Show last successful call, response time, error rate
- **Real-time Updates:** Poll health status every 60 seconds
- **Error Details:** Expandable section showing recent API errors
- **Alert Visual:** Red border when any API is down

**Relationship to Epic 13:**

This is Story 3 of 11 in Epic 13. It depends on:
- **Story 13.1 (Previous)**: Admin dashboard route and layout
- **Story 13.2 (Previous)**: Widget pattern established

It enables:
- **Story 13.4**: View Error Rates (drill down from API health)
- **Story 13.10**: Drill Down into Error Logs (detailed API errors)

It builds on:
- **Epic 4 (Complete)**: Fangraphs and Google Sheets integrations
- **Epic 9 (Complete)**: Couch Managers integration

### Previous Story Intelligence

**From Story 4.4 (Implement Fangraphs API Integration - COMPLETED):**

**Fangraphs API Endpoint:**
```typescript
const FANGRAPHS_API = 'https://www.fangraphs.com/api/projections';
```

**Health Check Pattern:**
```typescript
async function checkFangraphsHealth(): Promise<HealthStatus> {
  try {
    const start = Date.now();
    const response = await fetch(FANGRAPHS_API + '/health');
    const responseTime = Date.now() - start;

    if (response.ok) {
      return { status: 'healthy', responseTime };
    } else {
      return { status: 'degraded', responseTime };
    }
  } catch (error) {
    return { status: 'down', responseTime: null };
  }
}
```

**From Story 4.2 (Implement Google Sheets OAuth Integration - COMPLETED):**

**Google Sheets API Health:**

Google Sheets API uses OAuth tokens stored in database. Health check verifies:
1. Token exists and not expired
2. API endpoint responds
3. Read permission available

**From Story 9.2 (Implement Connection to Couch Managers - COMPLETED):**

**Couch Managers API Health:**

Couch Managers API health check pattern:
```typescript
async function checkCouchManagersHealth(): Promise<HealthStatus> {
  try {
    const start = Date.now();
    const response = await fetch(`${COUCH_MANAGERS_API}/health`);
    const responseTime = Date.now() - start;

    if (response.ok) {
      return { status: 'healthy', responseTime };
    } else {
      return { status: 'degraded', responseTime };
    }
  } catch (error) {
    return { status: 'down', responseTime: null };
  }
}
```

### Architecture Requirements

**From Architecture Document (docs/architecture.md):**

#### API Health Check Service

**Centralized Health Check Logic:**

Create a service that checks all API integrations:

```typescript
// src/features/admin/services/apiHealthService.ts

export interface APIHealthStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  lastSuccessfulCall: string | null;
  responseTime: number | null;
  errorRate: number;
  recentErrors: string[];
}

export async function checkAllAPIs(): Promise<APIHealthStatus[]> {
  const [couchManagers, fangraphs, googleSheets] = await Promise.all([
    checkCouchManagersAPI(),
    checkFangraphsAPI(),
    checkGoogleSheetsAPI(),
  ]);

  return [couchManagers, fangraphs, googleSheets];
}
```

#### Database Schema - API Health Logs

**Track API Call History:**

Create migration: `supabase/migrations/015_api_health_logs.sql`

```sql
CREATE TABLE api_health_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_name TEXT NOT NULL CHECK (api_name IN ('couch_managers', 'fangraphs', 'google_sheets')),
  status TEXT NOT NULL CHECK (status IN ('healthy', 'degraded', 'down')),
  response_time_ms INTEGER,
  error_message TEXT,
  checked_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast queries
CREATE INDEX idx_api_health_logs_api_name_checked_at ON api_health_logs(api_name, checked_at DESC);

-- Function to get error rate for last 100 calls
CREATE OR REPLACE FUNCTION get_api_error_rate(api_name_param TEXT)
RETURNS NUMERIC AS $$
  SELECT
    ROUND(
      COUNT(*) FILTER (WHERE status IN ('degraded', 'down'))::NUMERIC /
      NULLIF(COUNT(*), 0) * 100,
      2
    )
  FROM (
    SELECT status
    FROM api_health_logs
    WHERE api_name = api_name_param
    ORDER BY checked_at DESC
    LIMIT 100
  ) recent_calls;
$$ LANGUAGE SQL;
```

#### Project Organization - Feature-Based

**Required File Structure:**
```
src/features/admin/
  components/
    AdminDashboard.tsx         # MODIFY - Add APIHealthWidget
    APIHealthWidget.tsx        # CREATE - API health monitoring
    APIStatusCard.tsx          # CREATE - Individual API status
  hooks/
    useAPIHealth.ts            # CREATE - Fetch API health with polling
  services/
    apiHealthService.ts        # CREATE - Health check logic
  types/
    admin.types.ts             # MODIFY - Add APIHealthStatus type

supabase/
  migrations/
    015_api_health_logs.sql    # CREATE - API health tracking
```

**Key Principles:**
- **Service Layer:** Health check logic in apiHealthService.ts
- **Widget Component:** APIHealthWidget is self-contained
- **Individual Cards:** APIStatusCard for each API
- **Database Tracking:** Log all health checks for historical analysis

### UX Requirements

**From UX Design Specification (docs/ux-design-specification.md):**

#### Visual Design Consistency

**API Health Widget Styling:**
- **Card layout** - bg-slate-900 with slate-800 border
- **Status colors** - Green (healthy), yellow (degraded), red (down)
- **Alert border** - Red border when any API is down
- **Grid layout** - 3 columns for 3 APIs on desktop
- **Typography** - text-lg for API name, text-sm for metrics

**Status Indicator:**
```typescript
const statusColors = {
  healthy: 'bg-emerald-500',
  degraded: 'bg-yellow-500',
  down: 'bg-red-500',
};
```

#### API Health Widget Layout

**Widget Structure:**

```typescript
<div className={`bg-slate-900 border rounded-lg p-6 ${
  hasDownAPI ? 'border-red-500' : 'border-slate-800'
}`}>
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-xl font-semibold text-white">API Health</h2>
    <div className="flex items-center gap-2">
      <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
      <span className="text-sm text-slate-400">Monitoring</span>
    </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {apiStatuses.map(api => (
      <APIStatusCard key={api.name} api={api} />
    ))}
  </div>
</div>
```

**APIStatusCard Structure:**

```typescript
<div className="bg-slate-800 rounded-lg p-4">
  <div className="flex items-center justify-between mb-3">
    <h3 className="text-lg font-medium text-white">{api.name}</h3>
    <div className={`h-3 w-3 rounded-full ${statusColors[api.status]}`} />
  </div>

  <div className="space-y-2 text-sm">
    <div className="flex justify-between">
      <span className="text-slate-400">Status:</span>
      <span className={statusTextColors[api.status]}>
        {api.status.charAt(0).toUpperCase() + api.status.slice(1)}
      </span>
    </div>
    <div className="flex justify-between">
      <span className="text-slate-400">Response:</span>
      <span className="text-white">
        {api.responseTime ? `${api.responseTime}ms` : 'N/A'}
      </span>
    </div>
    <div className="flex justify-between">
      <span className="text-slate-400">Error Rate:</span>
      <span className="text-white">{api.errorRate}%</span>
    </div>
    {api.lastSuccessfulCall && (
      <div className="flex justify-between">
        <span className="text-slate-400">Last Success:</span>
        <span className="text-white">
          {formatDistanceToNow(new Date(api.lastSuccessfulCall))} ago
        </span>
      </div>
    )}
  </div>

  {/* Expandable Error Details */}
  {api.recentErrors.length > 0 && (
    <button
      onClick={() => setExpanded(!expanded)}
      className="mt-3 text-sm text-red-400 hover:text-red-300"
    >
      {expanded ? 'Hide' : 'Show'} Recent Errors ({api.recentErrors.length})
    </button>
  )}
</div>
```

#### User Flow

**Admin Monitoring Flow:**
1. Admin navigates to /admin dashboard
2. APIHealthWidget displays with status for all 3 APIs
3. Widget polls health every 60 seconds
4. Admin sees green status for all healthy APIs
5. Fangraphs API goes down
6. Widget border turns red (alert)
7. Fangraphs card shows "Down" status in red
8. Admin clicks "Show Recent Errors" to view details
9. Admin investigates error messages
10. Admin takes corrective action

**Error Handling:**
- Health check failures: Mark API as "down"
- Database errors: Show last known status
- Polling failures: Continue showing last data

### Technical Requirements

#### APIHealthStatus Type Definition

**Add to src/features/admin/types/admin.types.ts:**

```typescript
export interface APIHealthStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  lastSuccessfulCall: string | null;
  responseTime: number | null;
  errorRate: number;
  recentErrors: string[];
}
```

#### API Health Service

**Create src/features/admin/services/apiHealthService.ts:**

```typescript
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { APIHealthStatus } from '../types/admin.types';

const COUCH_MANAGERS_API = import.meta.env.VITE_COUCH_MANAGERS_API_URL;
const FANGRAPHS_API = import.meta.env.VITE_FANGRAPHS_API_URL;

async function checkCouchManagersAPI(): Promise<APIHealthStatus> {
  try {
    const start = Date.now();
    const response = await fetch(`${COUCH_MANAGERS_API}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5s timeout
    });
    const responseTime = Date.now() - start;

    const status = response.ok ? 'healthy' : 'degraded';
    await logHealthCheck('couch_managers', status, responseTime, null);

    return {
      name: 'Couch Managers',
      status,
      responseTime,
      lastSuccessfulCall: await getLastSuccessfulCall('couch_managers'),
      errorRate: await getErrorRate('couch_managers'),
      recentErrors: await getRecentErrors('couch_managers'),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await logHealthCheck('couch_managers', 'down', null, errorMessage);

    return {
      name: 'Couch Managers',
      status: 'down',
      responseTime: null,
      lastSuccessfulCall: await getLastSuccessfulCall('couch_managers'),
      errorRate: await getErrorRate('couch_managers'),
      recentErrors: await getRecentErrors('couch_managers'),
    };
  }
}

async function checkFangraphsAPI(): Promise<APIHealthStatus> {
  try {
    const start = Date.now();
    const response = await fetch(`${FANGRAPHS_API}/projections`, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
    });
    const responseTime = Date.now() - start;

    const status = response.ok ? 'healthy' : 'degraded';
    await logHealthCheck('fangraphs', status, responseTime, null);

    return {
      name: 'Fangraphs',
      status,
      responseTime,
      lastSuccessfulCall: await getLastSuccessfulCall('fangraphs'),
      errorRate: await getErrorRate('fangraphs'),
      recentErrors: await getRecentErrors('fangraphs'),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await logHealthCheck('fangraphs', 'down', null, errorMessage);

    return {
      name: 'Fangraphs',
      status: 'down',
      responseTime: null,
      lastSuccessfulCall: await getLastSuccessfulCall('fangraphs'),
      errorRate: await getErrorRate('fangraphs'),
      recentErrors: await getRecentErrors('fangraphs'),
    };
  }
}

async function checkGoogleSheetsAPI(): Promise<APIHealthStatus> {
  try {
    const start = Date.now();
    // Check if we have valid OAuth token
    const supabase = getSupabase();
    const { data: tokens } = await supabase
      .from('google_oauth_tokens')
      .select('access_token, expires_at')
      .limit(1)
      .single();

    if (!tokens || new Date(tokens.expires_at) < new Date()) {
      await logHealthCheck('google_sheets', 'degraded', null, 'No valid OAuth token');
      return {
        name: 'Google Sheets',
        status: 'degraded',
        responseTime: null,
        lastSuccessfulCall: await getLastSuccessfulCall('google_sheets'),
        errorRate: await getErrorRate('google_sheets'),
        recentErrors: await getRecentErrors('google_sheets'),
      };
    }

    // Ping Google Sheets API
    const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'HEAD',
      headers: { Authorization: `Bearer ${tokens.access_token}` },
      signal: AbortSignal.timeout(5000),
    });
    const responseTime = Date.now() - start;

    const status = response.ok ? 'healthy' : 'degraded';
    await logHealthCheck('google_sheets', status, responseTime, null);

    return {
      name: 'Google Sheets',
      status,
      responseTime,
      lastSuccessfulCall: await getLastSuccessfulCall('google_sheets'),
      errorRate: await getErrorRate('google_sheets'),
      recentErrors: await getRecentErrors('google_sheets'),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await logHealthCheck('google_sheets', 'down', null, errorMessage);

    return {
      name: 'Google Sheets',
      status: 'down',
      responseTime: null,
      lastSuccessfulCall: await getLastSuccessfulCall('google_sheets'),
      errorRate: await getErrorRate('google_sheets'),
      recentErrors: await getRecentErrors('google_sheets'),
    };
  }
}

async function logHealthCheck(
  apiName: string,
  status: string,
  responseTime: number | null,
  errorMessage: string | null
) {
  if (!isSupabaseConfigured()) return;

  const supabase = getSupabase();
  await supabase.from('api_health_logs').insert({
    api_name: apiName,
    status,
    response_time_ms: responseTime,
    error_message: errorMessage,
  });
}

async function getLastSuccessfulCall(apiName: string): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabase();
  const { data } = await supabase
    .from('api_health_logs')
    .select('checked_at')
    .eq('api_name', apiName)
    .eq('status', 'healthy')
    .order('checked_at', { ascending: false })
    .limit(1)
    .single();

  return data?.checked_at ?? null;
}

async function getErrorRate(apiName: string): Promise<number> {
  if (!isSupabaseConfigured()) return 0;

  const supabase = getSupabase();
  const { data } = await supabase.rpc('get_api_error_rate', {
    api_name_param: apiName,
  });

  return data ?? 0;
}

async function getRecentErrors(apiName: string): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = getSupabase();
  const { data } = await supabase
    .from('api_health_logs')
    .select('error_message')
    .eq('api_name', apiName)
    .not('error_message', 'is', null)
    .order('checked_at', { ascending: false })
    .limit(5);

  return data?.map(log => log.error_message).filter(Boolean) ?? [];
}

export async function checkAllAPIs(): Promise<APIHealthStatus[]> {
  const [couchManagers, fangraphs, googleSheets] = await Promise.all([
    checkCouchManagersAPI(),
    checkFangraphsAPI(),
    checkGoogleSheetsAPI(),
  ]);

  return [couchManagers, fangraphs, googleSheets];
}
```

#### useAPIHealth Hook

**Create src/features/admin/hooks/useAPIHealth.ts:**

```typescript
import { useState, useEffect } from 'react';
import { checkAllAPIs } from '../services/apiHealthService';
import type { APIHealthStatus } from '../types/admin.types';

export function useAPIHealth() {
  const [apiStatuses, setApiStatuses] = useState<APIHealthStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAPIHealth = async () => {
    try {
      const statuses = await checkAllAPIs();
      setApiStatuses(statuses);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchAPIHealth();

    // Poll every 60 seconds
    const intervalId = setInterval(() => {
      fetchAPIHealth();
    }, 60000);

    // Cleanup
    return () => clearInterval(intervalId);
  }, []);

  const hasDownAPI = apiStatuses.some(api => api.status === 'down');

  return { apiStatuses, loading, error, hasDownAPI, refetch: fetchAPIHealth };
}
```

#### APIStatusCard Component

**Create src/features/admin/components/APIStatusCard.tsx:**

```typescript
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { APIHealthStatus } from '../types/admin.types';

interface APIStatusCardProps {
  api: APIHealthStatus;
}

export function APIStatusCard({ api }: APIStatusCardProps) {
  const [expanded, setExpanded] = useState(false);

  const statusColors = {
    healthy: 'bg-emerald-500',
    degraded: 'bg-yellow-500',
    down: 'bg-red-500',
  };

  const statusTextColors = {
    healthy: 'text-emerald-400',
    degraded: 'text-yellow-400',
    down: 'text-red-400',
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium text-white">{api.name}</h3>
        <div className={`h-3 w-3 rounded-full ${statusColors[api.status]}`} />
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Status:</span>
          <span className={`font-medium ${statusTextColors[api.status]}`}>
            {api.status.charAt(0).toUpperCase() + api.status.slice(1)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Response:</span>
          <span className="text-white">
            {api.responseTime ? `${api.responseTime}ms` : 'N/A'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Error Rate:</span>
          <span className="text-white">{api.errorRate.toFixed(1)}%</span>
        </div>
        {api.lastSuccessfulCall && (
          <div className="flex justify-between">
            <span className="text-slate-400">Last Success:</span>
            <span className="text-white text-xs">
              {formatDistanceToNow(new Date(api.lastSuccessfulCall))} ago
            </span>
          </div>
        )}
      </div>

      {api.recentErrors.length > 0 && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            {expanded ? 'Hide' : 'Show'} Recent Errors ({api.recentErrors.length})
          </button>
          {expanded && (
            <div className="mt-2 space-y-1">
              {api.recentErrors.map((error, index) => (
                <div key={index} className="text-xs text-red-400 bg-red-950 p-2 rounded">
                  {error}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

#### APIHealthWidget Component

**Create src/features/admin/components/APIHealthWidget.tsx:**

```typescript
import { Activity } from 'lucide-react';
import { useAPIHealth } from '../hooks/useAPIHealth';
import { APIStatusCard } from './APIStatusCard';

export function APIHealthWidget() {
  const { apiStatuses, loading, error, hasDownAPI } = useAPIHealth();

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <div className="text-slate-400">Loading API health status...</div>
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
    <div className={`bg-slate-900 border rounded-lg p-6 ${
      hasDownAPI ? 'border-red-500' : 'border-slate-800'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-emerald-500" />
          <h2 className="text-xl font-semibold text-white">API Health</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm text-slate-400">Monitoring</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {apiStatuses.map(api => (
          <APIStatusCard key={api.name} api={api} />
        ))}
      </div>
    </div>
  );
}
```

#### Update AdminDashboard

**Modify src/features/admin/components/AdminDashboard.tsx:**

```typescript
// Add import
import { APIHealthWidget } from './APIHealthWidget';

// Add to grid
<main className="p-6">
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Active Drafts Widget */}
    <div className="lg:col-span-2">
      <ActiveDraftsWidget />
    </div>

    {/* API Health Widget */}
    <div className="lg:col-span-1">
      <APIHealthWidget />
    </div>
  </div>
</main>
```

---

## Tasks / Subtasks

- [ ] **Task 1: Create API Health Logs Database Migration** (AC: track health history)
  - [ ] Create `supabase/migrations/015_api_health_logs.sql`
  - [ ] Add api_health_logs table with columns: api_name, status, response_time_ms, error_message, checked_at
  - [ ] Add CHECK constraints for api_name and status values
  - [ ] Create index on (api_name, checked_at DESC)
  - [ ] Create get_api_error_rate() function
  - [ ] Run migration: `npx supabase db push`
  - [ ] Verify table and function created

- [ ] **Task 2: Define APIHealthStatus Type** (AC: type safety)
  - [ ] Open `src/features/admin/types/admin.types.ts`
  - [ ] Add APIHealthStatus interface
  - [ ] Include all required fields: name, status, lastSuccessfulCall, responseTime, errorRate, recentErrors
  - [ ] Export type

- [ ] **Task 3: Create API Health Service** (AC: health check logic)
  - [ ] Create `src/features/admin/services/apiHealthService.ts`
  - [ ] Import Supabase client
  - [ ] Create checkCouchManagersAPI() function with 5s timeout
  - [ ] Create checkFangraphsAPI() function with 5s timeout
  - [ ] Create checkGoogleSheetsAPI() function with OAuth token check
  - [ ] Create logHealthCheck() helper to insert logs
  - [ ] Create getLastSuccessfulCall() helper
  - [ ] Create getErrorRate() helper using RPC
  - [ ] Create getRecentErrors() helper
  - [ ] Create checkAllAPIs() function using Promise.all
  - [ ] Export checkAllAPIs

- [ ] **Task 4: Create useAPIHealth Hook** (AC: real-time polling)
  - [ ] Create `src/features/admin/hooks/useAPIHealth.ts`
  - [ ] Import checkAllAPIs service
  - [ ] Create fetchAPIHealth async function
  - [ ] Set up 60-second polling with setInterval
  - [ ] Add cleanup to clear interval
  - [ ] Calculate hasDownAPI flag
  - [ ] Return { apiStatuses, loading, error, hasDownAPI, refetch }

- [ ] **Task 5: Create APIStatusCard Component** (AC: individual API display)
  - [ ] Create `src/features/admin/components/APIStatusCard.tsx`
  - [ ] Import formatDistanceToNow from date-fns
  - [ ] Accept api prop of type APIHealthStatus
  - [ ] Add useState for expanded state
  - [ ] Display API name and status dot
  - [ ] Show status, response time, error rate, last success
  - [ ] Color-code status text and dot
  - [ ] Add expandable recent errors section
  - [ ] Show errors in red background boxes when expanded

- [ ] **Task 6: Create APIHealthWidget Component** (AC: health monitoring widget)
  - [ ] Create `src/features/admin/components/APIHealthWidget.tsx`
  - [ ] Import useAPIHealth hook
  - [ ] Import APIStatusCard component
  - [ ] Import Activity icon from lucide-react
  - [ ] Show loading state
  - [ ] Show error state
  - [ ] Display header with "API Health" title and Activity icon
  - [ ] Show "Monitoring" badge with pulse animation
  - [ ] Use red border if hasDownAPI is true
  - [ ] Grid layout for 3 API cards
  - [ ] Map over apiStatuses to render APIStatusCard

- [ ] **Task 7: Update AdminDashboard** (AC: dashboard integration)
  - [ ] Open `src/features/admin/components/AdminDashboard.tsx`
  - [ ] Import APIHealthWidget
  - [ ] Add APIHealthWidget to grid
  - [ ] Use lg:col-span-1 for responsive layout
  - [ ] Position next to Active Drafts widget

- [ ] **Task 8: Update Environment Variables** (AC: API endpoints configured)
  - [ ] Open `.env.example`
  - [ ] Add VITE_COUCH_MANAGERS_API_URL
  - [ ] Add VITE_FANGRAPHS_API_URL
  - [ ] Document required API URLs
  - [ ] Update local .env file with actual URLs

- [ ] **Task 9: Add Tests** (AC: test coverage)
  - [ ] Create `tests/features/admin/apiHealthService.test.ts`
    - [ ] Test: checkCouchManagersAPI returns healthy status
    - [ ] Test: checkFangraphsAPI handles timeout
    - [ ] Test: checkGoogleSheetsAPI validates OAuth token
    - [ ] Test: logHealthCheck inserts database record
    - [ ] Test: getErrorRate calculates correctly
    - [ ] Mock fetch and Supabase
  - [ ] Create `tests/features/admin/useAPIHealth.test.tsx`
    - [ ] Test: Fetches API health on mount
    - [ ] Test: Polls every 60 seconds
    - [ ] Test: Sets hasDownAPI flag correctly
    - [ ] Test: Handles service errors
  - [ ] Create `tests/features/admin/APIStatusCard.test.tsx`
    - [ ] Test: Displays API name and status
    - [ ] Test: Shows green dot for healthy
    - [ ] Test: Shows red dot for down
    - [ ] Test: Expands to show recent errors
  - [ ] Create `tests/features/admin/APIHealthWidget.test.tsx`
    - [ ] Test: Shows loading state
    - [ ] Test: Displays 3 API cards
    - [ ] Test: Red border when API is down
    - [ ] Test: Pulse animation on monitoring badge

- [ ] **Task 10: Test End-to-End** (AC: all acceptance criteria met)
  - [ ] Verify: API Health widget displays on admin dashboard
  - [ ] Verify: Shows status for all 3 APIs
  - [ ] Verify: Status indicators color-coded (green/yellow/red)
  - [ ] Verify: Displays response time, error rate, last success
  - [ ] Verify: Widget polls every 60 seconds
  - [ ] Verify: Clicking API expands to show errors
  - [ ] Verify: Red border appears when API is down
  - [ ] Verify: Health checks logged to database
  - [ ] Verify: Error rate calculation works
  - [ ] Verify: Recent errors display correctly

- [ ] **Task 11: Update Sprint Status** (AC: story tracking)
  - [ ] Update `docs/sprint-artifacts/sprint-status.yaml`
  - [ ] Change `13-3-monitor-api-health-for-integrations: backlog → ready-for-dev`

---

## Dev Notes

### Implementation Approach

**Step-by-Step Implementation Order:**

1. **Database Migration**: Create api_health_logs table
2. **API Health Service**: Implement health check logic for all 3 APIs
3. **useAPIHealth Hook**: Create polling mechanism
4. **APIStatusCard**: Build individual API status display
5. **APIHealthWidget**: Assemble complete widget
6. **AdminDashboard Update**: Integrate widget
7. **Testing**: Comprehensive tests for all components
8. **End-to-End**: Verify polling, alerts, error display

### Health Check Strategy

**Why 60-Second Polling:**

- APIs are stable, don't change rapidly
- Reduces API usage costs
- Still provides near-real-time monitoring
- Admin dashboards don't need <60s updates

**5-Second Timeout:**

- Prevents hanging requests
- Marks API as "down" if timeout exceeded
- User-friendly response time

### API Health Status Logic

**Status Determination:**

- **Healthy**: Response within 5s, status 200-299
- **Degraded**: Response within 5s, status 400-499
- **Down**: Timeout or status 500+

**Error Rate Calculation:**

- Last 100 health checks
- Percentage with status = degraded or down
- Updated on every health check

### Database vs Real-time Checks

**Why Log to Database:**

- Historical tracking (Story 13.5 uses this)
- Error rate calculation
- Incident log correlation
- Performance trend analysis

**Why Also Do Real-time Checks:**

- Immediate status visibility
- No database lag
- Fresh response time data

### Expandable Error Details

**Pattern:**

- Collapsed by default (clean UI)
- Click to expand (progressive disclosure)
- Show last 5 errors (recent context)
- Red background (visual alert)

**Why Limit to 5 Errors:**

- Prevents UI clutter
- Most recent errors most relevant
- Full error logs in Story 13.10

### Common Issues & Solutions

**Issue 1: CORS Errors on Health Checks**

Possible causes:
- API doesn't allow cross-origin requests
- Missing CORS headers

Solution:
- Use server-side health checks (Edge Function)
- Or use HEAD requests instead of GET
- Or proxy through backend

**Issue 2: Google Sheets OAuth Token Expired**

Possible causes:
- Token expiration not handled
- Refresh token not stored

Solution:
- Check expires_at before health check
- Mark as "degraded" if expired
- Don't fail completely (handle gracefully)

**Issue 3: Polling Continues After Component Unmount**

Possible causes:
- Interval not cleared in cleanup

Solution:
- Always return cleanup: `return () => clearInterval(intervalId)`

**Issue 4: Error Rate Shows 0% When Should Be Higher**

Possible causes:
- RPC function not created
- Not enough data in api_health_logs
- Division by zero edge case

Solution:
- Verify RPC function exists
- Insert test data for development
- Use NULLIF in SQL to prevent division by zero

### References

**Source Documents:**

- **Epic Definition:** docs/epics.md (lines 434-443)
- **FR56:** Monitor API health for integrations
- **Previous Stories:**
  - Story 4.2: Google Sheets OAuth integration
  - Story 4.4: Fangraphs API integration
  - Story 9.2: Couch Managers API integration
  - Story 13.1: Admin dashboard route
  - Story 13.2: Active drafts widget pattern

**Related Stories:**

- **Foundation:** 13.1, 13.2 - Admin dashboard and widget pattern
- **Current:** 13.3 - Monitor API Health (this story)
- **Next Stories:**
  - 13.4 - View Error Rates (uses api_health_logs)
  - 13.10 - Drill Down into Error Logs (detailed API errors)

**External Resources:**

- [Fetch API - AbortSignal.timeout](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static)
- [Supabase - RPC Functions](https://supabase.com/docs/guides/database/functions)

---

## Summary

Story 13.3 "Monitor API Health for Integrations" adds real-time API monitoring to the admin dashboard.

**Deliverable:**

Create APIHealthWidget that displays:
- Real-time status for Couch Managers, Fangraphs, Google Sheets APIs
- Color-coded status indicators (green/yellow/red)
- Response time, error rate, last successful call metrics
- Expandable recent error details
- Red border alert when any API is down
- 60-second polling for continuous monitoring
- Historical health check logging

**Key Technical Decisions:**

1. **60-Second Polling**: Balance real-time and API costs
2. **5-Second Timeout**: Prevent hanging requests
3. **Database Logging**: Track all health checks for analysis
4. **Expandable Errors**: Progressive disclosure pattern
5. **Red Border Alert**: Visual indication of critical issues

**Dependencies:**

- Story 13.1 (Previous): Admin dashboard route
- Story 13.2 (Previous): Widget pattern established
- Story 4.2, 4.4, 9.2 (Complete): API integrations

**Epic Progress:**

This is the third story in Epic 13. Completing this story:
- Adds critical infrastructure monitoring
- Enables Story 13.4 (Error rates using health logs)
- Enables Story 13.10 (Detailed error logs)
- Establishes health check pattern for system monitoring

**Implementation Estimate:** 5-6 hours (Migration, service, hooks, components, tests)

**Testing:** Unit tests for service, hook, components + Integration tests for polling + End-to-end verification of all acceptance criteria

**Next Step:** After completion, implement Story 13.4 (View Error Rates with Automated Alerts) to add error rate tracking.
