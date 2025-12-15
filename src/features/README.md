# Feature-Based Project Structure

This directory contains all feature modules for the Auction Projections application.

## Structure

Each feature is self-contained with the following subdirectories:

```
{feature}/
  components/    # React components specific to this feature
  hooks/         # Custom React hooks for this feature
  stores/        # Zustand state stores
  types/         # TypeScript type definitions
  utils/         # Business logic and calculations
```

## Features

| Feature | Description |
|---------|-------------|
| `auth/` | User authentication (login, register, session management) |
| `inflation/` | Inflation rate management (calculations, tracking, history) |
| `couch-manager/` | Couch Managers API integration (sync, connection management) |
| `leagues/` | League management (create, edit, delete, settings) |
| `teams/` | Team management (roster, budget, calculations) |
| `players/` | Player auctions & stats (search, filter, auction entry) |
| `draft/` | Draft preparation (draft board, queue, VBR rankings) |
| `projections/` | Projections & calculations (formulas, comparisons) |
| `data-exchange/` | Data import/export (CSV, Excel, JSON parsers) |
| `profile/` | User profile management (settings, preferences) |

## Design Principles

1. **Self-Contained Features**: Each feature contains all its own components, hooks, stores, types, and utilities.

2. **Cross-Feature Communication**: Features communicate via Zustand stores, NOT direct imports from other features.

3. **Shared Code Location**: Shared utilities go in:
   - `src/lib/` - Utility functions and API clients
   - `src/types/` - Global type definitions
   - `src/hooks/` - Shared React hooks
   - `src/components/ui/` - shadcn/ui components

4. **Test Mirroring**: Tests for each feature are located in `tests/features/{feature}/`

## Naming Conventions

- **Directories**: `kebab-case` (e.g., `couch-manager`, `data-exchange`)
- **React Components**: `PascalCase.tsx` (e.g., `LoginForm.tsx`)
- **Hooks**: `camelCase.ts` (e.g., `useAuth.ts`)
- **Stores**: `camelCase.ts` (e.g., `authStore.ts`)
- **Types**: `kebab-case.types.ts` (e.g., `auth.types.ts`)
- **Utils**: `camelCase.ts` (e.g., `authHelpers.ts`)
- **Tests**: `{fileName}.test.{ts|tsx}` (e.g., `LoginForm.test.tsx`)

## Adding a New Feature

1. Create the feature directory structure:
   ```bash
   mkdir -p src/features/{feature}/{components,hooks,stores,types,utils}
   ```

2. Create the corresponding test directory:
   ```bash
   mkdir -p tests/features/{feature}
   ```

3. Add index files for barrel exports as needed.

4. Update this README if adding a new feature.
