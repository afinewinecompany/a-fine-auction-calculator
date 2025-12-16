/**
 * Authentication Store (Zustand)
 *
 * Global state management for authentication.
 * Uses Zustand persist middleware for session persistence across refreshes.
 *
 * Story: 2.2 - Implement Email/Password Registration
 * Story: 2.4 - Implement Google OAuth Authentication
 * Related: Story 2.8 - Create Auth Store with Zustand (foundation)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, Session } from '@supabase/supabase-js';
import type {
  AuthStore,
  AuthResponse,
  OAuthInitResponse,
  OAuthCallbackResponse,
} from '../types/auth.types';
import * as authService from '../utils/authService';

/**
 * Initial auth state
 */
const initialState = {
  user: null as User | null,
  session: null as Session | null,
  isLoading: false,
  error: null as string | null,
  isInitialized: false,
};

/**
 * Auth store with Zustand persist middleware
 *
 * State persistence:
 * - User and session are persisted to localStorage
 * - Session expiration: 30 days (Supabase default, NFR-S2)
 * - Automatically rehydrates on page refresh
 *
 * @example
 * ```typescript
 * const { user, signUp, isLoading } = useAuthStore();
 *
 * const handleRegister = async () => {
 *   const result = await signUp(email, password);
 *   if (result.success) {
 *     navigate('/leagues');
 *   }
 * };
 * ```
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      ...initialState,

      // Actions

      /**
       * Sign up with email and password
       */
      signUp: async (email: string, password: string): Promise<AuthResponse> => {
        // Clear any previous errors and set loading
        set({ isLoading: true, error: null });

        const response = await authService.signUp({ email, password });

        if (response.success) {
          set({
            user: response.user ?? null,
            session: response.session ?? null,
            isLoading: false,
            error: null,
          });
        } else {
          set({
            isLoading: false,
            error: response.error?.message ?? 'Registration failed',
          });
        }

        return response;
      },

      /**
       * Sign in with email and password
       * (Foundation for Story 2.3)
       */
      signIn: async (email: string, password: string): Promise<AuthResponse> => {
        set({ isLoading: true, error: null });

        const response = await authService.signIn({ email, password });

        if (response.success) {
          set({
            user: response.user ?? null,
            session: response.session ?? null,
            isLoading: false,
            error: null,
          });
        } else {
          set({
            isLoading: false,
            error: response.error?.message ?? 'Sign in failed',
          });
        }

        return response;
      },

      /**
       * Sign in with Google OAuth
       * Story: 2.4 - Implement Google OAuth Authentication
       *
       * Initiates Google OAuth flow. Redirect to Google happens automatically.
       * After redirect back, call handleOAuthCallback to complete authentication.
       */
      signInWithGoogle: async (): Promise<OAuthInitResponse> => {
        set({ isLoading: true, error: null });

        const response = await authService.signInWithGoogle();

        if (!response.success) {
          set({
            isLoading: false,
            error: response.error ?? 'Google sign in failed',
          });
        } else {
          // On success, redirect to Google happens automatically
          // Set a timeout to reset isLoading in case redirect is blocked/delayed
          // This prevents perpetual loading state if popup is blocked or user navigates away
          setTimeout(() => {
            const currentState = get();
            // Only reset if still loading and no session established
            if (currentState.isLoading && !currentState.session) {
              set({ isLoading: false });
            }
          }, 10000); // 10 second timeout for redirect
        }

        return response;
      },

      /**
       * Handle OAuth callback after redirect from provider
       * Story: 2.4 - Implement Google OAuth Authentication
       *
       * Called on page load to check for OAuth callback.
       * Updates store with user and session if callback is successful.
       */
      handleOAuthCallback: async (): Promise<OAuthCallbackResponse> => {
        set({ isLoading: true, error: null });

        const response = await authService.handleOAuthCallback();

        if (response.success) {
          set({
            user: response.user ?? null,
            session: response.session ?? null,
            isLoading: false,
            error: null,
          });
        } else {
          set({
            user: null,
            session: null,
            isLoading: false,
            error: response.error ?? 'OAuth authentication failed',
          });
        }

        return response;
      },

      /**
       * Sign out current user
       * (Foundation for Story 2.5)
       */
      signOut: async (): Promise<void> => {
        set({ isLoading: true, error: null });

        const result = await authService.signOut();

        if (result.success) {
          set({
            user: null,
            session: null,
            isLoading: false,
            error: null,
          });
        } else {
          set({
            isLoading: false,
            error: result.error?.message ?? 'Sign out failed',
          });
        }
      },

      /**
       * Set user directly (for auth state changes)
       */
      setUser: (user: User | null) => {
        set({ user });
      },

      /**
       * Set session directly (for auth state changes)
       */
      setSession: (session: Session | null) => {
        set({ session });
      },

      /**
       * Set loading state
       */
      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      /**
       * Set error message
       */
      setError: (error: string | null) => {
        set({ error });
      },

      /**
       * Clear error message
       */
      clearError: () => {
        set({ error: null });
      },

      /**
       * Initialize auth state from Supabase session
       * Called on app mount to restore auth state
       */
      initialize: async (): Promise<void> => {
        // Skip if already initialized
        if (get().isInitialized) {
          return;
        }

        set({ isLoading: true });

        try {
          const { session, error } = await authService.getSession();

          if (error) {
            set({
              user: null,
              session: null,
              isLoading: false,
              isInitialized: true,
              error: error.message,
            });
            return;
          }

          set({
            user: session?.user ?? null,
            session: session ?? null,
            isLoading: false,
            isInitialized: true,
            error: null,
          });

          // Set up auth state listener
          authService.onAuthStateChange((event, newSession) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              set({
                user: newSession?.user ?? null,
                session: newSession ?? null,
              });
            } else if (event === 'SIGNED_OUT') {
              set({
                user: null,
                session: null,
              });
            }
          });
        } catch {
          set({
            user: null,
            session: null,
            isLoading: false,
            isInitialized: true,
            error: 'Failed to initialize authentication',
          });
        }
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist user and session (not loading/error states)
      partialize: state => ({
        user: state.user,
        session: state.session,
        isInitialized: state.isInitialized,
      }),
    }
  )
);

// Selector hooks for common patterns
export const useUser = () => useAuthStore(state => state.user);
export const useSession = () => useAuthStore(state => state.session);
export const useIsAuthenticated = () =>
  useAuthStore(state => state.user !== null && state.session !== null);
export const useAuthLoading = () => useAuthStore(state => state.isLoading);
export const useAuthError = () => useAuthStore(state => state.error);
