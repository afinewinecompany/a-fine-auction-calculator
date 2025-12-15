# Auction Projections by A Fine Wine Company

Fantasy baseball auction draft companion that provides real-time inflation-adjusted player values during live auction drafts.

## Quick Start

```bash
npm install        # Install dependencies
npm run dev        # Start development server
npm test           # Run tests
npm run build      # Build for production
```

## Supabase Setup

This project uses [Supabase](https://supabase.com) for backend services (database, authentication, Edge Functions).

### Prerequisites

- A Supabase account at [supabase.com](https://supabase.com)
- Node.js 20 or later

### Configuration

1. **Create `.env.local`** from the template:

   ```bash
   cp .env.example .env.local
   ```

2. **Add your Supabase credentials** to `.env.local`:

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

   Get these values from your Supabase project dashboard:
   - Go to [supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project → Settings → API
   - Copy the **Project URL** and **anon/public** key

3. **Apply database migrations** (if setting up fresh):
   - Go to Supabase Dashboard → SQL Editor
   - Run the SQL from `supabase/migrations/001_initial_schema.sql`

### Local Development with Supabase CLI

The Supabase CLI is installed as a dev dependency:

```bash
# Check CLI version
npx supabase --version

# Login to Supabase (opens browser)
npx supabase login

# Link to your remote project
npx supabase link --project-ref <your-project-ref>

# Generate TypeScript types from schema
npx supabase gen types typescript --project-id <project-ref> > src/types/database.types.ts
```

### Troubleshooting

- **"Supabase credentials not configured"**: Create `.env.local` with valid credentials
- **Type errors with database**: Regenerate types using the CLI command above
- **Connection issues**: Verify your Supabase project is active in the dashboard

## Project Structure

```text
src/
  features/           # Feature-based modules
    auth/             # Authentication
    inflation/        # Inflation calculations
    couch-manager/    # Couch Managers API integration
    leagues/          # League management
    teams/            # Team management
    players/          # Player data & search
    draft/            # Draft board
    projections/      # Projection calculations
    data-exchange/    # Import/export
    profile/          # User profile
  components/
    ui/               # shadcn/ui components
  lib/                # Shared utilities (including Supabase client)
  types/              # Global TypeScript types (including database types)
  hooks/              # Shared React hooks
  routes/             # Routing configuration

supabase/
  config.toml         # Supabase CLI configuration
  migrations/         # Database migrations

tests/
  features/           # Feature tests (mirrors src/features)
  components/         # Component tests
  integration/        # Integration tests
  e2e/                # End-to-end tests
  helpers/            # Test utilities (including Supabase mock)
```

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **State**: Zustand
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **Testing**: Vitest + React Testing Library
- **Deployment**: Vercel

## Documentation

- [Feature Structure](src/features/README.md) - Feature-based architecture guide
- [Architecture](docs/architecture.md) - Technical architecture decisions
- [PRD](docs/prd.md) - Product requirements document

## Development

See [docs/sprint-artifacts/](docs/sprint-artifacts/) for current sprint status and story files.

## Original Design

Based on [Figma design](https://www.figma.com/design/m0OAqaTBezvQwh19gsx3Uc/Fantasy-Baseball-Auction-Tool)
