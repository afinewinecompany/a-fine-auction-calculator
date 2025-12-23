# Story 4.7: Display Projection Source and Timestamp

**Story ID:** 4.7
**Story Key:** 4-7-display-projection-source-and-timestamp
**Epic:** Epic 4 - Projection Data Management
**Status:** done

---

## Story

As a **user**,
I want to view the projection source and last updated timestamp for my league,
So that I know which data I'm using and how current it is.

---

## Acceptance Criteria

**Given** my league has loaded projections
**When** I view the projections page or draft dashboard
**Then** I can see the projection source displayed: "Google Sheets" or "Fangraphs - Steamer"
**And** I can see the last updated timestamp: "Last updated: Dec 12, 2025 2:30 AM"
**And** the timestamp is formatted using date-fns per Architecture
**And** the information is prominently displayed at the top of the projections list
**And** hovering over the timestamp shows the full date/time

---

## Developer Context

### Story Foundation from Epic

From **Epic 4: Projection Data Management** (docs/epics-stories.md lines 548-562):

This story implements the UI display of projection metadata, helping users understand their data source and freshness. It's a display-only story that reads from existing data.

**Core Responsibilities:**

- **Source Display:** Show projection source prominently
- **Timestamp Display:** Show last updated time with formatting
- **Relative Time:** Use date-fns for human-readable timestamps
- **Tooltip:** Full date/time on hover
- **Placement:** Prominent position at top of projections list

**Relationship to Epic 4:**

This is Story 7 of 8 in Epic 4. It depends on Story 4.1 (database) and uses data from Stories 4.3, 4.5, and 4.6.

### Architecture Requirements

**From Architecture Document (docs/architecture.md):**

**Date Formatting:**
- Use date-fns v4.1.0 for all date operations
- Relative time: `formatDistanceToNow()` for "5 minutes ago"
- Absolute time: `format()` for full date/time display

**UI Patterns:**
- Dark theme with slate backgrounds
- Emerald accents for important information
- Tooltips for additional context

### Technical Requirements

#### ProjectionInfo Component

```typescript
// src/features/projections/components/ProjectionInfo.tsx

import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { Info, RefreshCw } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface ProjectionInfoProps {
  source: string | null;
  updatedAt: string | null;
  playerCount: number;
}

export function ProjectionInfo({ source, updatedAt, playerCount }: ProjectionInfoProps) {
  if (!source) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <div className="flex items-center gap-2 text-slate-400">
          <Info className="h-5 w-5" />
          <span>No projections loaded. Import projections to get started.</span>
        </div>
      </div>
    );
  }

  const parsedDate = updatedAt ? parseISO(updatedAt) : null;
  const relativeTime = parsedDate ? formatDistanceToNow(parsedDate, { addSuffix: true }) : 'Unknown';
  const fullDateTime = parsedDate ? format(parsedDate, "MMMM d, yyyy 'at' h:mm a") : 'Unknown';

  const isStale = parsedDate && Date.now() - parsedDate.getTime() > 24 * 60 * 60 * 1000; // 24 hours

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-sm text-slate-400">Projection Source</span>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="bg-emerald-900/30 border-emerald-700 text-emerald-300">
                {source}
              </Badge>
              <span className="text-sm text-slate-400">
                ({playerCount.toLocaleString()} players)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${isStale ? 'text-yellow-400' : 'text-slate-400'}`} />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <span className="text-sm text-slate-400">Last updated: </span>
                  <span className={`text-sm ${isStale ? 'text-yellow-400' : 'text-slate-200'}`}>
                    {relativeTime}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-900 border-slate-700">
                <p>{fullDateTime}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {isStale && (
        <div className="mt-3 text-sm text-yellow-400 flex items-center gap-2">
          <Info className="h-4 w-4" />
          Projections are more than 24 hours old. Consider refreshing.
        </div>
      )}
    </div>
  );
}
```

#### useProjectionInfo Hook

```typescript
// src/features/projections/hooks/useProjectionInfo.ts

import { useEffect, useState } from 'react';
import { useSupabase } from '@/lib/supabase';

interface ProjectionInfo {
  source: string | null;
  updatedAt: string | null;
  playerCount: number;
  loading: boolean;
}

export function useProjectionInfo(leagueId: string): ProjectionInfo {
  const [info, setInfo] = useState<ProjectionInfo>({
    source: null,
    updatedAt: null,
    playerCount: 0,
    loading: true,
  });
  const supabase = useSupabase();

  useEffect(() => {
    async function fetchInfo() {
      // Get most recent projection for source and timestamp
      const { data, error } = await supabase
        .from('player_projections')
        .select('projection_source, updated_at')
        .eq('league_id', leagueId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
        console.error('Error fetching projection info:', error);
        setInfo(prev => ({ ...prev, loading: false }));
        return;
      }

      // Get player count
      const { count } = await supabase
        .from('player_projections')
        .select('id', { count: 'exact', head: true })
        .eq('league_id', leagueId);

      setInfo({
        source: data?.projection_source ?? null,
        updatedAt: data?.updated_at ?? null,
        playerCount: count ?? 0,
        loading: false,
      });
    }

    fetchInfo();
  }, [leagueId, supabase]);

  return info;
}
```

#### Integration Example

```typescript
// src/features/projections/pages/ProjectionsPage.tsx

import { useParams } from 'react-router-dom';
import { ProjectionInfo } from '../components/ProjectionInfo';
import { useProjectionInfo } from '../hooks/useProjectionInfo';
import { PlayerProjectionsList } from '../components/PlayerProjectionsList';

export function ProjectionsPage() {
  const { leagueId } = useParams<{ leagueId: string }>();
  const { source, updatedAt, playerCount, loading } = useProjectionInfo(leagueId!);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <ProjectionInfo
        source={source}
        updatedAt={updatedAt}
        playerCount={playerCount}
      />

      <PlayerProjectionsList leagueId={leagueId!} />
    </div>
  );
}
```

---

## Tasks / Subtasks

- [x] **Task 1: Create ProjectionInfo Component**
  - [x] Create `src/features/projections/components/ProjectionInfo.tsx`
  - [x] Display projection source with badge styling
  - [x] Display player count
  - [x] Display relative timestamp ("5 minutes ago")
  - [x] Add tooltip with full date/time on hover
  - [x] Style with dark theme (slate/emerald)
  - [x] Add empty state for no projections

- [x] **Task 2: Create useProjectionInfo Hook**
  - [x] Create `src/features/projections/hooks/useProjectionInfo.ts`
  - [x] Query most recent projection for source/timestamp
  - [x] Query player count
  - [x] Handle loading state
  - [x] Handle no projections case

- [x] **Task 3: Implement Timestamp Formatting**
  - [x] Use date-fns formatDistanceToNow for relative time
  - [x] Use date-fns format for full date/time tooltip
  - [x] Handle null/undefined timestamps gracefully

- [x] **Task 4: Add Stale Data Indicator**
  - [x] Detect projections older than 24 hours
  - [x] Show yellow warning styling
  - [x] Display refresh suggestion message

- [x] **Task 5: Integrate into Pages**
  - [x] Add to projections import page
  - [x] Add to league detail page
  - [x] Ensure consistent placement (top of list)

- [x] **Task 6: Add Tooltip Component (if needed)**
  - [x] Tooltip component already exists in shadcn/ui
  - [x] Configured TooltipProvider in component

- [x] **Task 7: Add Tests**
  - [x] Test component renders with valid data
  - [x] Test empty state (no projections)
  - [x] Test relative time display
  - [x] Test tooltip trigger styling
  - [x] Test stale data indicator

---

## Dev Notes

### Date Formatting Examples

```typescript
import { format, formatDistanceToNow, parseISO } from 'date-fns';

const updatedAt = '2025-12-12T07:30:00Z';

// Relative time: "5 hours ago", "2 days ago"
formatDistanceToNow(parseISO(updatedAt), { addSuffix: true })

// Full date: "December 12, 2025 at 2:30 AM"
format(parseISO(updatedAt), "MMMM d, yyyy 'at' h:mm a")
```

### Stale Data Detection

Projections older than 24 hours are considered potentially stale:
- Visual indicator (yellow color, warning icon)
- Suggestion to refresh
- Not blocking - user can still use projections

### Source Display Format

The source is stored exactly as imported:
- "Google Sheets"
- "Fangraphs - Steamer"
- "Fangraphs - Batx"
- "Fangraphs - Ja"

### Placement

The ProjectionInfo component should appear:
1. At the top of the projections list page
2. In the draft dashboard header
3. Before any player data display

### References

- **Epic:** docs/epics-stories.md (lines 548-562)
- **Architecture:** docs/architecture.md (date formatting)
- **Dependencies:** date-fns v4.1.0
- [date-fns Documentation](https://date-fns.org/)
- [shadcn/ui Tooltip](https://ui.shadcn.com/docs/components/tooltip)

---

## Summary

Create a ProjectionInfo component that displays the projection source and last updated timestamp, helping users understand their data and its freshness. The component uses date-fns for formatting and includes a stale data indicator.

**Dependencies:** Story 4.1 (database), date-fns

**Next Step:** Story 4.8 - Export Projections for Offline Analysis

---

## Dev Agent Record

### Implementation Plan

1. Created `ProjectionInfo` component with emerald badge styling for source, relative timestamp with tooltip, and stale data indicator (>24h warning)
2. Created `useProjectionInfo` hook to fetch projection source, timestamp, and player count from Supabase
3. Used date-fns `formatDistanceToNow` for relative time and `format` for full date/time in tooltip
4. Integrated component into ProjectionImportPage and LeagueDetail pages
5. Added comprehensive unit tests (21 tests total across component and hook)

### Debug Log

- No issues encountered during implementation
- All acceptance criteria satisfied

### Completion Notes

✅ Implemented ProjectionInfo component with all required features:

- Source display with emerald badge styling
- Player count display with locale formatting
- Relative timestamp using date-fns formatDistanceToNow
- Full date/time tooltip on hover using date-fns format
- Stale data indicator (yellow warning) for projections >24 hours old
- Empty state for when no projections are loaded

✅ Created useProjectionInfo hook:

- Queries player_projections table for source and timestamp
- Gets player count via separate query
- Handles loading state and error cases
- Gracefully handles no projections (PGRST116 error)

✅ Integrated into pages:

- ProjectionImportPage: Shows current projection info above import tabs
- LeagueDetail: Shows projection info with "Import Projections" button when empty

✅ All 23 tests pass (15 for ProjectionInfo component, 8 for useProjectionInfo hook)

---

## File List

### New Files

- `src/features/projections/components/ProjectionInfo.tsx` - Main component
- `src/features/projections/hooks/useProjectionInfo.ts` - Data fetching hook
- `tests/features/projections/ProjectionInfo.test.tsx` - Component tests
- `tests/features/projections/useProjectionInfo.test.tsx` - Hook tests

### Modified Files

- `src/features/projections/index.ts` - Added exports for new component and hook
- `src/features/projections/pages/ProjectionImportPage.tsx` - Integrated ProjectionInfo component
- `src/features/leagues/components/LeagueDetail.tsx` - Integrated ProjectionInfo component with loading skeleton

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-17 | Story implementation complete - all tasks finished | Dev Agent |
| 2025-12-17 | Code review fixes: Added isSupabaseConfigured guard, error state, refetch capability, accessibility attributes, loading skeleton, fixed act() warning | Code Review |

---

## Senior Developer Review (AI)

**Review Date:** 2025-12-17
**Outcome:** ✅ Approved (after fixes)

### Issues Found & Fixed

| Severity | Issue | Status |
|----------|-------|--------|
| HIGH | Missing `isSupabaseConfigured()` guard in useProjectionInfo hook | ✅ Fixed |
| HIGH | Missing `error` state in useProjectionInfo return value | ✅ Fixed |
| HIGH | No loading skeleton while fetching projection info in LeagueDetail | ✅ Fixed |
| MEDIUM | React act() warning in tests not addressed | ✅ Fixed |
| MEDIUM | Missing accessibility attributes (aria-live, role="alert", aria-hidden) | ✅ Fixed |
| MEDIUM | No refetch() capability to manually refresh data | ✅ Fixed |
| MEDIUM | Duplicate empty state CTA (component + parent both showed import button) | ✅ Fixed |

### Fixes Applied

1. **useProjectionInfo.ts**: Added `isSupabaseConfigured()` guard following codebase pattern, exposed `error` state, added `refetch()` function for manual refresh
2. **ProjectionInfo.tsx**: Added comprehensive accessibility attributes (aria-live, role="alert", aria-hidden, aria-label)
3. **LeagueDetail.tsx**: Added loading skeleton with proper ARIA attributes, removed duplicate import CTA
4. **useProjectionInfo.test.tsx**: Fixed act() warning by awaiting async effects, added tests for error state, Supabase config guard, and refetch function

### Test Results

- All 23 tests pass (increased from 21)
- No act() warnings
- Coverage includes error states, loading, refetch functionality
