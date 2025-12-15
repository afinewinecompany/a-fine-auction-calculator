---
stepsCompleted: [1, 2]
inputDocuments:
  - 'c:\Users\lilra\myprojects\ProjectionCalculator\docs\prd.md'
  - 'c:\Users\lilra\myprojects\ProjectionCalculator\docs\architecture.md'
  - 'c:\Users\lilra\myprojects\ProjectionCalculator\docs\ux-design-specification.md'
---

# Auction Projections by A Fine Wine Company - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Auction Projections by A Fine Wine Company, decomposing the requirements from the PRD, UX Design, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

**User Account & Authentication**
- FR1: Users can create accounts using email and password
- FR2: Users can authenticate using Google OAuth
- FR3: Users can manage their profile information (username, profile picture)
- FR4: Users can maintain authenticated sessions across multiple drafts
- FR5: Users can log out from their account

**League Configuration & Management**
- FR6: Users can create new fantasy baseball league configurations
- FR7: Users can save multiple league configurations for different drafts
- FR8: Users can edit league settings (team count, budget, roster spots, scoring type)
- FR9: Users can access saved leagues via direct links for one-click entry
- FR10: Users can resume drafts in progress from saved leagues
- FR11: Users can delete leagues they no longer need

**Projection Data Management**
- FR12: Users can import player projections from Google Sheets via API integration
- FR13: Users can select projection systems from Fangraphs (Steamer, BatX, JA)
- FR14: System can automatically sync Fangraphs projection data daily
- FR15: Users can export projection data for offline analysis
- FR16: Users can view projection source and last updated timestamp

**Live Draft Synchronization**
- FR17: Users can connect to Couch Managers draft rooms via room ID
- FR18: System can automatically poll Couch Managers API for draft updates (20-minute intervals)
- FR19: Users can view connection status indicators (connected, reconnecting, disconnected)
- FR20: Users can view last successful sync timestamp
- FR21: Users can manually trigger reconnection attempts when connection fails
- FR22: System can automatically catch up on missed picks when connection restores

**Inflation Calculation & Value Tracking**
- FR23: System can calculate real-time inflation based on actual vs. projected player spending
- FR24: System can track position-specific inflation rates independently
- FR25: System can track tier-specific inflation rates (Elite, Mid, Lower tiers)
- FR26: System can model budget depletion effects on late-draft valuations
- FR27: Users can view dynamically adjusted player values reflecting current market inflation
- FR28: Users can view variance tracking showing overpays and steals for drafted players
- FR29: Users can view current inflation rate percentage
- FR30: Users can view inflation trend indicators (market heating/cooling)
- FR31: Users can view tier assignments for players to understand inflation modeling
- FR32: System can recalculate inflation values in under 2 seconds after each pick

**Draft Management & Roster Building**
- FR33: Users can track remaining auction budget in real-time
- FR34: Users can view money spent breakdown across roster positions
- FR35: Users can view spending pace compared to target budget allocation
- FR36: Users can view roster composition by position (hitters, pitchers, bench)
- FR37: Users can view filled vs. remaining roster slots
- FR38: Users can view position needs summary ("Still Needed")
- FR39: Users can view their current roster organized by position and price paid
- FR40: Users can track draft progress (players drafted, players remaining)

**Player Information & Discovery**
- FR41: Users can search for players by name in the player queue
- FR42: Users can sort players by various attributes (projected value, adjusted value, position, team)
- FR43: Users can view detailed player information (projected stats, positions, team)
- FR44: Users can view player draft status (available, drafted by team, drafted by me)
- FR45: Users can filter players by draft status
- FR46: Users can view player tier assignments in the player queue

**Failure Recovery & Resilience**
- FR47: Users can enable Manual Sync Mode to manually enter auction prices
- FR48: Users can manually input player auction prices when API connection fails
- FR49: System can maintain inflation calculation accuracy using manually entered data
- FR50: Users can view clear error messages explaining connection status and recovery options
- FR51: Users can access Manual Sync Mode documentation during connection issues
- FR52: System can preserve draft state (roster, budget, inflation data) during connection failures
- FR53: System can gracefully degrade functionality when API connections fail

**Admin Operations & Monitoring**
- FR54: Admin users can view real-time monitoring dashboard
- FR55: Admin users can view list of active drafts with status indicators
- FR56: Admin users can monitor API health for Couch Managers, Fangraphs, and Google Sheets
- FR57: Admin users can view error rates with automated alert thresholds
- FR58: Admin users can view connection success metrics and historical reliability trends
- FR59: Admin users can view projection sync logs showing successful/failed daily updates
- FR60: Admin users can broadcast in-app notifications to users during incidents
- FR61: Admin users can access user support channel for draft emergencies
- FR62: Admin users can view incident logs (failures, affected users, recovery actions, resolution times)
- FR63: Admin users can drill down into error logs for specific connection failures
- FR64: Admin users can track draft completion rates to ensure no data loss

**User Experience & Discovery**
- FR65: Users can view landing page with feature showcase and product information
- FR66: Users can access basic onboarding explaining core features
- FR67: Users can view post-draft summary showing roster, spending, and value analysis
- FR68: Users can access the application on mobile devices with responsive design
- FR69: Users can view all interfaces in dark-themed UI optimized for draft focus

### NonFunctional Requirements

**Performance**
- NFR-P1: Inflation recalculation must complete within 2 seconds of receiving draft update data
- NFR-P2: Initial page load must complete within 3 seconds on broadband connections (desktop and mobile)
- NFR-P3: API polling responses must complete within 1 second for Couch Managers data fetch
- NFR-P4: Google Sheets projection import must complete within 5 seconds
- NFR-P5: Fangraphs daily sync must complete within 10 seconds
- NFR-P6: Player queue scrolling and filtering must maintain 60fps frame rate
- NFR-P7: Roster and budget UI updates must appear instantaneous (<100ms) to users
- NFR-P8: Inflation recalculation must not block user interface interactions
- NFR-P9: Mobile devices must achieve identical calculation performance (<2 seconds) as desktop
- NFR-P10: JavaScript bundle size must remain under 500KB gzipped to optimize mobile load times
- NFR-P11: System performance must not degrade by more than 20% during peak draft season usage

**Reliability & Availability**
- NFR-R1: System must maintain >99% availability during peak draft season (February-March)
- NFR-R2: Scheduled maintenance windows must not occur during peak draft hours (6 PM - 11 PM EST weekdays, all day weekends)
- NFR-R3: System must achieve >80% draft completion rate (users who start a draft complete it without abandonment due to technical issues)
- NFR-R4: Draft state (roster, budget, inflation data) must be preserved across all failure scenarios with zero data loss
- NFR-R5: Manual Sync Mode must maintain calculation accuracy equivalent to automated sync (no data corruption)
- NFR-R6: Automatic reconnection logic must restore connectivity within 30 seconds for transient API failures
- NFR-R7: System must support graceful degradation when external APIs fail (Manual Sync Mode available within 5 seconds)

**Integration**
- NFR-I1: System must achieve >95% successful API connection rate across Couch Managers, Fangraphs, and Google Sheets APIs
- NFR-I2: API integration failures must not cause complete system failure (graceful degradation required)
- NFR-I3: System must support automatic retry logic with exponential backoff for transient API failures (max 3 retries)
- NFR-I4: Couch Managers polling interval must be configurable (default: 20 minutes, range: 5-60 minutes)
- NFR-I5: System must detect and report data sync lag when last successful sync exceeds 30 minutes
- NFR-I6: Catch-up sync after connection restore must process all missed picks within 15 seconds
- NFR-I7: Google Sheets OAuth integration must support standard Google authentication flow without requiring custom permissions
- NFR-I8: Fangraphs API integration must support multiple projection systems (Steamer, BatX, JA) with consistent data formats

**Security**
- NFR-S1: User authentication must support OAuth 2.0 standard (Google OAuth)
- NFR-S2: User sessions must expire after 30 days of inactivity
- NFR-S3: Password-based authentication must require minimum 8 characters with complexity requirements (if implemented)
- NFR-S4: All data transmission between client and server must use HTTPS/TLS encryption
- NFR-S5: User credentials must be hashed using industry-standard algorithms (bcrypt, Argon2, or equivalent)
- NFR-S6: API keys and secrets must never be exposed in client-side code
- NFR-S7: User league data must be accessible only to the authenticated league owner
- NFR-S8: Admin dashboard must enforce role-based access control (admin-only functionality)

**Browser Compatibility**
- NFR-B1: Application must function correctly on last 2 versions of Chrome, Firefox, Safari, and Edge (evergreen browsers)
- NFR-B2: Mobile browsers (iOS Safari, Chrome Mobile) must be supported with feature parity to desktop
- NFR-B3: Internet Explorer and legacy Edge are explicitly unsupported
- NFR-B4: Visual rendering must be consistent across supported browsers (no layout breaks or visual regressions)
- NFR-B5: JavaScript functionality must behave identically across supported browsers

**Monitoring & Observability**
- NFR-M1: Admin dashboard must provide real-time visibility into active drafts, API health, and error rates
- NFR-M2: Error rate alerts must trigger when threshold exceeds 5% within any 15-minute window
- NFR-M3: System must log all API failures with sufficient detail for troubleshooting (timestamp, error code, affected user, recovery action)
- NFR-M4: System must track and report inflation calculation performance metrics (median, p95, p99 latency)
- NFR-M5: Admin dashboard must display real-time calculation performance to detect algorithm degradation

### Additional Requirements

**Architecture-Specific Requirements:**
- Project must be initialized using Vite + React TypeScript template with shadcn/ui CLI
- State management must use Zustand v5.0.9 with persist middleware for draft state recovery
- Client-side routing must use React Router v7.10.1 with protected routes for admin dashboard
- Form handling must use React Hook Form v7.68.0 integrated with shadcn/ui components
- HTTP client must use native Fetch API with retry wrapper (exponential backoff, max 3 retries)
- Date/time handling must use date-fns v4.1.0 with time zone support
- Backend platform must use Supabase with PostgreSQL database, Edge Functions, and Auth
- Frontend must be hosted on Vercel with automatic preview deployments
- Testing framework must use Vitest v4.0.15 + React Testing Library with Browser Mode
- All code must follow feature-based organization in `src/features/{feature}/` with co-located tests
- Database naming must use snake_case (tables, columns), API URLs must use kebab-case, TypeScript must use PascalCase components and camelCase functions
- API error handling must use exponential backoff retry with standard error format `{ error, code, details }`
- Bundle size must stay under 500KB gzipped with Vite code splitting and tree-shaking
- Inflation engine must achieve >90% test coverage, components >70% coverage

**UX-Specific Requirements:**
- All interfaces must use dark slate theme (slate-950, slate-900, slate-800) with emerald accents for positive indicators
- Adjusted player values must be displayed prominently (text-xl, font-bold, emerald-400 color) as visual anchor
- Color-coded value indicators must use emerald/green for steals, yellow for fair value, orange/red for overpays
- Player queue must support 3-second glanceable value scan during active bidding
- Mobile and desktop must have identical feature parity (no "mobile lite" version)
- All touch targets must meet 44px minimum size on mobile
- All animations must complete in <200ms (perceived as instant)
- Progressive disclosure pattern for tier assignments and inflation rate details (expandable player rows)
- Status indicators must show last sync timestamp and connection state (connected/reconnecting/disconnected)
- Manual Sync Mode must provide simple fallback with inline bid entry + "My Team" checkbox
- Post-draft summary must highlight steals captured with visual comparison (drafted price vs adjusted value)

### FR Coverage Map

**User Account & Authentication:**
- FR1 → Epic 2: Create accounts using email and password
- FR2 → Epic 2: Authenticate using Google OAuth
- FR3 → Epic 2: Manage profile information (username, profile picture)
- FR4 → Epic 2: Maintain authenticated sessions across multiple drafts
- FR5 → Epic 2: Log out from account

**League Configuration & Management:**
- FR6 → Epic 3: Create new fantasy baseball league configurations
- FR7 → Epic 3: Save multiple league configurations for different drafts
- FR8 → Epic 3: Edit league settings (team count, budget, roster spots, scoring type)
- FR9 → Epic 3: Access saved leagues via direct links for one-click entry
- FR10 → Epic 3: Resume drafts in progress from saved leagues
- FR11 → Epic 3: Delete leagues no longer needed

**Projection Data Management:**
- FR12 → Epic 4: Import player projections from Google Sheets via API integration
- FR13 → Epic 4: Select projection systems from Fangraphs (Steamer, BatX, JA)
- FR14 → Epic 4: Automatically sync Fangraphs projection data daily
- FR15 → Epic 4: Export projection data for offline analysis
- FR16 → Epic 4: View projection source and last updated timestamp

**Live Draft Synchronization:**
- FR17 → Epic 9: Connect to Couch Managers draft rooms via room ID
- FR18 → Epic 9: Automatically poll Couch Managers API for draft updates (20-minute intervals)
- FR19 → Epic 9: View connection status indicators (connected, reconnecting, disconnected)
- FR20 → Epic 9: View last successful sync timestamp
- FR21 → Epic 9: Manually trigger reconnection attempts when connection fails
- FR22 → Epic 9: Automatically catch up on missed picks when connection restores

**Inflation Calculation & Value Tracking:**
- FR23 → Epic 5: Calculate real-time inflation based on actual vs. projected player spending
- FR24 → Epic 5: Track position-specific inflation rates independently
- FR25 → Epic 5: Track tier-specific inflation rates (Elite, Mid, Lower tiers)
- FR26 → Epic 5: Model budget depletion effects on late-draft valuations
- FR27 → Epic 5: View dynamically adjusted player values reflecting current market inflation
- FR28 → Epic 8: View variance tracking showing overpays and steals for drafted players
- FR29 → Epic 8: View current inflation rate percentage
- FR30 → Epic 8: View inflation trend indicators (market heating/cooling)
- FR31 → Epic 8: View tier assignments for players to understand inflation modeling
- FR32 → Epic 5: Recalculate inflation values in under 2 seconds after each pick

**Draft Management & Roster Building:**
- FR33 → Epic 7: Track remaining auction budget in real-time
- FR34 → Epic 7: View money spent breakdown across roster positions
- FR35 → Epic 7: View spending pace compared to target budget allocation
- FR36 → Epic 7: View roster composition by position (hitters, pitchers, bench)
- FR37 → Epic 7: View filled vs. remaining roster slots
- FR38 → Epic 7: View position needs summary ("Still Needed")
- FR39 → Epic 7: View current roster organized by position and price paid
- FR40 → Epic 7: Track draft progress (players drafted, players remaining)

**Player Information & Discovery:**
- FR41 → Epic 6: Search for players by name in the player queue
- FR42 → Epic 6: Sort players by various attributes (projected value, adjusted value, position, team)
- FR43 → Epic 6: View detailed player information (projected stats, positions, team)
- FR44 → Epic 6: View player draft status (available, drafted by team, drafted by me)
- FR45 → Epic 6: Filter players by draft status
- FR46 → Epic 6: View player tier assignments in the player queue

**Failure Recovery & Resilience:**
- FR47 → Epic 10: Enable Manual Sync Mode to manually enter auction prices
- FR48 → Epic 10: Manually input player auction prices when API connection fails
- FR49 → Epic 10: Maintain inflation calculation accuracy using manually entered data
- FR50 → Epic 10: View clear error messages explaining connection status and recovery options
- FR51 → Epic 10: Access Manual Sync Mode documentation during connection issues
- FR52 → Epic 10: Preserve draft state (roster, budget, inflation data) during connection failures
- FR53 → Epic 10: Gracefully degrade functionality when API connections fail

**Admin Operations & Monitoring:**
- FR54 → Epic 13: View real-time monitoring dashboard
- FR55 → Epic 13: View list of active drafts with status indicators
- FR56 → Epic 13: Monitor API health for Couch Managers, Fangraphs, and Google Sheets
- FR57 → Epic 13: View error rates with automated alert thresholds
- FR58 → Epic 13: View connection success metrics and historical reliability trends
- FR59 → Epic 13: View projection sync logs showing successful/failed daily updates
- FR60 → Epic 13: Broadcast in-app notifications to users during incidents
- FR61 → Epic 13: Access user support channel for draft emergencies
- FR62 → Epic 13: View incident logs (failures, affected users, recovery actions, resolution times)
- FR63 → Epic 13: Drill down into error logs for specific connection failures
- FR64 → Epic 13: Track draft completion rates to ensure no data loss

**User Experience & Discovery:**
- FR65 → Epic 11: View landing page with feature showcase and product information
- FR66 → Epic 11: Access basic onboarding explaining core features
- FR67 → Epic 12: View post-draft summary showing roster, spending, and value analysis
- FR68 → Epic 6: Access application on mobile devices with responsive design
- FR69 → Epic 6: View all interfaces in dark-themed UI optimized for draft focus

## Epic List

### Epic 1: Project Foundation & Setup

Enable the development team to initialize the project with the correct technology stack and foundational infrastructure.

**User Outcome:** Development environment is ready for feature implementation with proper tooling, authentication scaffolding, and deployment pipeline.

**FRs covered:** Architecture requirements (Vite + React + TypeScript setup, shadcn/ui initialization, Supabase project configuration, Vercel deployment, Vitest testing framework, feature-based project structure)

**Implementation Notes:** This is the starter template setup specified in the Architecture document. Creates the technical foundation that all other epics build upon. Includes initial project scaffolding, dependency installation, configuration files, and deployment pipeline setup.

---

### Epic 2: User Authentication & Profile Management

Enable users to create accounts, authenticate securely, and manage their profiles.

**User Outcome:** Users can register, log in with email/password or Google OAuth, manage their profile information (username, profile picture), and maintain secure sessions across multiple drafts.

**FRs covered:** FR1, FR2, FR3, FR4, FR5

**Implementation Notes:** Complete authentication system using Supabase Auth with OAuth 2.0 support. Standalone epic - no dependencies on other features. Implements protected routes using React Router. Addresses NFR-S1, NFR-S2, NFR-S3, NFR-S4, NFR-S5.

---

### Epic 3: League Configuration & Management

Enable users to create, save, and manage multiple league configurations for different drafts.

**User Outcome:** Users can set up fantasy baseball leagues with custom settings (team count, budget, roster spots, scoring type), save multiple leagues for different drafts, access saved leagues via direct links for one-click entry, resume drafts in progress, and delete leagues they no longer need.

**FRs covered:** FR6, FR7, FR8, FR9, FR10, FR11

**Implementation Notes:** Requires authentication from Epic 2. Delivers complete league management capability. Implements league persistence using Supabase PostgreSQL with user-specific data access (NFR-S7). Includes league validation utilities and forms using React Hook Form.

---

### Epic 4: Projection Data Management

Enable users to import, manage, and view player projection data from multiple sources.

**User Outcome:** Users can import projections from Google Sheets via OAuth integration, select Fangraphs projection systems (Steamer, BatX, JA), view automatic daily sync of projection data, export data for offline analysis, and see projection source with last updated timestamps.

**FRs covered:** FR12, FR13, FR14, FR15, FR16

**Implementation Notes:** Requires leagues from Epic 3. Establishes the projection data foundation for the inflation engine. Implements Google Sheets OAuth flow (NFR-I7), Fangraphs API integration with daily scheduled sync (NFR-I8), and Supabase Edge Functions for API proxying (NFR-S6). Addresses NFR-P4, NFR-P5.

---

### Epic 5: Core Inflation Engine

Enable the system to calculate real-time, tier-specific, position-aware inflation adjustments for all players.

**User Outcome:** System automatically recalculates inflation based on actual vs. projected spending, tracks position-specific and tier-specific inflation rates independently, models budget depletion effects on late-draft valuations, displays dynamically adjusted player values reflecting current market inflation, and completes all calculations in under 2 seconds.

**FRs covered:** FR23, FR24, FR25, FR26, FR27, FR32

**Implementation Notes:** This is the core algorithmic innovation implementing the "Tiered Position-Specific Inflation Modeling" described in the PRD. Requires projection data from Epic 4. Standalone client-side calculation engine using efficient algorithms to meet NFR-P1 (<2 second recalculation). Implements Zustand store for real-time state management. Must achieve >90% test coverage per Architecture requirements. Addresses NFR-P8, NFR-P9.

---

### Epic 6: Live Draft Experience - Player Discovery & Tracking

Enable users to search, filter, sort, and discover players during live drafts with inflation-adjusted values displayed prominently for glanceable competitive intelligence.

**User Outcome:** Users can search players by name with instant filtering, sort by adjusted value/projected value/position/team, view detailed player information (projected stats, positions, team), see player draft status (available, drafted by team, drafted by me), filter by draft status, view tier assignments in the player queue, and complete 3-second value scans on both mobile and desktop with identical feature parity.

**FRs covered:** FR41, FR42, FR43, FR44, FR45, FR46, FR68, FR69

**Implementation Notes:** Requires inflation engine from Epic 5. Delivers the core competitive intelligence interface (PlayerQueue component). Implements UX requirements: dark slate theme with emerald accents, adjusted values prominently displayed (text-xl, font-bold, emerald-400), color-coded value indicators (green for steals, yellow for fair, red for overpays), 44px minimum touch targets on mobile, responsive design with mobile-desktop parity. Addresses NFR-P6, NFR-P7, NFR-B1, NFR-B2, NFR-B4, NFR-B5.

---

### Epic 7: Live Draft Experience - Budget & Roster Management

Enable users to track their auction budget, roster composition, and position needs in real-time during drafts with persistent context panels.

**User Outcome:** Users can monitor remaining auction budget in real-time, view money spent breakdown across roster positions, see spending pace compared to target budget allocation, track roster composition by position (hitters, pitchers, bench), view filled vs. remaining roster slots, see position needs summary ("Still Needed"), view current roster organized by position and price paid, and track overall draft progress (players drafted, players remaining).

**FRs covered:** FR33, FR34, FR35, FR36, FR37, FR38, FR39, FR40

**Implementation Notes:** Complements Epic 6 with contextual draft management panels (RosterPanel, InflationTracker components). Implements persistent side panel pattern from UX design. Uses Zustand store for real-time budget and roster state synchronization. Addresses NFR-P7 (<100ms UI update perception). Works seamlessly on mobile and desktop with responsive layout adaptation.

---

### Epic 8: Live Draft Experience - Variance & Inflation Insights

Enable users to see real-time inflation metrics, identify steals vs. overpays, and understand tier-based inflation dynamics as the draft progresses.

**User Outcome:** Users can view variance tracking showing overpays and steals for drafted players with color-coded indicators, see current inflation rate percentage prominently displayed, monitor inflation trend indicators (market heating/cooling), and understand tier assignments for players to trust the inflation modeling algorithm.

**FRs covered:** FR28, FR29, FR30, FR31

**Implementation Notes:** Builds on Epic 5-7 to complete the competitive intelligence dashboard. Implements progressive disclosure pattern for tier assignments and inflation rate details (expandable player rows per UX requirements). Provides transparency into the "Tiered Position-Specific Inflation Modeling" algorithm to build user trust. Visual indicators use emerald/green for steals, orange/red for overpays per established color system.

---

### Epic 9: Couch Managers Integration & Sync

Enable automatic draft data synchronization from Couch Managers draft rooms, eliminating manual data entry burden during high-pressure bidding moments.

**User Outcome:** Users connect to Couch Managers draft rooms via room ID, system automatically polls Couch Managers API for draft updates every 20 minutes, displays connection status indicators (connected/reconnecting/disconnected), shows last sync timestamp ("Last synced 2 minutes ago"), supports manual reconnection attempts when connection fails, and automatically catches up on missed picks when connection restores.

**FRs covered:** FR17, FR18, FR19, FR20, FR21, FR22

**Implementation Notes:** Eliminates manual data entry - core value proposition. Implements HTTP polling architecture (20-minute configurable intervals) via Supabase Edge Functions. Standalone integration that feeds Epic 5's inflation engine. Addresses NFR-I1 (>95% API success rate), NFR-I3 (exponential backoff retry, max 3 retries), NFR-I4 (configurable polling 5-60 minutes), NFR-I5 (detect sync lag >30 minutes), NFR-I6 (catch-up sync <15 seconds), NFR-P3 (<1 second API response).

---

### Epic 10: Resilience & Manual Sync Fallback

Enable users to maintain draft functionality when API integrations fail through graceful degradation to Manual Sync Mode, preserving competitive advantage during technical issues.

**User Outcome:** When API connection fails, users can enable Manual Sync Mode, manually enter auction prices via inline bid input fields, maintain inflation calculation accuracy using manually entered data (no degradation), view clear error messages explaining connection status and recovery options, access Manual Sync Mode documentation during connection issues, and have all draft state (roster, budget, inflation data) preserved across connection failures with zero data loss.

**FRs covered:** FR47, FR48, FR49, FR50, FR51, FR52, FR53

**Implementation Notes:** Critical resilience feature ensuring users never lose competitive advantage during API failures. Implements graceful degradation pattern: same PlayerQueue interface with bid input field + "My Team" checkbox enabled. Addresses NFR-R4 (zero data loss), NFR-R5 (Manual Sync accuracy equivalent to auto sync), NFR-R6 (auto-reconnect within 30 seconds), NFR-R7 (Manual Sync Mode available within 5 seconds), NFR-I2 (API failures don't cause complete system failure). Uses Zustand persist middleware for draft state recovery.

---

### Epic 11: User Onboarding & Discovery

Enable new users to discover product value and understand core features through landing page and onboarding flow.

**User Outcome:** Users can explore the landing page with feature showcase demonstrating competitive advantages, understand product value proposition through clear messaging and social proof, and access basic onboarding explaining core features before their first draft (inflation tracking, adjusted values, tier assignments).

**FRs covered:** FR65, FR66

**Implementation Notes:** Marketing and user acquisition focus. Implements LandingPage component with hero section, animated background patterns, feature grid (3-column, 6 features), "How It Works" 4-step flow, and gradient CTA buttons per UX design. Can be developed in parallel with other epics. Addresses emotional goals: curiosity → anticipation → confidence.

---

### Epic 12: Post-Draft Analytics & Value Summary

Enable users to review their draft performance with value analysis showing steals captured and competitive advantage gained, reinforcing success and creating sharing motivation.

**User Outcome:** Users can view post-draft summary showing their complete roster organized by position, total spending and budget utilization, and value analysis highlighting which players were steals (drafted below adjusted value) with visual comparison (drafted price vs. adjusted value using green highlights for favorable captures).

**FRs covered:** FR67

**Implementation Notes:** Reinforces success and creates "you have to try this" sharing motivation per emotional design principles. Implements accomplishment → advocacy emotional journey. Visual comparison shows competitive advantage gained. Builds on Epic 6-8 draft tracking data.

---

### Epic 13: Admin Operations & Monitoring

Enable administrators to monitor system health, track active drafts, view API integration status, and respond to incidents during peak draft season.

**User Outcome:** Admins can access real-time monitoring dashboard showing active drafts with status indicators, monitor API health for Couch Managers/Fangraphs/Google Sheets integrations, view error rates with automated alerts (>5% threshold triggers), see connection success metrics and historical reliability trends, review projection sync logs (successful/failed daily updates), broadcast in-app notifications to users during incidents, access user support channel for draft emergencies, view detailed incident logs (failures, affected users, recovery actions, resolution times), drill down into error logs for specific connection failures, and track draft completion rates to ensure no data loss.

**FRs covered:** FR54, FR55, FR56, FR57, FR58, FR59, FR60, FR61, FR62, FR63, FR64

**Implementation Notes:** Admin-only features with role-based access control (NFR-S8). Critical for maintaining >99% uptime during peak draft season (NFR-R1) and achieving >80% draft completion rate (NFR-R3). Implements protected admin routes using React Router. Addresses NFR-M1 (real-time visibility), NFR-M2 (error rate alerts >5%), NFR-M3 (detailed API failure logging), NFR-M4 (inflation calculation performance metrics), NFR-M5 (real-time calculation performance display to detect degradation).

