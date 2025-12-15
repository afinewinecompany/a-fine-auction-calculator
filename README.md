# Auction Projections by A Fine Wine Company

Fantasy baseball auction draft companion that provides real-time inflation-adjusted player values during live auction drafts.

## Deployment

**Production URL:** <https://a-fine-auction-calculator.vercel.app>

### Deploying to Production

Deployment is automatic via Vercel:

1. Push changes to `master` branch
2. Vercel automatically builds and deploys
3. Deployment typically completes in 1-3 minutes

### Preview Deployments

- Every push to non-master branches creates a preview deployment
- Preview URL is commented on pull requests automatically
- Preview deployments use the same environment variables as production

### Environment Variables

Required environment variables (set in Vercel dashboard):

- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

### Viewing Deployment Logs

1. Visit [Vercel Dashboard](https://vercel.com/dashboard)
2. Select project: `a-fine-auction-calculator`
3. Click on deployment to view logs

### Troubleshooting Deployments

**Build Fails:**

- Check build logs in Vercel dashboard
- Verify `npm run build` works locally
- Ensure all dependencies are in `package.json`

**App Shows Errors:**

- Check browser console for errors
- Verify environment variables are set correctly
- Verify Supabase project is accessible

**Routes Return 404:**

- Verify `vercel.json` exists with SPA rewrite configuration
- Check that file was committed to repository

## Quick Start

```bash
npm install        # Install dependencies
npm run dev        # Start development server
npm test           # Run tests
npm run build      # Build for production
```

## Code Quality

This project uses ESLint and Prettier for code quality and formatting.

### Linting

ESLint 9.x with TypeScript support is configured to enforce code quality standards.

```bash
npm run lint       # Check for linting errors
npm run lint:fix   # Auto-fix linting errors
```

### Formatting

Prettier is configured for consistent code formatting.

```bash
npm run format        # Format all files
npm run format:check  # Check formatting without making changes
```

### Pre-Commit Hooks

Husky and lint-staged are configured to automatically lint and format staged files before each commit.

**Bypass hooks (emergency only):**

```bash
git commit --no-verify
```

### Naming Conventions

The ESLint configuration enforces naming conventions from the Architecture document:

| Type             | Format                                       | Example                                 |
| ---------------- | -------------------------------------------- | --------------------------------------- |
| React Components | PascalCase                                   | `DraftDashboard.tsx`, `PlayerQueue.tsx` |
| Functions        | camelCase                                    | `calculateInflation`, `getUserById`     |
| Variables        | camelCase                                    | `leagueId`, `playerData`                |
| Constants        | SCREAMING_SNAKE_CASE                         | `MAX_RETRIES`, `API_TIMEOUT`            |
| Types/Interfaces | PascalCase                                   | `User`, `League`, `PlayerProjection`    |
| Enums            | PascalCase name, SCREAMING_SNAKE_CASE values | `DraftStatus.IN_PROGRESS`               |

### Code Quality Troubleshooting

**Warnings vs Errors:**

- `npm run lint` may show warnings (e.g., naming conventions, unused vars) - these don't block builds
- Only errors will prevent code from running - warnings are guidance for best practices

**ESLint shows errors for @ imports:**

- Ensure `tsconfig.json` includes path alias configuration
- The `@/*` alias maps to `./src/*`

**Prettier and ESLint conflict:**

- The configuration uses `eslint-config-prettier` to disable conflicting rules
- Run `npm run format` after `npm run lint:fix`

**Pre-commit hook fails:**

- Verify `lint-staged` configuration in `package.json`
- Use `git commit --no-verify` to bypass in emergencies

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

### Supabase Troubleshooting

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
