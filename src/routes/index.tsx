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
  },

  // Protected routes (authentication required)
  protected: {
    dashboard: '/dashboard',
    leagues: '/leagues',
    league: '/leagues/:leagueId',
    setup: '/setup/:leagueId',
    draft: '/draft/:leagueId',
    analysis: '/analysis/:leagueId',
    profile: '/profile',
  },

  // Admin routes (admin role required)
  admin: {
    dashboard: '/admin',
    users: '/admin/users',
    logs: '/admin/logs',
  },
} as const;

/**
 * Helper to generate dynamic route paths
 */
export const generatePath = {
  league: (leagueId: string) => `/leagues/${leagueId}`,
  setup: (leagueId: string) => `/setup/${leagueId}`,
  draft: (leagueId: string) => `/draft/${leagueId}`,
  analysis: (leagueId: string) => `/analysis/${leagueId}`,
} as const;

export default routes;
