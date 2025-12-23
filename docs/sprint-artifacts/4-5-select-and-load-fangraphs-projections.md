# Story 4.5: Select and Load Fangraphs Projections

**Story ID:** 4.5
**Story Key:** 4-5-select-and-load-fangraphs-projections
**Epic:** Epic 4 - Projection Data Management
**Status:** complete

---

## Story

As a **user**,
I want to select a Fangraphs projection system (Steamer, BatX, or JA) for my league,
So that I can use professional projection data.

---

## Acceptance Criteria

**Given** I am on the projection selection page for a league
**When** I select a projection system from the dropdown (Steamer, BatX, or JA)
**And** I click "Load Projections"
**Then** the Fangraphs API is called via Supabase Edge Function
**And** player projection data is fetched for the selected system
**And** projections are imported into the `player_projections` table for my league
**And** the projection source is recorded as "Fangraphs - {System Name}"
**And** a loading indicator displays during the import
**And** the import completes within 10 seconds (NFR-P5)
**And** I see a success message: "Loaded {count} projections from Fangraphs {System}"

---

## Developer Context

### Story Foundation from Epic

From **Epic 4: Projection Data Management** (docs/epics-stories.md lines 511-529):

This story creates the user-facing interface for loading Fangraphs projections, utilizing the Edge Function from Story 4.4. Users select their preferred projection system and the data is fetched, processed, and stored.

**Core Responsibilities:**

- **System Selection:** Dropdown to choose Steamer, BatX, or JA
- **Loading Experience:** Progress indicator during fetch
- **Data Import:** Store projections in player_projections table
- **Source Tracking:** Record source as "Fangraphs - {System}"
- **Performance:** Complete within 10 seconds (NFR-P5)
- **Success Feedback:** Clear message with import count

**Relationship to Epic 4:**

This is Story 5 of 8 in Epic 4. It depends on Stories 4.1 (database) and 4.4 (API integration).

### Architecture Requirements

**From Architecture Document (docs/architecture.md):**

**State Management:**
- Use Zustand store for projection loading state
- Track loading, success, error states
- Store selected projection source

**Performance (NFR-P5):**
- Complete import within 10 seconds
- Show progress during long operations
- Don't block UI during fetch

### Technical Requirements

#### ProjectionSystemSelector Component

```typescript
// src/features/projections/components/ProjectionSystemSelector.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useLoadFangraphsProjections } from '../hooks/useLoadFangraphsProjections';

type ProjectionSystem = 'steamer' | 'batx' | 'ja';

const SYSTEMS: { value: ProjectionSystem; label: string; description: string }[] = [
  { value: 'steamer', label: 'Steamer', description: 'Industry-standard projections' },
  { value: 'batx', label: 'BatX', description: 'Advanced batting analysis' },
  { value: 'ja', label: 'JA', description: 'Custom projection system' },
];

export function ProjectionSystemSelector({ leagueId }: { leagueId: string }) {
  const [selectedSystem, setSelectedSystem] = useState<ProjectionSystem | null>(null);
  const { loadProjections, isLoading, progress, result, error } = useLoadFangraphsProjections();

  const handleLoad = async () => {
    if (!selectedSystem) return;
    await loadProjections(leagueId, selectedSystem);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200">
          Projection System
        </label>
        <Select
          value={selectedSystem ?? undefined}
          onValueChange={(v) => setSelectedSystem(v as ProjectionSystem)}
        >
          <SelectTrigger className="bg-slate-900 border-slate-700">
            <SelectValue placeholder="Select a projection system" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700">
            {SYSTEMS.map((system) => (
              <SelectItem key={system.value} value={system.value}>
                <div className="flex flex-col">
                  <span className="font-medium">{system.label}</span>
                  <span className="text-xs text-slate-400">{system.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={handleLoad}
        disabled={!selectedSystem || isLoading}
        className="w-full bg-emerald-600 hover:bg-emerald-700"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading Projections...
          </>
        ) : (
          'Load Projections'
        )}
      </Button>

      {isLoading && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-slate-400 text-center">
            {progress < 50 ? 'Fetching hitters...' : 'Fetching pitchers...'}
          </p>
        </div>
      )}

      {result && (
        <Alert className="bg-emerald-900/20 border-emerald-800">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <AlertDescription className="text-emerald-200">
            Loaded {result.count} projections from Fangraphs {result.system}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
```

#### useLoadFangraphsProjections Hook

```typescript
// src/features/projections/hooks/useLoadFangraphsProjections.ts

import { useState } from 'react';
import { useSupabase } from '@/lib/supabase';

interface LoadResult {
  system: string;
  count: number;
}

export function useLoadFangraphsProjections() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<LoadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = useSupabase();

  const loadProjections = async (leagueId: string, system: string) => {
    setIsLoading(true);
    setProgress(0);
    setResult(null);
    setError(null);

    const startTime = Date.now();

    try {
      // Fetch hitters
      setProgress(10);
      const hittersResponse = await supabase.functions.invoke('fetch-fangraphs-projections', {
        body: { system, playerType: 'hitters' },
      });

      if (hittersResponse.error) throw new Error(hittersResponse.error.message);
      setProgress(40);

      // Fetch pitchers
      const pitchersResponse = await supabase.functions.invoke('fetch-fangraphs-projections', {
        body: { system, playerType: 'pitchers' },
      });

      if (pitchersResponse.error) throw new Error(pitchersResponse.error.message);
      setProgress(70);

      // Combine and insert into database
      const allPlayers = [
        ...hittersResponse.data.players,
        ...pitchersResponse.data.players,
      ];

      const projections = allPlayers.map((player: any) => ({
        league_id: leagueId,
        player_name: player.playerName,
        team: player.team,
        positions: player.positions,
        projected_value: player.projectedValue,
        projection_source: `Fangraphs - ${system.charAt(0).toUpperCase() + system.slice(1)}`,
        stats_hitters: player.statsHitters,
        stats_pitchers: player.statsPitchers,
      }));

      setProgress(85);

      // Upsert to database
      const { error: insertError } = await supabase
        .from('player_projections')
        .upsert(projections, { onConflict: 'league_id,player_name' });

      if (insertError) throw insertError;

      setProgress(100);

      const duration = Date.now() - startTime;
      console.log(`Fangraphs import completed in ${duration}ms`);

      setResult({
        system: system.charAt(0).toUpperCase() + system.slice(1),
        count: allPlayers.length,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projections');
    } finally {
      setIsLoading(false);
    }
  };

  return { loadProjections, isLoading, progress, result, error };
}
```

#### Projection Page Integration

```typescript
// src/features/projections/pages/ProjectionImportPage.tsx

import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectionSystemSelector } from '../components/ProjectionSystemSelector';
import { ImportFromGoogleSheets } from '../components/ImportFromGoogleSheets';

export function ProjectionImportPage() {
  const { leagueId } = useParams<{ leagueId: string }>();

  if (!leagueId) return null;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Import Projections</h1>

      <Tabs defaultValue="fangraphs" className="w-full">
        <TabsList className="bg-slate-800">
          <TabsTrigger value="fangraphs">Fangraphs</TabsTrigger>
          <TabsTrigger value="sheets">Google Sheets</TabsTrigger>
        </TabsList>

        <TabsContent value="fangraphs">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Fangraphs Projections</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectionSystemSelector leagueId={leagueId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sheets">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Google Sheets Import</CardTitle>
            </CardHeader>
            <CardContent>
              <ImportFromGoogleSheets leagueId={leagueId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## Tasks / Subtasks

- [x] **Task 1: Create ProjectionSystemSelector Component**
  - [x] Create `src/features/projections/components/ProjectionSystemSelector.tsx`
  - [x] Add system dropdown with Steamer, BatX, JA options
  - [x] Include system descriptions in dropdown items
  - [x] Add Load Projections button
  - [x] Style with dark theme (slate/emerald)

- [x] **Task 2: Create useLoadFangraphsProjections Hook**
  - [x] Create `src/features/projections/hooks/useLoadFangraphsProjections.ts`
  - [x] Implement sequential fetch for hitters and pitchers
  - [x] Track progress through fetch/import stages
  - [x] Handle errors with clear messages
  - [x] Time the operation for performance validation

- [x] **Task 3: Implement Progress Indicator**
  - [x] Use shadcn/ui Progress component
  - [x] Show progress through stages (10%, 40%, 70%, 85%, 100%)
  - [x] Display stage description text

- [x] **Task 4: Implement Success/Error Feedback**
  - [x] Success alert with player count
  - [x] Error alert with message
  - [x] Clear previous state on new load

- [x] **Task 5: Create Projection Import Page**
  - [x] Create `src/features/projections/pages/ProjectionImportPage.tsx`
  - [x] Add tabs for Fangraphs and Google Sheets
  - [x] Integrate both import methods
  - [x] Add route `/leagues/:leagueId/projections/import`

- [x] **Task 6: Add Unique Constraint (if not done)**
  - [x] Unique constraint already exists in migration 007_projections_unique_constraint.sql
  - [x] Required for upsert operation

- [x] **Task 7: Performance Validation**
  - [x] Logging timing for monitoring
  - [x] Hook logs duration on completion

- [x] **Task 8: Add Tests**
  - [x] Test component renders correctly (14 tests)
  - [x] Test system selection
  - [x] Test loading state display
  - [x] Test success/error display
  - [x] Test hook fetch logic (10 tests)

---

## Dev Notes

### Progress Stages

| Progress % | Stage |
|------------|-------|
| 0% | Initial |
| 10% | Starting hitters fetch |
| 40% | Hitters complete, starting pitchers |
| 70% | Pitchers complete, preparing insert |
| 85% | Inserting to database |
| 100% | Complete |

### Projection Source Format

The projection source is stored as:
- `Fangraphs - Steamer`
- `Fangraphs - Batx`
- `Fangraphs - Ja`

This allows filtering by source and identifying which system was used.

### Error Scenarios

| Error | User Message |
|-------|--------------|
| Network failure | "Unable to connect to Fangraphs. Please try again." |
| API rate limit | "Too many requests. Please wait a moment and try again." |
| Database error | "Failed to save projections. Please try again." |
| Invalid data | "Received invalid data from Fangraphs." |

### Performance Considerations

- Parallel fetch of hitters and pitchers (could be optimized further)
- Bulk upsert instead of individual inserts
- Progress updates don't block UI
- 10-second target accommodates network variability

### References

- **Epic:** docs/epics-stories.md (lines 511-529)
- **Architecture:** docs/architecture.md (state management, performance)
- **Previous Stories:** 4.1 (database), 4.4 (API integration)
- **Next Story:** 4.6 (daily sync)

---

## Summary

Create the user-facing interface for selecting and loading Fangraphs projection data. Users choose a projection system (Steamer, BatX, or JA) and the data is fetched via Edge Function, then stored in the database.

**Dependencies:** Stories 4.1 (database), 4.4 (API)

**Performance Target:** Complete within 10 seconds (NFR-P5)

**Next Step:** Story 4.6 - Implement Daily Fangraphs Sync
