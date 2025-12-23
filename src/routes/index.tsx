/**
 * Route Definitions
 *
 * Defines all application routes using react-router-dom v7.
 * Routes are organized by authentication requirements.
 */

/**
 * Route configuration object
 */
export const routes = {
  // Public routes (no authentication required)
  public: {
    home: '/',
    login: '/login',
    register: '/register',
    signup: '/signup', // Alias for register
    demo: '/demo',
    googleCallback: '/auth/google/callback',
  },

  // Protected routes (authentication required)
  protected: {
    dashboard: '/dashboard',
    leagues: '/leagues',
    leagueNew: '/leagues/new',
    league: '/leagues/:leagueId',
    leagueEdit: '/leagues/:leagueId/edit',
    leagueProjections: '/leagues/:leagueId/projections/import',
    setup: '/setup/:leagueId',
    draft: '/draft/:leagueId',
    draftSummary: '/leagues/:leagueId/draft/summary',
    analysis: '/analysis/:leagueId',
    profile: '/profile',
  },

  // Admin routes (admin role required)
  admin: {
    dashboard: '/admin',
    users: '/admin/users',
    logs: '/admin/logs',
    errorLogs: '/admin/errors/:apiName',
  },
} as const;

/**
 * Helper to generate dynamic route paths
 */
export const generatePath = {
  league: (leagueId: string) => `/leagues/${leagueId}`,
  leagueEdit: (leagueId: string) => `/leagues/${leagueId}/edit`,
  leagueProjections: (leagueId: string) => `/leagues/${leagueId}/projections/import`,
  setup: (leagueId: string) => `/setup/${leagueId}`,
  draft: (leagueId: string) => `/draft/${leagueId}`,
  draftSummary: (leagueId: string) => `/leagues/${leagueId}/draft/summary`,
  analysis: (leagueId: string) => `/analysis/${leagueId}`,
  errorLogs: (apiName: string) => `/admin/errors/${apiName}`,
} as const;

export default routes;
