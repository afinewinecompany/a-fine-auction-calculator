/**
 * Routes Configuration Tests
 *
 * Tests for route definitions and path generation utilities.
 *
 * Story: 2.3 - Implement Email/Password Login
 */

import { describe, it, expect } from 'vitest';
import { routes, generatePath } from '@/routes';

describe('routes', () => {
  describe('public routes', () => {
    it('should have correct home route', () => {
      expect(routes.public.home).toBe('/');
    });

    it('should have correct login route', () => {
      expect(routes.public.login).toBe('/login');
    });

    it('should have correct register route', () => {
      expect(routes.public.register).toBe('/register');
    });
  });

  describe('protected routes', () => {
    it('should have correct dashboard route', () => {
      expect(routes.protected.dashboard).toBe('/dashboard');
    });

    it('should have correct leagues route', () => {
      expect(routes.protected.leagues).toBe('/leagues');
    });

    it('should have correct league route with param', () => {
      expect(routes.protected.league).toBe('/leagues/:leagueId');
    });

    it('should have correct setup route with param', () => {
      expect(routes.protected.setup).toBe('/setup/:leagueId');
    });

    it('should have correct draft route with param', () => {
      expect(routes.protected.draft).toBe('/draft/:leagueId');
    });

    it('should have correct analysis route with param', () => {
      expect(routes.protected.analysis).toBe('/analysis/:leagueId');
    });

    it('should have correct profile route', () => {
      expect(routes.protected.profile).toBe('/profile');
    });
  });

  describe('admin routes', () => {
    it('should have correct admin dashboard route', () => {
      expect(routes.admin.dashboard).toBe('/admin');
    });

    it('should have correct admin users route', () => {
      expect(routes.admin.users).toBe('/admin/users');
    });

    it('should have correct admin logs route', () => {
      expect(routes.admin.logs).toBe('/admin/logs');
    });
  });
});

describe('generatePath', () => {
  describe('league', () => {
    it('should generate league path with leagueId', () => {
      expect(generatePath.league('abc123')).toBe('/leagues/abc123');
    });

    it('should handle UUID format leagueId', () => {
      expect(generatePath.league('550e8400-e29b-41d4-a716-446655440000')).toBe(
        '/leagues/550e8400-e29b-41d4-a716-446655440000'
      );
    });

    it('should handle empty string leagueId', () => {
      expect(generatePath.league('')).toBe('/leagues/');
    });
  });

  describe('setup', () => {
    it('should generate setup path with leagueId', () => {
      expect(generatePath.setup('abc123')).toBe('/setup/abc123');
    });

    it('should handle UUID format leagueId', () => {
      expect(generatePath.setup('550e8400-e29b-41d4-a716-446655440000')).toBe(
        '/setup/550e8400-e29b-41d4-a716-446655440000'
      );
    });
  });

  describe('draft', () => {
    it('should generate draft path with leagueId', () => {
      expect(generatePath.draft('abc123')).toBe('/draft/abc123');
    });

    it('should handle UUID format leagueId', () => {
      expect(generatePath.draft('550e8400-e29b-41d4-a716-446655440000')).toBe(
        '/draft/550e8400-e29b-41d4-a716-446655440000'
      );
    });
  });

  describe('analysis', () => {
    it('should generate analysis path with leagueId', () => {
      expect(generatePath.analysis('abc123')).toBe('/analysis/abc123');
    });

    it('should handle UUID format leagueId', () => {
      expect(generatePath.analysis('550e8400-e29b-41d4-a716-446655440000')).toBe(
        '/analysis/550e8400-e29b-41d4-a716-446655440000'
      );
    });
  });
});
