/**
 * Auth Store Tests
 *
 * Tests for the Zustand auth store (state management and actions).
 *
 * Story: 2.2 - Implement Email/Password Registration
 * Story: 2.4 - Implement Google OAuth Authentication
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { createMockUser, createMockSession } from '../../../helpers/supabaseMock';

// Mock the auth service
vi.mock('@/features/auth/utils/authService', () => ({
  signUp: vi.fn(),
  signIn: vi.fn(),
  signInWithGoogle: vi.fn(),
  handleOAuthCallback: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(() => ({ unsubscribe: vi.fn() })),
}));

// Import after mocking
import {
  useAuthStore,
  useUser,
  useSession,
  useIsAuthenticated,
  useAuthLoading,
  useAuthError,
} from '@/features/auth/stores/authStore';
import * as authService from '@/features/auth/utils/authService';

describe('authStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { getState } = useAuthStore;
    act(() => {
      getState().setUser(null);
      getState().setSession(null);
      getState().setLoading(false);
      getState().setError(null);
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have null user initially', () => {
      const { result } = renderHook(() => useUser());
      expect(result.current).toBeNull();
    });

    it('should have null session initially', () => {
      const { result } = renderHook(() => useSession());
      expect(result.current).toBeNull();
    });

    it('should not be authenticated initially', () => {
      const { result } = renderHook(() => useIsAuthenticated());
      expect(result.current).toBe(false);
    });

    it('should not be loading initially', () => {
      const { result } = renderHook(() => useAuthLoading());
      expect(result.current).toBe(false);
    });

    it('should have no error initially', () => {
      const { result } = renderHook(() => useAuthError());
      expect(result.current).toBeNull();
    });
  });

  describe('signUp action', () => {
    it('should update user and session on successful signUp', async () => {
      const mockUser = createMockUser({ email: 'test@example.com' });
      const mockSession = createMockSession(mockUser);

      vi.mocked(authService.signUp).mockResolvedValue({
        success: true,
        user: mockUser,
        session: mockSession,
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.signUp('test@example.com', 'password123');
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.session).toEqual(mockSession);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should set error on failed signUp', async () => {
      vi.mocked(authService.signUp).mockResolvedValue({
        success: false,
        error: { message: 'Registration failed' },
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.signUp('test@example.com', 'password123');
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.error).toBe('Registration failed');
      expect(result.current.isLoading).toBe(false);
    });

    it('should set isLoading during signUp', async () => {
      let resolveSignUp: (value: unknown) => void;
      const signUpPromise = new Promise(resolve => {
        resolveSignUp = resolve;
      });

      vi.mocked(authService.signUp).mockReturnValue(signUpPromise as Promise<never>);

      const { result } = renderHook(() => useAuthStore());

      // Start signUp (don't await)
      act(() => {
        result.current.signUp('test@example.com', 'password123');
      });

      // Check loading is true during operation
      expect(result.current.isLoading).toBe(true);

      // Complete the signUp
      await act(async () => {
        resolveSignUp!({ success: true, user: createMockUser(), session: createMockSession() });
      });

      // Loading should be false after completion
      expect(result.current.isLoading).toBe(false);
    });

    it('should clear previous error on new signUp attempt', async () => {
      const { result } = renderHook(() => useAuthStore());

      // Set an initial error
      act(() => {
        result.current.setError('Previous error');
      });

      expect(result.current.error).toBe('Previous error');

      // Mock successful signUp
      vi.mocked(authService.signUp).mockResolvedValue({
        success: true,
        user: createMockUser(),
        session: createMockSession(),
      });

      await act(async () => {
        await result.current.signUp('test@example.com', 'password123');
      });

      expect(result.current.error).toBeNull();
    });

    it('should return AuthResponse from signUp', async () => {
      const mockUser = createMockUser();
      const mockSession = createMockSession(mockUser);
      const mockResponse = {
        success: true,
        user: mockUser,
        session: mockSession,
      };

      vi.mocked(authService.signUp).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuthStore());

      let response;
      await act(async () => {
        response = await result.current.signUp('test@example.com', 'password123');
      });

      expect(response).toEqual(mockResponse);
    });
  });

  describe('signIn action', () => {
    it('should update user and session on successful signIn', async () => {
      const mockUser = createMockUser({ email: 'test@example.com' });
      const mockSession = createMockSession(mockUser);

      vi.mocked(authService.signIn).mockResolvedValue({
        success: true,
        user: mockUser,
        session: mockSession,
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.signIn('test@example.com', 'password123');
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.session).toEqual(mockSession);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should set error on failed signIn', async () => {
      vi.mocked(authService.signIn).mockResolvedValue({
        success: false,
        error: { message: 'Invalid credentials' },
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.signIn('test@example.com', 'wrongpassword');
      });

      expect(result.current.error).toBe('Invalid credentials');
      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should set isLoading during signIn', async () => {
      let resolveSignIn: (value: unknown) => void;
      const signInPromise = new Promise(resolve => {
        resolveSignIn = resolve;
      });

      vi.mocked(authService.signIn).mockReturnValue(signInPromise as Promise<never>);

      const { result } = renderHook(() => useAuthStore());

      // Start signIn (don't await)
      act(() => {
        result.current.signIn('test@example.com', 'password123');
      });

      // Check loading is true during operation
      expect(result.current.isLoading).toBe(true);

      // Complete the signIn
      await act(async () => {
        resolveSignIn!({ success: true, user: createMockUser(), session: createMockSession() });
      });

      // Loading should be false after completion
      expect(result.current.isLoading).toBe(false);
    });

    it('should clear previous error on new signIn attempt', async () => {
      const { result } = renderHook(() => useAuthStore());

      // Set an initial error
      act(() => {
        result.current.setError('Previous error');
      });

      expect(result.current.error).toBe('Previous error');

      // Mock successful signIn
      vi.mocked(authService.signIn).mockResolvedValue({
        success: true,
        user: createMockUser(),
        session: createMockSession(),
      });

      await act(async () => {
        await result.current.signIn('test@example.com', 'password123');
      });

      expect(result.current.error).toBeNull();
    });

    it('should return AuthResponse from signIn', async () => {
      const mockUser = createMockUser();
      const mockSession = createMockSession(mockUser);
      const mockResponse = {
        success: true,
        user: mockUser,
        session: mockSession,
      };

      vi.mocked(authService.signIn).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuthStore());

      let response;
      await act(async () => {
        response = await result.current.signIn('test@example.com', 'password123');
      });

      expect(response).toEqual(mockResponse);
    });
  });

  describe('signOut action', () => {
    it('should clear user and session on signOut', async () => {
      const mockUser = createMockUser();
      const mockSession = createMockSession(mockUser);

      vi.mocked(authService.signOut).mockResolvedValue({ success: true });

      const { result } = renderHook(() => useAuthStore());

      // Set initial authenticated state
      act(() => {
        result.current.setUser(mockUser);
        result.current.setSession(mockSession);
      });

      expect(result.current.user).toBeDefined();
      expect(result.current.session).toBeDefined();

      await act(async () => {
        await result.current.signOut();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
    });

    it('should set error on failed signOut', async () => {
      vi.mocked(authService.signOut).mockResolvedValue({
        success: false,
        error: { message: 'Sign out failed' },
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.signOut();
      });

      expect(result.current.error).toBe('Sign out failed');
    });
  });

  describe('Setter actions', () => {
    it('should set user directly', () => {
      const mockUser = createMockUser();
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setUser(mockUser);
      });

      expect(result.current.user).toEqual(mockUser);
    });

    it('should set session directly', () => {
      const mockSession = createMockSession();
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setSession(mockSession);
      });

      expect(result.current.session).toEqual(mockSession);
    });

    it('should set loading state', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should set error message', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setError('Test error');
      });

      expect(result.current.error).toBe('Test error');
    });

    it('should clear error', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setError('Test error');
      });

      expect(result.current.error).toBe('Test error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('initialize action', () => {
    it('should restore session from Supabase on initialize', async () => {
      const mockUser = createMockUser({ email: 'test@example.com' });
      const mockSession = createMockSession(mockUser);

      vi.mocked(authService.getSession).mockResolvedValue({
        session: mockSession,
        error: null,
      });

      const { result } = renderHook(() => useAuthStore());

      // Reset isInitialized for this test
      act(() => {
        useAuthStore.setState({ isInitialized: false });
      });

      await act(async () => {
        await result.current.initialize();
      });

      expect(result.current.user).toEqual(mockSession.user);
      expect(result.current.session).toEqual(mockSession);
      expect(result.current.isInitialized).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle initialize with no existing session', async () => {
      vi.mocked(authService.getSession).mockResolvedValue({
        session: null,
        error: null,
      });

      const { result } = renderHook(() => useAuthStore());

      // Reset isInitialized for this test
      act(() => {
        useAuthStore.setState({ isInitialized: false });
      });

      await act(async () => {
        await result.current.initialize();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.isInitialized).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle getSession error during initialize', async () => {
      vi.mocked(authService.getSession).mockResolvedValue({
        session: null,
        error: { message: 'Session retrieval failed' },
      });

      const { result } = renderHook(() => useAuthStore());

      // Reset isInitialized for this test
      act(() => {
        useAuthStore.setState({ isInitialized: false });
      });

      await act(async () => {
        await result.current.initialize();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.isInitialized).toBe(true);
      expect(result.current.error).toBe('Session retrieval failed');
    });

    it('should not re-initialize if already initialized', async () => {
      vi.mocked(authService.getSession).mockResolvedValue({
        session: null,
        error: null,
      });

      const { result } = renderHook(() => useAuthStore());

      // Set isInitialized to true
      act(() => {
        useAuthStore.setState({ isInitialized: true });
      });

      await act(async () => {
        await result.current.initialize();
      });

      // getSession should not have been called since already initialized
      expect(authService.getSession).not.toHaveBeenCalled();
    });

    it('should set up auth state change listener on initialize', async () => {
      const mockUser = createMockUser();
      const mockSession = createMockSession(mockUser);

      vi.mocked(authService.getSession).mockResolvedValue({
        session: mockSession,
        error: null,
      });

      const { result } = renderHook(() => useAuthStore());

      // Reset isInitialized for this test
      act(() => {
        useAuthStore.setState({ isInitialized: false });
      });

      await act(async () => {
        await result.current.initialize();
      });

      expect(authService.onAuthStateChange).toHaveBeenCalled();
    });

    it('should update state on SIGNED_IN auth event', async () => {
      const mockUser = createMockUser();
      const mockSession = createMockSession(mockUser);
      let authChangeCallback: (event: string, session: unknown) => void = () => {};

      vi.mocked(authService.getSession).mockResolvedValue({
        session: null,
        error: null,
      });

      vi.mocked(authService.onAuthStateChange).mockImplementation(
        (callback: (event: string, session: unknown) => void) => {
          authChangeCallback = callback;
          return { unsubscribe: vi.fn() };
        }
      );

      const { result } = renderHook(() => useAuthStore());

      // Reset isInitialized for this test
      act(() => {
        useAuthStore.setState({ isInitialized: false });
      });

      await act(async () => {
        await result.current.initialize();
      });

      // Simulate SIGNED_IN event
      act(() => {
        authChangeCallback('SIGNED_IN', mockSession);
      });

      expect(result.current.user).toEqual(mockSession.user);
      expect(result.current.session).toEqual(mockSession);
    });

    it('should clear state on SIGNED_OUT auth event', async () => {
      const mockUser = createMockUser();
      const mockSession = createMockSession(mockUser);
      let authChangeCallback: (event: string, session: unknown) => void = () => {};

      vi.mocked(authService.getSession).mockResolvedValue({
        session: mockSession,
        error: null,
      });

      vi.mocked(authService.onAuthStateChange).mockImplementation(
        (callback: (event: string, session: unknown) => void) => {
          authChangeCallback = callback;
          return { unsubscribe: vi.fn() };
        }
      );

      const { result } = renderHook(() => useAuthStore());

      // Reset isInitialized for this test
      act(() => {
        useAuthStore.setState({ isInitialized: false });
      });

      await act(async () => {
        await result.current.initialize();
      });

      // Verify session is set
      expect(result.current.session).toEqual(mockSession);

      // Simulate SIGNED_OUT event
      act(() => {
        authChangeCallback('SIGNED_OUT', null);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
    });

    it('should update state on TOKEN_REFRESHED auth event', async () => {
      const initialUser = createMockUser({ email: 'test@example.com' });
      const initialSession = createMockSession(initialUser);

      // Create refreshed session with new token
      const refreshedUser = createMockUser({ email: 'test@example.com' });
      const refreshedSession = {
        ...createMockSession(refreshedUser),
        access_token: 'new-refreshed-access-token',
      };

      let authChangeCallback: (event: string, session: unknown) => void = () => {};

      vi.mocked(authService.getSession).mockResolvedValue({
        session: initialSession,
        error: null,
      });

      vi.mocked(authService.onAuthStateChange).mockImplementation(
        (callback: (event: string, session: unknown) => void) => {
          authChangeCallback = callback;
          return { unsubscribe: vi.fn() };
        }
      );

      const { result } = renderHook(() => useAuthStore());

      // Reset isInitialized for this test
      act(() => {
        useAuthStore.setState({ isInitialized: false });
      });

      await act(async () => {
        await result.current.initialize();
      });

      // Verify initial session is set
      expect(result.current.session).toEqual(initialSession);

      // Simulate TOKEN_REFRESHED event
      act(() => {
        authChangeCallback('TOKEN_REFRESHED', refreshedSession);
      });

      // Session should be updated with refreshed token
      expect(result.current.session).toEqual(refreshedSession);
      expect(result.current.session?.access_token).toBe('new-refreshed-access-token');
      expect(result.current.user).toEqual(refreshedSession.user);
    });

    it('should handle exception during initialize', async () => {
      vi.mocked(authService.getSession).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAuthStore());

      // Reset isInitialized for this test
      act(() => {
        useAuthStore.setState({ isInitialized: false });
      });

      await act(async () => {
        await result.current.initialize();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.isInitialized).toBe(true);
      expect(result.current.error).toBe('Failed to initialize authentication');
    });
  });

  describe('Selector hooks', () => {
    it('useIsAuthenticated should return true when user and session exist', () => {
      const mockUser = createMockUser();
      const mockSession = createMockSession(mockUser);
      const { result: authResult } = renderHook(() => useAuthStore());

      act(() => {
        authResult.current.setUser(mockUser);
        authResult.current.setSession(mockSession);
      });

      const { result } = renderHook(() => useIsAuthenticated());
      expect(result.current).toBe(true);
    });

    it('useIsAuthenticated should return false when user is null', () => {
      const mockSession = createMockSession();
      const { result: authResult } = renderHook(() => useAuthStore());

      act(() => {
        authResult.current.setUser(null);
        authResult.current.setSession(mockSession);
      });

      const { result } = renderHook(() => useIsAuthenticated());
      expect(result.current).toBe(false);
    });

    it('useIsAuthenticated should return false when session is null', () => {
      const mockUser = createMockUser();
      const { result: authResult } = renderHook(() => useAuthStore());

      act(() => {
        authResult.current.setUser(mockUser);
        authResult.current.setSession(null);
      });

      const { result } = renderHook(() => useIsAuthenticated());
      expect(result.current).toBe(false);
    });
  });
});

/**
 * Google OAuth Store Tests
 * Story: 2.4 - Implement Google OAuth Authentication
 */
describe('authStore OAuth - Story 2.4', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { getState } = useAuthStore;
    act(() => {
      getState().setUser(null);
      getState().setSession(null);
      getState().setLoading(false);
      getState().setError(null);
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('signInWithGoogle action', () => {
    it('should set loading state during Google sign in', async () => {
      let resolveSignIn: (value: unknown) => void;
      const signInPromise = new Promise(resolve => {
        resolveSignIn = resolve;
      });

      vi.mocked(authService.signInWithGoogle).mockReturnValue(signInPromise as Promise<never>);

      const { result } = renderHook(() => useAuthStore());

      // Start sign in (don't await)
      act(() => {
        result.current.signInWithGoogle();
      });

      // Check loading is true during operation
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBeNull();

      // Complete the sign in
      await act(async () => {
        resolveSignIn!({ success: true, provider: 'google' });
      });
    });

    it('should set error on failed Google sign in', async () => {
      vi.mocked(authService.signInWithGoogle).mockResolvedValue({
        success: false,
        error: 'You must grant permission to continue',
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.signInWithGoogle();
      });

      expect(result.current.error).toBe('You must grant permission to continue');
      expect(result.current.isLoading).toBe(false);
    });

    it('should clear previous error on new Google sign in attempt', async () => {
      const { result } = renderHook(() => useAuthStore());

      // Set an initial error
      act(() => {
        result.current.setError('Previous error');
      });

      expect(result.current.error).toBe('Previous error');

      // Mock successful sign in
      vi.mocked(authService.signInWithGoogle).mockResolvedValue({
        success: true,
        provider: 'google',
      });

      await act(async () => {
        await result.current.signInWithGoogle();
      });

      expect(result.current.error).toBeNull();
    });

    it('should return OAuthInitResponse from signInWithGoogle', async () => {
      const mockResponse = {
        success: true,
        url: 'https://accounts.google.com/oauth',
        provider: 'google' as const,
      };

      vi.mocked(authService.signInWithGoogle).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuthStore());

      let response;
      await act(async () => {
        response = await result.current.signInWithGoogle();
      });

      expect(response).toEqual(mockResponse);
    });
  });

  describe('handleOAuthCallback action', () => {
    it('should update user and session on successful OAuth callback', async () => {
      const mockUser = createMockUser({ email: 'user@gmail.com' });
      const mockSession = createMockSession(mockUser);

      vi.mocked(authService.handleOAuthCallback).mockResolvedValue({
        success: true,
        user: mockUser,
        session: mockSession,
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.handleOAuthCallback();
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.session).toEqual(mockSession);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should set error on failed OAuth callback', async () => {
      vi.mocked(authService.handleOAuthCallback).mockResolvedValue({
        success: false,
        error: 'No active session found',
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.handleOAuthCallback();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.error).toBe('No active session found');
      expect(result.current.isLoading).toBe(false);
    });

    it('should set loading state during OAuth callback processing', async () => {
      let resolveCallback: (value: unknown) => void;
      const callbackPromise = new Promise(resolve => {
        resolveCallback = resolve;
      });

      vi.mocked(authService.handleOAuthCallback).mockReturnValue(callbackPromise as Promise<never>);

      const { result } = renderHook(() => useAuthStore());

      // Start callback processing (don't await)
      act(() => {
        result.current.handleOAuthCallback();
      });

      // Check loading is true during operation
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBeNull();

      // Complete the callback
      await act(async () => {
        resolveCallback!({ success: true, user: createMockUser(), session: createMockSession() });
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should return OAuthCallbackResponse from handleOAuthCallback', async () => {
      const mockUser = createMockUser();
      const mockSession = createMockSession(mockUser);
      const mockResponse = {
        success: true,
        user: mockUser,
        session: mockSession,
      };

      vi.mocked(authService.handleOAuthCallback).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuthStore());

      let response;
      await act(async () => {
        response = await result.current.handleOAuthCallback();
      });

      expect(response).toEqual(mockResponse);
    });

    it('should clear user and session on OAuth callback error', async () => {
      const mockUser = createMockUser();
      const mockSession = createMockSession(mockUser);

      const { result } = renderHook(() => useAuthStore());

      // Set initial authenticated state
      act(() => {
        result.current.setUser(mockUser);
        result.current.setSession(mockSession);
      });

      expect(result.current.user).toBeDefined();
      expect(result.current.session).toBeDefined();

      // Mock failed callback
      vi.mocked(authService.handleOAuthCallback).mockResolvedValue({
        success: false,
        error: 'OAuth authentication failed',
      });

      await act(async () => {
        await result.current.handleOAuthCallback();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.error).toBe('OAuth authentication failed');
    });
  });
});
