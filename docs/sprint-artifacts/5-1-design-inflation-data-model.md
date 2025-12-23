# Story 5.1: Design Inflation Data Model

**Story ID:** 5.1
**Story Key:** 5-1-design-inflation-data-model
**Epic:** Epic 5 - Core Inflation Engine
**Status:** done

---

## Story

As a **developer**,
I want to define the TypeScript types and data structures for the inflation engine,
So that inflation calculations have a clear contract.

---

## Acceptance Criteria

**Given** I need to model inflation state
**When** I create `src/features/inflation/types/inflation.types.ts`
**Then** the file defines: `InflationState`, `PositionInflationRate`, `TierInflationRate`, `PlayerTier`, `InflationMetrics`
**And** `InflationState` includes: `overallRate` (number), `positionRates` (Record<Position, number>), `tierRates` (Record<Tier, number>), `budgetDepleted` (number), `playersRemaining` (number)
**And** `PlayerTier` enum includes: `ELITE`, `MID`, `LOWER`
**And** all types follow Architecture naming conventions (PascalCase for types)

---

## Developer Context

### Story Foundation from Epic

From **Epic 5: Core Inflation Engine** (docs/epics-stories.md lines 583-720):

This story establishes the TypeScript type system for the inflation engine, which is the heart of the application. The inflation engine calculates real-time, tier-specific, position-aware inflation adjustments for all players during live drafts. This is Story 1 of 8 in Epic 5.

**Core Responsibilities:**

- **TypeScript Type Definitions:** Define all types for inflation state management
- **Data Structure Contracts:** Establish clear interfaces for inflation calculations
- **Position Types:** Support all baseball positions (C, 1B, 2B, SS, 3B, OF, SP, RP)
- **Tier System:** Define Elite, Mid, and Lower tiers based on projected value percentiles
- **Architecture Compliance:** Follow PascalCase naming conventions for TypeScript types

**Relationship to Epic 5:**

This is Story 1 of 8 in Epic 5 (Core Inflation Engine). It enables all subsequent stories:
- **Story 5.2**: Basic inflation calculation (uses InflationState type)
- **Story 5.3**: Position-specific inflation (uses PositionInflationRate type)
- **Story 5.4**: Tier-specific inflation (uses TierInflationRate, PlayerTier types)
- **Story 5.5**: Budget depletion modeling (uses InflationState fields)
- **Story 5.6**: Dynamic adjusted values (uses InflationMetrics type)
- **Story 5.7**: Inflation store (stores InflationState)
- **Story 5.8**: Draft integration (consumes all types)

### Architecture Requirements

**From Architecture Document (docs/architecture.md):**

#### TypeScript/React Naming Conventions

**TypeScript Types & Interfaces:**
- PascalCase, no prefix
- Interfaces: `User`, `League`, `PlayerProjection`
- Types: `DraftStatus`, `InflationMetrics`
- No `I` prefix (modern TypeScript convention)

**Enums:**
- PascalCase for enum name, SCREAMING_SNAKE_CASE for values
```typescript
enum DraftStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}
```

#### Project Organization - Feature-Based

**Required File Structure:**
```
src/features/inflation/
  types/
    inflation.types.ts    # CREATE - All inflation type definitions
```

### Technical Requirements

#### Core Type Definitions

**Position Type:**
```typescript
export type Position = 'C' | '1B' | '2B' | 'SS' | '3B' | 'OF' | 'SP' | 'RP';
```

**PlayerTier Enum:**
```typescript
export enum PlayerTier {
  ELITE = 'ELITE',
  MID = 'MID',
  LOWER = 'LOWER'
}
```

**InflationState Interface:**
```typescript
export interface InflationState {
  overallRate: number;
  positionRates: PositionInflationRate;
  tierRates: TierInflationRate;
  budgetDepleted: number;
  playersRemaining: number;
}
```

---

## Tasks / Subtasks

- [x] **Task 1: Create Inflation Types Directory**
  - [x] Create directory: `src/features/inflation/types/`
  - [x] Verify directory exists in feature-based structure

- [x] **Task 2: Define Base Position and Tier Types**
  - [x] Create `src/features/inflation/types/inflation.types.ts`
  - [x] Define `Position` type with all 8 baseball positions
  - [x] Define `PlayerTier` enum with ELITE, MID, LOWER values
  - [x] Add JSDoc comments explaining tier percentile ranges
  - [x] Define type guards: `isPosition()`, `isPlayerTier()`

- [x] **Task 3: Define Inflation Rate Types**
  - [x] Define `PositionInflationRate` as Record<Position, number>
  - [x] Define `TierInflationRate` as Record<PlayerTier, number>
  - [x] Add JSDoc comments explaining inflation interpretation

- [x] **Task 4: Define InflationState Interface**
  - [x] Define `InflationState` interface with all 5 required fields
  - [x] Add comprehensive JSDoc comments

- [x] **Task 5: Define Extended Inflation Types**
  - [x] Define `InflationMetrics` interface
  - [x] Define `PlayerValue` interface
  - [x] Define `BudgetDepletionFactor` interface

- [x] **Task 6: Add Type Exports**
  - [x] Export all types from inflation.types.ts
  - [x] Create feature index: `src/features/inflation/index.ts`

- [x] **Task 7: Write Type Tests**
  - [x] Create `tests/features/inflation/types.test.ts`
  - [x] Test type guards work correctly

---

## Dev Agent Record

### File List

| File | Action | Description |
|------|--------|-------------|
| `src/features/inflation/types/inflation.types.ts` | Created | Core type definitions for inflation engine |
| `src/features/inflation/index.ts` | Created | Feature barrel export file |
| `tests/features/inflation/types.test.ts` | Created | Unit tests for type guards and factory functions |

### Change Log

| Date | Change | Reason |
|------|--------|--------|
| 2025-12-17 | Initial implementation | Story 5.1 completion |
| 2025-12-17 | Added `Tier` type alias | AC compliance - AC references `Record<Tier, number>` |
| 2025-12-17 | Added `InflationSnapshot` interface | Extended type for trend tracking (supports Story 5.6) |
| 2025-12-17 | Added factory functions | Utility functions for initializing default state |

### Implementation Notes

**Beyond-AC Additions (Approved Scope Enhancements):**

The following types/functions were added beyond the explicit AC to support downstream stories:

1. **`InflationSnapshot`** - Required by `InflationMetrics.history` for trend analysis (Story 5.6)
2. **`Tier` type alias** - Added for AC compliance where `Record<Tier, number>` is referenced
3. **`POSITIONS` constant array** - Enables iteration over all positions
4. **`PLAYER_TIERS` constant array** - Enables iteration over all tiers
5. **Factory functions** (`createDefaultPositionRates`, `createDefaultTierRates`, `createDefaultInflationState`) - Reduces boilerplate in Story 5.7 (Inflation Store)

These additions follow the Architecture pattern of co-locating related utilities with type definitions.

---

## Dev Notes

### Implementation Approach

1. Create directory structure
2. Define base types (Position, PlayerTier)
3. Define rate types (PositionInflationRate, TierInflationRate)
4. Define state interface (InflationState)
5. Define extended types (InflationMetrics, PlayerValue)
6. Create exports and tests

---

**Status:** Done
**Epic:** 5 of 13
**Story:** 1 of 8 in Epic 5
