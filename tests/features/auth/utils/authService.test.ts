/**
 * Auth Service Tests
 *
 * Tests for the authentication service functions (signUp, signIn, signOut, signInWithGoogle, handleOAuthCallback).
 *
 * Story: 2.2 - Implement Email/Password Registration
 * Story: 2.4 - Implement Google OAuth Authentication
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createMockSupabaseClient,
  createMockUser,
  createMockSession,
  createMockSupabaseError,
  createMockUserProfile,
} from '../../../helpers/supabaseMock';

// Mock the supabase module
vi.mock('@/lib/supabase', () => ({
  getSupabase: vi.fn(),
  isSupabaseConfigured: vi.fn(),
}));

// Import after mocking
import {
  signUp,
  signIn,
  signOut,
  getSession,
  signInWithGoogle,
  handleOAuthCallback,
} from '@/features/auth/utils/authService';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

describe('authService', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    vi.mocked(getSupabase).mockReturnValue(
      mockSupabase as unknown as ReturnType<typeof getSupabase>
    );
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('signUp', () => {
    it('should successfully create user account', async () => {
      const mockUser = createMockUser({ email: 'test@example.com' });
      const mockSession = createMockSession(mockUser);

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await signUp({ email: 'test@example.com', password: 'password123' });

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(result.session).toEqual(mockSession);
      expect(result.error).toBeUndefined();
    });

    it('should handle email confirmation required scenario', async () => {
      const mockUser = createMockUser({ email: 'test@example.com' });

      // When email confirmation is required, session is null
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });

      const result = await signUp({ email: 'test@example.com', password: 'password123' });

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(result.session).toBeNull();
      expect(result.emailConfirmationRequired).toBe(true);
    });

    it('should return error for existing email', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: createMockSupabaseError('User already registered'),
      });

      const result = await signUp({ email: 'existing@example.com', password: 'password123' });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('already exists');
    });

    it('should return error for weak password', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: createMockSupabaseError('Password should be at least 6 characters'),
      });

      const result = await signUp({ email: 'test@example.com', password: '123' });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('6 characters');
    });

    it('should return error for invalid email format', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: createMockSupabaseError('Unable to validate email address: invalid format'),
      });

      const result = await signUp({ email: 'notanemail', password: 'password123' });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('valid email');
    });

    it('should handle network errors', async () => {
      mockSupabase.auth.signUp.mockRejectedValue(new Error('Failed to fetch'));

      const result = await signUp({ email: 'test@example.com', password: 'password123' });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('connect');
    });

    it('should return error when Supabase is not configured', async () => {
      vi.mocked(isSupabaseConfigured).mockReturnValue(false);

      const result = await signUp({ email: 'test@example.com', password: 'password123' });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('NOT_CONFIGURED');
    });

    it('should call Supabase signUp with correct parameters', async () => {
      const mockUser = createMockUser();
      const mockSession = createMockSession(mockUser);

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      await signUp({ email: 'test@example.com', password: 'securepassword' });

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'securepassword',
      });
    });
  });

  describe('signIn', () => {
    it('should successfully sign in user', async () => {
      const mockUser = createMockUser({ email: 'test@example.com' });
      const mockSession = createMockSession(mockUser);

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await signIn({ email: 'test@example.com', password: 'password123' });

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(result.session).toEqual(mockSession);
    });

    it('should return error for invalid credentials', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: createMockSupabaseError('Invalid login credentials'),
      });

      const result = await signIn({ email: 'test@example.com', password: 'wrongpassword' });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Invalid');
    });

    it('should return error when Supabase is not configured', async () => {
      vi.mocked(isSupabaseConfigured).mockReturnValue(false);

      const result = await signIn({ email: 'test@example.com', password: 'password123' });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_CONFIGURED');
    });

    it('should return error for email not confirmed', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: createMockSupabaseError('Email not confirmed'),
      });

      const result = await signIn({ email: 'test@example.com', password: 'password123' });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('confirm');
    });

    it('should handle network errors during sign in', async () => {
      mockSupabase.auth.signInWithPassword.mockRejectedValue(new Error('Failed to fetch'));

      const result = await signIn({ email: 'test@example.com', password: 'password123' });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('connect');
    });

    it('should call Supabase signInWithPassword with correct parameters', async () => {
      const mockUser = createMockUser();
      const mockSession = createMockSession(mockUser);

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      await signIn({ email: 'test@example.com', password: 'securepassword' });

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'securepassword',
      });
    });

    it('should return user and session data on successful sign in', async () => {
      const mockUser = createMockUser({ id: 'user-123', email: 'test@example.com' });
      const mockSession = createMockSession(mockUser);

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await signIn({ email: 'test@example.com', password: 'password123' });

      expect(result.success).toBe(true);
      expect(result.user?.id).toBe('user-123');
      expect(result.user?.email).toBe('test@example.com');
      expect(result.session).toBeDefined();
      expect(result.session?.access_token).toBeDefined();
    });

    it('should load and merge user profile from users table after auth', async () => {
      const mockUser = createMockUser({ id: 'user-123', email: 'test@example.com' });
      const mockSession = createMockSession(mockUser);
      const mockProfile = createMockUserProfile({
        id: 'user-123',
        email: 'test@example.com',
        display_name: 'Test Display Name',
        avatar_url: 'https://example.com/avatar.png',
        is_admin: true,
      });

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      // Mock the profile lookup chain
      const mockSingle = vi.fn().mockResolvedValue({ data: mockProfile, error: null });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      mockSupabase.from = vi.fn().mockReturnValue({ select: mockSelect });

      const result = await signIn({ email: 'test@example.com', password: 'password123' });

      expect(result.success).toBe(true);
      // Verify profile data was merged into user_metadata
      expect(result.user?.user_metadata?.display_name).toBe('Test Display Name');
      expect(result.user?.user_metadata?.avatar_url).toBe('https://example.com/avatar.png');
      expect(result.user?.user_metadata?.is_admin).toBe(true);
      // Verify original auth user data is preserved
      expect(result.user?.id).toBe('user-123');
      expect(result.user?.email).toBe('test@example.com');
    });

    it('should gracefully handle profile lookup failure and return auth user', async () => {
      const mockUser = createMockUser({ id: 'user-123', email: 'test@example.com' });
      const mockSession = createMockSession(mockUser);

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      // Mock profile lookup failure
      const mockSingle = vi.fn().mockRejectedValue(new Error('Database error'));
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      mockSupabase.from = vi.fn().mockReturnValue({ select: mockSelect });

      const result = await signIn({ email: 'test@example.com', password: 'password123' });

      // Should still succeed with auth user data
      expect(result.success).toBe(true);
      expect(result.user?.id).toBe('user-123');
      expect(result.user?.email).toBe('test@example.com');
      expect(result.session).toBeDefined();
    });

    it('should return auth user when profile not found in users table', async () => {
      const mockUser = createMockUser({ id: 'user-123', email: 'test@example.com' });
      const mockSession = createMockSession(mockUser);

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      // Mock profile not found (null data)
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      mockSupabase.from = vi.fn().mockReturnValue({ select: mockSelect });

      const result = await signIn({ email: 'test@example.com', password: 'password123' });

      // Should succeed with auth user data (no profile merge)
      expect(result.success).toBe(true);
      expect(result.user?.id).toBe('user-123');
      expect(result.user?.email).toBe('test@example.com');
      // user_metadata should not have profile data
      expect(result.user?.user_metadata?.display_name).toBeUndefined();
    });
  });

  describe('signOut', () => {
    it('should successfully sign out user', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });

      const result = await signOut();

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should handle sign out errors', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        error: createMockSupabaseError('Sign out failed'),
      });

      const result = await signOut();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return error when Supabase is not configured', async () => {
      vi.mocked(isSupabaseConfigured).mockReturnValue(false);

      const result = await signOut();

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_CONFIGURED');
    });
  });

  describe('getSession', () => {
    it('should return current session', async () => {
      const mockUser = createMockUser();
      const mockSession = createMockSession(mockUser);

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await getSession();

      expect(result.session).toEqual(mockSession);
      expect(result.error).toBeNull();
    });

    it('should return null session when not authenticated', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await getSession();

      expect(result.session).toBeNull();
      expect(result.error).toBeNull();
    });

    it('should return null when Supabase is not configured', async () => {
      vi.mocked(isSupabaseConfigured).mockReturnValue(false);

      const result = await getSession();

      expect(result.session).toBeNull();
      expect(result.error).toBeNull();
    });
  });
});

describe('Error Message Mapping', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    vi.mocked(getSupabase).mockReturnValue(
      mockSupabase as unknown as ReturnType<typeof getSupabase>
    );
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const errorMappingCases = [
    {
      supabaseError: 'User already registered',
      expectedMessage: 'already exists',
    },
    {
      supabaseError: 'Invalid login credentials',
      expectedMessage: 'Invalid',
    },
    {
      supabaseError: 'Password should be at least 6 characters',
      expectedMessage: '6 characters',
    },
    {
      supabaseError: 'Unable to validate email address: invalid format',
      expectedMessage: 'valid email',
    },
  ];

  it.each(errorMappingCases)(
    'should map "$supabaseError" to user-friendly message',
    async ({ supabaseError, expectedMessage }) => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: createMockSupabaseError(supabaseError),
      });

      const result = await signUp({ email: 'test@example.com', password: 'password123' });

      expect(result.error?.message).toContain(expectedMessage);
    }
  );
});

/**
 * Google OAuth Tests
 * Story: 2.4 - Implement Google OAuth Authentication
 */
describe('signInWithGoogle - Story 2.4', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    vi.mocked(getSupabase).mockReturnValue(
      mockSupabase as unknown as ReturnType<typeof getSupabase>
    );
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);

    // Mock window.location for OAuth
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'http://localhost:5173',
        href: 'http://localhost:5173/login',
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully initiate Google OAuth sign in', async () => {
    mockSupabase.auth.signInWithOAuth.mockResolvedValue({
      data: { url: 'https://accounts.google.com/oauth/authorize?...' },
      error: null,
    });

    const result = await signInWithGoogle();

    expect(result.success).toBe(true);
    expect(result.provider).toBe('google');
    expect(result.url).toBeDefined();
    expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:5173/login',
        skipBrowserRedirect: false, // PKCE security enhancement
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
  });

  it('should return error when Supabase is not configured', async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(false);

    const result = await signInWithGoogle();

    expect(result.success).toBe(false);
    expect(result.error).toContain('not configured');
  });

  it('should return error when user denies permission', async () => {
    mockSupabase.auth.signInWithOAuth.mockResolvedValue({
      data: { url: null },
      error: createMockSupabaseError('access_denied: User denied consent'),
    });

    const result = await signInWithGoogle();

    expect(result.success).toBe(false);
    expect(result.error).toContain('grant permission');
  });

  it('should handle network errors during OAuth initiation', async () => {
    mockSupabase.auth.signInWithOAuth.mockRejectedValue(new Error('Failed to fetch'));

    const result = await signInWithGoogle();

    expect(result.success).toBe(false);
    expect(result.error).toContain('Unable to connect');
  });

  it('should return configuration error for invalid OAuth setup', async () => {
    mockSupabase.auth.signInWithOAuth.mockResolvedValue({
      data: { url: null },
      error: createMockSupabaseError('Invalid client_id configuration'),
    });

    const result = await signInWithGoogle();

    expect(result.success).toBe(false);
    expect(result.error).toContain('misconfigured');
  });

  it('should return error when provider is not enabled', async () => {
    mockSupabase.auth.signInWithOAuth.mockResolvedValue({
      data: { url: null },
      error: createMockSupabaseError('Provider google is not enabled'),
    });

    const result = await signInWithGoogle();

    expect(result.success).toBe(false);
    expect(result.error).toContain('not available');
  });
});

describe('handleOAuthCallback - Story 2.4', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    vi.mocked(getSupabase).mockReturnValue(
      mockSupabase as unknown as ReturnType<typeof getSupabase>
    );
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully handle OAuth callback with session', async () => {
    const mockUser = createMockUser({ id: 'oauth-user-123', email: 'user@gmail.com' });
    const mockSession = createMockSession(mockUser);
    const mockProfile = createMockUserProfile({
      id: 'oauth-user-123',
      email: 'user@gmail.com',
      display_name: 'OAuth User',
      avatar_url: 'https://lh3.googleusercontent.com/avatar.jpg',
    });

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    // Mock the profile lookup chain
    const mockSingle = vi.fn().mockResolvedValue({ data: mockProfile, error: null });
    const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    mockSupabase.from = vi.fn().mockReturnValue({ select: mockSelect });

    const result = await handleOAuthCallback();

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.session).toBeDefined();
    expect(result.user?.user_metadata?.display_name).toBe('OAuth User');
    expect(result.user?.user_metadata?.avatar_url).toBe(
      'https://lh3.googleusercontent.com/avatar.jpg'
    );
  });

  it('should return error when Supabase is not configured', async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(false);

    const result = await handleOAuthCallback();

    expect(result.success).toBe(false);
    expect(result.error).toContain('not configured');
  });

  it('should return error when no session is found', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const result = await handleOAuthCallback();

    expect(result.success).toBe(false);
    expect(result.error).toContain('No active session');
  });

  it('should return error when session retrieval fails', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: createMockSupabaseError('Session expired'),
    });

    const result = await handleOAuthCallback();

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should succeed with session even if profile lookup fails', async () => {
    const mockUser = createMockUser({ id: 'oauth-user-123', email: 'user@gmail.com' });
    const mockSession = createMockSession(mockUser);

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    // Mock profile lookup failure
    const mockSingle = vi.fn().mockRejectedValue(new Error('Database error'));
    const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    mockSupabase.from = vi.fn().mockReturnValue({ select: mockSelect });

    const result = await handleOAuthCallback();

    // Should still succeed with auth user data (graceful degradation)
    expect(result.success).toBe(true);
    expect(result.user?.id).toBe('oauth-user-123');
    expect(result.session).toBeDefined();
  });

  it('should succeed with session when profile not found', async () => {
    const mockUser = createMockUser({ id: 'oauth-user-123', email: 'user@gmail.com' });
    const mockSession = createMockSession(mockUser);

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    // Mock profile not found
    const mockSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    mockSupabase.from = vi.fn().mockReturnValue({ select: mockSelect });

    const result = await handleOAuthCallback();

    // Should succeed with auth user data
    expect(result.success).toBe(true);
    expect(result.user?.id).toBe('oauth-user-123');
    expect(result.session).toBeDefined();
  });

  it('should handle unexpected errors during callback', async () => {
    mockSupabase.auth.getSession.mockRejectedValue(new Error('Unexpected error'));

    const result = await handleOAuthCallback();

    expect(result.success).toBe(false);
    expect(result.error).toContain('error occurred');
  });
});

describe('OAuth Error Message Mapping - Story 2.4', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    vi.mocked(getSupabase).mockReturnValue(
      mockSupabase as unknown as ReturnType<typeof getSupabase>
    );
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);

    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:5173' },
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const oauthErrorMappingCases = [
    {
      supabaseError: 'access_denied',
      expectedMessage: 'grant permission',
    },
    {
      supabaseError: 'User cancelled the authorization',
      expectedMessage: 'grant permission',
    },
    {
      supabaseError: 'Invalid client_id configuration',
      expectedMessage: 'misconfigured',
    },
    {
      supabaseError: 'Invalid redirect_uri',
      expectedMessage: 'misconfigured',
    },
    {
      supabaseError: 'Failed to fetch',
      expectedMessage: 'Unable to connect',
    },
    {
      supabaseError: 'Network error',
      expectedMessage: 'Unable to connect',
    },
    {
      supabaseError: 'Provider google is not enabled',
      expectedMessage: 'not available',
    },
  ];

  it.each(oauthErrorMappingCases)(
    'should map OAuth error "$supabaseError" to user-friendly message',
    async ({ supabaseError, expectedMessage }) => {
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({
        data: { url: null },
        error: createMockSupabaseError(supabaseError),
      });

      const result = await signInWithGoogle();

      expect(result.success).toBe(false);
      expect(result.error).toContain(expectedMessage);
    }
  );
});
