/**
 * Application Constants
 *
 * Centralized configuration values used throughout the application.
 * Organized by domain for easy maintenance.
 */

// =============================================================================
// API Configuration
// =============================================================================

export const API = {
  /** Couch Managers API polling interval (20 minutes in milliseconds) */
  POLL_INTERVAL: 20 * 60 * 1000,

  /** Default API request timeout (30 seconds) */
  TIMEOUT: 30000,

  /** Number of retry attempts for failed requests */
  RETRY_COUNT: 3,

  /** Base delay between retries (multiplied by attempt number) */
  RETRY_DELAY: 1000,
} as const;

// =============================================================================
// Draft Configuration
// =============================================================================

export const DRAFT = {
  /** Default auction budget */
  DEFAULT_BUDGET: 260,

  /** Roster size limits */
  ROSTER: {
    TOTAL: 23,
    HITTERS: 14,
    PITCHERS: 9,
    BENCH: 0,
  },

  /** Position requirements */
  POSITIONS: {
    C: 1,
    '1B': 1,
    '2B': 1,
    '3B': 1,
    SS: 1,
    OF: 5,
    UTIL: 1,
    SP: 2,
    RP: 2,
    P: 5,
  },
} as const;

// =============================================================================
// UI Configuration
// =============================================================================

export const UI = {
  /** Toast notification duration (milliseconds) */
  TOAST_DURATION: 5000,

  /** Debounce delay for search inputs (milliseconds) */
  SEARCH_DEBOUNCE: 300,

  /** Animation durations (milliseconds) */
  ANIMATION: {
    FAST: 150,
    NORMAL: 200,
    SLOW: 300,
  },

  /** Breakpoints matching Tailwind defaults */
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536,
  },
} as const;

// =============================================================================
// Inflation Tiers
// =============================================================================

export const TIERS = {
  /** Tier thresholds based on projected value */
  THRESHOLDS: {
    T1: 35, // Elite players ($35+)
    T2: 25, // Stars ($25-34)
    T3: 15, // Starters ($15-24)
    T4: 5, // Bench pieces ($5-14)
    T5: 0, // End-game ($1-4)
  },

  /** Labels for each tier */
  LABELS: {
    T1: 'Elite',
    T2: 'Star',
    T3: 'Starter',
    T4: 'Bench',
    T5: 'End-Game',
  },
} as const;

// =============================================================================
// Value Indicator Colors (for color-coded UI)
// =============================================================================

export const VALUE_INDICATORS = {
  /** Threshold percentages for value classification */
  THRESHOLDS: {
    STEAL: -15, // 15% or more below adjusted value = steal
    FAIR_LOW: -5, // 5-15% below = slight value
    FAIR_HIGH: 5, // Within 5% = fair value
    OVERPAY: 15, // 5-15% above = slight overpay
    // > 15% above = significant overpay
  },

  /** Color classes for Tailwind */
  COLORS: {
    STEAL: 'text-emerald-400 bg-emerald-900/30',
    FAIR: 'text-yellow-400 bg-yellow-900/30',
    OVERPAY: 'text-orange-400 bg-orange-900/30',
    SIGNIFICANT_OVERPAY: 'text-red-400 bg-red-900/30',
  },
} as const;

// =============================================================================
// Local Storage Keys
// =============================================================================

export const STORAGE_KEYS = {
  /** User preferences */
  USER_PREFERENCES: 'auction-projections-preferences',

  /** Cached draft state */
  DRAFT_STATE: 'auction-projections-draft-state',

  /** Last sync timestamp */
  LAST_SYNC: 'auction-projections-last-sync',

  /** Theme preference */
  THEME: 'auction-projections-theme',
} as const;

// =============================================================================
// Route Paths
// =============================================================================

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  LEAGUES: '/leagues',
  DRAFT: '/draft/:leagueId',
  PROFILE: '/profile',
  ADMIN: '/admin',
} as const;

// =============================================================================
// Feature Flags
// =============================================================================

export const FEATURES = {
  /** Enable Google Sheets integration */
  GOOGLE_SHEETS: false,

  /** Enable Fangraphs API integration */
  FANGRAPHS: false,

  /** Enable admin dashboard */
  ADMIN_DASHBOARD: false,

  /** Enable post-draft analytics */
  POST_DRAFT_ANALYTICS: true,
} as const;
