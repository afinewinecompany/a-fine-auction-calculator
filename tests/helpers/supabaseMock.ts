import { vi } from 'vitest';
import type { Database } from '../../src/types/database.types';

// Type aliases for convenience
type User = Database['public']['Tables']['users']['Row'];

/**
 * Mock user data for testing
 * Represents a row in the users table (migration 002_users_auth.sql)
 * Uses valid UUIDs and past dates for test fidelity
 */
export const mockUser: User = {
  id: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID v4 format
  email: 'test@example.com',
  display_name: 'Test User',
  avatar_url: 'https://example.com/avatar.jpg',
  onboarding_completed: true,
  is_admin: false,
  created_at: '2024-06-15T10:30:00.000Z', // Past date for realistic testing
  updated_at: '2024-06-15T10:30:00.000Z',
};

/**
 * Mock admin user for testing admin functionality
 * Uses valid UUIDs and past dates for test fidelity
 */
export const mockAdminUser: User = {
  id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8', // Valid UUID v1 format
  email: 'admin@example.com',
  display_name: 'Admin User',
  avatar_url: null,
  onboarding_completed: true,
  is_admin: true,
  created_at: '2024-06-01T08:00:00.000Z', // Past date for realistic testing
  updated_at: '2024-06-10T14:22:00.000Z', // Updated later than created
};

/**
 * Creates a chainable query builder mock
 * Supports method chaining like: from('users').select('*').eq('id', '123').single()
 */
const createQueryBuilder = () => {
  const builder: Record<string, ReturnType<typeof vi.fn>> = {};

  // All methods return the builder for chaining
  const chainableMethods = [
    'select',
    'insert',
    'update',
    'delete',
    'upsert',
    'eq',
    'neq',
    'gt',
    'lt',
    'gte',
    'lte',
    'like',
    'ilike',
    'is',
    'in',
    'contains',
    'containedBy',
    'range',
    'textSearch',
    'match',
    'not',
    'or',
    'filter',
    'order',
    'limit',
    'offset',
    'single',
    'maybeSingle',
    'csv',
    'returns',
  ];

  chainableMethods.forEach(method => {
    builder[method] = vi.fn().mockReturnValue(builder);
  });

  // Terminal methods that return promises
  builder.then = vi.fn().mockResolvedValue({ data: [], error: null });

  return builder;
};

/**
 * Creates a mock Supabase client for testing
 *
 * Usage in tests:
 * ```typescript
 * import { createMockSupabaseClient, mockUser } from '@/tests/helpers/supabaseMock';
 *
 * const mockSupabase = createMockSupabaseClient();
 *
 * // Mock a specific query response:
 * vi.mocked(mockSupabase.from).mockReturnValue({
 *   ...createQueryBuilder(),
 *   select: vi.fn().mockReturnValue({
 *     eq: vi.fn().mockReturnValue({
 *       single: vi.fn().mockResolvedValue({ data: mockUser, error: null })
 *     })
 *   })
 * });
 * ```
 *
 * @returns Mocked Supabase client with common database and auth methods
 */
export const createMockSupabaseClient = () => ({
  // Database query methods
  from: vi.fn((table: string) => {
    const builder = createQueryBuilder();
    // Default resolved value
    Object.defineProperty(builder, 'then', {
      value: (resolve: (value: { data: unknown; error: null }) => void) => {
        resolve({ data: table === 'users' ? [mockUser] : [], error: null });
      },
    });
    return builder;
  }),

  // Authentication methods
  auth: {
    signInWithPassword: vi.fn().mockResolvedValue({
      data: { user: null, session: null },
      error: null,
    }),
    signInWithOAuth: vi.fn().mockResolvedValue({
      data: { url: 'https://oauth.example.com', provider: 'google' },
      error: null,
    }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    signUp: vi.fn().mockResolvedValue({
      data: { user: null, session: null },
      error: null,
    }),
    getSession: vi.fn().mockResolvedValue({
      data: { session: null },
      error: null,
    }),
    getUser: vi.fn().mockResolvedValue({
      data: { user: null },
      error: null,
    }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    }),
    resetPasswordForEmail: vi.fn().mockResolvedValue({
      data: {},
      error: null,
    }),
    updateUser: vi.fn().mockResolvedValue({
      data: { user: null },
      error: null,
    }),
  },

  // Real-time subscriptions
  channel: vi.fn(() => ({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
    unsubscribe: vi.fn().mockReturnThis(),
  })),

  // Storage methods
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn().mockResolvedValue({ data: { path: 'test/file.jpg' }, error: null }),
      download: vi.fn().mockResolvedValue({ data: new Blob(), error: null }),
      remove: vi.fn().mockResolvedValue({ data: null, error: null }),
      list: vi.fn().mockResolvedValue({ data: [], error: null }),
      getPublicUrl: vi.fn().mockReturnValue({
        data: { publicUrl: 'https://example.com/file.jpg' },
      }),
    })),
  },
});

/**
 * Helper to create a mock Supabase error response
 * @param message - Error message
 * @param code - Error code (optional)
 * @returns Mock error object matching Supabase error structure
 */
export const createMockSupabaseError = (message: string, code?: string) => ({
  message,
  code: code || 'MOCK_ERROR',
  details: '',
  hint: '',
});

/**
 * Helper to create a mock authenticated user (auth.users format, not public.users)
 * Uses valid UUIDs and past dates for test fidelity
 */
export const createMockUser = (overrides?: Partial<{ id: string; email: string }>) => ({
  id: overrides?.id || '550e8400-e29b-41d4-a716-446655440000', // Valid UUID
  email: overrides?.email || 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2024-06-15T10:30:00.000Z', // Past date for realistic testing
});

/**
 * Helper to create a mock user profile (public.users format)
 * This is the user profile stored in our database, not Supabase Auth
 */
export const createMockUserProfile = (overrides?: Partial<User>) => ({
  id: overrides?.id || '550e8400-e29b-41d4-a716-446655440000',
  email: overrides?.email || 'test@example.com',
  display_name: overrides?.display_name ?? 'Test User',
  avatar_url: overrides?.avatar_url ?? 'https://example.com/avatar.jpg',
  is_admin: overrides?.is_admin ?? false,
  created_at: overrides?.created_at || '2024-06-15T10:30:00.000Z',
  updated_at: overrides?.updated_at || '2024-06-15T10:30:00.000Z',
});

/**
 * Helper to create a mock session
 */
export const createMockSession = (user = createMockUser()) => ({
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() / 1000 + 3600,
  token_type: 'bearer',
  user,
});

// Export type for the mock client
export type MockSupabaseClient = ReturnType<typeof createMockSupabaseClient>;
