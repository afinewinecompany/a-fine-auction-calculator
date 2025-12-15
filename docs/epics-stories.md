---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - 'c:\Users\lilra\myprojects\ProjectionCalculator\docs\prd.md'
  - 'c:\Users\lilra\myprojects\ProjectionCalculator\docs\architecture.md'
  - 'c:\Users\lilra\myprojects\ProjectionCalculator\docs\ux-design-specification.md'
totalEpics: 13
totalStories: 107
status: validated
validationComplete: true
validationDate: 2025-12-13
---

# Auction Projections by A Fine Wine Company - Epic Breakdown with Stories

## Overview

This document provides the complete epic and story breakdown for Auction Projections by A Fine Wine Company, decomposing the requirements from the PRD, UX Design, and Architecture requirements into implementable stories.

**Total Epics:** 13
**Total Stories:** (To be counted after generation)

---

## Epic 1: Project Foundation & Setup

Enable the development team to initialize the project with the correct technology stack and foundational infrastructure.

### Story 1.1: Initialize Vite React TypeScript Project

As a **developer**,
I want to initialize the project using Vite with React TypeScript template,
So that the foundational project structure is established with modern tooling.

**Acceptance Criteria:**

**Given** I need to start the project from scratch
**When** I execute the Vite initialization commands
**Then** the project is created with React 18+, TypeScript strict mode, and ESM module system
**And** the project includes `package.json`, `tsconfig.json`, `vite.config.ts`, and `index.html`
**And** the development server starts successfully on port 5173
**And** Hot Module Replacement (HMR) works correctly

### Story 1.2: Configure shadcn/ui Design System

As a **developer**,
I want to initialize and configure shadcn/ui with Tailwind CSS,
So that the design system foundation is ready for UI component development.

**Acceptance Criteria:**

**Given** the Vite project is initialized
**When** I run `npx shadcn@latest init`
**Then** Tailwind CSS v3+ is installed and configured automatically
**And** `tailwind.config.js` and PostCSS configuration files are created
**And** CSS variables for dark theme are configured in `globals.css`
**And** the `cn` utility function is available in `src/lib/utils.ts`
**And** the `src/components/ui/` directory structure is created
**And** I can add shadcn/ui components using `npx shadcn@latest add [component-name]`

### Story 1.3: Install Core Dependencies

As a **developer**,
I want to install all required core dependencies per Architecture specifications,
So that the application has access to state management, routing, forms, and date handling libraries.

**Acceptance Criteria:**

**Given** the project foundation is established
**When** I install the specified dependencies
**Then** Zustand v5.0.9 is installed for state management
**And** React Router v7.10.1 is installed for client-side routing
**And** React Hook Form v7.68.0 is installed for form handling
**And** date-fns v4.1.0 is installed for date/time operations
**And** all dependencies are recorded in `package.json` with exact versions
**And** `npm install` completes without errors

### Story 1.4: Configure Testing Framework

As a **developer**,
I want to set up Vitest v4.0.15 with React Testing Library,
So that comprehensive testing infrastructure is available from the start.

**Acceptance Criteria:**

**Given** core dependencies are installed
**When** I configure the testing framework
**Then** Vitest v4.0.15 and @testing-library/react are installed as dev dependencies
**And** `vitest.config.ts` is created with Browser Mode configuration
**And** `tests/setup.ts` is created with global test utilities
**And** `tests/helpers/` directory contains test utilities, mock data, and Supabase mocks
**And** test scripts (`npm test`, `npm run test:ui`) are added to `package.json`
**And** running `npm test` executes tests successfully

### Story 1.5: Establish Feature-Based Project Structure

As a **developer**,
I want to create the complete feature-based directory structure per Architecture document,
So that code organization follows the established patterns from the beginning.

**Acceptance Criteria:**

**Given** the project foundation is ready
**When** I create the directory structure
**Then** `src/features/` exists with placeholder directories for all 10 features (auth, inflation, couch-manager, leagues, teams, players, draft, projections, data-exchange, profile)
**And** each feature directory contains subdirectories: `components/`, `hooks/`, `stores/`, `types/`, `utils/`
**And** `src/components/ui/` exists for shadcn/ui components
**And** `src/lib/` exists with `api.ts`, `supabase.ts`, `utils.ts`, `constants.ts`
**And** `src/types/` exists for global types
**And** `src/hooks/` exists for shared hooks
**And** `src/routes/` exists for routing configuration
**And** `tests/` mirrors the src structure

### Story 1.6: Initialize Supabase Project

As a **developer**,
I want to create and configure the Supabase project,
So that backend services (database, auth, Edge Functions) are available.

**Acceptance Criteria:**

**Given** I have a Supabase account
**When** I create a new Supabase project
**Then** the project is created with PostgreSQL database
**And** I have the project URL and anon key credentials
**And** `supabase/` directory is created with `config.toml`
**And** `supabase/migrations/` directory exists for database migrations
**And** `supabase/functions/` directory exists for Edge Functions
**And** `.env.local` file contains `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
**And** `.env.example` file is created with placeholder values (committed to git)
**And** Supabase client initialization file exists at `src/lib/supabase.ts`

### Story 1.7: Configure Vercel Deployment

As a **developer**,
I want to connect the GitHub repository to Vercel for automatic deployments,
So that the application can be deployed to production with CI/CD.

**Acceptance Criteria:**

**Given** the project is in a GitHub repository
**When** I connect the repository to Vercel
**Then** automatic deployments are configured on push to main branch
**And** preview deployments are enabled for pull requests
**And** environment variables (Supabase credentials) are configured in Vercel dashboard
**And** the build command is set to `npm run build`
**And** the output directory is set to `dist/`
**And** a successful deployment completes
**And** the deployment URL is accessible

### Story 1.8: Configure Code Quality Tools

As a **developer**,
I want to set up ESLint and Prettier configurations,
So that code quality and formatting standards are enforced.

**Acceptance Criteria:**

**Given** the project structure is established
**When** I configure linting and formatting tools
**Then** ESLint is configured with TypeScript support in `eslint.config.js`
**And** Prettier is configured with project-specific rules
**And** lint scripts are added to `package.json` (`npm run lint`, `npm run lint:fix`)
**And** format scripts are added to `package.json` (`npm run format`)
**And** pre-commit hooks (optional) can be configured with husky
**And** running `npm run lint` shows no errors on clean code
**And** the configuration follows Architecture naming conventions (PascalCase components, camelCase functions)

---

## Epic 2: User Authentication & Profile Management

Enable users to create accounts, authenticate securely, and manage their profiles.

### Story 2.1: Create Users Table and Auth Schema

As a **developer**,
I want to create the users table and configure Supabase Auth,
So that user account data can be stored securely.

**Acceptance Criteria:**

**Given** Supabase project is initialized
**When** I create the initial database migration
**Then** a `users` table exists with columns: `id` (UUID, primary key), `email` (TEXT, unique), `display_name` (TEXT), `avatar_url` (TEXT), `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ)
**And** Row Level Security (RLS) is enabled on the `users` table
**And** RLS policies allow users to read/update only their own data
**And** a trigger automatically creates a user record when auth.users is populated
**And** the migration file is saved in `supabase/migrations/001_users_auth.sql`
**And** running `supabase db push` applies the migration successfully

### Story 2.2: Implement Email/Password Registration

As a **user**,
I want to register for an account using my email and password,
So that I can create a new account and access the application.

**Acceptance Criteria:**

**Given** I am on the registration page
**When** I enter a valid email and password (minimum 8 characters)
**Then** my account is created in Supabase Auth
**And** a corresponding user record is created in the `users` table
**And** I receive a confirmation email (if email confirmation is enabled)
**And** I am automatically logged in after successful registration
**And** I am redirected to the leagues dashboard
**And** error messages display for invalid inputs (weak password, existing email)
**And** the registration form uses React Hook Form with validation per Architecture requirements

### Story 2.3: Implement Email/Password Login

As a **user**,
I want to log in using my email and password,
So that I can access my account and saved data.

**Acceptance Criteria:**

**Given** I have a registered account
**When** I enter my correct email and password on the login page
**Then** I am successfully authenticated via Supabase Auth
**And** my session is established with a JWT token
**And** my user data is loaded into the auth store (Zustand)
**And** I am redirected to the leagues dashboard
**And** my session persists across browser refreshes (NFR-S2: 30-day expiration)
**And** error messages display for incorrect credentials
**And** the login form uses React Hook Form with shadcn/ui components

### Story 2.4: Implement Google OAuth Authentication

As a **user**,
I want to log in using my Google account,
So that I can authenticate quickly without creating a password.

**Acceptance Criteria:**

**Given** I am on the login page
**When** I click the "Sign in with Google" button
**Then** I am redirected to Google's OAuth consent screen
**And** after granting permission, I am redirected back to the application
**And** my account is created automatically if it doesn't exist
**And** my Google profile information (email, name, avatar) is stored in the `users` table
**And** I am logged in and redirected to the leagues dashboard
**And** the OAuth flow uses Supabase Auth Google provider (NFR-S1: OAuth 2.0 standard)
**And** my session is established and persists

### Story 2.5: Implement Logout Functionality

As a **user**,
I want to log out of my account,
So that I can securely end my session.

**Acceptance Criteria:**

**Given** I am logged in
**When** I click the logout button in the navigation
**Then** my session is terminated via Supabase Auth signOut()
**And** my authentication state is cleared from the auth store (Zustand)
**And** I am redirected to the landing page
**And** attempting to access protected routes redirects me to login
**And** my session cannot be resumed without re-authentication

### Story 2.6: Implement Profile Management

As a **user**,
I want to view and update my profile information (username, profile picture),
So that I can personalize my account.

**Acceptance Criteria:**

**Given** I am logged in
**When** I navigate to my profile page
**Then** I can view my current display name and avatar
**And** I can edit my display name using an inline form
**And** I can upload a new profile picture (stored in Supabase Storage)
**And** changes are saved to the `users` table
**And** the updated profile data is reflected immediately in the UI
**And** the profile form uses React Hook Form with validation
**And** avatar images are optimized and stored securely (NFR-S7: user data accessible only to owner)

### Story 2.7: Implement Protected Routes

As a **developer**,
I want to implement protected route guards using React Router,
So that authenticated users can access restricted pages and unauthenticated users are redirected to login.

**Acceptance Criteria:**

**Given** the application has public and protected routes
**When** an unauthenticated user attempts to access a protected route (e.g., `/leagues`, `/draft`)
**Then** they are redirected to the `/login` page
**And** after successful login, they are redirected to their originally requested page
**And** authenticated users can access protected routes without redirection
**And** protected routes use a `<ProtectedRoute>` wrapper component
**And** the auth state is checked via Zustand auth store
**And** all routes are defined in `src/routes/router.tsx` per Architecture

### Story 2.8: Create Auth Store with Zustand

As a **developer**,
I want to create the authentication Zustand store,
So that auth state is managed globally and persists across page refreshes.

**Acceptance Criteria:**

**Given** Zustand is installed
**When** I create `src/features/auth/stores/authStore.ts`
**Then** the store manages: `user` (User | null), `session` (Session | null), `isLoading` (boolean), `error` (string | null)
**And** the store exposes actions: `setUser()`, `setSession()`, `clearAuth()`, `login()`, `logout()`, `signUp()`
**And** the store uses Zustand persist middleware to save auth state to localStorage
**And** the store integrates with Supabase Auth to sync session state
**And** the store follows naming conventions per Architecture (camelCase store name, camelCase hook name `useAuthStore`)

---

## Epic 3: League Configuration & Management

Enable users to create, save, and manage multiple league configurations for different drafts.

### Story 3.1: Create Leagues Database Table

As a **developer**,
I want to create the leagues table in PostgreSQL,
So that league configuration data can be persisted.

**Acceptance Criteria:**

**Given** the users table exists
**When** I create the leagues migration
**Then** a `leagues` table exists with columns: `id` (UUID, primary key), `user_id` (UUID, foreign key to users), `name` (TEXT, not null), `team_count` (INTEGER, not null), `budget` (INTEGER, not null), `roster_spots_hitters` (INTEGER), `roster_spots_pitchers` (INTEGER), `roster_spots_bench` (INTEGER), `scoring_type` (TEXT), `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ)
**And** RLS policies ensure users can only access their own leagues (NFR-S7)
**And** indexes are created: `idx_leagues_user_id` for efficient user-specific queries
**And** the migration is saved in `supabase/migrations/002_leagues.sql`

### Story 3.2: Implement Create League Form

As a **user**,
I want to create a new fantasy baseball league configuration,
So that I can set up a league with custom settings for my draft.

**Acceptance Criteria:**

**Given** I am logged in and on the leagues page
**When** I click "Create New League" and fill out the league form
**Then** I can enter: league name, team count (8-20), budget ($100-$500), roster spots (hitters, pitchers, bench), and scoring type (5x5, 6x6, points)
**And** form validation ensures all required fields are filled with valid values
**And** clicking "Save" creates a new league record in the database
**And** the league is associated with my user ID
**And** I am redirected to the league detail view
**And** the form uses React Hook Form with shadcn/ui components per Architecture
**And** validation logic is in `src/features/leagues/utils/leagueValidation.ts`

### Story 3.3: Display Saved Leagues List

As a **user**,
I want to view a list of all my saved leagues,
So that I can see all the leagues I've configured.

**Acceptance Criteria:**

**Given** I am logged in and have created leagues
**When** I navigate to the leagues page
**Then** I see a list of all my saved leagues
**And** each league card displays: league name, team count, budget, creation date
**And** leagues are sorted by most recently created first
**And** empty state is displayed if I have no leagues ("Create your first league")
**And** the list uses Supabase query: `supabase.from('leagues').select('*').eq('user_id', userId)`
**And** league data is stored in `src/features/leagues/stores/leagueStore.ts` using Zustand

### Story 3.4: Implement Edit League Settings

As a **user**,
I want to edit an existing league's settings,
So that I can update configurations before a draft.

**Acceptance Criteria:**

**Given** I have a saved league
**When** I click "Edit" on a league card
**Then** the league form is pre-populated with current settings
**And** I can modify: league name, team count, budget, roster spots, scoring type
**And** clicking "Save Changes" updates the league record in the database
**And** the updated league appears in my leagues list with new values
**And** validation ensures changes are valid
**And** the form uses React Hook Form with the same validation as create

### Story 3.5: Implement Delete League

As a **user**,
I want to delete a league I no longer need,
So that my leagues list stays organized.

**Acceptance Criteria:**

**Given** I have a saved league
**When** I click "Delete" on a league card
**Then** a confirmation dialog appears asking "Are you sure you want to delete [League Name]?"
**And** clicking "Confirm" deletes the league from the database
**And** the league is removed from my leagues list immediately
**And** clicking "Cancel" closes the dialog without deleting
**And** the deletion uses Supabase: `supabase.from('leagues').delete().eq('id', leagueId)`
**And** RLS ensures I can only delete my own leagues

### Story 3.6: Generate Direct League Access Links

As a **user**,
I want each league to have a unique URL for one-click access,
So that I can quickly return to a specific league.

**Acceptance Criteria:**

**Given** I have created a league
**When** the league is saved
**Then** a unique URL is generated: `/leagues/{leagueId}`
**And** I can copy the league URL to clipboard using a "Copy Link" button
**And** navigating directly to the URL loads the league detail page
**And** the league detail page displays all league settings
**And** clicking "Start Draft" from the league detail page navigates to `/leagues/{leagueId}/draft`
**And** React Router handles the dynamic `:leagueId` parameter

### Story 3.7: Implement Resume Draft Functionality

As a **user**,
I want to resume a draft in progress from a saved league,
So that I can continue where I left off if I navigate away.

**Acceptance Criteria:**

**Given** I have started a draft for a league
**When** draft state (roster, budget, players drafted) is saved to the database or localStorage
**Then** navigating back to `/leagues/{leagueId}/draft` restores the draft state
**And** my roster, remaining budget, and draft progress are all preserved
**And** the player queue reflects which players have been drafted
**And** the inflation calculations resume from the current state
**And** draft state is saved using Zustand persist middleware per Architecture (NFR-R4: zero data loss)
**And** the draft state includes: `leagueId`, `roster`, `budget`, `draftedPlayers`, `inflationData`

---

## Epic 4: Projection Data Management

Enable users to import, manage, and view player projection data from multiple sources.

### Story 4.1: Create Player Projections Database Table

As a **developer**,
I want to create the player_projections table,
So that projection data can be stored and queried efficiently.

**Acceptance Criteria:**

**Given** the leagues table exists
**When** I create the projections migration
**Then** a `player_projections` table exists with columns: `id` (UUID, primary key), `league_id` (UUID, foreign key to leagues), `player_name` (TEXT, not null), `team` (TEXT), `positions` (TEXT[]), `projected_value` (DECIMAL), `projection_source` (TEXT), `stats_hitters` (JSONB for batting stats), `stats_pitchers` (JSONB for pitching stats), `tier` (TEXT), `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ)
**And** indexes are created: `idx_projections_league_id`, `idx_projections_player_name`
**And** RLS policies ensure users can only access projections for their own leagues
**And** the migration is saved in `supabase/migrations/003_player_projections.sql`

### Story 4.2: Implement Google Sheets OAuth Integration

As a **user**,
I want to connect my Google account to import player projections from Google Sheets,
So that I can use my custom projection data.

**Acceptance Criteria:**

**Given** I am on the projection import page for a league
**When** I click "Import from Google Sheets"
**Then** I am redirected to Google OAuth consent screen
**And** I grant permission to access Google Sheets
**And** I am redirected back to the application with authorization
**And** the OAuth token is securely stored (server-side via Supabase Edge Function per NFR-S6)
**And** I can select a Google Sheet from my drive
**And** the integration follows standard Google authentication flow (NFR-I7)

### Story 4.3: Import Projections from Google Sheets

As a **user**,
I want to import player projection data from a selected Google Sheet,
So that my league uses my custom projections.

**Acceptance Criteria:**

**Given** I have authorized Google Sheets access and selected a sheet
**When** I click "Import Projections"
**Then** the system reads the sheet data (player names, teams, positions, projected stats)
**And** the data is validated (required fields present, data types correct)
**And** valid projections are inserted into the `player_projections` table for my league
**And** the import completes within 5 seconds (NFR-P4)
**And** I see a success message: "Imported {count} player projections"
**And** invalid rows are reported with clear error messages
**And** the import uses a Supabase Edge Function to keep API keys server-side
**And** the projection source is recorded as "Google Sheets"

### Story 4.4: Implement Fangraphs API Integration

As a **developer**,
I want to integrate with Fangraphs API to fetch projection systems (Steamer, BatX, JA),
So that users can select professional projection data.

**Acceptance Criteria:**

**Given** Fangraphs API credentials are configured
**When** I create the Fangraphs integration Edge Function
**Then** the function can fetch projections for all three systems: Steamer, BatX, JA
**And** the function returns consistent data formats for all systems (NFR-I8)
**And** API calls are proxied through Supabase Edge Functions (NFR-S6: API keys not exposed client-side)
**And** the function handles rate limiting and errors gracefully
**And** the function is deployed to Supabase: `supabase/functions/fetch-fangraphs-projections/`
**And** the function can be invoked from the client application

### Story 4.5: Select and Load Fangraphs Projections

As a **user**,
I want to select a Fangraphs projection system (Steamer, BatX, or JA) for my league,
So that I can use professional projection data.

**Acceptance Criteria:**

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

### Story 4.6: Implement Daily Fangraphs Sync

As a **developer**,
I want to set up automated daily syncs of Fangraphs projection data,
So that leagues using Fangraphs always have up-to-date projections.

**Acceptance Criteria:**

**Given** a league is using Fangraphs projections
**When** the daily sync job runs (scheduled at 2 AM via Supabase Cron)
**Then** the job fetches updated projections from Fangraphs for all active leagues
**And** existing projections are updated with new data (upsert operation)
**And** the `updated_at` timestamp is updated for all modified projections
**And** the sync completes within 10 seconds per league (NFR-P5)
**And** sync success/failure is logged to `projection_sync_logs` table
**And** failed syncs trigger alerts if error rate exceeds threshold
**And** the sync job is configured in `supabase/functions/daily-projection-sync/`

### Story 4.7: Display Projection Source and Timestamp

As a **user**,
I want to view the projection source and last updated timestamp for my league,
So that I know which data I'm using and how current it is.

**Acceptance Criteria:**

**Given** my league has loaded projections
**When** I view the projections page or draft dashboard
**Then** I can see the projection source displayed: "Google Sheets" or "Fangraphs - Steamer"
**And** I can see the last updated timestamp: "Last updated: Dec 12, 2025 2:30 AM"
**And** the timestamp is formatted using date-fns per Architecture
**And** the information is prominently displayed at the top of the projections list
**And** hovering over the timestamp shows the full date/time

### Story 4.8: Export Projections for Offline Analysis

As a **user**,
I want to export my league's projection data to CSV or JSON,
So that I can perform offline analysis or backup my data.

**Acceptance Criteria:**

**Given** my league has projection data
**When** I click "Export Projections"
**Then** I can choose export format: CSV or JSON
**And** clicking "Export as CSV" downloads a CSV file with all projection data
**And** clicking "Export as JSON" downloads a JSON file with all projection data
**And** the exported file includes: player names, teams, positions, projected values, stats, tiers, source, and timestamp
**And** the filename includes the league name and export date: `{LeagueName}_Projections_{Date}.csv`
**And** the export uses client-side generation per Architecture (no server roundtrip needed)

---

## Epic 5: Core Inflation Engine

Enable the system to calculate real-time, tier-specific, position-aware inflation adjustments for all players.

### Story 5.1: Design Inflation Data Model

As a **developer**,
I want to define the TypeScript types and data structures for the inflation engine,
So that inflation calculations have a clear contract.

**Acceptance Criteria:**

**Given** I need to model inflation state
**When** I create `src/features/inflation/types/inflation.types.ts`
**Then** the file defines: `InflationState`, `PositionInflationRate`, `TierInflationRate`, `PlayerTier`, `InflationMetrics`
**And** `InflationState` includes: `overallRate` (number), `positionRates` (Record<Position, number>), `tierRates` (Record<Tier, number>), `budgetDepleted` (number), `playersRemaining` (number)
**And** `PlayerTier` enum includes: `ELITE`, `MID`, `LOWER`
**And** all types follow Architecture naming conventions (PascalCase for types)

### Story 5.2: Implement Basic Inflation Calculation

As a **developer**,
I want to implement the core inflation calculation algorithm,
So that overall inflation rate can be computed based on actual vs. projected spending.

**Acceptance Criteria:**

**Given** I have draft data with actual auction prices and projected values
**When** I call `calculateOverallInflation(draftedPlayers, projections)`
**Then** the function calculates: `totalActualSpent - totalProjectedSpent`
**And** the function returns the inflation rate as a percentage
**And** the function handles edge cases (no players drafted, division by zero)
**And** the calculation completes in <100ms for 200+ drafted players
**And** the function is in `src/features/inflation/utils/inflationCalculations.ts`
**And** the function has >90% test coverage per Architecture requirements

### Story 5.3: Implement Position-Specific Inflation Tracking

As a **developer**,
I want to calculate inflation rates independently for each position (C, 1B, 2B, SS, 3B, OF, SP, RP),
So that position scarcity is accurately modeled.

**Acceptance Criteria:**

**Given** players are drafted at different positions
**When** I call `calculatePositionInflation(draftedPlayers, projections)`
**Then** the function returns an object mapping each position to its inflation rate
**And** positions with no drafted players return 0% inflation
**And** the function handles multi-position players by apportioning inflation across eligible positions
**And** the calculation is independent for each position (OF inflation doesn't affect SS inflation)
**And** the function completes in <100ms
**And** tests validate position-specific rates against mock draft data

### Story 5.4: Implement Tier-Specific Inflation Tracking

As a **developer**,
I want to calculate inflation rates for player tiers (Elite, Mid, Lower),
So that the "run on bank" theory is accurately modeled.

**Acceptance Criteria:**

**Given** players are assigned to tiers (Elite, Mid, Lower) based on projected value thresholds
**When** I call `calculateTierInflation(draftedPlayers, projections)`
**Then** the function returns inflation rates for each tier: `{ ELITE: 15%, MID: 22%, LOWER: -5% }`
**And** tier assignments are based on projected value percentiles (top 10% = Elite, 10-40% = Mid, 40%+ = Lower)
**And** tier inflation is calculated independently (Elite inflation doesn't directly affect Lower tier)
**And** the function handles the case where mid-tier players inflate faster than elite (as per PRD theory)
**And** the calculation completes in <100ms
**And** comprehensive tests cover all tier inflation scenarios

### Story 5.5: Implement Budget Depletion Modeling

As a **developer**,
I want to model how budget depletion affects late-draft valuations,
So that player values adjust as available money decreases.

**Acceptance Criteria:**

**Given** draft progress data (total budget, money spent, players remaining)
**When** I call `calculateBudgetDepletionFactor(totalBudget, spent, playersRemaining)`
**Then** the function returns a depletion multiplier that reduces values as budgets run low
**And** early in the draft (10% spent), the multiplier is near 1.0 (no adjustment)
**And** late in the draft (90% spent), the multiplier is <1.0 (values deflate)
**And** the function accounts for roster spots remaining vs. budget remaining
**And** the calculation prevents negative adjusted values
**And** the function completes in <10ms

### Story 5.6: Calculate Dynamic Adjusted Player Values

As a **developer**,
I want to combine overall, position, tier, and budget depletion factors to produce adjusted values for all remaining players,
So that users see inflation-adjusted values in real-time.

**Acceptance Criteria:**

**Given** inflation state is calculated (overall, position, tier, budget depletion)
**When** I call `calculateAdjustedValues(players, inflationState)`
**Then** each remaining player receives an `adjustedValue` based on their projected value + relevant inflation factors
**And** the formula applies: `adjustedValue = projectedValue * (1 + positionInflation) * (1 + tierInflation) * budgetDepletionFactor`
**And** adjusted values are rounded to whole dollars
**And** the function processes 2000+ players in <2 seconds (NFR-P1)
**And** adjusted values are never negative
**And** tests validate adjusted value accuracy against known inflation scenarios

### Story 5.7: Create Inflation Store with Zustand

As a **developer**,
I want to create a Zustand store to manage inflation state globally,
So that inflation data is available throughout the application.

**Acceptance Criteria:**

**Given** Zustand is configured
**When** I create `src/features/inflation/stores/inflationStore.ts`
**Then** the store manages: `overallRate`, `positionRates`, `tierRates`, `budgetDepleted`, `adjustedValues` (Map<playerId, value>)
**And** the store exposes actions: `updateInflation(draftedPlayers, projections)`, `resetInflation()`
**And** calling `updateInflation()` triggers all inflation calculations and updates state
**And** the store uses immutable updates per Zustand best practices
**And** the store follows Architecture naming: `useInflationStore()` hook, camelCase store name

### Story 5.8: Integrate Inflation Engine with Draft State

As a **developer**,
I want to automatically trigger inflation recalculation whenever new players are drafted,
So that adjusted values update in real-time.

**Acceptance Criteria:**

**Given** the draft store tracks drafted players and the inflation store manages calculations
**When** a new player is marked as drafted (via API sync or manual entry)
**Then** the `updateInflation()` action is called automatically
**And** all inflation rates (overall, position, tier) are recalculated
**And** all remaining player adjusted values are updated
**And** the recalculation completes in <2 seconds (NFR-P1)
**And** the UI reflects updated values immediately without blocking user interactions (NFR-P8)
**And** the integration uses Zustand subscriptions to react to draft state changes

---

## Epic 6: Live Draft Experience - Player Discovery & Tracking

Enable users to search, filter, sort, and discover players during live drafts with inflation-adjusted values displayed prominently for glanceable competitive intelligence.

### Story 6.1: Create Draft State Database Tables

As a **developer**,
I want to create database tables for tracking draft state (drafted players, rosters),
So that draft progress can be persisted and synchronized.

**Acceptance Criteria:**

**Given** the projections and leagues tables exist
**When** I create the draft tables migration
**Then** a `drafted_players` table exists with columns: `id` (UUID), `league_id` (UUID, FK), `player_id` (UUID, FK to projections), `drafted_by_team` (INTEGER), `auction_price` (DECIMAL), `drafted_at` (TIMESTAMPTZ)
**And** a `rosters` table exists with columns: `id` (UUID), `league_id` (UUID, FK), `team_number` (INTEGER), `budget_remaining` (DECIMAL), `players` (JSONB array), `created_at`, `updated_at`
**And** indexes are created for efficient querying by league_id
**And** RLS policies ensure users can only access their own league data
**And** the migration is saved in `supabase/migrations/004_draft_tables.sql`

### Story 6.2: Implement PlayerQueue Component Foundation

As a **developer**,
I want to create the PlayerQueue component structure with shadcn/ui Table,
So that the player list UI foundation is established.

**Acceptance Criteria:**

**Given** shadcn/ui Table component is available
**When** I create `src/features/draft/components/PlayerQueue.tsx`
**Then** the component renders a responsive table with columns: Player Name, Positions, Team, Projected Value, Adjusted Value, Tier, Status
**And** the table uses dark slate theme (slate-950 background) per UX requirements
**And** the component accepts props: `players` (array), `onPlayerSelect` (function)
**And** the table is responsive with horizontal scroll on mobile (sticky first column for player names)
**And** 44px minimum touch targets are maintained on mobile (NFR touch requirements)
**And** the component uses TypeScript with proper type definitions

### Story 6.3: Implement Instant Player Search

As a **user**,
I want to search for players by name with instant filtering,
So that I can quickly find a nominated player during live bidding.

**Acceptance Criteria:**

**Given** I am viewing the PlayerQueue
**When** I type a player name into the search input field
**Then** the player list filters instantly as I type (no submit button required)
**And** the search is case-insensitive
**And** partial matches are displayed (typing "Acu" shows "Ronald Acuña Jr.")
**And** the search completes in <100ms (NFR-P6: 60fps maintained)
**And** the search input receives automatic keyboard focus on page load
**And** the search uses client-side filtering (no API call needed)
**And** showing "X of Y players" count updates dynamically

### Story 6.4: Implement Sortable Table Columns

As a **user**,
I want to sort players by any column (projected value, adjusted value, position, team),
So that I can organize the player list by different attributes.

**Acceptance Criteria:**

**Given** the PlayerQueue table is rendered
**When** I click on a column header
**Then** the table sorts by that column in ascending order
**And** clicking again toggles to descending order
**And** a visual indicator (arrow icon) shows the current sort column and direction
**And** the default sort is by adjusted value descending (highest values first)
**And** sorting completes instantly (<100ms) for 2000+ players
**And** the sort state persists during the draft session (stored in Zustand)
**And** numerical columns sort numerically, text columns sort alphabetically

### Story 6.5: Display Adjusted Values with Prominent Styling

As a **user**,
I want adjusted player values displayed prominently with emerald color,
So that I can complete 3-second value scans during active bidding.

**Acceptance Criteria:**

**Given** inflation calculations have produced adjusted values
**When** the PlayerQueue renders
**Then** adjusted values are displayed in large, bold text (text-xl, font-bold per UX spec)
**And** adjusted values use emerald-400 color to stand out visually
**And** projected values are displayed smaller and in secondary color (slate-400) for comparison
**And** the visual hierarchy ensures adjusted values are the visual anchor of each row
**And** values are formatted as currency ($45, not 45.0)
**And** the styling matches UX requirements exactly

### Story 6.6: Implement Color-Coded Value Indicators

As a **user**,
I want players color-coded based on value (green for steals, yellow for fair, red for overpays),
So that I can instantly identify undervalued opportunities.

**Acceptance Criteria:**

**Given** players have both projected and adjusted values
**When** the PlayerQueue renders
**Then** each player row has a subtle background tint based on value
**And** green background (emerald-900/20) indicates "steal" (actual price < adjusted value by >10%)
**And** yellow background (yellow-900/20) indicates "fair value" (within ±10% of adjusted value)
**And** orange/red background (red-900/20) indicates "overpay" (actual price > adjusted value by >10%)
**And** undrafted players show no background tint (only show indicators after being drafted)
**And** the color coding follows universal fantasy sports conventions (green = good)
**And** color is paired with text labels for accessibility (not color-only communication)

### Story 6.7: Display Player Draft Status

As a **user**,
I want to see which players are available, drafted by other teams, or drafted by me,
So that I can filter the player pool appropriately.

**Acceptance Criteria:**

**Given** players have draft status in the system
**When** the PlayerQueue renders
**Then** each player displays status: "Available", "Drafted by Team {N}", or "My Team"
**And** my drafted players are highlighted with a distinct visual treatment (emerald border)
**And** unavailable players (drafted by others) are grayed out (opacity reduced)
**And** the player count updates: "Showing X available of Y total players"
**And** status updates immediately when players are drafted (real-time via Zustand store)

### Story 6.8: Implement Filter by Draft Status

As a **user**,
I want to filter players by draft status (all, available only, my team),
So that I can focus on relevant players.

**Acceptance Criteria:**

**Given** the PlayerQueue has filter controls
**When** I select a filter option from the dropdown
**Then** selecting "Available Only" shows only undrafted players
**And** selecting "My Team" shows only players I've drafted
**And** selecting "All Players" shows the complete player pool
**And** the active filter is visually indicated
**And** one-click "Clear Filters" button resets all filters
**And** filter state persists during the draft session
**And** multiple filters can be combined (e.g., "Available Only" + position filter)

### Story 6.9: Display Player Tier Assignments

As a **user**,
I want to view tier assignments (Elite, Mid, Lower) for each player in the queue,
So that I understand how inflation is being calculated.

**Acceptance Criteria:**

**Given** players have been assigned to tiers by the inflation engine
**When** the PlayerQueue renders
**Then** each player displays their tier badge (T1 = Elite, T2 = Mid, T3 = Lower)
**And** tier badges use consistent styling (small badge component from shadcn/ui)
**And** the tier is visible without requiring row expansion (always shown)
**And** hovering over the tier badge shows a tooltip explaining tier criteria
**And** tier assignments follow the percentile thresholds from Epic 5 (top 10% = Elite, etc.)

### Story 6.10: Implement Mobile-Responsive Design

As a **user**,
I want the PlayerQueue to work identically on mobile and desktop,
So that I can draft from any device without feature loss.

**Acceptance Criteria:**

**Given** I access the PlayerQueue on mobile (<768px screen width)
**When** the component renders
**Then** the table uses horizontal scroll with sticky first column (player name always visible)
**And** all features work identically (search, sort, filter, value display)
**And** touch targets meet 44px minimum size requirement
**And** the adjusted value column remains visible alongside player names
**And** scrolling maintains 60fps performance (NFR-P6)
**And** the layout matches UX requirements for mobile-desktop parity (NFR: identical feature sets)

### Story 6.11: Implement Player Detail Modal

As a **user**,
I want to tap/click a player row to view detailed information,
So that I can see full projected stats before bidding.

**Acceptance Criteria:**

**Given** I am viewing the PlayerQueue
**When** I click/tap on a player row
**Then** a modal overlay opens displaying full player details
**And** the modal shows: full name, team, all eligible positions, projected stats (batting or pitching), tier assignment, inflation breakdown
**And** the modal uses shadcn/ui Dialog component per Architecture
**And** clicking outside or pressing Escape closes the modal
**And** the modal is responsive and works on mobile and desktop
**And** the modal follows dark theme styling (slate backgrounds)

---

## Epic 7: Live Draft Experience - Budget & Roster Management

Enable users to track their auction budget, roster composition, and position needs in real-time during drafts with persistent context panels.

### Story 7.1: Create RosterPanel Component Foundation

As a **developer**,
I want to create the RosterPanel component structure,
So that budget and roster tracking UI can be built.

**Acceptance Criteria:**

**Given** shadcn/ui Card component is available
**When** I create `src/features/draft/components/RosterPanel.tsx`
**Then** the component renders a panel with sections: Budget Summary, Roster Composition, Position Needs
**And** the panel uses dark slate backgrounds (slate-900) with emerald accents per UX
**And** the component accepts props: `budget`, `roster`, `leagueSettings`
**And** the panel is positioned as persistent sidebar (4-column grid on desktop per UX layout)
**And** on mobile, the panel is collapsible or accessible via bottom sheet
**And** the component uses TypeScript with proper types

### Story 7.2: Display Real-Time Budget Tracking

As a **user**,
I want to monitor my remaining auction budget in real-time,
So that I know how much money I have left to spend.

**Acceptance Criteria:**

**Given** I am in an active draft
**When** the RosterPanel renders
**Then** I see my remaining budget prominently displayed: "$185 Remaining"
**And** I see total budget: "of $260 total"
**And** I see money spent: "$75 Spent"
**And** the budget updates immediately (<100ms) when I draft a player (NFR-P7)
**And** the remaining budget uses large, bold text (emerald-400 color)
**And** low budget triggers a visual warning (red color when <$20 remaining)

### Story 7.3: Display Money Spent Breakdown by Position

As a **user**,
I want to view my spending breakdown across roster positions,
So that I can see where my budget has been allocated.

**Acceptance Criteria:**

**Given** I have drafted players at various positions
**When** the RosterPanel renders the spending breakdown
**Then** I see spending grouped by position category: Hitters, Pitchers, Bench
**And** each position shows: total spent and number of players (e.g., "OF: $42 (3 players)")
**And** the breakdown uses a compact list format
**And** the totals sum correctly to match total spent
**And** the breakdown updates in real-time as players are drafted

### Story 7.4: Display Spending Pace Indicator

As a **user**,
I want to see my spending pace compared to target budget allocation,
So that I know if I'm spending too fast or too slow.

**Acceptance Criteria:**

**Given** I am partway through the draft
**When** the RosterPanel calculates spending pace
**Then** I see a pace indicator: "On Pace" (green), "Spending Fast" (yellow), "Spending Slow" (blue)
**And** the indicator compares: (money spent / roster spots filled) vs. (total budget / total roster spots)
**And** "On Pace" means within 10% of target pace
**And** the indicator updates after each player drafted
**And** a tooltip explains the calculation on hover

### Story 7.5: Display Roster Composition by Position

As a **user**,
I want to view my current roster organized by position (hitters, pitchers, bench),
So that I can see who I've drafted and which positions are filled.

**Acceptance Criteria:**

**Given** I have drafted players
**When** the RosterPanel renders the roster section
**Then** my roster is displayed in three groups: Hitters, Pitchers, Bench
**And** each player entry shows: name, position, auction price
**And** the roster is scrollable if it exceeds panel height
**And** empty positions show placeholder text: "No hitters drafted yet"
**And** the roster updates immediately when players are drafted

### Story 7.6: Display Filled vs. Remaining Roster Slots

As a **user**,
I want to see how many roster spots I've filled vs. how many remain,
So that I know how many more players I need to draft.

**Acceptance Criteria:**

**Given** league settings define total roster spots
**When** the RosterPanel renders
**Then** I see roster slot counts: "14 of 23 roster spots filled"
**And** I see a progress bar visualizing roster completion (60% filled)
**And** the counts update in real-time as players are drafted
**And** the display breaks down by position group: "Hitters: 9/14", "Pitchers: 5/9", "Bench: 0/0"

### Story 7.7: Display Position Needs Summary

As a **user**,
I want to see which positions I still need to fill ("Still Needed"),
So that I can prioritize my remaining draft picks.

**Acceptance Criteria:**

**Given** league roster requirements specify positions needed
**When** the RosterPanel renders the position needs section
**Then** I see a list of unfilled positions with counts: "C: 1", "OF: 2", "SP: 3"
**And** positions that are filled are not shown in the "Still Needed" list
**And** the list uses badge/chip components (shadcn/ui Badge)
**And** the list updates immediately as positions are filled
**And** the section shows "All positions filled!" when roster is complete

### Story 7.8: Track Overall Draft Progress

As a **user**,
I want to see overall draft progress (players drafted league-wide, players remaining),
So that I understand how far along the draft is.

**Acceptance Criteria:**

**Given** the draft is in progress
**When** the RosterPanel renders draft progress
**Then** I see total players drafted league-wide: "85 of 276 players drafted"
**And** I see a progress bar showing draft completion percentage
**And** I see estimated time remaining (optional): "~45 minutes remaining"
**And** the progress updates in real-time as any team drafts players
**And** the data comes from the draft store (Zustand)

---

## Epic 8: Live Draft Experience - Variance & Inflation Insights

Enable users to see real-time inflation metrics, identify steals vs. overpays, and understand tier-based inflation dynamics as the draft progresses.

### Story 8.1: Create InflationTracker Component

As a **developer**,
I want to create the InflationTracker component,
So that inflation metrics can be displayed to users.

**Acceptance Criteria:**

**Given** shadcn/ui Card component is available
**When** I create `src/features/draft/components/InflationTracker.tsx`
**Then** the component renders a compact metrics grid (2x2 layout per UX spec)
**And** the component accepts props: `inflationRate`, `positionRates`, `tierRates`, `variance`
**And** the component uses dark slate theme with emerald accents
**And** the component is positioned in the persistent sidebar alongside RosterPanel
**And** the component updates in real-time as inflation changes

### Story 8.2: Display Current Inflation Rate Percentage

As a **user**,
I want to view the current overall inflation rate percentage prominently,
So that I understand the current market temperature.

**Acceptance Criteria:**

**Given** the inflation engine has calculated overall inflation
**When** the InflationTracker renders
**Then** I see the inflation rate displayed prominently: "+12.5%"
**And** the rate uses large, bold text with emerald color for positive inflation
**And** negative inflation (deflation) is displayed in red: "-3.2%"
**And** a badge or highlight draws attention to the inflation percentage
**And** the rate updates immediately after each inflation recalculation
**And** hovering shows a tooltip: "Players are selling for 12.5% above projections on average"

### Story 8.3: Display Variance Tracking for Drafted Players

As a **user**,
I want to view variance tracking showing which players were steals vs. overpays,
So that I can learn from the market and adjust my bidding strategy.

**Acceptance Criteria:**

**Given** players have been drafted with actual prices
**When** the InflationTracker renders variance data
**Then** I see a summary: "Steals: 12 players | Overpays: 8 players"
**And** "Steals" are players drafted below their adjusted value (green color)
**And** "Overpays" are players drafted above their adjusted value (red/orange color)
**And** clicking on the summary expands a list showing specific players and their variance
**And** variance is calculated as: (actual price - adjusted value) / adjusted value
**And** the display updates in real-time as more players are drafted

### Story 8.4: Display Inflation Trend Indicators

As a **user**,
I want to see if inflation is trending up or down (market heating/cooling),
So that I can anticipate whether to bid more aggressively or conservatively.

**Acceptance Criteria:**

**Given** inflation has been calculated over multiple picks
**When** the InflationTracker displays trend indicators
**Then** I see an arrow icon indicating trend: ↑ "Heating" (inflation increasing), ↓ "Cooling" (inflation decreasing), → "Stable"
**And** the trend is calculated by comparing inflation rate now vs. 10 picks ago
**And** "Heating" is indicated with red/orange color (market is getting more expensive)
**And** "Cooling" is indicated with blue color (market is deflating)
**And** "Stable" is indicated with gray (inflation change < ±2%)
**And** a tooltip explains: "Inflation has increased 3% in the last 10 picks"

### Story 8.5: Display Tier-Specific Inflation Breakdown

As a **user**,
I want to view inflation rates for each tier (Elite, Mid, Lower),
So that I can understand which player tiers are inflating faster.

**Acceptance Criteria:**

**Given** the inflation engine calculates tier-specific rates
**When** the InflationTracker renders tier breakdown (optional toggle or expandable section)
**Then** I see inflation for each tier: "Elite (T1): +8%", "Mid (T2): +15%", "Lower (T3): -2%"
**And** the tier with highest inflation is highlighted
**And** this data uses progressive disclosure (hidden by default, revealed on click/tap)
**And** a tooltip explains: "Mid-tier players are selling 15% above their projections"
**And** the breakdown updates after each inflation recalculation

### Story 8.6: Display Position-Specific Inflation Breakdown

As a **user**,
I want to view inflation rates for each position (C, 1B, 2B, SS, 3B, OF, SP, RP),
So that I understand position scarcity dynamics.

**Acceptance Criteria:**

**Given** the inflation engine calculates position-specific rates
**When** the InflationTracker renders position breakdown (optional toggle or expandable section)
**Then** I see inflation for each position: "C: +22%", "OF: +5%", "SP: +12%", "RP: -3%"
**And** positions are sorted by inflation rate (highest first)
**And** scarce positions (high inflation) are highlighted in red/orange
**And** this data uses progressive disclosure (expandable detail section)
**And** the breakdown updates in real-time

### Story 8.7: Implement Progressive Disclosure for Tier Details

As a **user**,
I want to tap/click to reveal detailed tier assignment rationale,
So that I can understand why a player is assigned to a specific tier.

**Acceptance Criteria:**

**Given** players have tier assignments in the PlayerQueue
**When** I click/tap on a player's tier badge
**Then** an inline detail panel expands showing tier criteria
**And** the panel explains: "Elite tier = top 10% by projected value (>$35)"
**And** the panel shows the player's tier assignment: "This player: $42 projected → Elite"
**And** the panel shows tier-specific inflation: "Elite tier inflating at +8%"
**And** clicking again or clicking elsewhere collapses the panel
**And** this follows UX requirements for progressive disclosure pattern

---

## Epic 9: Couch Managers Integration & Sync

Enable automatic draft data synchronization from Couch Managers draft rooms, eliminating manual data entry burden during high-pressure bidding moments.

### Story 9.1: Create Draft Sync Edge Function

As a **developer**,
I want to create a Supabase Edge Function to poll Couch Managers API,
So that draft data can be fetched server-side without exposing API keys.

**Acceptance Criteria:**

**Given** Couch Managers API credentials are configured
**When** I create `supabase/functions/sync-couch-managers/index.ts`
**Then** the function accepts parameters: `roomId`, `leagueId`
**And** the function calls Couch Managers API: `GET /api/draft-rooms/{roomId}/picks`
**And** the function returns drafted players with: player name, team, auction price, timestamp
**And** the function handles rate limiting and errors gracefully (NFR-I3: exponential backoff, max 3 retries)
**And** the function completes within 1 second (NFR-P3)
**And** API keys are stored as environment variables (NFR-S6: not exposed client-side)

### Story 9.2: Implement Connection to Couch Managers Draft Room

As a **user**,
I want to connect my league to a Couch Managers draft room via room ID,
So that draft data can be automatically synchronized.

**Acceptance Criteria:**

**Given** I am viewing my league detail page
**When** I click "Connect to Couch Managers" and enter the room ID
**Then** the room ID is validated and saved to the league record
**And** a test connection is made to verify the room ID is valid
**And** I see a success message: "Connected to room {roomId}"
**And** the connection status indicator shows "Connected" (green)
**And** an error message displays if the room ID is invalid
**And** the room ID is persisted in the `leagues` table

### Story 9.3: Implement Automatic API Polling

As a **developer**,
I want to set up automatic HTTP polling to fetch draft updates every 20 minutes,
So that users receive real-time draft data without manual refresh.

**Acceptance Criteria:**

**Given** a league is connected to a Couch Managers room
**When** the draft page is active
**Then** the system automatically calls the sync Edge Function every 20 minutes (NFR-I4: configurable 5-60 minutes)
**And** polling starts when the draft page loads
**And** polling stops when the user navigates away
**And** each poll fetches new picks since the last sync timestamp
**And** the polling interval is configurable via `league.sync_interval` (default: 20 minutes)
**And** the polling uses `setInterval` in a React effect with proper cleanup

### Story 9.4: Display Connection Status Indicators

As a **user**,
I want to view connection status indicators (connected, reconnecting, disconnected),
So that I know if the system is successfully syncing data.

**Acceptance Criteria:**

**Given** I am in a draft with Couch Managers sync enabled
**When** the draft page renders
**Then** I see a status badge in the header: "Connected" (green), "Reconnecting" (yellow), or "Disconnected" (red)
**And** "Connected" indicates successful API sync within the last polling interval
**And** "Reconnecting" indicates a failed sync attempt with automatic retry in progress
**And** "Disconnected" indicates multiple failed attempts (triggers Manual Sync Mode)
**And** hovering over the badge shows more details: "Last sync: 2 minutes ago"
**And** the status updates in real-time based on sync results

### Story 9.5: Display Last Successful Sync Timestamp

As a **user**,
I want to see when the last successful sync occurred,
So that I know how current my draft data is.

**Acceptance Criteria:**

**Given** draft data has been synced from Couch Managers
**When** I view the draft dashboard
**Then** I see a timestamp: "Last synced: 2 minutes ago"
**And** the timestamp is formatted using date-fns with relative time (2 minutes ago, 18 minutes ago)
**And** hovering shows the absolute timestamp: "Dec 12, 2025 3:42 PM"
**And** the timestamp updates every minute
**And** if sync lag exceeds 30 minutes, a warning is displayed (NFR-I5)

### Story 9.6: Implement Manual Reconnection Trigger

As a **user**,
I want to manually trigger a reconnection attempt when sync fails,
So that I can try to restore the connection without waiting for the next automatic poll.

**Acceptance Criteria:**

**Given** the connection status shows "Disconnected" or "Reconnecting"
**When** I click the "Retry Connection" button
**Then** an immediate sync attempt is triggered (bypasses polling interval)
**And** a loading indicator displays: "Reconnecting..."
**And** if successful, status updates to "Connected" and last sync timestamp updates
**And** if failed, an error message displays with retry guidance
**And** the button is only enabled when status is not "Connected"

### Story 9.7: Implement Catch-Up Sync After Connection Restore

As a **developer**,
I want to automatically fetch all missed picks when connection restores,
So that users don't lose draft data during temporary outages.

**Acceptance Criteria:**

**Given** the connection was lost and has now been restored
**When** the next sync succeeds
**Then** the system fetches all picks since the last successful sync timestamp
**And** all missed picks are processed and added to the drafted players list
**And** inflation is recalculated based on all newly synced picks
**And** the catch-up sync completes within 15 seconds (NFR-I6)
**And** the user sees a notification: "Synced 8 missed picks"
**And** the draft state is fully updated (no data loss per NFR-R4)

---

## Epic 10: Resilience & Manual Sync Fallback

Enable users to maintain draft functionality when API integrations fail through graceful degradation to Manual Sync Mode, preserving competitive advantage during technical issues.

### Story 10.1: Detect API Connection Failures

As a **developer**,
I want to detect when API connections fail and track failure count,
So that the system can gracefully degrade to Manual Sync Mode.

**Acceptance Criteria:**

**Given** automatic sync is enabled
**When** an API call to Couch Managers fails
**Then** the failure is logged with timestamp and error details
**And** a retry counter is incremented
**And** after 3 consecutive failures (NFR-I3), the system triggers Manual Sync Mode
**And** transient failures (network timeout) trigger automatic retry with exponential backoff
**And** persistent failures (invalid room ID) immediately trigger Manual Sync Mode
**And** failure detection completes within 5 seconds (NFR-R7)

### Story 10.2: Enable Manual Sync Mode

As a **user**,
I want to enable Manual Sync Mode when API sync fails,
So that I can manually enter auction prices to maintain inflation calculation accuracy.

**Acceptance Criteria:**

**Given** automatic sync has failed multiple times
**When** the system triggers Manual Sync Mode
**Then** a prominent notification displays: "API connection failed. Switched to Manual Sync Mode."
**And** the connection status badge shows "Manual Mode" (yellow)
**And** the PlayerQueue interface updates to show bid input fields for each player
**And** a "My Team" checkbox appears on each player row
**And** the transition to Manual Mode completes within 5 seconds (NFR-R7)
**And** a help link explains how to use Manual Sync Mode (FR51)

### Story 10.3: Implement Manual Bid Entry

As a **user**,
I want to manually input player auction prices when API connection fails,
So that I can continue tracking the draft.

**Acceptance Criteria:**

**Given** Manual Sync Mode is enabled
**When** I enter an auction price in the bid input field next to a player
**Then** the price is validated (positive number, <= remaining budget if "My Team" checked)
**And** pressing Enter or clicking "Save" records the bid
**And** the player is marked as drafted with the entered price
**And** the player row updates to show "Drafted" status
**And** inflation is recalculated using the manually entered price (NFR-R5: no accuracy degradation)
**And** the bid input field uses React Hook Form with validation

### Story 10.4: Implement "My Team" Checkbox

As a **user**,
I want to check a "My Team" checkbox when manually entering my own bids,
So that the system can track my roster and budget correctly.

**Acceptance Criteria:**

**Given** Manual Sync Mode is enabled and I am entering a bid for my own player
**When** I check the "My Team" checkbox and enter the auction price
**Then** the player is added to my roster
**And** my budget is reduced by the auction price
**And** the RosterPanel updates to show the new player
**And** position needs update if the player fills a required position
**And** unchecked boxes indicate other teams' picks (budget not affected)

### Story 10.5: Maintain Inflation Calculation Accuracy in Manual Mode

As a **developer**,
I want to ensure inflation calculations remain accurate when using manually entered data,
So that Manual Sync Mode provides equivalent functionality to automatic sync.

**Acceptance Criteria:**

**Given** Manual Sync Mode is active and users are manually entering bids
**When** a new bid is recorded manually
**Then** the inflation engine recalculates using the manually entered price
**And** adjusted values update identically to automatic sync (NFR-R5: no degradation)
**And** all inflation metrics (overall, position, tier) are calculated correctly
**And** the calculation completes in <2 seconds (NFR-P1)
**And** comprehensive tests validate manual mode accuracy equals automatic mode accuracy

### Story 10.6: Display Clear Error Messages

As a **user**,
I want to view clear error messages explaining connection status and recovery options,
So that I understand what happened and how to proceed.

**Acceptance Criteria:**

**Given** an API connection failure has occurred
**When** the error is displayed to the user
**Then** the message clearly explains the issue: "Unable to connect to Couch Managers API. Please check your internet connection."
**And** the message provides recovery options: "1. Retry connection 2. Switch to Manual Sync Mode"
**And** the message uses plain language (avoid technical jargon)
**And** the message is dismissible but reappears if the issue persists
**And** different error types have tailored messages (network timeout vs. invalid room ID vs. rate limiting)

### Story 10.7: Preserve Draft State During Connection Failures

As a **developer**,
I want to preserve all draft state (roster, budget, inflation data) during connection failures,
So that users experience zero data loss.

**Acceptance Criteria:**

**Given** the draft is in progress and an API failure occurs
**When** the connection fails
**Then** all draft state is preserved in Zustand persist middleware (localStorage)
**And** the state includes: roster, budget remaining, drafted players, inflation metrics, last sync timestamp
**And** if the user refreshes the page, all state is restored from localStorage
**And** state is never lost regardless of failure type (NFR-R4: zero data loss)
**And** recovery from localStorage completes in <1 second

### Story 10.8: Implement Graceful Degradation Pattern

As a **developer**,
I want to implement graceful degradation when API connections fail,
So that the user experience remains functional.

**Acceptance Criteria:**

**Given** an API integration (Couch Managers, Fangraphs, or Google Sheets) fails
**When** the failure is detected
**Then** the system does NOT cause complete application failure (NFR-I2)
**And** core functionality remains available (inflation calculation, player queue, roster tracking)
**And** the user can complete the draft using Manual Sync Mode
**And** automatic retry attempts continue in the background (auto-reconnect within 30 seconds per NFR-R6)
**And** when connection restores, the system seamlessly switches back to automatic sync

---

## Epic 11: User Onboarding & Discovery

Enable new users to discover product value and understand core features through landing page and onboarding flow.

### Story 11.1: Create Landing Page Component

As a **developer**,
I want to create the LandingPage component structure,
So that the marketing page foundation is established.

**Acceptance Criteria:**

**Given** the project structure is set up
**When** I create `src/features/landing/components/LandingPage.tsx`
**Then** the component renders sections: Hero, Features Grid, How It Works, CTA
**And** the component uses dark slate theme with emerald accents per UX design
**And** the component includes animated background patterns (subtle, non-distracting)
**And** the component is fully responsive (mobile-first design)
**And** the component follows the 3-column feature grid layout (6 features total) per UX spec

### Story 11.2: Implement Hero Section

As a **user**,
I want to see a compelling hero section explaining the product value proposition,
So that I understand what the product does and why I should use it.

**Acceptance Criteria:**

**Given** I land on the homepage
**When** the hero section renders
**Then** I see a headline: "Real-Time Inflation Intelligence for Fantasy Baseball Auction Drafts"
**And** I see a subheadline explaining the value: "Stop guessing. Start winning with tier-specific, position-aware inflation tracking."
**And** I see a prominent CTA button: "Get Started" (gradient emerald button per UX)
**And** I see a secondary CTA: "View Demo"
**And** the hero uses animated gradient background per UX design
**And** the section is mobile-responsive with vertical stacking on small screens

### Story 11.3: Implement Feature Showcase Grid

As a **user**,
I want to view a grid showcasing the key features with icons and descriptions,
So that I understand the competitive advantages of the product.

**Acceptance Criteria:**

**Given** I scroll to the features section
**When** the features grid renders
**Then** I see 6 feature cards in a 3-column grid (responsive to 2-column on tablet, 1-column on mobile)
**And** each card includes: Lucide icon, feature title, 2-3 sentence description
**And** the 6 features are: "Real-Time Inflation Tracking", "Tier-Specific Modeling", "Position Scarcity Analysis", "Automatic Couch Managers Sync", "Mobile-Desktop Parity", "Manual Sync Fallback"
**And** cards use subtle hover effects (gradient transitions per UX)
**And** cards use dark slate backgrounds with emerald accents

### Story 11.4: Implement "How It Works" Section

As a **user**,
I want to understand the workflow in 4 simple steps,
So that I know how to use the product.

**Acceptance Criteria:**

**Given** I scroll to the "How It Works" section
**When** the section renders
**Then** I see a 4-step workflow with numbered steps
**And** Step 1: "Create your league and import projections"
**And** Step 2: "Connect to Couch Managers draft room"
**And** Step 3: "Monitor inflation-adjusted values in real-time"
**And** Step 4: "Dominate your draft with competitive intelligence"
**And** each step includes an icon and brief explanation
**And** the section uses a horizontal timeline layout (vertical on mobile)

### Story 11.5: Implement Call-to-Action Buttons

As a **user**,
I want prominent CTA buttons that guide me to sign up or view a demo,
So that I can take the next step.

**Acceptance Criteria:**

**Given** I am viewing the landing page
**When** CTA buttons render in the hero and footer
**Then** I see a primary CTA: "Get Started" (links to `/signup`)
**And** I see a secondary CTA: "View Demo" (links to demo video or screenshot gallery)
**And** buttons use gradient styling per UX design (emerald-to-green gradient)
**And** buttons have hover effects (scale, shadow transitions)
**And** buttons are accessible (keyboard navigable, proper ARIA labels)
**And** clicking "Get Started" navigates to registration page

### Story 11.6: Create Basic Onboarding Flow

As a **user**,
I want to access basic onboarding explaining core features before my first draft,
So that I understand how to use the key functionality.

**Acceptance Criteria:**

**Given** I have just created an account
**When** I log in for the first time
**Then** a welcome modal appears: "Welcome to Auction Projections!"
**And** the modal explains 3 core features: "1. Inflation Tracking 2. Adjusted Values 3. Tier Assignments"
**And** the modal includes a simple diagram or screenshot for each feature
**And** I can dismiss the modal with "Skip" or proceed with "Next"
**And** I can re-access onboarding from the help menu anytime
**And** the modal uses shadcn/ui Dialog component

---

## Epic 12: Post-Draft Analytics & Value Summary

Enable users to review their draft performance with value analysis showing steals captured and competitive advantage gained, reinforcing success and creating sharing motivation.

### Story 12.1: Create Post-Draft Summary Component

As a **developer**,
I want to create the DraftSummary component,
So that post-draft analytics can be displayed.

**Acceptance Criteria:**

**Given** a draft has been completed
**When** I create `src/features/draft/components/DraftSummary.tsx`
**Then** the component accepts props: `roster`, `budget`, `projections`, `inflationData`
**And** the component renders sections: Roster Overview, Budget Utilization, Value Analysis
**And** the component uses dark slate theme with emerald/green highlights for steals
**And** the component is accessible via `/leagues/{leagueId}/draft/summary`

### Story 12.2: Display Complete Roster Organized by Position

As a **user**,
I want to view my complete drafted roster organized by position,
So that I can review all the players I acquired.

**Acceptance Criteria:**

**Given** my draft is complete
**When** I view the post-draft summary
**Then** I see my full roster grouped by position: Hitters, Pitchers, Bench
**And** each player entry shows: name, position(s), auction price, projected stats
**And** the roster is formatted as a clean table or card list
**And** totals are shown for each position group

### Story 12.3: Display Total Spending and Budget Utilization

As a **user**,
I want to see my total spending and how I utilized my budget,
So that I understand my resource allocation.

**Acceptance Criteria:**

**Given** my draft is complete
**When** the budget utilization section renders
**Then** I see total spent: "$260 of $260 budget used (100%)"
**And** I see budget remaining: "$0 remaining"
**And** I see spending breakdown by position: "Hitters: $145 (56%) | Pitchers: $95 (36%) | Bench: $20 (8%)"
**And** a visual chart (bar or pie chart) shows the spending distribution
**And** the section highlights if I left money on the table (underspent)

### Story 12.4: Highlight Steals with Visual Comparison

As a **user**,
I want to view value analysis highlighting which players were steals,
So that I can celebrate my successful value captures.

**Acceptance Criteria:**

**Given** my draft is complete and I acquired players below their adjusted values
**When** the value analysis section renders
**Then** I see a "Steals" subsection with a list of favorable acquisitions
**And** each steal shows: player name, auction price, adjusted value, value gained (e.g., "$5 below value")
**And** steals are highlighted with emerald/green backgrounds per UX requirements
**And** a visual comparison shows drafted price vs. adjusted value side-by-side
**And** the section displays total value gained: "You saved $42 compared to adjusted values!"

### Story 12.5: Show Competitive Advantage Summary

As a **user**,
I want to see a summary of my competitive advantage gained,
So that I feel accomplished and motivated to share the product.

**Acceptance Criteria:**

**Given** the value analysis is complete
**When** the summary section renders
**Then** I see a headline: "You outperformed the market by $42!"
**And** I see key metrics: "Steals: 8 players | Overpays: 2 players | Net value: +$42"
**And** I see a share button: "Share your results" (pre-filled social media post)
**And** the section reinforces the emotional goal: accomplishment → advocacy (per UX design)
**And** the display creates the "you have to try this" sharing motivation

---

## Epic 13: Admin Operations & Monitoring

Enable administrators to monitor system health, track active drafts, view API integration status, and respond to incidents during peak draft season.

### Story 13.1: Create Admin Dashboard Route

As a **developer**,
I want to create a protected admin-only route for the monitoring dashboard,
So that only authorized administrators can access monitoring tools.

**Acceptance Criteria:**

**Given** React Router is configured
**When** I create `/admin/dashboard` route
**Then** the route is protected with role-based access control (NFR-S8)
**And** only users with `role: 'admin'` in the `users` table can access the route
**And** unauthorized users are redirected to the home page with an error message
**And** the route uses a `<ProtectedAdminRoute>` wrapper component
**And** the admin role check queries Supabase: `supabase.from('users').select('role').eq('id', userId).single()`

### Story 13.2: Display Active Drafts List

As an **admin user**,
I want to view a list of all active drafts with status indicators,
So that I can monitor ongoing draft activity.

**Acceptance Criteria:**

**Given** I am logged in as an admin
**When** I view the admin dashboard
**Then** I see a table of active drafts with columns: League Name, User, Start Time, Status, Last Sync, Player Count
**And** "Active" drafts are those with `status: 'in_progress'` or recent activity (last sync < 2 hours ago)
**And** status indicators show: "Active" (green), "Stalled" (yellow, no sync in 30+ minutes), "Complete" (gray)
**And** I can click on a draft to view detailed logs
**And** the list auto-refreshes every 30 seconds

### Story 13.3: Monitor API Health for Integrations

As an **admin user**,
I want to monitor API health for Couch Managers, Fangraphs, and Google Sheets integrations,
So that I can identify integration issues quickly.

**Acceptance Criteria:**

**Given** I am viewing the admin dashboard
**When** the API health section renders
**Then** I see status indicators for each integration: Couch Managers, Fangraphs, Google Sheets
**And** each indicator shows: "Healthy" (green), "Degraded" (yellow), "Down" (red)
**And** health checks run every 5 minutes via Edge Function
**And** clicking on an integration shows detailed metrics: response times, error rates, last successful call
**And** historical uptime percentage is displayed (last 24 hours, last 7 days)

### Story 13.4: View Error Rates with Automated Alerts

As an **admin user**,
I want to view error rates and receive automated alerts when thresholds are exceeded,
So that I can respond to incidents proactively.

**Acceptance Criteria:**

**Given** API calls are being logged with success/failure status
**When** the error rate section renders
**Then** I see error rate percentages for each integration (Couch Managers, Fangraphs, Google Sheets)
**And** error rates are calculated as: (failed calls / total calls) * 100 over a 15-minute window
**And** if error rate exceeds 5%, an alert badge appears (NFR-M2)
**And** alerts are color-coded: >5% (yellow warning), >15% (red critical)
**And** clicking an alert shows affected users and error details
**And** alerts can trigger email/Slack notifications (optional configuration)

### Story 13.5: View Connection Success Metrics

As an **admin user**,
I want to view connection success metrics and historical reliability trends,
So that I can assess overall system stability.

**Acceptance Criteria:**

**Given** historical API call data is logged
**When** the connection metrics section renders
**Then** I see success rate percentages for each integration (target: >95% per NFR-I1)
**And** I see a line chart showing success rate trends over time (last 24 hours, last 7 days, last 30 days)
**And** I can filter by time period (1 hour, 1 day, 1 week, 1 month)
**And** I can drill down into specific time windows to see details
**And** metrics are refreshed every 5 minutes

### Story 13.6: View Projection Sync Logs

As an **admin user**,
I want to view projection sync logs showing successful and failed daily updates,
So that I can ensure Fangraphs data is staying current.

**Acceptance Criteria:**

**Given** the daily Fangraphs sync job runs at 2 AM daily
**When** the projection sync logs section renders
**Then** I see a log of all sync attempts with: Date, Status (Success/Failure), League Count, Duration, Error (if failed)
**And** successful syncs show player count updated: "Updated 2,000 projections across 15 leagues"
**And** failed syncs show error details and affected leagues
**And** I can filter logs by date range and status
**And** logs are paginated (50 entries per page)

### Story 13.7: Broadcast In-App Notifications

As an **admin user**,
I want to broadcast in-app notifications to users during incidents,
So that I can communicate outages or degraded service.

**Acceptance Criteria:**

**Given** I need to notify users of an API outage
**When** I use the broadcast notification tool
**Then** I can compose a message: "Couch Managers API is currently unavailable. Please use Manual Sync Mode."
**And** I can select notification type: "Info" (blue), "Warning" (yellow), "Critical" (red)
**And** I can target: "All users", "Active draft users only", or "Specific league"
**And** clicking "Send" displays the notification as a banner at the top of the app for all targeted users
**And** notifications persist until dismissed or for a set duration (configurable)

### Story 13.8: Track Draft Completion Rates

As an **admin user**,
I want to track draft completion rates to ensure no data loss,
So that I can assess product reliability and user satisfaction.

**Acceptance Criteria:**

**Given** draft completion data is tracked
**When** the draft completion metrics section renders
**Then** I see the completion rate: "Draft completion rate: 87% (target: >80%)" per NFR-R3
**And** completion is defined as: user started a draft and reached the "Draft Complete" state
**And** I see abandonment reasons (if tracked): "API failures: 8% | User navigation: 5%"
**And** I can filter by date range to see trends over time
**And** low completion rates (<80%) trigger a warning alert

### Story 13.9: View Detailed Incident Logs

As an **admin user**,
I want to view detailed incident logs with failures, affected users, recovery actions, and resolution times,
So that I can conduct post-mortems and improve reliability.

**Acceptance Criteria:**

**Given** incidents are logged when errors occur
**When** I view the incident logs section
**Then** I see a table of all incidents with: Timestamp, Type (API failure, database error, etc.), Affected Users, Duration, Recovery Action, Resolution Time
**And** I can click on an incident to view full details and error stack traces
**And** incidents are categorized by severity: "Low", "Medium", "High", "Critical"
**And** I can export incident logs to CSV for analysis
**And** resolved incidents show resolution notes: "Cause: Couch Managers API timeout. Recovery: Auto-switched to Manual Sync Mode."

### Story 13.10: Drill Down into Error Logs

As an **admin user**,
I want to drill down into error logs for specific connection failures,
So that I can troubleshoot and diagnose issues.

**Acceptance Criteria:**

**Given** errors are logged with detailed context
**When** I click on a specific error in the logs
**Then** I see full error details: Timestamp, User ID, League ID, API endpoint, Request payload, Response status, Error message, Stack trace
**And** I can filter logs by: User, League, API endpoint, Time range, Error type
**And** I can search logs by keyword or error code
**And** logs are paginated and sortable
**And** I can export filtered logs to JSON for external analysis

### Story 13.11: View Inflation Calculation Performance Metrics

As an **admin user**,
I want to view inflation calculation performance metrics (median, p95, p99 latency),
So that I can detect algorithm degradation and ensure <2 second recalculations.

**Acceptance Criteria:**

**Given** inflation calculation latency is tracked
**When** the performance metrics section renders
**Then** I see latency metrics: "Median: 750ms | P95: 1.5s | P99: 1.8s (target: <2s)" per NFR-P1, NFR-M4
**And** I see a histogram showing latency distribution over the last 24 hours
**And** metrics exceeding 2 seconds trigger a performance warning
**And** I can filter by time period to see trends
**And** I can see worst-performing leagues (largest player pools or complex inflation scenarios)

---

## Document Complete

**Total Epics:** 13
**Total Stories:** 107

All stories are implementation-ready with:
- Clear user stories (As a.../I want.../So that...)
- Specific Given/When/Then acceptance criteria
- Technical implementation notes and Architecture alignment
- Appropriate scope for single dev agent completion
- No forward dependencies within epics
- Complete coverage of all 69 FRs + NFRs + Architecture/UX requirements

This epic breakdown is ready for development execution.
