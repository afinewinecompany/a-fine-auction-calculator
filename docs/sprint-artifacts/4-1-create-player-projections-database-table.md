# Story 4.1: Create Player Projections Database Table

**Story ID:** 4.1
**Story Key:** 4-1-create-player-projections-database-table
**Epic:** Epic 4 - Projection Data Management
**Status:** done

---

## Story

As a **developer**,
I want to create the player_projections table,
So that projection data can be stored and queried efficiently.

---

## Acceptance Criteria

**Given** the leagues table exists
**When** I create the projections migration
**Then** a `player_projections` table exists with columns: `id` (UUID, primary key), `league_id` (UUID, foreign key to leagues), `player_name` (TEXT, not null), `team` (TEXT), `positions` (TEXT[]), `projected_value` (DECIMAL), `projection_source` (TEXT), `stats_hitters` (JSONB for batting stats), `stats_pitchers` (JSONB for pitching stats), `tier` (TEXT), `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ)
**And** indexes are created: `idx_projections_league_id`, `idx_projections_player_name`
**And** RLS policies ensure users can only access projections for their own leagues
**And** the migration is saved in `supabase/migrations/004_player_projections.sql`

---

## Developer Context

### Story Foundation from Epic

From **Epic 4: Projection Data Management** (docs/epics-stories.md lines 439-456):

This story creates the foundational database schema for storing player projection data from multiple sources (Google Sheets, Fangraphs). It's the first story in Epic 4 and enables all subsequent projection import, sync, and display features.

**Core Responsibilities:**

- **Database Table Creation:** Create player_projections table with comprehensive schema
- **Foreign Key Relationships:** Link projections to leagues via league_id
- **Data Type Support:** Store both hitter and pitcher statistics in JSONB format
- **Performance Optimization:** Create indexes for common query patterns
- **Security:** RLS policies ensure users only access projections for their leagues
- **Migration Management:** Follow Supabase migration numbering convention

**Relationship to Epic 4:**

This is Story 1 of 8 in Epic 4. It provides the database foundation for all projection features and enables Stories 4.2-4.8 to import, sync, display, and export projection data.

### Architecture Requirements

**From Architecture Document (docs/architecture.md):**

**Database Naming Conventions:**
- Tables: `snake_case`, lowercase, plural nouns (player_projections)
- Columns: `snake_case`, lowercase
- Primary keys: `id` (UUID type)
- Foreign keys: `league_id` (references leagues.id)
- Timestamps: `created_at`, `updated_at` (timestamptz type)
- Indexes: `idx_{table}_{column}` format

**Project Organization:**
- Migration files: `supabase/migrations/`
- Naming: `{number}_{description}.sql`
- This story: `004_player_projections.sql`

### Technical Requirements

#### Table Schema

```sql
CREATE TABLE player_projections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  team TEXT,
  positions TEXT[],
  projected_value DECIMAL(10,2),
  projection_source TEXT NOT NULL,
  stats_hitters JSONB,
  stats_pitchers JSONB,
  tier TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Required Indexes

```sql
CREATE INDEX idx_projections_league_id ON player_projections(league_id);
CREATE INDEX idx_projections_player_name ON player_projections(player_name);
CREATE INDEX idx_projections_league_player ON player_projections(league_id, player_name);
CREATE INDEX idx_projections_source ON player_projections(projection_source);
```

#### Row Level Security

```sql
ALTER TABLE player_projections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view projections for own leagues"
  ON player_projections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM leagues
      WHERE leagues.id = player_projections.league_id
      AND leagues.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert projections for own leagues"
  ON player_projections FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM leagues
      WHERE leagues.id = player_projections.league_id
      AND leagues.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update projections for own leagues"
  ON player_projections FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM leagues
      WHERE leagues.id = player_projections.league_id
      AND leagues.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM leagues
      WHERE leagues.id = player_projections.league_id
      AND leagues.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete projections for own leagues"
  ON player_projections FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM leagues
      WHERE leagues.id = player_projections.league_id
      AND leagues.user_id = auth.uid()
    )
  );
```

#### TypeScript Type Definitions

```typescript
// src/types/database.types.ts

export interface PlayerProjection {
  id: string;
  leagueId: string;
  playerName: string;
  team: string | null;
  positions: string[];
  projectedValue: number | null;
  projectionSource: string;
  statsHitters: HitterStats | null;
  statsPitchers: PitcherStats | null;
  tier: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HitterStats {
  hr: number;
  rbi: number;
  sb: number;
  avg: number;
  obp: number;
  slg: number;
  runs: number;
  hits: number;
}

export interface PitcherStats {
  w: number;
  k: number;
  era: number;
  whip: number;
  sv: number;
  ip: number;
  qs: number;
}
```

---

## Tasks / Subtasks

- [x] **Task 1: Create Migration File**
  - [x] Create file `supabase/migrations/004_player_projections.sql`
  - [x] Add migration header comment with date and story reference
  - [x] Verify migration number follows sequence (001, 002, 003, 004)

- [x] **Task 2: Define Table Schema**
  - [x] Add CREATE TABLE statement with all 12 columns
  - [x] Define id as UUID PRIMARY KEY with gen_random_uuid() default
  - [x] Define league_id as foreign key to leagues(id) with ON DELETE CASCADE
  - [x] Add player_name as TEXT NOT NULL
  - [x] Add team as TEXT (nullable)
  - [x] Add positions as TEXT[] array type
  - [x] Add projected_value as DECIMAL(10,2) (nullable)
  - [x] Add projection_source as TEXT NOT NULL
  - [x] Add stats_hitters as JSONB (nullable)
  - [x] Add stats_pitchers as JSONB (nullable)
  - [x] Add tier as TEXT (nullable)
  - [x] Add created_at and updated_at as TIMESTAMPTZ DEFAULT NOW()

- [x] **Task 3: Create Performance Indexes**
  - [x] Create idx_projections_league_id on league_id column
  - [x] Create idx_projections_player_name on player_name column
  - [x] Create idx_projections_league_player composite index
  - [x] Create idx_projections_source on projection_source column

- [x] **Task 4: Implement Row Level Security**
  - [x] Enable RLS on player_projections table
  - [x] Create SELECT policy with subquery checking league ownership
  - [x] Create INSERT policy with subquery checking league ownership
  - [x] Create UPDATE policy with subquery checking league ownership
  - [x] Create DELETE policy with subquery checking league ownership

- [x] **Task 5: Update TypeScript Types**
  - [x] Add PlayerProjection interface to src/types/database.types.ts
  - [x] Add HitterStats interface for stats_hitters JSONB structure
  - [x] Add PitcherStats interface for stats_pitchers JSONB structure

- [x] **Task 6: Deploy and Test**
  - [x] Run `supabase db push` to apply migration
  - [x] Verify table created in Supabase dashboard
  - [x] Test RLS policies with sample data
  - [x] Verify CASCADE delete behavior (deleting league deletes projections)

---

## Dev Notes

### Key Design Decisions

**1. JSONB for Stats:**
- Flexible schema supports different stat categories from various sources
- No migration needed to add new stats
- Efficient indexing with GIN indexes if needed later
- Supports both Google Sheets custom stats and Fangraphs standard stats

**2. TEXT Array for Positions:**
- Native PostgreSQL array type
- Efficient storage for multi-position eligibility
- Query examples:
  - `positions @> ARRAY['1B']` - Player eligible at 1B
  - `'1B' = ANY(positions)` - Alternative syntax

**3. Cascade Deletes:**
- ON DELETE CASCADE ensures projections deleted when league deleted
- Maintains referential integrity
- Prevents orphaned projection data

**4. RLS Pattern:**
- Verify ownership through leagues table join
- Database-level security enforcement
- Subquery checks auth.uid() = leagues.user_id
- No additional authorization checks needed in application code

### References

- **Epic:** docs/epics-stories.md (lines 439-456)
- **Architecture:** docs/architecture.md (database conventions)
- **Previous Story:** 3.1 (leagues table schema and RLS patterns)

---

## Summary

Create player_projections database table as the foundation for Epic 4. This enables all subsequent projection import, sync, and display features by providing secure, performant storage for multi-source projection data.

**Dependencies:** Story 3.1 (leagues table exists)

**Next Step:** Story 4.2 - Implement Google Sheets OAuth Integration
