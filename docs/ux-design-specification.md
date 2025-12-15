---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - 'c:\Users\lilra\myprojects\ProjectionCalculator\docs\prd.md'
  - 'c:\Users\lilra\myprojects\ProjectionCalculator\docs\analysis\product-brief-Auction Projections by A Fine Wine Company-2025-12-12.md'
workflowType: 'ux-design'
lastStep: 8
status: 'complete'
completionDate: '2025-12-12'
project_name: 'Auction Projections by A Fine Wine Company'
user_name: 'Dyl'
date: '2025-12-12'
---

# UX Design Specification Auction Projections by A Fine Wine Company

**Author:** Dyl
**Date:** 2025-12-12

---

<!-- UX design content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

### Project Vision

Auction Projections by A Fine Wine Company transforms the fantasy baseball auction draft experience by providing real-time competitive intelligence during live auctions. The product solves the inflation calculation problem that plagues experienced managers—as players are drafted above or below projections, the entire market shifts, but managers are left doing mental math during high-pressure bidding moments.

The UX must deliver actionable insights at a glance while users operate under cognitive load and time pressure. By automatically integrating with Couch Managers draft rooms and providing instant inflation-adjusted values, the interface becomes the competitive advantage that turns preparation into execution.

### Target Users

**The Competitive Fantasy Baseball Manager**

Our users are experienced fantasy baseball managers (5-30 years) who participate in multiple mid-to-high level auction draft leagues annually. They are analytics-focused individuals who invest significant time in draft preparation and value data-driven decision making.

**User Context:**
- Operating in high-pressure, time-sensitive environments (auction clocks ticking)
- Switching between mobile and desktop devices during drafts (mobile may be primary)
- Managing cognitive overload (tracking budget, roster needs, positional scarcity, inflation simultaneously)
- Experiencing peak anxiety when elite players inflate unexpectedly
- Currently relying on mental math and guesswork for inflation adjustments

**Success Criteria:**
Users achieve success when they can confidently identify undervalued opportunities while competitors operate with outdated projections. The "aha moment" comes when they realize they have real-time market intelligence their opponents lack.

### Key Design Challenges

1. **Cognitive Load Management** - Present real-time inflation data without overwhelming users during high-pressure bidding moments
2. **Mobile-Desktop Parity** - Deliver full functionality on mobile without sacrificing usability on smaller screens (both platforms equally critical)
3. **Information Hierarchy** - Surface the most critical data (adjusted values for top-ranked available players) while making detailed analytics accessible but not intrusive
4. **Trust Building** - Balance algorithmic transparency (showing tier/position-specific inflation data) with interface simplicity through progressive disclosure

### Design Opportunities

1. **Glanceable Intelligence** - Create a dashboard where users can scan top available players and their adjusted values in under 3 seconds during active bidding
2. **Contextual Detail** - Smart progressive disclosure that reveals algorithmic details (tier assignments, position-specific rates) when users need to understand "why," while hiding complexity during fast-paced moments
3. **Mobile-First Competitive Advantage** - Deliver a mobile experience with full feature parity that enables confident bidding from any device
4. **Visual Inflation Indicators** - Use visual cues (color coding, trend indicators, icons) to communicate inflation dynamics instantly without requiring detailed number analysis

### Current Design Implementation

**Existing UI Components & Patterns:**

The application already has a comprehensive design system implemented with shadcn/ui components (48+ components) and a dark-themed aesthetic optimized for long draft sessions.

**Established Visual Language:**
- **Color Palette:** Dark slate background (`slate-950`, `slate-900`, `slate-800`) with emerald/green accents for positive indicators, red accents for primary actions, blue for information
- **Gradient Usage:** Extensive use of gradient overlays (`from-slate-950 via-slate-900 to-emerald-950`) for depth and visual interest
- **Border Treatment:** Subtle borders (`border-slate-700/50`) with opacity variations
- **Shadow System:** Layered shadows (`shadow-2xl`, `shadow-red-500/30`) for elevation hierarchy
- **Animation Library:** Fade-in, slide-in, and pulse-slow animations for progressive enhancement

**Key Implemented Components:**

1. **DraftRoom (Main Layout):**
   - 12-column grid layout (8 columns player queue, 4 columns roster/inflation)
   - Full-height viewport design with fixed header
   - Dark gradient background (`bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950`)

2. **PlayerQueue (Primary Interaction Surface):**
   - Multi-column sortable table with inline bid entry
   - Search and multi-dimensional filtering (position, status)
   - Color-coded value indicators (green for steals, yellow fair, orange/red overpays)
   - Tier visibility on player rows
   - Checkbox for "My Team" selection
   - Responsive showing X of Y players count

3. **InflationTracker:**
   - Compact metrics grid (2x2 layout)
   - Prominent inflation percentage badge with color coding
   - Progress bar for draft completion
   - Contextual explanation text

4. **RosterPanel:**
   - Position-grouped roster display (Hitters, Pitchers, Bench)
   - Inline budget tracking (spent/remaining)
   - "Still Needed" position chips
   - Scrollable roster list

5. **LandingPage:**
   - Hero section with animated background patterns
   - Feature grid (3-column, 6 features)
   - "How It Works" 4-step flow
   - Gradient CTA buttons

**Design Patterns Already Established:**
- Hover states with gradient transitions
- Icon-first component headers (Lucide icons)
- Inline form inputs for rapid data entry
- Progressive state feedback (empty states, loading, completion)
- Badge/chip components for categorical data
- Modal overlays for detail views (PlayerDetailModal)

## Core User Experience

### Defining Experience

**Auction Projections is a passive intelligence platform, not an active data entry tool.**

The core user experience centers on **observational analysis** rather than transactional interaction. Users monitor the draft in real-time, scanning for competitive advantages while the system automatically synchronizes draft data, recalculates inflation, and adjusts player values in the background.

**Primary User Action: Glanceable Value Discovery**

The most frequent and critical user interaction is rapidly scanning the PlayerQueue to identify undervalued opportunities—players whose inflation-adjusted values reveal them as "steals" compared to current market dynamics. This scan must be completable in under 3 seconds during active auction moments when users need to make split-second bidding decisions.

**Secondary User Action: Real-Time Intelligence Monitoring**

As the Couch Managers API automatically syncs new draft data every 20 minutes, users passively observe inflation recalculations and value adjustments across all remaining players. This continuous background intelligence-gathering creates increasing confidence that they possess market insights competitors lack.

**Fallback Interaction: Manual Sync Mode**

When API integration fails, users can switch to Manual Sync Mode—a simple workflow of entering auction prices and marking "My Team" checkboxes that preserves calculation accuracy without disrupting the core monitoring experience.

### Platform Strategy

**Multi-Device Web Application**

- **Primary Platform:** Responsive web application (React + Vite + Tailwind CSS)
- **Device Strategy:** Equal prioritization of mobile and desktop experiences—users may have the draft room open on one device while monitoring the app on another
- **Interaction Model:** Mouse/keyboard on desktop, touch-optimized on mobile with identical feature parity
- **Offline Functionality:** Not required—the app depends on real-time API connectivity for value proposition
- **Performance Target:** Sub-2-second inflation recalculation on both mobile and desktop after each sync

**Platform Rationale:**

Slow auction drafts (where nominations can take 12+ hours) allow generous 20-minute API polling intervals without sacrificing real-time responsiveness. The web-first approach eliminates native app complexity while supporting the multi-device switching behavior common among competitive managers.

### Effortless Interactions

**What Should Happen Automatically (Zero User Effort):**

1. **Draft Data Synchronization** - HTTP polling to Couch Managers API every 20 minutes pulls new auction results without user intervention
2. **Inflation Recalculation** - Tier-specific, position-aware inflation models recalculate instantly when new draft data arrives
3. **Value Adjustments** - Every remaining player's adjusted value updates automatically to reflect current market dynamics
4. **Roster Tracking** - Budget remaining, position needs, and roster composition update in real-time as players are drafted

**What Should Be Instant and Glanceable (Minimal Cognitive Load):**

1. **Value Comparison** - Identifying steals vs. overpays through color-coded visual indicators (green, yellow, orange, red)
2. **Top Targets** - Scanning sorted PlayerQueue for highest-value available players at needed positions
3. **Inflation State** - Understanding current market temperature through prominent inflation percentage badge
4. **Budget Status** - Seeing money remaining and roster needs at a glance in persistent sidebar

**Competitor Advantage Eliminated:**

Unlike manual spreadsheet approaches or static projection tools, users never need to:
- Manually enter auction results during high-pressure moments
- Perform mental math to estimate inflation impacts
- Update player values in separate tracking systems
- Switch between multiple tools to synthesize draft intelligence

### Critical Success Moments

**The "Aha Moment" (First 5-10 Picks):**

After the initial nomination round completes and the first API sync occurs, users see how actual auction prices are affecting inflation across all remaining players. The system has performed calculations they previously attempted mentally—and they realize they possess actionable intelligence their competitors don't have.

**Success Indicators:**
- Users can immediately identify which player tiers are inflating faster than others
- Position-specific scarcity becomes visually obvious through tier assignments
- Adjusted values provide confident bidding targets instead of guesswork

**Make-or-Break Interaction (3-Second Value Scan):**

When a player is nominated and the auction clock is ticking, users must be able to:
1. Find the player in the PlayerQueue (search or scroll)
2. See their inflation-adjusted value prominently displayed
3. Compare adjusted value to actual bid to identify steal opportunity
4. Return to the draft room to place their bid

**Failure occurs if:**
- Information hierarchy buries adjusted values below the fold
- Color coding is unclear or requires interpretation
- Mobile experience degrades scan speed compared to desktop
- Search/filter functionality is sluggish or unintuitive

**Trust-Building Moment (Progressive Disclosure):**

When users question why a specific player's adjusted value differs significantly from their projection, they can:
- Tap/click the player row to see tier assignment
- View position-specific inflation rates through optional detail toggle
- Access Modal overlay with full statistical breakdown
- Understand the "why" without cluttering the default glanceable view

### Experience Principles

These principles guide all UX design decisions for Auction Projections:

1. **Intelligence Over Interaction** - The app is primarily a passive monitoring tool that provides competitive intelligence, not a data entry interface. Users observe and analyze rather than actively input data.

2. **Glanceable Value Discovery** - Users must be able to scan the PlayerQueue and identify undervalued targets (favorable adjusted values) in under 3 seconds during active auction moments.

3. **Automatic Synchronization** - Draft data sync, inflation recalculation, and value adjustments happen automatically without user intervention. The system works invisibly in the background via 20-minute API polling.

4. **Graceful Degradation** - When API integration fails, Manual Sync Mode provides a simple fallback (manual bid entry + "My Team" checkbox) that maintains calculation accuracy without breaking the user experience.

5. **Real-Time Confidence Building** - As inflation adjusts automatically after each sync, users gain increasing confidence that they possess market intelligence their competitors lack (the "aha moment").

6. **Mobile-Desktop Parity** - Both platforms receive equal design attention with identical feature sets—scanning and monitoring must be equally effective regardless of device.

7. **Progressive Disclosure of Complexity** - Default views emphasize glanceable intelligence; detailed algorithmic transparency (tiers, position rates) is accessible but hidden until needed.

## Desired Emotional Response

### Primary Emotional Goals

**Confidence and Control**

Users should feel **confident and in control** throughout their draft experience. This confidence stems from possessing competitive intelligence their opponents lack—knowing exactly what remaining players should cost based on real-time inflation dynamics rather than relying on guesswork or mental math.

The emotional shift we're creating: From **anxiety and uncertainty** ("Am I overpaying? Did I miss inflation?") to **calm certainty** ("I know this is the right bid based on current market dynamics").

**Shareability Trigger: "You Have to Try This"**

The emotional experience should be compelling enough that users feel eager to recommend the app to league mates. This happens when users experience a clear competitive advantage—they secure undervalued players their competitors missed because they had superior market intelligence.

### Emotional Journey Mapping

**1. Discovery (Curiosity → Anticipation)**

When users first discover the app through influencer recommendations or word-of-mouth:
- Initial State: **Curiosity mixed with skepticism** - "Can this really give me an edge?"
- Desired Outcome: **Anticipation** - Landing page converts skepticism through clear value proposition
- UX Support: Landing page feature showcase demonstrates concrete advantages with social proof

**2. During Live Draft (Confidence → Calm Focus)**

As users monitor the draft and scan for value opportunities:
- Primary Emotion: **Confidence and control** - "I know exactly what players should cost"
- Supporting Emotion: **Calm focus** - Mental burden of inflation calculations eliminated
- Desired State: Users feel empowered rather than overwhelmed despite high-pressure environment
- UX Support: Automatic sync, glanceable intelligence, prominent adjusted values

**3. After Draft Completion (Accomplishment → Advocacy)**

When users complete their draft and review results:
- Primary Emotion: **Accomplishment and vindication** - "I got steals my competitors missed"
- Secondary Emotion: **Eagerness to share** - "You have to try this" excitement
- Desired Outcome: Post-draft value analysis reinforces success
- UX Support: Draft summary highlights steals captured and value gained

**4. When Problems Occur (Trust → Maintained Confidence)**

If API connection fails during a draft:
- Undesired Emotion: Panic, abandonment, frustration
- Desired Emotion: **Trust in the fallback** - "Manual Sync Mode has me covered"
- Emotional Goal: Maintain confidence even during technical issues
- UX Support: Graceful degradation to Manual Sync Mode with clear instructions

**5. Return Usage (Eager Dependency)**

When users return for subsequent league drafts:
- Primary Emotion: **Eager confidence** - "I can't draft without this anymore"
- Desired State: Tool becomes indispensable to draft preparation
- UX Support: Saved league links, proven value delivery, consistent reliability

### Micro-Emotions

**Critical Emotional States:**

1. **Confidence (not Confusion)**
   - Moment: Scanning PlayerQueue for undervalued targets
   - Design Support: Clear visual hierarchy makes adjusted values impossible to miss
   - Success Metric: Users can identify steals in under 3 seconds

2. **Trust (not Skepticism)**
   - Moment: Questioning why adjusted values differ from projections
   - Design Support: Progressive disclosure reveals tier assignments and inflation rates on demand
   - Success Metric: Users accept algorithmic recommendations without second-guessing

3. **Accomplishment (not Frustration)**
   - Moment: Completing draft and reviewing performance
   - Design Support: Post-draft value analysis highlights successful value captures
   - Success Metric: Users feel validated in their bidding decisions

4. **Calm Focus (not Anxiety)**
   - Moment: Managing cognitive load during high-pressure bidding
   - Design Support: Automatic background sync eliminates manual data entry burden
   - Success Metric: Users maintain composure despite auction time pressure

### Design Implications

**Emotion-to-Design Connections:**

1. **Confidence → Clear Visual Hierarchy**
   - UX Approach: Adjusted values must be the most prominent data point in PlayerQueue
   - Implementation: Larger font size, emerald/green color highlighting, bold weight for adjusted values
   - Rationale: Users can't feel confident if they have to hunt for critical information

2. **Trust → Progressive Disclosure + Transparent Calculations**
   - UX Approach: Default view shows simple adjusted values; optional toggle reveals tier assignments and position-specific inflation rates
   - Implementation: PlayerDetailModal with full algorithmic breakdown accessible via tap/click
   - Rationale: Analytical users need to verify the "why" behind values to trust the system

3. **Accomplishment → Post-Draft Value Analysis**
   - UX Approach: Draft summary highlights steals captured and value gained vs. competitors
   - Implementation: Visual comparison showing drafted price vs. adjusted value with color-coded success indicators
   - Rationale: Reinforce success and create "you have to try this" sharing motivation

4. **Calm Focus → Automatic Background Processing**
   - UX Approach: Zero manual data entry; all sync and calculation happens invisibly
   - Implementation: Subtle status indicators (connection badge, last sync timestamp) that don't demand attention
   - Rationale: Reduce cognitive load during high-pressure moments by eliminating busy work

5. **Trust During Failures → Graceful Degradation**
   - UX Approach: When API fails, simple manual entry interface maintains calculation accuracy
   - Implementation: Same PlayerQueue interface with bid input field + "My Team" checkbox enabled
   - Rationale: Preserve confidence even during technical failures—users stay in control

### Emotional Design Principles

**Guiding Principles for Emotional Experience:**

1. **Make Critical Information Impossible to Miss** - Adjusted values should be the visual anchor of every player row, using size, color, and position to command attention

2. **Build Trust Through Optional Transparency** - Don't force algorithmic details on users, but make them accessible when analytical minds want to verify calculations

3. **Reinforce Success Visibly** - Post-draft analysis should celebrate value captures with clear visual indicators (green highlights for steals, comparison charts showing competitive advantage)

4. **Maintain Calm Through Invisibility** - The best UX is invisible—automatic sync and calculation should happen without demanding user attention or acknowledgment

5. **Preserve Confidence During Failure** - When things break, provide simple fallback mechanisms that maintain core value (accurate inflation calculations) without requiring technical troubleshooting

6. **Create Dependency Through Consistency** - Reliable performance across multiple drafts transforms the tool from "helpful" to "indispensable"

7. **Avoid Negative Emotional Triggers** - Never create uncertainty (vague error messages), confusion (buried information), or abandonment scenarios (dead-ends without recovery paths)

## UX Pattern Analysis & Inspiration

### Inspiring Products Analysis

**Fangraphs - Data Density Mastery**

Fangraphs excels at presenting complex baseball analytics in a data-dense interface without overwhelming users. Their strength lies in comprehensive sortable tables with clear column headers, consistent data formatting, and hover tooltips that reveal additional context. The site demonstrates that analytical users can handle high information density when it's organized systematically.

**Key Lessons:**
- Multi-column sortable tables are the foundation for scanning player data
- Consistent number formatting (decimals, percentages, counting stats) reduces cognitive load
- Hover interactions can reveal supplementary data without cluttering the primary view
- Dark mode isn't required for analytics tools, but clean typography is essential

**Fantrax & Couch Managers - Reliability and Cleanliness**

Both Fantrax and Couch Managers are industry standards that fantasy managers trust for league management and draft hosting. Their UX success stems from reliability, clean interfaces, and predictable interaction patterns. Users return because these platforms "just work" without surprises or unnecessary flourishes.

**Key Lessons:**
- Reliability builds trust faster than innovative features
- Clean, predictable layouts reduce learning curve for returning users
- Simple, consistent color coding (green = good, red = bad) is universally understood
- Draft interfaces benefit from persistent status panels (budget, roster needs, timer)
- Mobile responsiveness is critical—managers draft from phones frequently

**Sleeper - Modern Polish and Mobile-First Design**

Sleeper represents the modern evolution of fantasy sports UX with polished mobile-first design, smooth animations, and social features that create engagement. While Auction Projections doesn't need social layers, Sleeper demonstrates how contemporary visual design can make data-heavy fantasy tools feel approachable rather than intimidating.

**Key Lessons:**
- Mobile-first design doesn't mean compromising on features—it means rethinking information hierarchy
- Smooth micro-animations (loading states, transitions) create polish without slowing interactions
- Dark themes work exceptionally well for fantasy sports tools used during evening drafts
- Card-based layouts with subtle shadows create visual hierarchy without heavy borders
- Pull-to-refresh and swipe gestures feel natural on mobile for data updates

### Transferable UX Patterns

**Navigation Patterns:**

1. **Persistent Side Panel for Context** (Fantrax/Couch Managers) - Keep budget, roster needs, and draft status visible at all times rather than burying in separate screens. *Already implemented in RosterPanel component.*

2. **Tabbed Filtering for Large Datasets** (Fangraphs) - Allow users to filter player queues by position categories (All, Hitters, Pitchers, Position-Specific) using prominent tab navigation.

3. **Sticky Table Headers** (Fangrapps) - When scrolling long player lists, column headers should remain visible so users always understand what data they're viewing.

**Interaction Patterns:**

4. **Click-to-Sort Table Columns** (Fangraphs/Fantrax) - Users should be able to sort by any column with visual indicators (arrows) showing current sort state. *Already implemented in PlayerQueue component.*

5. **Instant Search with Keyboard Focus** (Sleeper) - Search input should be keyboard-accessible with instant filtering (no submit button required). *Already implemented in PlayerQueue.*

6. **Progressive Disclosure via Expandable Rows** (Fantrax) - Player rows can expand to show detailed stats, tier assignments, and inflation breakdowns without navigating away from the main queue.

7. **Touch-Optimized Tap Targets** (Sleeper) - On mobile, interactive elements (sort headers, checkboxes, player rows) should have minimum 44px touch targets to prevent mis-taps during fast-paced drafts.

**Visual Patterns:**

8. **Dark Theme with High-Contrast Data** (Sleeper) - Dark slate backgrounds reduce eye strain during long evening drafts, but require high-contrast text (white/emerald) for critical data points. *Already implemented across components.*

9. **Color-Coded Value Indicators** (Fantrax) - Use green for undervalued ("steals"), yellow for fair value, orange/red for overpriced. Avoid relying solely on color—pair with icons or text for accessibility. *Already implemented in PlayerQueue.*

### Anti-Patterns to Avoid

**Patterns That Create Friction:**

1. **Hidden Critical Data** - Never hide adjusted values, inflation rates, or roster needs behind multiple clicks. If users have to hunt for information during time-pressure moments, they'll abandon the tool.

2. **Over-Animation** - Sleeper occasionally suffers from animation delays that slow interactions. Every transition should complete in <200ms or feel instant. Avoid animation for animation's sake.

3. **Non-Responsive Mobile Tables** - Horizontal scrolling for wide tables on mobile is frustrating. Either redesign the table for mobile (cards, stacked rows) or allow horizontal scroll with clear visual indicators.

4. **Vague Status Indicators** - "Syncing..." without progress indication creates anxiety. Always show last sync time, next sync countdown, or explicit "connected/disconnected" status.

5. **Modal Overload** - Don't force users into modals for routine actions. Modals should be reserved for critical confirmations or detailed views users explicitly request.

6. **Unintuitive Filter Combinations** - When users apply multiple filters (position + availability status + tier), make it obvious which filters are active and provide one-click "clear all" functionality.

7. **Mobile-Desktop Feature Disparity** - If desktop has advanced filtering or sorting, mobile must have it too—just redesigned for touch. Never create a "mobile lite" version for competitive users.

8. **Performance-Heavy Visual Effects** - Gradient animations, particle effects, and parallax scrolling may look impressive but tank performance on older devices. Prioritize speed over visual flair for data-intensive tools.

### Design Inspiration Strategy

**What to Adopt:**

1. **Multi-Column Sortable Tables (Fangraphs)** - The PlayerQueue already implements this pattern. Continue refining sort indicators, sticky headers, and keyboard navigation for power users.
   - ✅ Already implemented in PlayerQueue component
   - Enhancement opportunity: Add sticky table headers on scroll

2. **Dark Theme with Emerald Accents (Sleeper influence)** - The existing slate-900/slate-950 backgrounds with emerald-400 accents for positive indicators align perfectly with modern fantasy sports aesthetics.
   - ✅ Already implemented across all components
   - Maintain this visual language consistently

3. **Persistent Status Panel (Fantrax/Couch Managers)** - RosterPanel and InflationTracker already provide this. Keep budget, roster needs, and inflation state visible at all times.
   - ✅ Already implemented in 12-column grid layout
   - Enhancement opportunity: Consider collapsible panel on mobile to maximize PlayerQueue space when needed

4. **Reliable, Predictable Interactions (Fantrax/Couch Managers)** - Favor consistency over novelty. Users should never wonder "how do I sort this?" or "where did my filters go?"
   - Guideline: Every interactive element should behave the same way across all views

**What to Adapt:**

5. **Sleeper's Mobile Polish for Data-Heavy Interface** - Sleeper's smooth animations and card-based layouts work for social feeds, but Auction Projections needs to adapt these patterns for dense tabular data.
   - Adaptation: Use subtle fade-in animations for value updates after sync, but keep tables as primary layout (not cards)
   - Mobile tables should use horizontal scroll with sticky first column (player name) rather than switching to cards

6. **Progressive Disclosure (Fangraphs tooltips → Expandable Rows)** - Instead of Fangraphs' hover tooltips (which don't work on mobile), use expandable player rows that reveal tier assignments and inflation breakdowns.
   - Implementation: Tap player row to expand inline detail panel
   - Desktop can support both hover preview + click to expand

**What to Avoid:**

7. **Social Features (Sleeper)** - Sleeper's chat, emoji reactions, and league activity feeds create engagement but would distract from Auction Projections' focus on analytical intelligence.
   - Rationale: Users need to minimize cognitive load, not add social interactions during drafts

8. **Fangraphs' Light Theme** - While Fangraphs proves data density works, the light theme doesn't align with long evening draft sessions where dark mode reduces eye strain.
   - Already avoided: Dark theme is core to existing design system

9. **Performance-Heavy Effects** - Avoid Sleeper-style parallax backgrounds, particle effects, or GPU-intensive animations that could slow recalculation performance.
   - Performance budget: Every API sync → inflation recalculation must complete in <2 seconds
   - Visual effects must not interfere with this performance target

## Design System Foundation

### Design System Choice

**shadcn/ui + Tailwind CSS**

Auction Projections uses shadcn/ui component library with Tailwind CSS as its design system foundation. This combination provides a comprehensive set of accessible, customizable UI components with utility-first styling that supports rapid iteration and precise control over data-dense interfaces.

Unlike traditional component libraries (Material UI, Ant Design), shadcn/ui components are copied directly into the codebase rather than imported as dependencies. This approach provides complete ownership and customization freedom while maintaining the benefits of a proven component architecture.

### Rationale for Selection

**Technical Alignment:**

1. **Already Implemented** - The project has 48+ shadcn/ui components in production across DraftRoom, PlayerQueue, InflationTracker, RosterPanel, and LandingPage components. Continuing with this foundation eliminates migration costs and leverages existing patterns.

2. **Data-Dense UI Requirements** - Fantasy baseball analytics require precise control over table layouts, sortable columns, color-coded indicators, and responsive data visualization. Tailwind's utility-first approach provides the granular control needed for these complex interfaces without fighting against opinionated component defaults.

3. **Mobile-Desktop Parity** - Tailwind's responsive utility system (`sm:`, `md:`, `lg:` prefixes) makes it straightforward to maintain identical feature sets across breakpoints while adapting layouts appropriately. Critical for the equal mobile-desktop prioritization requirement.

4. **Performance Characteristics** - All Tailwind styles compile to static CSS with automatic purging of unused styles. No runtime CSS-in-JS overhead that could impact the <2-second inflation recalculation performance target.

5. **Customization Without Constraints** - Since shadcn/ui components are copied into the codebase, modifications to support domain-specific needs (expandable player rows, tier indicators, inflation badges) don't require workarounds or wrapper components.

**Design System Maturity:**

- **48+ Production Components**: Button, Table, Badge, Modal, Input, Select, Checkbox, Tabs, Card, ScrollArea, and more
- **Established Visual Language**: Dark slate theme with emerald accents, gradient overlays, layered shadows
- **Consistent Patterns**: Icon-first headers, inline form inputs, progressive state feedback, hover states with transitions

### Implementation Approach

**Component Strategy:**

1. **Use shadcn/ui for Foundation Components** - Buttons, inputs, badges, modals, cards, and navigation elements leverage shadcn/ui defaults with project-specific theming.

2. **Extend with Custom Components** - Domain-specific components (InflationTracker, PlayerQueue, RosterPanel) are built using shadcn/ui primitives as building blocks but customized for fantasy sports analytics needs.

3. **Progressive Enhancement** - Start with shadcn/ui defaults; customize only when product requirements demand it. Avoid premature abstraction.

**Tailwind Configuration:**

- **Color Palette**: Formalize slate (backgrounds), emerald (positive indicators), red (primary actions/negative), blue (information) as design tokens in `tailwind.config.js`
- **Spacing Scale**: Use Tailwind's default spacing scale (0.5rem increments) for consistent rhythm
- **Typography**: Define heading scales, body text sizes, and font weights as reusable utilities
- **Breakpoints**: Mobile-first responsive design with standard Tailwind breakpoints (sm: 640px, md: 768px, lg: 1024px, xl: 1280px)

**Accessibility Compliance:**

- shadcn/ui components include ARIA attributes and keyboard navigation by default
- Color-coded value indicators (green/yellow/orange/red) pair with text labels or icons to avoid color-only communication
- Touch targets meet 44px minimum size on mobile for sortable columns, filters, and player row interactions

### Customization Strategy

**Brand Identity:**

The dark slate + emerald aesthetic is the visual signature of Auction Projections, optimized for long evening draft sessions while communicating analytical credibility.

**Core Color Tokens:**

```
Backgrounds: slate-950, slate-900, slate-800
Borders: slate-700 (with opacity variations)
Text: white (primary), slate-400 (secondary), slate-500 (tertiary)
Positive Indicators: emerald-400, green-500 (steals, favorable values)
Negative Indicators: red-500, orange-500 (overpays, warnings)
Information: blue-400 (neutral data, help text)
Accents: emerald gradients for depth (from-emerald-900/30 to-green-900/30)
```

**Component Variants:**

1. **Value Indicator Badges** - Create semantic variants:
   - `variant="steal"` - Emerald background for undervalued players
   - `variant="fair"` - Yellow background for market value
   - `variant="overpay"` - Orange/red background for inflated prices

2. **Player Row States** - Expandable rows for progressive disclosure:
   - Default: Condensed view with name, position, tier, adjusted value
   - Expanded: Reveals tier assignment rationale, position-specific inflation rates, statistical breakdown
   - Mobile: Same expandable pattern with touch-optimized tap targets

3. **Status Indicators** - Connection state, sync status, draft progress:
   - Subtle badges that don't demand attention when functioning normally
   - Prominent warnings when API connection fails (graceful degradation to Manual Sync Mode)

**Animation Standards:**

- **Value Updates**: Subtle fade-in animation (<200ms) when adjusted values recalculate after API sync
- **Loading States**: Pulse animation for skeleton loaders during initial data fetch
- **No Heavy Effects**: Avoid parallax, particle effects, or GPU-intensive animations that could impact performance

**Typography Scale:**

- **Adjusted Values** (most critical data): Large, bold, emerald-400 color to command attention
- **Player Names**: Medium weight, white text for scannability
- **Secondary Data** (tiers, positions): Smaller, slate-400 for supporting context
- **Tertiary Info** (last sync time, explanatory text): Smallest, slate-500, non-distracting

## Core User Interaction Design

### Defining Experience

**"Scan and identify undervalued steals during live auction bidding"**

The defining experience of Auction Projections is the moment when a player gets nominated during a live auction, the clock is ticking, and the user can instantly scan their screen to identify whether the current bid represents value based on real-time inflation dynamics. This 3-second glanceable intelligence transforms high-pressure guesswork into confident bidding decisions.

Unlike static projection tools or manual spreadsheets, Auction Projections provides automatic inflation-adjusted values that update in the background as the draft progresses. Users describe this to friends as: *"It shows me which players are actually worth bidding on based on how the draft is going - I can see steals my opponents miss."*

**Why This Defines the Product:**

This interaction is the competitive advantage. While competitors rely on:

- Static pre-draft projections that become obsolete after 10-15 picks
- Manual data entry during high-pressure bidding moments
- Mental math to estimate inflation impacts
- Switching between multiple tools to synthesize draft intelligence

Auction Projections delivers:

- Automatic API synchronization every 20 minutes (zero manual effort)
- Instant tier-specific, position-aware inflation recalculation
- Color-coded visual indicators showing exactly which players are steals (emerald/green) vs. overpays (orange/red)
- Progressive disclosure revealing algorithmic reasoning when users ask "why?"

### User Mental Model

**Current Problem-Solving Approach:**

Experienced fantasy managers currently solve the auction inflation problem through a fragmented workflow:

1. **Pre-Draft Preparation** - Spending hours creating custom projection spreadsheets with anticipated player values based on league settings and scoring
2. **Mental Math During Drafts** - Attempting to estimate inflation adjustments on the fly as elite players sell above projection ("If Ohtani went for $10 over, does that mean Acuna is worth $48 now?")
3. **Gut Feel Decision-Making** - Relying on years of experience to sense when the market has shifted toward hitters or pitchers
4. **Post-Draft Regret** - Realizing they overpaid or missed value opportunities only after reviewing final rosters

**User Expectations and Established Patterns:**

Fantasy managers bring established mental models from tools they already use (Fangraphs, Fantrax, ESPN, Sleeper):

- **Sortable Tables**: "I should be able to click any column header to sort by that value"
- **Instant Search**: "Typing should filter results immediately without a submit button"
- **Color Conventions**: "Green = good value, red = bad value" (universal fantasy sports standard)
- **Progressive Disclosure**: "If I want to see why a player's value changed, I can click for details"
- **Persistent Context**: "Budget, roster needs, and draft status should always be visible"

**What Users Love About Existing Tools:**

- ✅ **Reliability** (Fantrax, Couch Managers) - Platforms that "just work" without downtime during critical moments
- ✅ **Data Density** (Fangraphs) - Comprehensive tables showing all relevant stats at once
- ✅ **Predictable Layouts** - Consistent interfaces that reduce learning curve across draft seasons
- ✅ **Mobile Functionality** - Ability to draft from phones without feature compromises

**What Users Hate:**

- ❌ **Static Projections** - Values that don't adjust as the draft market shifts
- ❌ **Manual Entry Burden** - Having to update spreadsheets during high-pressure bidding moments
- ❌ **Tool Switching** - Juggling draft room + spreadsheet + projection sites simultaneously
- ❌ **Inflation Guesswork** - Never knowing if their mental math correctly estimated market shifts

### Success Criteria

**Core Experience Success Indicators:**

1. **3-Second Value Scan** - User can search for a nominated player, identify their adjusted value, and return to bidding in under 3 seconds
2. **"Aha Moment" After First Sync** - Within the first 5-10 picks, users realize the system has performed tier-specific inflation calculations they previously attempted mentally
3. **Zero Manual Entry** - Users never need to enter auction prices during the draft (automatic API sync handles synchronization)
4. **Confident Decision-Making** - Users trust adjusted values enough to bid based on them without second-guessing or consulting external sources

**What Makes Users Say "This Just Works":**

- Searching for a player by name instantly reveals their adjusted value prominently displayed in the results
- Inflation recalculates automatically after each API sync without any user action or acknowledgment
- Color coding makes it visually obvious which players are steals (emerald/green) vs. overpriced (orange/red)
- Mobile experience delivers identical speed and functionality compared to desktop (no feature disparity)
- Progressive disclosure answers "why is this value different?" without cluttering the default view

**Feedback Mechanisms:**

- **Visual Confirmation**: Color-coded value indicators communicate market position at a glance
- **Status Reassurance**: "Last synced 2 minutes ago" badge confirms data is current without demanding attention
- **Algorithmic Transparency**: Expandable player rows reveal tier assignment and position-specific inflation rates (answers "why?")
- **Real-Time Adjustments**: Subtle fade-in animations (<200ms) signal value updates after sync completion

**Performance Requirements:**

- **Instant Search Filtering**: Results appear as user types with no perceptible delay
- **Sub-2-Second Recalculation**: Inflation model updates across all remaining players after API sync
- **<200ms Visual Feedback**: Animations complete instantly to avoid feeling sluggish during time-pressure moments

**Failure Indicators:**

The experience fails if:

- Information hierarchy buries adjusted values below the fold or among less critical data
- Color coding requires interpretation or doesn't follow universal conventions
- Mobile experience degrades scan speed compared to desktop
- Search/filter functionality introduces latency during active bidding
- Users feel the need to verify values in external tools (lack of trust)

### Novel vs. Established Patterns

**Pattern Classification: Established Patterns with Novel Data Application**

Auction Projections uses **proven UX patterns** that fantasy managers already understand from existing tools. No user education or onboarding tutorials are required because the interaction design leverages established conventions:

**Established Patterns We're Adopting:**

- ✅ **Sortable Multi-Column Tables** (Fangraphs, Fantrax) - Click column header to sort, visual indicators show sort direction
- ✅ **Instant Search Filtering** (Sleeper, ESPN) - Type to filter results, no submit button required
- ✅ **Color-Coded Value Indicators** (Universal) - Green = good value (steals), red = bad value (overpays)
- ✅ **Expandable Rows for Progressive Disclosure** (Fantrax) - Tap/click player to reveal detailed breakdown
- ✅ **Persistent Status Panels** (Fantrax, Couch Managers) - Budget, roster needs, inflation state always visible

**The Innovation: Real-Time Inflation Intelligence**

What's novel is **not the interaction design** but **the data being presented**:

- **Automatic Tier-Specific Inflation** - System recalculates inflation rates by player tier (elite, mid-tier, late-round) rather than assuming uniform inflation
- **Position-Aware Adjustments** - Tracks position scarcity and adjusts values accordingly (if catchers are inflating faster than outfielders, values reflect this)
- **Background API Synchronization** - HTTP polling every 20 minutes eliminates manual data entry burden
- **Live Value Adjustments** - Every remaining player's value updates automatically as draft market dynamics shift

**No User Education Required:**

Users immediately understand core interactions because they match established patterns:

- "Click column header to sort" - Standard sortable table behavior
- "Type to search" - Standard search input behavior
- "Green = good, red = bad" - Universal color convention
- "Tap row to expand" - Standard progressive disclosure pattern
- "Side panel shows my budget/roster" - Standard draft interface layout

**Our Unique Twist:**

We innovate **within familiar patterns** rather than inventing novel interaction paradigms. The interface feels immediately familiar to anyone who's used Fangraphs or Fantrax, but the **intelligence it provides** (real-time inflation-adjusted values derived from tier-specific, position-aware modeling) is what competitors lack.

This approach minimizes friction during onboarding while maximizing the competitive advantage through superior data presentation.

### Experience Mechanics

**Core Experience Flow: Glanceable Value Discovery During Live Bidding**

**1. Initiation (Nomination Moment):**

- **Trigger**: Another manager nominates a player in the Couch Managers draft room (auction clock starts ticking)
- **User Action**: User switches focus to Auction Projections app (on same device or second device)
- **Initial State**: PlayerQueue displays all available players sorted by adjusted value (highest to lowest by default)
- **Context Available**: RosterPanel shows budget remaining, roster needs; InflationTracker shows current inflation percentage

**2. Interaction (Value Scan - Two Paths):**

**Path A - Search for Specific Nominated Player:**

1. User types player name into search input (keyboard accessible, cursor auto-focuses)
2. Results filter instantly as they type (e.g., "Acu" immediately shows Ronald Acuña Jr.)
3. Player row appears with critical data visible:
   - Player name + position(s)
   - Tier assignment (T1, T2, etc.)
   - **Adjusted value prominently displayed** in large, bold, emerald-400 text
   - Original projection for comparison (smaller, secondary color)
4. Color-coded indicator communicates market position (green background = steal, yellow = fair, red = overpay)

**Path B - Scan Sorted Queue for Top Values:**

1. User scrolls through PlayerQueue (sorted by adjusted value descending)
2. Scans top rows to see which high-value players are still available at needed positions
3. Color coding creates visual pattern recognition (emerald/green rows = steals to target)
4. Position filters allow quick refinement ("Show only available OF")

**3. Feedback (Visual Confirmation):**

**Primary Visual Indicators:**

- **Adjusted Value**: Displayed large, bold, emerald-400 color as the visual anchor of each player row
- **Color-Coded Background**: Subtle background tint (green for steals, yellow for fair, orange/red for overpays)
- **Tier Badge**: Shows tier assignment (T1, T2) immediately visible without expansion

**System Response:**

- No loading states needed (data already synced via background API polling)
- Instant feedback - search and sort operations complete in <100ms
- Subtle fade-in animation (<200ms) when values update after API sync (signals recalculation occurred)

**Optional Detail (Progressive Disclosure):**

- User taps/clicks player row to expand inline detail panel
- Expanded view reveals:
  - Tier assignment rationale
  - Position-specific inflation rate (e.g., "OF inflating at +12%")
  - Statistical breakdown from projection source
- Desktop can support both hover preview + click to expand

**4. Completion (Decision Made):**

**Success Outcome:**

- User returns to draft room with confident bidding target in mind
- User feeling: **"I know this is the right bid"** (confidence over guesswork)
- Competitive advantage: User possesses market intelligence opponents lack

**What's Next:**

- User either places bid in draft room based on adjusted value
- User continues monitoring PlayerQueue for next nomination
- After bid completes, next API sync (within 20 minutes) automatically updates inflation calculations

**Error/Edge Case Handling:**

**If API Sync Fails:**

- System gracefully degrades to Manual Sync Mode
- PlayerQueue enables inline bid input fields + "My Team" checkboxes
- User can manually enter auction prices to maintain calculation accuracy
- Clear status indicator: "API disconnected - using Manual Sync Mode"

**If Player Not Found:**

- Search displays "No players found" message
- Active filters shown prominently (position filters, availability status)
- One-click "Clear all filters" button restores full player list

**If Data is Stale:**

- "Last synced 18 minutes ago" status badge makes staleness obvious
- Next sync countdown visible ("Next sync in 2 minutes")
- No false confidence - users know data may not reflect most recent 1-2 picks

## Visual Design Foundation

### Color System

**Primary Color Palette:**

The dark slate + emerald aesthetic serves as the visual signature of Auction Projections, optimized for long evening draft sessions (reducing eye strain) while communicating analytical credibility through professional color choices.

**Background Colors:**

- `slate-950` - Primary background (darkest, used for main app canvas)
- `slate-900` - Secondary background (component surfaces, modals)
- `slate-800` - Tertiary background (nested elements, hover states)

**Border Colors:**

- `slate-700` - Standard borders (often with opacity variations like `slate-700/50`)
- `slate-600` - Emphasis borders (focused states, active elements)

**Text Colors:**

- `white` - Primary text (player names, headings, critical data)
- `slate-400` - Secondary text (labels, supporting information)
- `slate-500` - Tertiary text (timestamps, help text, non-critical metadata)
- `slate-600` - Disabled text

**Semantic Colors:**

- **Success/Positive Indicators**: `emerald-400`, `green-500` (undervalued players "steals", favorable values, positive trends)
- **Warning/Caution**: `yellow-500`, `orange-400` (fair market value, mild warnings)
- **Error/Negative Indicators**: `red-500`, `orange-500` (overpriced players, errors, critical warnings)
- **Information/Neutral**: `blue-400` (help text, neutral data, informational badges)

**Gradient Accents:**

Used sparingly for depth and visual interest without performance impact:

- `from-slate-950 via-slate-900 to-emerald-950` - Main app background gradient
- `from-emerald-900/30 to-green-900/30` - Positive indicator gradients (component headers, success states)

**Color Rationale:**

1. **Dark Theme for Evening Use** - Drafts typically occur in evenings; dark backgrounds reduce eye strain during multi-hour sessions
2. **Emerald for Positive Psychology** - Green universally signals "go ahead" and positive value, aligning with the emotional goal of confidence
3. **High Contrast for Data Density** - White text on dark backgrounds ensures readability in data-heavy tables
4. **Semantic Consistency** - Green = steals, red = overpays matches universal fantasy sports conventions (no learning curve)

**Accessibility Compliance:**

- All text color combinations meet WCAG AA standards for contrast (minimum 4.5:1 for body text, 3:1 for large text)
- Color-coded value indicators pair with text labels or position to avoid color-only communication
- Emerald-400 on slate-900 provides 7.2:1 contrast ratio (exceeds AAA standard)

### Typography System

**Font Stack:**

Uses system font stack for optimal performance and native feel across platforms:

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
```

**Rationale**: System fonts load instantly (no web font delay), provide excellent readability for dense data tables, and feel native to each platform (iOS, Android, Windows, Mac).

**Type Scale:**

The typography hierarchy emphasizes **adjusted values** as the most critical data point, with supporting information scaled appropriately:

- **Adjusted Values** (most critical): `text-xl` (1.25rem / 20px), `font-bold`, emerald-400 color
- **Player Names**: `text-base` (1rem / 16px), `font-medium`, white color
- **Headings (H1)**: `text-2xl` or `text-3xl` (1.5-1.875rem), `font-semibold`, white
- **Headings (H2)**: `text-xl` (1.25rem), `font-semibold`, white or emerald-400
- **Headings (H3)**: `text-lg` (1.125rem), `font-medium`, slate-300
- **Body Text**: `text-sm` (0.875rem / 14px), `font-normal`, slate-400
- **Secondary Data** (tiers, positions): `text-sm` (0.875rem), slate-400
- **Tertiary Info** (timestamps, help text): `text-xs` (0.75rem / 12px), slate-500

**Line Height:**

- **Headings**: `leading-tight` (1.25) - Compact for visual impact
- **Body Text**: `leading-normal` (1.5) - Comfortable reading
- **Data Tables**: `leading-snug` (1.375) - Optimized for dense information without crowding

**Font Weight Usage:**

- `font-bold` (700) - Adjusted values only (the single most important data point)
- `font-semibold` (600) - Headings, emphasis
- `font-medium` (500) - Player names, labels
- `font-normal` (400) - Body text, secondary information

**Typography Principles:**

1. **Adjusted Values Command Attention** - Largest, boldest, most vibrant color (emerald-400) ensures they're the visual anchor of every player row
2. **Scannability Over Readability** - Data tables prioritize quick scanning; slightly tighter line-height optimizes information density
3. **Hierarchy Through Size + Weight + Color** - Three variables create clear visual hierarchy without relying solely on size
4. **Performance First** - System fonts eliminate render-blocking web font requests, critical for sub-2-second recalculation target

### Spacing & Layout Foundation

**Base Spacing Unit:**

Tailwind's default 4px base unit (`spacing[1] = 0.25rem = 4px`) provides the foundation for all spatial relationships.

**Spacing Scale (Most Frequently Used):**

- `space-1` (4px) - Minimal gap between tightly related elements
- `space-2` (8px) - Standard gap within components (icon + text, badge spacing)
- `space-4` (16px) - Component internal padding, gap between related groups
- `space-6` (24px) - Section padding, gap between unrelated groups
- `space-8` (32px) - Major section separation, component external margins

**Layout Grid System:**

**Desktop (≥1024px):**

- 12-column grid layout
- 8 columns: PlayerQueue (primary interaction surface)
- 4 columns: RosterPanel + InflationTracker (persistent context panels)
- Rationale: Prioritizes glanceable value discovery (PlayerQueue) while keeping budget/roster visible

**Tablet (768px - 1023px):**

- Maintains 12-column grid
- PlayerQueue can expand to 9 columns when panels collapse to icons
- Vertical stacking option for smaller tablets

**Mobile (<768px):**

- Single-column layout with collapsible panels
- PlayerQueue takes full width for optimal scanning on small screens
- RosterPanel/InflationTracker accessible via bottom sheet or collapsible header
- Horizontal scroll enabled for table with sticky first column (player name)

**Component Spacing Patterns:**

1. **Player Rows in PlayerQueue:**
   - Vertical padding: `py-2` (8px top/bottom) for touch targets
   - Horizontal padding: `px-4` (16px left/right)
   - Gap between rows: `space-y-1` (4px) for density without crowding
   - Minimum touch target: 44px height on mobile (8px top + 8px bottom + content)

2. **Panel Components (RosterPanel, InflationTracker):**
   - Internal padding: `p-4` (16px all sides)
   - Section separation: `space-y-4` (16px between sections)
   - Border radius: `rounded-xl` (12px) for modern, friendly aesthetic

3. **Modals and Overlays:**
   - Outer padding: `p-6` (24px) for breathing room
   - Content spacing: `space-y-6` (24px between major sections)
   - Border radius: `rounded-lg` (8px) for hierarchy (smaller than panels)

**Layout Principles:**

1. **Information Density Over White Space** - Fantasy managers expect data-heavy interfaces; spacing optimizes scan speed rather than visual minimalism
2. **Persistent Context Panels** - Budget, roster needs, inflation state remain visible at all times (no hidden hamburger menus during drafts)
3. **Mobile-First Responsive** - Layouts adapt to smaller screens without hiding functionality (horizontal scroll + sticky columns, not truncation)
4. **Touch-Optimized Targets** - All interactive elements meet 44px minimum touch target on mobile (prevent mis-taps during high-pressure moments)
5. **Scan-Path Optimization** - PlayerQueue occupies left-to-center viewport (natural eye scanning pattern), context panels on right (peripheral vision)

### Accessibility Considerations

**Color Contrast:**

- All text meets WCAG AA minimum contrast ratios (4.5:1 for body text, 3:1 for large text)
- Critical data (adjusted values) exceeds AAA standards (7.2:1 contrast)
- Color-coded value indicators include text labels or iconography (not color-only)

**Keyboard Navigation:**

- Search input receives automatic focus on page load (keyboard-first workflow)
- All interactive elements reachable via Tab key (sortable columns, filters, player rows)
- Enter key activates expandable rows and buttons
- Escape key closes modals and expanded states

**Screen Reader Support:**

- shadcn/ui components include ARIA attributes by default
- Table headers associated with data cells for context
- Status indicators announced ("Last synced 2 minutes ago")
- Loading states communicated ("Calculating inflation adjustments")

**Touch Accessibility:**

- Minimum 44px touch targets on mobile for all interactive elements
- Generous padding around tap areas prevents accidental activations
- Swipe gestures optional (all actions accessible via tap)

**Motion and Animation:**

- All animations under 200ms (perceived as instant, not distracting)
- No parallax, particle effects, or GPU-intensive animations (performance + motion sensitivity)
- Value update fade-ins can be disabled via `prefers-reduced-motion` media query

**Text Resizing:**

- System font stack respects user's browser text size preferences
- Layout remains functional at 150% text zoom (WCAG requirement)
- Data tables may require horizontal scroll at extreme zoom levels, but remain readable
