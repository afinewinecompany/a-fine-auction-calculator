---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
inputDocuments:
  - 'c:\Users\lilra\myprojects\ProjectionCalculator\docs\analysis\product-brief-Auction Projections by A Fine Wine Company-2025-12-12.md'
documentCounts:
  briefs: 1
  research: 0
  brainstorming: 0
  projectDocs: 0
workflowType: 'prd'
lastStep: 11
workflowComplete: true
completionDate: '2025-12-12'
project_name: 'Auction Projections by A Fine Wine Company'
user_name: 'Dyl'
date: '2025-12-12'
---

# Product Requirements Document - Auction Projections by A Fine Wine Company

**Author:** Dyl
**Date:** 2025-12-12

## Executive Summary

Auction Projections by A Fine Wine Company solves the real-time inflation problem in fantasy baseball auction drafts. While managers enter drafts with pre-calculated player values, these projections become obsolete the moment bidding begins. As players are drafted above or below their projected values, inflation dynamics shift across the entire remaining player pool - yet managers are left doing mental math or guessing at adjusted values.

The application integrates directly with Couch Managers draft rooms to automatically pull live auction data, eliminating manual input entirely. It provides managers with two critical insights at a glance: (1) how much each drafted player deviated from their projection (steals vs. overpays), and (2) how that inflation is dynamically affecting the auction values of all remaining undrafted players.

The target users are competitive fantasy baseball managers with 5-30 years of experience who participate in mid-to-high level auction draft leagues. These analytics-focused managers invest significant time in draft preparation and value data-driven decision making, but struggle with real-time calculation complexity during high-pressure bidding moments.

### What Makes This Special

**Sophisticated Inflation Modeling:** The core algorithm handles the unique challenge of fantasy baseball auctions - accurately modeling inflation when only ~800 of 2000+ projected players will actually be drafted. This expertise in auction dynamics combined with real-time calculation speed creates a competitive advantage that's difficult to replicate.

**Zero-Friction Multi-Platform Integration:** Automatic integrations with Couch Managers (live draft data), Fangraphs (projection API), and Google Sheets (projection import/export) eliminate manual data entry burden during high-pressure draft moments. Users simply open the app and start drafting.

**Real-Time Actionable Intelligence:** Sub-2-second calculation updates provide instant inflation-adjusted values as each player is drafted. The interface delivers at-a-glance insights - not just data dumps - enabling managers to identify undervalued opportunities while competitors operate with outdated projections.

**Deep Domain Expertise:** Understanding of fantasy baseball auction dynamics and inflation mechanics that existing tools lack. The solution addresses the specific problem that analytics-focused managers feel most acutely - the gap between their preparation and execution.

## Project Classification

**Technical Type:** web_app
**Domain:** general (sports/entertainment)
**Complexity:** medium
**Project Context:** Greenfield - new project

This is a responsive web application supporting both desktop and mobile usage during live fantasy baseball auction drafts. The complexity stems from real-time calculation requirements, sophisticated inflation modeling algorithms, and multi-platform API integrations (Couch Managers, Fangraphs, Google Sheets). While the domain doesn't require regulatory compliance like healthcare or fintech, the performance-critical nature of real-time draft updates and the technical sophistication of the inflation algorithm position this as a medium-complexity web application.

## Success Criteria

### User Success

Users achieve success when they gain **actionable, current insights that eliminate guesswork and second-guessing** during live auction drafts. Success is measured through observable behaviors that demonstrate competitive advantage:

**Primary Success Indicators:**
- **Confident Decision-Making** - Users consistently reference inflation-adjusted values throughout drafts instead of relying on assumptions or outdated projections
- **Winning Value Bids** - Users successfully acquire desired players at projected cost or below, identifying "steals" that competitors miss
- **Roster Assembly Alignment** - Users complete drafts with rosters matching their pre-draft strategy, avoiding panic bids or budget mismanagement
- **Repeat Usage** - Users return to the app for multiple drafts across different leagues within the same season
- **Organic Advocacy** - Users recommend the app to league mates, indicating perceived competitive value

**The "Aha Moment":**
Success crystallizes immediately after the initial nomination round completes, when users see how actual bid prices are affecting all remaining player projections in real-time. At this moment, users realize they have information their competitors lack - actionable intelligence instead of assumptions.

**User Success Statement:**
"I know exactly what each remaining player should cost given current draft dynamics, and I can identify undervalued opportunities while my competitors operate with outdated information."

### Business Success

Business success focuses on **product-market fit validation through quality engagement** rather than aggressive growth or revenue generation. The goal is proving that competitive fantasy baseball managers cannot draft without this tool.

**3-Month Validation Milestones:**
- **Reliable Technical Foundation** - Establish >95% integration reliability across Couch Managers, Fangraphs, and Google Sheets APIs
- **Initial User Base** - Build core user cohort through influencer partnerships and word-of-mouth (quality over quantity)
- **Multi-Draft Retention** - Validate that >60% of users return for 2+ drafts within the same season
- **Qualitative Validation** - Gather user feedback confirming competitive advantage delivery and "can't draft without it" sentiment

**12-Month Product-Market Fit Goals:**
- **Community Recognition** - Become recognized within the Couch Managers fantasy baseball community as the standard auction draft inflation tool, demonstrated through:
  - Community discussions mentioning the tool as essential
  - Potential integration partnerships or endorsements
  - Organic user advocacy driving acquisition
- **Cross-League Dependency** - Demonstrate strong multi-league usage (average 2.5+ saved leagues per active user)
- **Monetization Foundation** - Establish proven value delivery and user dependency to support future monetization strategy (not implemented in year 1)
- **Platform Credibility** - Position A Fine Wine Company as authority on fantasy baseball auction dynamics, creating foundation for future product expansion

**Go/No-Go Decision Point:**
If MVP achieves >60% multi-draft retention and demonstrates consistent cross-league usage (2+ saved leagues per user) within first draft season, with qualitative feedback confirming competitive advantage delivery and >95% technical reliability, proceed to expand feature set and scale operations.

### Technical Success

Technical success is defined by **reliability and performance thresholds** that enable the core user experience. These are non-negotiable table stakes:

**Performance Requirements:**
- **<2 Second Calculation Speed** - Inflation recalculation and value adjustments must be imperceptible to users after each player is drafted (real-time responsiveness)
- **>95% Integration Reliability** - API connections to Couch Managers, Fangraphs, and Google Sheets must function without errors or data sync failures
- **Cross-Platform Consistency** - Seamless responsive design working equally well on desktop and mobile devices during live drafts
- **Zero Manual Input** - Automatic draft room data sync eliminating any user data entry burden during high-pressure draft moments

**Reliability Metrics:**
- **>80% Draft Completion Rate** - Users who open the app maintain active usage through entire draft (no abandonment due to technical issues)
- **Real-Time Data Accuracy** - Inflation calculations reflect actual draft state with no lag or stale data
- **Mobile Performance Parity** - Mobile users experience identical calculation speed and interface responsiveness as desktop users

**Technical Failure Modes to Prevent:**
- Integration failures causing users to miss draft updates or lose sync with live auction
- Calculation delays causing users to make decisions on outdated inflation data
- Mobile performance degradation forcing users to switch to desktop mid-draft
- Data loss or state corruption requiring manual league recreation

### Measurable Outcomes

**User Engagement Metrics:**
- **Draft Completion Rate:** >80% of users who open app during a draft maintain active usage through completion
- **Multi-Draft Retention:** >60% of users return for 2+ drafts within the same season
- **Cross-League Usage:** Average 2.5+ leagues per active user (saved leagues)
- **Feature Utilization:** >75% of users actively viewing inflation-adjusted values (not just variance tracking)
- **Session Engagement:** Consistent inflation data checks throughout draft indicating reliance on real-time insights

**Business Validation Metrics:**
- **Active Users During Peak Season:** Establish baseline user cohort during draft months (February-March)
- **Word-of-Mouth Growth:** Increasing percentage of new users acquired through referrals vs. influencer promotion
- **Leagues Tracked:** Total number of unique Couch Managers leagues integrated with the app

**Technical Performance Metrics:**
- **Integration Success Rate:** >95% successful API connections and data sync operations
- **Calculation Performance:** <2 seconds for inflation recalculation after each player drafted
- **Uptime:** >99% availability during peak draft season (February-March)

## Product Scope

### MVP - Minimum Viable Product

The MVP delivers the complete core user journey: account creation → league setup → live draft with real-time inflation tracking. This is the minimum feature set required to prove competitive advantage and validate product-market fit.

**User Account & League Management:**
- User authentication (Email and Google OAuth login)
- Multi-league management (create, save, manage multiple fantasy baseball leagues)
- League persistence with ability to resume drafts
- User profile (username and profile picture)

**Data Integration & Projections:**
- Fangraphs API integration for projection data (Steamer, BatX, JA projection systems)
- Google Sheets API for projection import/export
- Couch Managers integration via room ID for live auction data sync
- League configuration setup (team count, budget, roster spots, scoring type)

**Core Inflation Engine:**
- Real-time inflation calculator that continuously recalculates based on actual vs. projected spending
- Dynamic value adjustments (`adjustedValue`) for all remaining undrafted players
- Variance tracking visualization (steals vs. overpays)
- Inflation analysis dashboard (inflation rate, budget tracking, draft progress)

**Draft Management Interface:**
- Budget tracking (remaining auction budget, money spent breakdown)
- Roster tracking (positional breakdown, filled/remaining slots by hitters/pitchers/bench)
- Position needs display ("Still Needed" summary)
- My Roster panel (live roster construction organized by position and price paid)

**Player Management:**
- Player queue (searchable, sortable table of all available players)
- Player detail modal (projected stats, positions, team info)
- Draft status tracking (available, drafted by others, drafted by me)

**User Experience:**
- Mobile-friendly responsive interface (Tailwind CSS)
- Dark-themed at-a-glance dashboard for high-pressure draft moments
- Saved league links for one-click access
- Landing page with feature showcase and onboarding
- Basic post-draft summary (immediate roster, spending, value analysis)

**MVP Success Criteria:**
Users experience the "aha moment" immediately after initial nominations when they see real-time inflation adjustments providing competitive intelligence their opponents lack.

### Growth Features (Post-MVP)

Features that enhance the product and expand value delivery after core validation:

**Advanced Post-Draft Analytics:**
- Comprehensive draft grading showing value capture efficiency
- Roster construction analysis and competitive positioning vs. league opponents
- Draft performance insights and improvement recommendations

**Enhanced Player Intelligence:**
- Advanced filtering and sorting options in player queue beyond basic search
- Player comparison tools
- Positional scarcity modeling and tier-based valuations

**Historical Data & Learning:**
- Multi-season draft tracking and year-over-year performance analysis
- League-specific historical auction cost databases
- Draft strategy improvement insights based on accumulated data

**Platform Expansion:**
- Additional projection system integrations beyond Fangraphs/Google Sheets
- Support for other draft platforms beyond Couch Managers
- Export capabilities for draft results and analysis

### Vision (Future)

Long-term vision for comprehensive fantasy baseball platform expansion:

**Phase 2: Analytics Suite Expansion**
- Advanced historical intelligence leveraging compiled auction data across thousands of drafts
- Custom projection integration (CSV/Excel upload for proprietary systems)
- Sophisticated positional analytics with advanced scarcity modeling
- Comprehensive multi-season tracking and strategy improvement tools

**Phase 3: Full Draft Platform**
- Multi-format support (snake drafts, dynasty leagues, keeper leagues)
- Native draft hosting (become the draft platform, eliminating Couch Managers dependency)
- Complete pre-draft tools (rankings, tiers, mock drafts, player research aggregation)
- In-season management (roster optimization, trade analysis, waiver recommendations, lineup optimization)

**Phase 4: Multi-Sport & Platform Expansion**
- Fantasy football auction drafts and bestball formats
- Fantasy basketball season-long and daily fantasy with category-specific valuations
- Cross-sport analytics leveraging expertise across multiple sports
- Native mobile apps (iOS/Android) with offline draft support and push notifications
- Platform integrations (ESPN, Yahoo, Fantrax, other major platforms)

**Strategic Vision:**
Establish A Fine Wine Company as the authority on auction draft dynamics and sophisticated fantasy analytics. Each phase builds on proven value - starting with solving one specific problem exceptionally well (real-time inflation), then expanding to adjacent use cases once user trust is earned through saved leagues, repeat usage, and demonstrated technical capability. The end goal: becoming the comprehensive platform that serious fantasy managers cannot live without.

## User Journeys

### Journey 1: Marcus Chen - The Aha Moment

Marcus is a 12-year veteran of competitive fantasy baseball who participates in four high-stakes auction leagues annually. He spends weeks preparing custom projections, meticulously calculating player values for his $260 auction budget. But every year, the same frustration hits him 20 minutes into his draft - his beautiful pre-draft spreadsheet becomes obsolete the moment elite players start going 15-20% over projection. He frantically tries to recalculate inflation in his head while the auction clock ticks down, knowing he's making $200+ roster decisions based on guesswork.

Two weeks before his main league draft, Marcus discovers Auction Projections through a fantasy baseball influencer's endorsement. The promise of real-time inflation tracking sounds too good to be true, but he decides to try it for his first draft of the season.

It's 7:55 PM on a cold February evening. Marcus opens his laptop in his home office, pulls up his carefully crafted Google Sheets projections (hundreds of hours of research), and navigates to Auction Projections. He logs in with his Google account - no friction, no setup hassle - and clicks on his saved "League of Champions" that he configured last week. He enters the Couch Managers room ID, and within seconds, the app syncs. His projection data populates automatically via the Google Sheets integration. The dark-themed dashboard feels professional and purposeful.

The draft begins. The first five players nominated go for an average of $8 above Marcus's projections. In previous years, this would trigger panic - "Am I undervaluing everyone? Should I bid more aggressively?" But tonight is different. He glances at Auction Projections and sees the variance tracker highlighting each overpay in red: +$5, +$12, +$7, +$9, +$6. More importantly, he sees the inflation-adjusted values updating in real-time. His $32 projection for the next tier of outfielders now shows as $35 adjusted value. The system has done the math he used to fumble through mentally.

The breakthrough moment arrives in round 3. A premium shortstop Marcus targeted at $28 gets nominated. His competitors, operating on gut feel and outdated static projections, stop bidding at $26. Marcus sees his inflation-adjusted value: $30. He confidently calls $27 and wins the player - a $3 steal according to current market dynamics. His competitors don't even realize they just let value walk away.

Throughout the three-hour draft, Marcus checks the inflation dashboard constantly. When the market cools and inflation drops from 12% to 8%, he sees it immediately and adjusts his bidding strategy. When his budget tracker shows he's $15 ahead of pace with 8 roster spots remaining, he knows exactly how aggressive he can be on the final tier of closers.

Three months later, Marcus has used Auction Projections for all four of his league drafts. He's won two championships and finished second in another. But the real victory isn't the trophies - it's the confidence. He drafts with the calm certainty of someone who knows exactly what every player should cost while his competitors operate in the dark.

### Journey 2: Sarah Rodriguez - The Connection Drop Crisis

Sarah is 45 minutes into her most important auction draft of the year - her longtime keeper league with a $500 buy-in. She's been using Auction Projections flawlessly through 18 player nominations, making smart bids and identifying two steals that her league mates missed. Her roster is shaping up perfectly.

Then it happens. Mid-nomination, she refreshes the page and notices the inflation tracker hasn't updated for the last two picks. The Couch Managers connection indicator that was green at the top of her screen now shows yellow with a "Reconnecting..." message. Her heart sinks - the next player up is a premium starting pitcher she absolutely needs, and without accurate inflation data, she's flying blind again.

Sarah immediately takes a breath and looks for recovery options. The app displays a clear alert banner: "Draft room connection lost. Last synced: 2 minutes ago. Attempting automatic reconnection..." She sees two options: "Retry Connection" or "Enter Manual Sync Mode." She clicks "Retry Connection" and waits. Five seconds pass. Ten seconds. The banner updates: "Connection restored. Syncing last 3 picks..."

Within 15 seconds, the app catches up. The variance tracker shows the two picks she missed (+$4, -$2), and her inflation-adjusted values update to reflect the new market state. Her adjusted value for the pitcher she's targeting: $41 (was $38 before the connection drop). She bids confidently at $39, wins him at $40, and breathes a sigh of relief.

But she wonders - what if the connection hadn't restored? She notices the "Manual Sync Mode" option is still available in the settings menu. Curious, she clicks it during a lull in nominations and sees it would let her manually input the last few picks to keep her inflation calculations accurate even without the live Couch Managers feed. She doesn't need it now, but knowing it's there gives her confidence for future drafts. In slow auction drafts where players stay on the board for 12+ hours, she'd have plenty of time to manually enter values without pressure.

The draft continues without further issues. Sarah finishes with what she believes is her best roster in five years - and she only had one moment of panic instead of three hours of uncertainty.

### Journey 3: Dyl (Platform Admin) - The Peak Season Vigil

It's early March, the heart of fantasy baseball draft season. Dyl opens his admin dashboard at 6 AM, a ritual he's maintained throughout February and March. A quick glance shows him what he needs to know: 23 active drafts currently in progress, API health indicators all green, error rate at 0.8% (well below the 5% threshold that would trigger alerts).

The Fangraphs projection sync ran successfully at 2 AM as scheduled - one daily update, minimal quota usage, no issues. He checks the sync log: all three projection systems (Steamer, BatX, JA) pulled cleanly. That's one less thing to worry about.

But his attention focuses on the Couch Managers integration health dashboard. He sees the connection success rate: 96.2% over the last 7 days. Good, but he notices a cluster of reconnection events yesterday evening between 7-9 PM when multiple drafts were starting simultaneously. He drills into the error logs and sees 4 users experienced temporary connection drops, but all recovered within 15-30 seconds using the automatic reconnection logic. No support tickets filed.

Around 3 PM, his phone buzzes - an error rate alert. Couch Managers API is returning 503 errors at 12% frequency. He immediately opens the admin dashboard and sees 8 active drafts potentially affected. His nightmare scenario is users losing connection during critical bidding moments without any fallback.

He quickly drafts a platform status message and posts it to the in-app notification system: "We're experiencing intermittent connection issues with Couch Managers API. Your draft data is safe. If you see 'Connection Lost', use Manual Sync Mode to continue - instructions here: [link]."

Three users reach out via the support channel built into the app. Dyl walks them through enabling Manual Sync Mode: "Go to Settings → Draft Options → Enable Manual Sync. You'll see a simple form where you can enter each player's auction price as they're sold. Your inflation calculations will stay accurate even if the live feed drops."

Because these are slow drafts (12+ hours per nomination), users have plenty of time to manually enter values without pressure. It's not ideal, but it works. One user even comments: "Honestly, I barely noticed the API was down. The manual entry took 10 seconds per player."

By 6 PM, Couch Managers API is back to normal. Dyl checks the affected drafts - all 8 completed successfully with no data corruption or user abandonments. The error rate drops back to 1.2%. He reviews the incident log and makes a note: "Manual Sync Mode saved us. Consider making it more prominent in onboarding for slow draft users."

As draft season winds down in late March, Dyl reviews the full-season metrics: >95% integration reliability achieved, >99% uptime during peak hours, zero critical failures resulting in lost draft data. The manual fallback mode was used by 15% of users at least once, and feedback indicated it provided crucial peace of mind even when not needed.

### Journey Requirements Summary

These three user journeys reveal the following capability areas required for Auction Projections:

**Authentication & League Management:**
- Google OAuth login (frictionless account creation)
- Saved league management (one-click access to configured leagues)
- League configuration persistence (team count, budget, roster spots, scoring type)
- Couch Managers room ID integration setup

**Data Integration & Sync:**
- Google Sheets API integration for projection import (automatic population of user's custom projections)
- Fangraphs API integration for projection systems (Steamer, BatX, JA)
- Daily automated projection sync scheduler (one update per day, minimal quota usage)
- Couch Managers real-time draft room data sync (live auction feed)
- Connection status indicators (green/yellow/red visual feedback)
- Last sync timestamp display
- Automatic reconnection logic with retry capability
- Catch-up sync for missed picks when connection restores

**Core Inflation Engine:**
- Real-time inflation calculation (<2 second updates after each pick)
- Dynamic value adjustments (`adjustedValue`) for all remaining undrafted players
- Variance tracking visualization (highlighting overpays/steals in red/green)
- Inflation rate dashboard (showing current market inflation percentage)
- Inflation trend tracking (detecting market cooling/heating)

**Draft Management Interface:**
- Budget tracking dashboard (remaining budget, money spent, spending pace vs. target)
- Roster tracking (positional breakdown, filled/remaining slots)
- Position needs display ("Still Needed" summary)
- My Roster panel (live roster construction by position and price paid)
- Player queue (searchable, sortable table of available players)
- Player detail modal (projected stats, positions, team info)

**Failure Recovery & Resilience:**
- **Manual Sync Mode** (critical fallback) - User interface for manually entering auction prices to maintain inflation accuracy when API connection fails
- Manual sync documentation accessible during connection issues
- Connection retry UI (user-initiated reconnection attempts)
- Graceful degradation (app remains functional during connection loss)
- Draft state persistence (roster, budget, inflation data preserved during failures)
- Clear error messaging (users understand status and recovery options)
- Alert banners for connection issues with action items

**Admin & Operations:**
- Admin dashboard for real-time monitoring
- Active draft monitoring (list of live drafts with status indicators)
- API health indicators (Couch Managers, Fangraphs, Google Sheets status)
- Error rate tracking with automated alerts (threshold: >5% error rate)
- Connection success metrics (historical reliability trends)
- Projection sync logs (record of successful/failed daily updates)
- In-app notification broadcast system (admin messages to users during incidents)
- User support channel (built-in communication for draft emergencies)
- Incident logging (failures, affected users, recovery actions, resolution times)
- Error log drill-down (detailed view of specific connection failures)
- Draft completion tracking (ensuring no data loss or corruption)

**User Experience:**
- Dark-themed dashboard optimized for draft focus
- Mobile-responsive design (seamless laptop ↔ mobile switching)
- Saved league links for one-click access
- Professional, purposeful interface design

## Innovation & Novel Patterns

### Core Algorithmic Innovation: Tiered Position-Specific Inflation Modeling

Auction Projections' primary innovation is a sophisticated inflation calculation engine that models real auction market dynamics rather than applying naive linear adjustments across all players.

**The Problem with Existing Approaches:**
Traditional auction tools (if they calculate inflation at all) apply a single percentage adjustment uniformly across all remaining players. If elite players go 10% over projection, the tool inflates every remaining player by 10%. This fundamentally misunderstands how fantasy baseball auction markets actually behave.

**The "Run on Bank" Theory:**
When premium players at a specific position inflate significantly, auction psychology creates cascading effects:

- **Tier 1 (Elite Players):** If 4 of 5 elite shortstops go 20% over projection, the market assumes the 5th will follow the same pattern
- **Tier 2 (Mid-Tier Players):** Managers who missed elite shortstops now compete harder for mid-tier replacements, often driving inflation HIGHER than at the elite tier
- **Tier 3 (Lower-Tier Players):** Inflation behavior varies based on remaining budget pool - may inflate, deflate, or stabilize depending on money left

**Position-Specific Scarcity:**
Inflation doesn't transfer uniformly across positions. Elite shortstop inflation doesn't necessarily predict elite outfielder inflation - each position has independent scarcity dynamics that must be tracked separately.

**Budget Depletion Economics:**
As the draft progresses and budgets deplete, lower-tier players may actually deflate despite early inflation because managers have less money available. The algorithm must model remaining budget distribution across all teams.

**The Innovation - Three-Dimensional Inflation Tracking:**

The Auction Projections algorithm simultaneously tracks:

1. **Positional Scarcity** - How many elite/mid/lower-tier players remain at each position
2. **Budget Depletion** - Total money spent vs. remaining, affecting late-draft valuations
3. **Tier-Specific Inflation Rates** - Independent inflation multipliers for each position-tier combination (Elite SS, Mid SS, Elite OF, etc.)

Each drafted player triggers real-time recalculation across all three dimensions, producing position-tier-specific adjusted values that reflect actual market psychology rather than mathematical averages.

**User Transparency:**
Players are tagged with visible tier indicators in the UI, allowing users to understand why a $32 projected mid-tier shortstop now shows a $41 adjusted value while a $32 elite outfielder shows $35. This transparency builds trust in the algorithm and helps users learn auction dynamics.

### Market Context & Validation

**Historical Data as Ground Truth:**
The tiered inflation model will be validated against historical auction data patterns. By ingesting past draft results and analyzing how inflation actually distributed across position-tier combinations, the algorithm can learn the empirical patterns that drive "run on bank" behavior.

**Competitive Landscape:**
No existing fantasy baseball tool provides position-tier-specific inflation modeling. The competition landscape consists of:

- **Static Projection Tools:** Provide pre-draft values but no inflation adjustment (e.g., traditional spreadsheets, static ranking sites)
- **Basic Inflation Calculators:** Apply uniform percentage adjustments without tier or position awareness
- **Manual Approaches:** Managers attempting mental math during live drafts (the current painful workaround)

Auction Projections is the first tool to model the actual psychological and economic dynamics of fantasy baseball auctions with real-time tier-position-specific calculations.

### Validation Approach

**MVP Validation Strategy:**

1. **Algorithm Accuracy Testing:**
   - Compare tier-inflation predictions vs. actual auction results across multiple drafts
   - Track prediction accuracy by position-tier combination
   - Measure mean absolute error between adjusted values and actual sale prices

2. **User Trust Metrics:**
   - Monitor feature utilization (>75% of users actively viewing adjusted values)
   - Collect qualitative feedback on whether adjusted values "feel right" during drafts
   - Track user confidence in bidding decisions (primary success metric)

3. **Historical Data Validation:**
   - Ingest historical auction data showing tier-inflation patterns
   - Backtest algorithm against past drafts to validate tier boundaries and inflation multipliers
   - Continuous learning from each new draft to refine position-tier models

**Growth Phase Enhancements:**
- Machine learning models to dynamically refine tier boundaries based on accumulated data
- League-specific inflation pattern recognition (aggressive vs conservative leagues)
- Advanced scarcity modeling incorporating scoring system differences

### Risk Mitigation

**Primary Innovation Risk: Algorithm Complexity**

**Risk:** The tiered position-specific inflation model is mathematically complex and may produce unexpected results during live drafts, eroding user trust.

**Mitigation Strategies:**

1. **Fallback to Simple Inflation:**
   - If tier-specific calculations produce anomalous results (e.g., adjusted value >2x projection), fall back to basic uniform inflation
   - Alert admin dashboard when fallback mode is triggered for post-draft analysis

2. **Transparency & User Control:**
   - Users can see tier assignments and understand why inflation affects different groups differently
   - Option to view both "simple inflation" and "advanced tier inflation" side-by-side during drafts (Growth phase)
   - Manual override capability if users disagree with tier-inflation adjustments

3. **Gradual Rollout:**
   - MVP launches with position-tier awareness but conservative tier boundaries
   - Tier boundaries and inflation multipliers refined iteratively based on real draft data
   - A/B testing of algorithm variations during non-critical early-season drafts

4. **Performance Monitoring:**
   - Sub-2-second calculation requirement ensures algorithm complexity doesn't degrade user experience
   - Real-time performance metrics tracked in admin dashboard
   - Automatic algorithm simplification if calculation time exceeds thresholds

**Secondary Risk: Historical Data Availability**

**Risk:** Insufficient historical auction data to train tier-inflation patterns accurately.

**Mitigation:**
- MVP launches with expert-defined tier boundaries based on domain knowledge
- Each completed draft adds to historical dataset, improving model over time
- Partnerships with fantasy baseball data providers for historical auction databases (Growth phase)

**Tertiary Risk: User Misunderstanding**

**Risk:** Users don't understand why different players inflate differently, leading to distrust of adjusted values.

**Mitigation:**
- Clear UI indicators showing tier assignments and position scarcity
- Tooltips explaining "Why is this value adjusted?" with position-tier context
- Onboarding tutorial demonstrating tier-inflation concept with historical examples
- Post-draft analysis showing tier-inflation accuracy vs actual results

## Web App Specific Requirements

### Project-Type Overview

Auction Projections is a responsive Single Page Application (SPA) built with React + Vite + Tailwind CSS. The application prioritizes real-time performance and mobile-responsive design to support managers drafting from laptops, tablets, or phones during live auction events. The architecture focuses on simplicity and reliability rather than progressive enhancement or offline capabilities.

### Technical Architecture Considerations

**Application Architecture:**
- **Single Page Application (SPA)** - React-based client-side application with Vite build tooling
- **Client-Side State Management** - Real-time draft state, inflation calculations, and roster tracking managed in browser
- **API-First Integration** - All external data (Couch Managers, Fangraphs, Google Sheets) consumed via API endpoints
- **Stateless Backend** - Minimal server-side logic; primary computation happens client-side for <2 second performance

**Real-Time Data Synchronization:**
- **HTTP Polling Architecture** - Periodic API calls to Couch Managers draft rooms every 20 minutes to fetch updated auction data
- **Polling Interval:** 20 minutes initial scraping frequency (configurable based on draft pace)
- **Client-Side Refresh Logic** - React state updates trigger automatic recalculation of inflation values when new draft data arrives
- **Connection Failure Handling** - Graceful degradation to Manual Sync Mode if polling fails (user can manually enter auction prices)
- **Last Sync Indicator** - UI displays timestamp of last successful data sync for user transparency

**Note on Polling vs WebSocket:** HTTP polling was selected for simplicity and reliability. The application periodically requests updated draft data from Couch Managers API rather than maintaining persistent WebSocket connections. For slow auction drafts (12+ hour nominations), 20-minute polling intervals provide sufficient freshness without excessive API load.

### Browser Compatibility Matrix

**Supported Browsers:**
- **Chrome** - Last 2 versions (evergreen, auto-updating)
- **Firefox** - Last 2 versions (evergreen, auto-updating)
- **Safari** - Last 2 versions (macOS and iOS)
- **Edge** - Last 2 versions (Chromium-based, evergreen)

**Mobile Browser Support:**
- **iOS Safari** - Last 2 versions (iPhone and iPad)
- **Chrome Mobile** - Last 2 versions (Android)

**Unsupported Browsers:**
- Internet Explorer (all versions)
- Legacy Edge (pre-Chromium)
- Browsers older than 2 major versions

**Testing Strategy:**
- Primary development and testing on Chrome (desktop and mobile)
- Cross-browser validation on Firefox, Safari, Edge before release
- Mobile responsive testing on iOS Safari and Chrome Mobile

### Responsive Design Requirements

**Breakpoint Strategy (Tailwind CSS):**
- **Mobile:** 320px - 640px (sm) - Single column layout, stacked panels
- **Tablet:** 640px - 1024px (md/lg) - Two-column layout, condensed dashboard
- **Desktop:** 1024px+ (xl/2xl) - Full multi-panel layout with sidebar navigation

**Critical Responsive Behaviors:**
- **Draft Dashboard** - Adapts from full-width multi-panel desktop view to vertically stacked mobile panels
- **Player Queue Table** - Horizontal scroll on mobile, full table on desktop
- **Inflation Tracker** - Condensed metrics on mobile, expanded visualization on desktop
- **Roster Panel** - Collapsible on mobile, persistent sidebar on desktop
- **Navigation** - Hamburger menu on mobile, persistent navigation on desktop

**Mobile-First Performance:**
- Touch-friendly tap targets (minimum 44px × 44px)
- Mobile performance parity with desktop (<2 second calculations on mobile devices)
- Optimized bundle size for faster mobile load times

**Dark Theme:**
- Dark-themed UI across all breakpoints (established in imported UI files)
- High contrast for readability during long draft sessions
- Reduced eye strain for late-night drafts

### Performance Targets

**Critical Performance Requirements:**
- **Inflation Recalculation:** <2 seconds after each player drafted (client-side computation)
- **Initial Page Load:** <3 seconds on broadband connection (desktop and mobile)
- **API Polling Response:** <1 second for Couch Managers data fetch
- **Google Sheets Import:** <5 seconds for projection data population (one-time setup)
- **Fangraphs Sync:** <10 seconds for daily projection update (background job)

**Runtime Performance:**
- Smooth scrolling and filtering in player queue (60fps)
- Instant UI updates for roster additions and budget changes
- No UI lag or blocking during inflation recalculation

**Bundle Size Optimization:**
- JavaScript bundle <500KB gzipped (Vite code splitting)
- Lazy loading for non-critical components (post-draft analytics, player detail modal)
- Tree-shaking to eliminate unused Tailwind CSS classes

### SEO Strategy

**SEO Priority:** Low - Not Required for MVP

**Rationale:**
- Application is a logged-in draft tool, not a content marketing site
- User acquisition driven by influencer partnerships and word-of-mouth, not organic search
- Landing page provides basic product information but is not optimized for search ranking

**Minimal SEO Implementation:**
- Landing page has basic meta tags (title, description) for brand consistency
- No server-side rendering or static site generation needed
- No structured data, sitemap, or advanced SEO techniques

**Future Consideration (Growth Phase):**
- If content marketing becomes acquisition strategy, add blog or resource section with SEO optimization
- For MVP, focus on product performance over discoverability

### Accessibility Level

**Accessibility Priority:** Low - Not Required for MVP

**Rationale:**
- Target users are sighted managers actively participating in real-time auctions
- Screen reader support and WCAG compliance not critical for initial validation
- Focus on core functionality and performance over accessibility features

**Basic Accessibility Included:**
- Semantic HTML structure (headings, lists, tables)
- Color contrast sufficient for readability (dark theme with high contrast text)
- Keyboard navigation for form inputs (login, league setup)

**Not Implemented in MVP:**
- Full keyboard navigation for draft interface
- Screen reader optimization (ARIA labels, live regions)
- WCAG 2.1 AA/AAA compliance testing

**Future Consideration (Growth Phase):**
- If user base expands or accessibility becomes requirement, retrofit WCAG AA compliance
- Add keyboard shortcuts for power users (e.g., quick player search, roster navigation)

### Progressive Web App (PWA) Capabilities

**PWA Priority:** Not Required for MVP

**Rationale:**
- No offline capabilities needed (live drafts require real-time API connectivity)
- Web app accessed via browser, not installed as native-like app
- Push notifications not part of core experience

**PWA Features NOT Implemented:**
- Service worker for offline caching
- App manifest for home screen installation
- Push notification API
- Background sync

**Future Consideration (Growth Phase):**
- If mobile usage dominates, consider PWA installation for native-like mobile experience
- Offline mode could cache projections for manual sync scenarios

### Implementation Considerations

**Development Stack (Confirmed):**
- **Frontend Framework:** React 18+ with TypeScript
- **Build Tool:** Vite (fast development server, optimized production builds)
- **Styling:** Tailwind CSS (utility-first, responsive design)
- **UI Components:** shadcn/ui library (48 components already imported)
- **State Management:** React Context or lightweight state library (TBD during implementation)

**Deployment Architecture:**
- **Static Hosting:** SPA deployed to CDN (Vercel, Netlify, or similar)
- **Backend API:** Minimal backend for authentication, league persistence, and API proxying
- **Database:** User accounts, saved leagues, draft state (PostgreSQL or similar)

**API Integration Patterns:**
- **Couch Managers:** Polling every 20 minutes via HTTP requests
- **Fangraphs:** Daily sync job (cron or scheduled task) for projection updates
- **Google Sheets:** OAuth flow for one-time authorization, API calls for projection import

**Error Handling & Resilience:**
- Graceful API failure handling with user-facing error messages
- Automatic retry logic for transient failures
- Manual Sync Mode as critical fallback when Couch Managers API fails

## Functional Requirements

### User Account & Authentication

- **FR1:** Users can create accounts using email and password
- **FR2:** Users can authenticate using Google OAuth
- **FR3:** Users can manage their profile information (username, profile picture)
- **FR4:** Users can maintain authenticated sessions across multiple drafts
- **FR5:** Users can log out from their account

### League Configuration & Management

- **FR6:** Users can create new fantasy baseball league configurations
- **FR7:** Users can save multiple league configurations for different drafts
- **FR8:** Users can edit league settings (team count, budget, roster spots, scoring type)
- **FR9:** Users can access saved leagues via direct links for one-click entry
- **FR10:** Users can resume drafts in progress from saved leagues
- **FR11:** Users can delete leagues they no longer need

### Projection Data Management

- **FR12:** Users can import player projections from Google Sheets via API integration
- **FR13:** Users can select projection systems from Fangraphs (Steamer, BatX, JA)
- **FR14:** System can automatically sync Fangraphs projection data daily
- **FR15:** Users can export projection data for offline analysis
- **FR16:** Users can view projection source and last updated timestamp

### Live Draft Synchronization

- **FR17:** Users can connect to Couch Managers draft rooms via room ID
- **FR18:** System can automatically poll Couch Managers API for draft updates (20-minute intervals)
- **FR19:** Users can view connection status indicators (connected, reconnecting, disconnected)
- **FR20:** Users can view last successful sync timestamp
- **FR21:** Users can manually trigger reconnection attempts when connection fails
- **FR22:** System can automatically catch up on missed picks when connection restores

### Inflation Calculation & Value Tracking

- **FR23:** System can calculate real-time inflation based on actual vs. projected player spending
- **FR24:** System can track position-specific inflation rates independently
- **FR25:** System can track tier-specific inflation rates (Elite, Mid, Lower tiers)
- **FR26:** System can model budget depletion effects on late-draft valuations
- **FR27:** Users can view dynamically adjusted player values reflecting current market inflation
- **FR28:** Users can view variance tracking showing overpays and steals for drafted players
- **FR29:** Users can view current inflation rate percentage
- **FR30:** Users can view inflation trend indicators (market heating/cooling)
- **FR31:** Users can view tier assignments for players to understand inflation modeling
- **FR32:** System can recalculate inflation values in under 2 seconds after each pick

### Draft Management & Roster Building

- **FR33:** Users can track remaining auction budget in real-time
- **FR34:** Users can view money spent breakdown across roster positions
- **FR35:** Users can view spending pace compared to target budget allocation
- **FR36:** Users can view roster composition by position (hitters, pitchers, bench)
- **FR37:** Users can view filled vs. remaining roster slots
- **FR38:** Users can view position needs summary ("Still Needed")
- **FR39:** Users can view their current roster organized by position and price paid
- **FR40:** Users can track draft progress (players drafted, players remaining)

### Player Information & Discovery

- **FR41:** Users can search for players by name in the player queue
- **FR42:** Users can sort players by various attributes (projected value, adjusted value, position, team)
- **FR43:** Users can view detailed player information (projected stats, positions, team)
- **FR44:** Users can view player draft status (available, drafted by team, drafted by me)
- **FR45:** Users can filter players by draft status
- **FR46:** Users can view player tier assignments in the player queue

### Failure Recovery & Resilience

- **FR47:** Users can enable Manual Sync Mode to manually enter auction prices
- **FR48:** Users can manually input player auction prices when API connection fails
- **FR49:** System can maintain inflation calculation accuracy using manually entered data
- **FR50:** Users can view clear error messages explaining connection status and recovery options
- **FR51:** Users can access Manual Sync Mode documentation during connection issues
- **FR52:** System can preserve draft state (roster, budget, inflation data) during connection failures
- **FR53:** System can gracefully degrade functionality when API connections fail

### Admin Operations & Monitoring

- **FR54:** Admin users can view real-time monitoring dashboard
- **FR55:** Admin users can view list of active drafts with status indicators
- **FR56:** Admin users can monitor API health for Couch Managers, Fangraphs, and Google Sheets
- **FR57:** Admin users can view error rates with automated alert thresholds
- **FR58:** Admin users can view connection success metrics and historical reliability trends
- **FR59:** Admin users can view projection sync logs showing successful/failed daily updates
- **FR60:** Admin users can broadcast in-app notifications to users during incidents
- **FR61:** Admin users can access user support channel for draft emergencies
- **FR62:** Admin users can view incident logs (failures, affected users, recovery actions, resolution times)
- **FR63:** Admin users can drill down into error logs for specific connection failures
- **FR64:** Admin users can track draft completion rates to ensure no data loss

### User Experience & Discovery

- **FR65:** Users can view landing page with feature showcase and product information
- **FR66:** Users can access basic onboarding explaining core features
- **FR67:** Users can view post-draft summary showing roster, spending, and value analysis
- **FR68:** Users can access the application on mobile devices with responsive design
- **FR69:** Users can view all interfaces in dark-themed UI optimized for draft focus

## Non-Functional Requirements

### Performance

**Response Time Requirements:**
- **NFR-P1:** Inflation recalculation must complete within 2 seconds of receiving draft update data
- **NFR-P2:** Initial page load must complete within 3 seconds on broadband connections (desktop and mobile)
- **NFR-P3:** API polling responses must complete within 1 second for Couch Managers data fetch
- **NFR-P4:** Google Sheets projection import must complete within 5 seconds
- **NFR-P5:** Fangraphs daily sync must complete within 10 seconds

**Runtime Performance:**
- **NFR-P6:** Player queue scrolling and filtering must maintain 60fps frame rate
- **NFR-P7:** Roster and budget UI updates must appear instantaneous (<100ms) to users
- **NFR-P8:** Inflation recalculation must not block user interface interactions

**Mobile Performance:**
- **NFR-P9:** Mobile devices must achieve identical calculation performance (<2 seconds) as desktop
- **NFR-P10:** JavaScript bundle size must remain under 500KB gzipped to optimize mobile load times

**Performance Degradation Tolerance:**
- **NFR-P11:** System performance must not degrade by more than 20% during peak draft season usage

### Reliability & Availability

**Uptime Requirements:**
- **NFR-R1:** System must maintain >99% availability during peak draft season (February-March)
- **NFR-R2:** Scheduled maintenance windows must not occur during peak draft hours (6 PM - 11 PM EST weekdays, all day weekends)
- **NFR-R3:** System must achieve >80% draft completion rate (users who start a draft complete it without abandonment due to technical issues)

**Data Integrity:**
- **NFR-R4:** Draft state (roster, budget, inflation data) must be preserved across all failure scenarios with zero data loss
- **NFR-R5:** Manual Sync Mode must maintain calculation accuracy equivalent to automated sync (no data corruption)

**Failover & Recovery:**
- **NFR-R6:** Automatic reconnection logic must restore connectivity within 30 seconds for transient API failures
- **NFR-R7:** System must support graceful degradation when external APIs fail (Manual Sync Mode available within 5 seconds)

### Integration

**API Reliability:**
- **NFR-I1:** System must achieve >95% successful API connection rate across Couch Managers, Fangraphs, and Google Sheets APIs
- **NFR-I2:** API integration failures must not cause complete system failure (graceful degradation required)
- **NFR-I3:** System must support automatic retry logic with exponential backoff for transient API failures (max 3 retries)

**Data Synchronization:**
- **NFR-I4:** Couch Managers polling interval must be configurable (default: 20 minutes, range: 5-60 minutes)
- **NFR-I5:** System must detect and report data sync lag when last successful sync exceeds 30 minutes
- **NFR-I6:** Catch-up sync after connection restore must process all missed picks within 15 seconds

**External System Compatibility:**
- **NFR-I7:** Google Sheets OAuth integration must support standard Google authentication flow without requiring custom permissions
- **NFR-I8:** Fangraphs API integration must support multiple projection systems (Steamer, BatX, JA) with consistent data formats

### Security

**Authentication & Authorization:**
- **NFR-S1:** User authentication must support OAuth 2.0 standard (Google OAuth)
- **NFR-S2:** User sessions must expire after 30 days of inactivity
- **NFR-S3:** Password-based authentication must require minimum 8 characters with complexity requirements (if implemented)

**Data Protection:**
- **NFR-S4:** All data transmission between client and server must use HTTPS/TLS encryption
- **NFR-S5:** User credentials must be hashed using industry-standard algorithms (bcrypt, Argon2, or equivalent)
- **NFR-S6:** API keys and secrets must never be exposed in client-side code

**Privacy:**
- **NFR-S7:** User league data must be accessible only to the authenticated league owner
- **NFR-S8:** Admin dashboard must enforce role-based access control (admin-only functionality)

### Browser Compatibility

**Supported Browsers:**
- **NFR-B1:** Application must function correctly on last 2 versions of Chrome, Firefox, Safari, and Edge (evergreen browsers)
- **NFR-B2:** Mobile browsers (iOS Safari, Chrome Mobile) must be supported with feature parity to desktop
- **NFR-B3:** Internet Explorer and legacy Edge are explicitly unsupported

**Cross-Browser Consistency:**
- **NFR-B4:** Visual rendering must be consistent across supported browsers (no layout breaks or visual regressions)
- **NFR-B5:** JavaScript functionality must behave identically across supported browsers

### Monitoring & Observability

**Admin Monitoring:**
- **NFR-M1:** Admin dashboard must provide real-time visibility into active drafts, API health, and error rates
- **NFR-M2:** Error rate alerts must trigger when threshold exceeds 5% within any 15-minute window
- **NFR-M3:** System must log all API failures with sufficient detail for troubleshooting (timestamp, error code, affected user, recovery action)

**Performance Monitoring:**
- **NFR-M4:** System must track and report inflation calculation performance metrics (median, p95, p99 latency)
- **NFR-M5:** Admin dashboard must display real-time calculation performance to detect algorithm degradation
