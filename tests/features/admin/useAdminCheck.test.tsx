/**
 * useAdminCheck Hook Tests
 *
 * Tests for the admin verification hook that queries Supabase
 * to check if the current user has admin privileges.
 *
 * Story: 13.1 - Create Admin Dashboard Route
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import type { User } from '@supabase/supabase-js';

// Mock user state
let mockUser: User | null = null;

// Mock the auth store
vi.mock('@/features/auth/stores/authStore', () => ({
  useUser: () => mockUser,
}));

// Mock Supabase responses
let mockSupabaseConfigured = true;
let mockSupabaseResponse: { data: { is_admin: boolean } | null; error: Error | null } = {
  data: { is_admin: false },
  error: null,
};

// Create mock query builder
const createMockQueryBuilder = () => ({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue(mockSupabaseResponse),
});

const mockQueryBuilder = createMockQueryBuilder();

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: () => mockSupabaseConfigured,
  getSupabase: () => ({
    from: vi.fn().mockReturnValue(mockQueryBuilder),
  }),
}));

// Import after mocking
import { useAdminCheck } from '@/features/admin/hooks/useAdminCheck';

// Helper to create mock user
const createMockUser = (id: string = 'test-user-id'): User => ({
  id,
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00.000Z',
});

describe('useAdminCheck', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = null;
    mockSupabaseConfigured = true;
    mockSupabaseResponse = { data: { is_admin: false }, error: null };

    // Reset mock query builder
    mockQueryBuilder.select.mockReturnThis();
    mockQueryBuilder.eq.mockReturnThis();
    mockQueryBuilder.single.mockResolvedValue(mockSupabaseResponse);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Unauthenticated User', () => {
    it('should return isAdmin=false for unauthenticated user', async () => {
      mockUser = null;

      const { result } = renderHook(() => useAdminCheck());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isAdmin).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should not query database when user is null', async () => {
      mockUser = null;

      const { result } = renderHook(() => useAdminCheck());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockQueryBuilder.select).not.toHaveBeenCalled();
    });
  });

  describe('Admin User', () => {
    it('should return isAdmin=true for admin user', async () => {
      mockUser = createMockUser('admin-user-id');
      mockSupabaseResponse = { data: { is_admin: true }, error: null };
      mockQueryBuilder.single.mockResolvedValue(mockSupabaseResponse);

      const { result } = renderHook(() => useAdminCheck());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isAdmin).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should query users table with correct user id', async () => {
      const userId = 'specific-user-id';
      mockUser = createMockUser(userId);
      mockSupabaseResponse = { data: { is_admin: true }, error: null };
      mockQueryBuilder.single.mockResolvedValue(mockSupabaseResponse);

      const { result } = renderHook(() => useAdminCheck());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockQueryBuilder.select).toHaveBeenCalledWith('is_admin');
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', userId);
    });
  });

  describe('Non-Admin User', () => {
    it('should return isAdmin=false for non-admin user', async () => {
      mockUser = createMockUser('regular-user-id');
      mockSupabaseResponse = { data: { is_admin: false }, error: null };
      mockQueryBuilder.single.mockResolvedValue(mockSupabaseResponse);

      const { result } = renderHook(() => useAdminCheck());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isAdmin).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should return isAdmin=false when is_admin is null', async () => {
      mockUser = createMockUser('user-with-null-admin');
      mockSupabaseResponse = { data: { is_admin: null as unknown as boolean }, error: null };
      mockQueryBuilder.single.mockResolvedValue(mockSupabaseResponse);

      const { result } = renderHook(() => useAdminCheck());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isAdmin).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockUser = createMockUser('error-user-id');
      mockSupabaseResponse = {
        data: null,
        error: new Error('Database connection failed'),
      };
      mockQueryBuilder.single.mockResolvedValue(mockSupabaseResponse);

      const { result } = renderHook(() => useAdminCheck());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isAdmin).toBe(false);
      expect(result.current.error).toBe('Failed to verify admin status');
    });

    it('should handle Supabase not configured', async () => {
      mockUser = createMockUser('user-id');
      mockSupabaseConfigured = false;

      const { result } = renderHook(() => useAdminCheck());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isAdmin).toBe(false);
      expect(result.current.error).toBe('Admin service not configured');
    });

    it('should handle query exceptions', async () => {
      mockUser = createMockUser('exception-user-id');
      mockQueryBuilder.single.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAdminCheck());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isAdmin).toBe(false);
      expect(result.current.error).toBe('Network error');
    });
  });

  describe('Loading State', () => {
    it('should start with loading=true', () => {
      mockUser = createMockUser('loading-test-user');

      const { result } = renderHook(() => useAdminCheck());

      // Initial state should be loading
      expect(result.current.loading).toBe(true);
    });

    it('should set loading=false after check completes', async () => {
      mockUser = createMockUser('loading-complete-user');
      mockSupabaseResponse = { data: { is_admin: true }, error: null };
      mockQueryBuilder.single.mockResolvedValue(mockSupabaseResponse);

      const { result } = renderHook(() => useAdminCheck());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe('User Changes', () => {
    it('should re-check admin status when user changes', async () => {
      // Start with admin user
      mockUser = createMockUser('admin-user');
      mockSupabaseResponse = { data: { is_admin: true }, error: null };
      mockQueryBuilder.single.mockResolvedValue(mockSupabaseResponse);

      const { result, rerender } = renderHook(() => useAdminCheck());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isAdmin).toBe(true);

      // Change to non-admin user
      mockUser = createMockUser('regular-user');
      mockSupabaseResponse = { data: { is_admin: false }, error: null };
      mockQueryBuilder.single.mockResolvedValue(mockSupabaseResponse);

      rerender();

      await waitFor(() => {
        expect(result.current.isAdmin).toBe(false);
      });
    });
  });
});
