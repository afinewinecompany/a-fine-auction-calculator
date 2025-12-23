# Story 4.8: Export Projections for Offline Analysis

**Story ID:** 4.8
**Story Key:** 4-8-export-projections-for-offline-analysis
**Epic:** Epic 4 - Projection Data Management
**Status:** Done

---

## Story

As a **user**,
I want to export my league's projection data to CSV or JSON,
So that I can perform offline analysis or backup my data.

---

## Acceptance Criteria

**Given** my league has projection data
**When** I click "Export Projections"
**Then** I can choose export format: CSV or JSON
**And** clicking "Export as CSV" downloads a CSV file with all projection data
**And** clicking "Export as JSON" downloads a JSON file with all projection data
**And** the exported file includes: player names, teams, positions, projected values, stats, tiers, source, and timestamp
**And** the filename includes the league name and export date: `{LeagueName}_Projections_{Date}.csv`
**And** the export uses client-side generation per Architecture (no server roundtrip needed)

---

## Developer Context

### Story Foundation from Epic

From **Epic 4: Projection Data Management** (docs/epics-stories.md lines 563-580):

This story implements client-side export of projection data to CSV and JSON formats, enabling users to perform offline analysis or backup their data. No server roundtrip is required.

**Core Responsibilities:**

- **Format Selection:** Dropdown for CSV or JSON
- **CSV Export:** Properly formatted CSV file download
- **JSON Export:** Structured JSON file download
- **Complete Data:** Include all projection fields
- **File Naming:** League name and date in filename
- **Client-Side:** No server roundtrip required

**Relationship to Epic 4:**

This is Story 8 of 8 in Epic 4 (final story). It depends on Story 4.1 (database) and completes the projection data management capabilities.

### Architecture Requirements

**From Architecture Document (docs/architecture.md):**

**Client-Side Operations:**
- Use browser APIs for file download
- No server roundtrip for export
- Handle large datasets efficiently

**Data Format:**
- CSV: Standard comma-separated values
- JSON: Pretty-printed, valid JSON

### Technical Requirements

#### ExportProjections Component

```typescript
// src/features/projections/components/ExportProjections.tsx

import { useState } from 'react';
import { Download, FileJson, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useProjections } from '../hooks/useProjections';
import { exportToCSV, exportToJSON } from '../utils/exportProjections';
import { format } from 'date-fns';

interface ExportProjectionsProps {
  leagueId: string;
  leagueName: string;
}

export function ExportProjections({ leagueId, leagueName }: ExportProjectionsProps) {
  const [exporting, setExporting] = useState(false);
  const { projections, isLoading } = useProjections(leagueId);

  const handleExport = async (formatType: 'csv' | 'json') => {
    if (!projections || projections.length === 0) return;

    setExporting(true);

    try {
      const date = format(new Date(), 'yyyy-MM-dd');
      const sanitizedLeagueName = leagueName.replace(/[^a-z0-9]/gi, '_');
      const filename = `${sanitizedLeagueName}_Projections_${date}`;

      if (formatType === 'csv') {
        exportToCSV(projections, filename);
      } else {
        exportToJSON(projections, filename);
      }
    } finally {
      setExporting(false);
    }
  };

  const hasProjections = projections && projections.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={isLoading || !hasProjections || exporting}
          className="border-slate-700"
        >
          <Download className="h-4 w-4 mr-2" />
          {exporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-slate-900 border-slate-700">
        <DropdownMenuItem
          onClick={() => handleExport('csv')}
          className="cursor-pointer"
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('json')}
          className="cursor-pointer"
        >
          <FileJson className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

#### Export Utilities

```typescript
// src/features/projections/utils/exportProjections.ts

import type { PlayerProjection } from '@/types/database.types';

interface ExportRow {
  playerName: string;
  team: string;
  positions: string;
  projectedValue: number | null;
  tier: string;
  projectionSource: string;
  updatedAt: string;
  // Hitter stats
  hr?: number;
  rbi?: number;
  sb?: number;
  avg?: number;
  obp?: number;
  slg?: number;
  // Pitcher stats
  w?: number;
  k?: number;
  era?: number;
  whip?: number;
  sv?: number;
  ip?: number;
}

function transformForExport(projections: PlayerProjection[]): ExportRow[] {
  return projections.map(p => ({
    playerName: p.playerName,
    team: p.team ?? '',
    positions: p.positions?.join(', ') ?? '',
    projectedValue: p.projectedValue,
    tier: p.tier ?? '',
    projectionSource: p.projectionSource,
    updatedAt: p.updatedAt,
    // Flatten hitter stats
    hr: p.statsHitters?.hr,
    rbi: p.statsHitters?.rbi,
    sb: p.statsHitters?.sb,
    avg: p.statsHitters?.avg,
    obp: p.statsHitters?.obp,
    slg: p.statsHitters?.slg,
    // Flatten pitcher stats
    w: p.statsPitchers?.w,
    k: p.statsPitchers?.k,
    era: p.statsPitchers?.era,
    whip: p.statsPitchers?.whip,
    sv: p.statsPitchers?.sv,
    ip: p.statsPitchers?.ip,
  }));
}

export function exportToCSV(projections: PlayerProjection[], filename: string): void {
  const rows = transformForExport(projections);

  if (rows.length === 0) return;

  // Get headers from first row keys
  const headers = Object.keys(rows[0]);

  // Build CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row =>
      headers.map(header => {
        const value = row[header as keyof ExportRow];
        // Escape commas and quotes in string values
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ].join('\n');

  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
}

export function exportToJSON(projections: PlayerProjection[], filename: string): void {
  const rows = transformForExport(projections);

  const exportData = {
    exportedAt: new Date().toISOString(),
    playerCount: rows.length,
    projections: rows,
  };

  const jsonContent = JSON.stringify(exportData, null, 2);
  downloadFile(jsonContent, `${filename}.json`, 'application/json');
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
```

#### useProjections Hook

```typescript
// src/features/projections/hooks/useProjections.ts

import { useEffect, useState } from 'react';
import { useSupabase } from '@/lib/supabase';
import type { PlayerProjection } from '@/types/database.types';

export function useProjections(leagueId: string) {
  const [projections, setProjections] = useState<PlayerProjection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = useSupabase();

  useEffect(() => {
    async function fetchProjections() {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('player_projections')
        .select('*')
        .eq('league_id', leagueId)
        .order('player_name');

      if (error) {
        setError(error.message);
      } else {
        // Transform snake_case to camelCase
        setProjections(data?.map(p => ({
          id: p.id,
          leagueId: p.league_id,
          playerName: p.player_name,
          team: p.team,
          positions: p.positions,
          projectedValue: p.projected_value,
          projectionSource: p.projection_source,
          statsHitters: p.stats_hitters,
          statsPitchers: p.stats_pitchers,
          tier: p.tier,
          createdAt: p.created_at,
          updatedAt: p.updated_at,
        })) ?? []);
      }

      setIsLoading(false);
    }

    fetchProjections();
  }, [leagueId, supabase]);

  return { projections, isLoading, error };
}
```

---

## Tasks / Subtasks

- [x] **Task 1: Create Export Utilities**
  - [x] Create `src/features/projections/utils/exportProjections.ts`
  - [x] Implement transformForExport function
  - [x] Implement exportToCSV function with proper escaping
  - [x] Implement exportToJSON function with pretty printing
  - [x] Implement downloadFile helper

- [x] **Task 2: Create ExportProjections Component**
  - [x] Create `src/features/projections/components/ExportProjections.tsx`
  - [x] Add dropdown menu with CSV and JSON options
  - [x] Show loading state during export
  - [x] Disable when no projections available
  - [x] Style with dark theme

- [x] **Task 3: Create/Update useProjections Hook**
  - [x] Create `src/features/projections/hooks/useProjections.ts` (if not exists)
  - [x] Fetch all projections for league
  - [x] Transform snake_case to camelCase
  - [x] Handle loading and error states

- [x] **Task 4: Implement CSV Export**
  - [x] Generate CSV headers from data structure
  - [x] Handle comma and quote escaping
  - [x] Flatten nested stats objects
  - [x] Include all required fields

- [x] **Task 5: Implement JSON Export**
  - [x] Create structured export object
  - [x] Include metadata (export date, count)
  - [x] Pretty print with 2-space indent
  - [x] Valid JSON output

- [x] **Task 6: File Naming**
  - [x] Sanitize league name for filename
  - [x] Format date as YYYY-MM-DD
  - [x] Generate filename: `{LeagueName}_Projections_{Date}.{ext}`

- [x] **Task 7: Integrate Component**
  - [x] Add ExportProjections to projections page header
  - [x] Pass leagueId and leagueName props
  - [x] Verify styling consistency

- [x] **Task 8: Add Tests**
  - [x] Test CSV export format
  - [x] Test JSON export format
  - [x] Test special character escaping
  - [x] Test filename generation
  - [x] Test empty projections handling

---

## Dev Notes

### CSV Format

```csv
playerName,team,positions,projectedValue,tier,projectionSource,updatedAt,hr,rbi,sb,avg,obp,slg,w,k,era,whip,sv,ip
Mike Trout,LAA,CF,45,Elite,Fangraphs - Steamer,2025-12-12T02:30:00Z,35,90,15,0.280,0.350,0.520,,,,,,,
Shohei Ohtani,LAD,"DH, SP",55,Elite,Fangraphs - Steamer,2025-12-12T02:30:00Z,40,100,12,0.290,0.370,0.550,15,200,3.00,1.00,0,180
```

### JSON Format

```json
{
  "exportedAt": "2025-12-16T10:30:00Z",
  "playerCount": 500,
  "projections": [
    {
      "playerName": "Mike Trout",
      "team": "LAA",
      "positions": "CF",
      "projectedValue": 45,
      "tier": "Elite",
      "projectionSource": "Fangraphs - Steamer",
      "updatedAt": "2025-12-12T02:30:00Z",
      "hr": 35,
      "rbi": 90,
      "sb": 15,
      "avg": 0.280,
      "obp": 0.350,
      "slg": 0.520
    }
  ]
}
```

### Filename Sanitization

Characters replaced with underscores:
- Spaces
- Special characters (!@#$%^&*...)
- Non-alphanumeric characters

Example: "My League 2025!" → "My_League_2025_"

### Browser Compatibility

The Blob and URL.createObjectURL APIs are supported in:
- Chrome 20+
- Firefox 4+
- Safari 6+
- Edge (all versions)

### Performance Considerations

- Client-side only - no server load
- Memory usage scales with projection count
- For very large exports (10k+ rows), consider chunking

### References

- **Epic:** docs/epics-stories.md (lines 563-580)
- **Architecture:** docs/architecture.md (client-side operations)
- **Previous Stories:** 4.1 (database schema)
- [Blob API](https://developer.mozilla.org/en-US/docs/Web/API/Blob)
- [URL.createObjectURL](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL)

---

## Summary

Implement client-side export of projection data to CSV and JSON formats. Users can download their league's projections for offline analysis or backup purposes. This is the final story in Epic 4.

**Dependencies:** Story 4.1 (database)

**Client-Side:** No server roundtrip required

**Epic Complete:** This story completes Epic 4 - Projection Data Management

---

## Dev Agent Record

### Implementation Plan

Implemented client-side export functionality for projection data using:
- Export utilities with transformForExport, exportToCSV, exportToJSON, and sanitizeFilename functions
- ExportProjections component with dropdown menu for format selection
- useProjections hook for fetching all projections for a league
- Integration into LeagueDetail and ProjectionImportPage components

### Completion Notes

✅ All 8 tasks completed successfully
✅ 45 tests written and passing (28 utility tests, 8 hook tests, 9 component tests)
✅ Export dropdown integrated into LeagueDetail page (Projections section)
✅ Export dropdown integrated into ProjectionImportPage (when projections exist)
✅ CSV export properly escapes commas and quotes
✅ JSON export includes metadata (exportedAt, playerCount)
✅ Filename follows pattern: {LeagueName}_Projections_{YYYY-MM-DD}.{ext}
✅ Client-side only - no server roundtrip per Architecture requirements

### Code Review Fixes (2025-12-17)

✅ Fixed prettier formatting violations in ExportProjections.tsx
✅ Fixed prettier formatting violations in useProjections.ts
✅ Added error handling with toast notifications in handleExport function
✅ Exported downloadFile function for testability
✅ Added 13 additional tests for exportToCSV, exportToJSON, and downloadFile functions

---

## File List

### New Files
- src/features/projections/utils/exportProjections.ts
- src/features/projections/hooks/useProjections.ts
- src/features/projections/components/ExportProjections.tsx
- tests/features/projections/exportProjections.test.ts
- tests/features/projections/useProjections.test.tsx
- tests/features/projections/ExportProjections.test.tsx

### Modified Files
- src/features/projections/index.ts (added exports)
- src/features/projections/pages/ProjectionImportPage.tsx (integrated ExportProjections)
- src/features/leagues/components/LeagueDetail.tsx (integrated ExportProjections)

---

## Change Log

- **2025-12-17**: Implemented export projections feature
  - Created export utilities (transformForExport, exportToCSV, exportToJSON, sanitizeFilename)
  - Created useProjections hook for fetching projection data
  - Created ExportProjections dropdown component
  - Integrated export into LeagueDetail and ProjectionImportPage
  - Added 32 comprehensive tests covering utilities, hook, and component
  - Story completed - ready for review
- **2025-12-17**: Code review fixes applied
  - Fixed prettier formatting in ExportProjections.tsx and useProjections.ts
  - Added error handling with toast notifications for export failures
  - Exported downloadFile function for better testability
  - Added 13 additional tests (downloadFile, exportToCSV, exportToJSON direct tests)
  - Total tests now: 45 (was 32)
  - Story status: Done
