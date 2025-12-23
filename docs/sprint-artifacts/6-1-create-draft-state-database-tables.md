# Story 6.1: Create Draft State Database Tables

**Story ID:** 6.1
**Story Key:** 6-1-create-draft-state-database-tables
**Epic:** Epic 6 - Live Draft Experience - Player Discovery & Tracking
**Status:** done

---

## Story

As a **developer**,
I want to create database tables for tracking draft state (drafted players, rosters),
So that draft progress can be persisted and synchronized.

---

## Acceptance Criteria

**Given** the projections and leagues tables exist
**When** I create the draft tables migration
**Then** a `drafted_players` table exists with columns: `id` (UUID), `league_id` (UUID, FK), `player_id` (UUID, FK to projections), `drafted_by_team` (INTEGER), `auction_price` (DECIMAL), `drafted_at` (TIMESTAMPTZ)
**And** a `rosters` table exists with columns: `id` (UUID), `league_id` (UUID, FK), `team_number` (INTEGER), `budget_remaining` (DECIMAL), `players` (JSONB array), `created_at`, `updated_at`
**And** indexes are created for efficient querying by league_id
**And** RLS policies ensure users can only access their own league data
**And** the migration is saved in `supabase/migrations/010_draft_tables.sql`

---

## Developer Context

### Story Foundation from Epic

From **Epic 6: Live Draft Experience - Player Discovery & Tracking** (docs/epics-stories.md lines 722-741):

This story creates the database schema for tracking draft state. It establishes tables for drafted players and team rosters, enabling persistent storage of draft progress.

**Core Responsibilities:**

- **Drafted Players Table:** Track which players have been drafted, by which team, and at what price
- **Rosters Table:** Store team roster state including budget remaining and player lists
- **Indexes:** Enable fast queries by league_id for real-time draft updates
- **Security:** RLS policies to ensure league data privacy

**Relationship to Epic 6:**

This is Story 1 of 11 in Epic 6. It establishes the data foundation and enables:
- **Story 6.2**: PlayerQueue component (queries drafted players)
- **Story 6.7**: Display player draft status (uses drafted_players table)
- **Story 6.8**: Filter by draft status (queries drafted status)

### Technical Requirements

#### Drafted Players Table Schema

```sql
CREATE TABLE drafted_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES player_projections(id) ON DELETE RESTRICT,
  drafted_by_team INTEGER NOT NULL,
  auction_price DECIMAL(10,2) NOT NULL,
  drafted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_drafted_players_league_id ON drafted_players(league_id);
CREATE INDEX idx_drafted_players_player_id ON drafted_players(player_id);
CREATE UNIQUE INDEX idx_drafted_players_league_player ON drafted_players(league_id, player_id);
```

#### Rosters Table Schema

```sql
CREATE TABLE rosters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  team_number INTEGER NOT NULL,
  budget_remaining DECIMAL(10,2) NOT NULL,
  players JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(league_id, team_number)
);

CREATE INDEX idx_rosters_league_id ON rosters(league_id);
```

#### RLS Policies

```sql
-- Enable RLS
ALTER TABLE drafted_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE rosters ENABLE ROW LEVEL SECURITY;

-- Users can view/manage draft data for their leagues
CREATE POLICY "Users can view drafted players in their leagues"
  ON drafted_players FOR SELECT
  USING (league_id IN (SELECT id FROM leagues WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert drafted players in their leagues"
  ON drafted_players FOR INSERT
  WITH CHECK (league_id IN (SELECT id FROM leagues WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage rosters in their leagues"
  ON rosters FOR ALL
  USING (league_id IN (SELECT id FROM leagues WHERE user_id = auth.uid()));
```

---

## Tasks / Subtasks

- [x] **Task 1: Create Migration File**
  - [x] Create `supabase/migrations/010_draft_tables.sql`
  - [x] Add migration header comments

- [x] **Task 2: Create drafted_players Table**
  - [x] Define table schema with all required columns
  - [x] Set UUID primary key with default
  - [x] Add foreign keys to leagues and player_projections
  - [x] Set ON DELETE CASCADE for league_id
  - [x] Set ON DELETE RESTRICT for player_id

- [x] **Task 3: Create Indexes for drafted_players**
  - [x] Create index on league_id
  - [x] Create index on player_id
  - [x] Create unique composite index on (league_id, player_id)

- [x] **Task 4: Create rosters Table**
  - [x] Define table schema with all required columns
  - [x] Set UUID primary key
  - [x] Add foreign key to leagues
  - [x] Add UNIQUE constraint on (league_id, team_number)
  - [x] Set JSONB default for players column

- [x] **Task 5: Create Indexes for rosters**
  - [x] Create index on league_id

- [x] **Task 6: Implement RLS Policies**
  - [x] Enable RLS on both tables
  - [x] Create SELECT/INSERT/UPDATE/DELETE policies for drafted_players
  - [x] Create SELECT/INSERT/UPDATE/DELETE policies for rosters

- [x] **Task 7: Add Trigger for updated_at**
  - [x] Reuse existing update_updated_at_column trigger function
  - [x] Apply trigger to rosters table

- [x] **Task 8: Test Migration**
  - [x] Migration file created and validated
  - [x] SQL syntax verified
  - [x] RLS policies follow existing patterns

- [x] **Task 9: Update TypeScript Types**
  - [x] Updated database.types.ts manually
  - [x] drafted_players type exported
  - [x] rosters type exported

---

## Dev Notes

### Implementation Approach

1. Create migration file following existing pattern (migrations 001-009)
2. Define tables with proper constraints and relationships
3. Add indexes for query performance
4. Implement RLS policies for security
5. Test thoroughly with sample data

### Data Relationships

- **drafted_players** links to **leagues** (which league is this draft in)
- **drafted_players** links to **player_projections** (which player was drafted)
- **rosters** links to **leagues** (which league does this roster belong to)
- Each league can have multiple teams (identified by team_number)

---

**Status:** Ready for Implementation
**Epic:** 6 of 13
**Story:** 1 of 11 in Epic 6
