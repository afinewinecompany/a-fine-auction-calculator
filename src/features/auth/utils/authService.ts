/**
 * Authentication Service
 *
 * Wrapper around Supabase Auth API for authentication operations.
 * Provides consistent error handling and response structure.
 *
 * Story: 2.2 - Implement Email/Password Registration
 * Story: 2.4 - Implement Google OAuth Authentication
 */

import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type {
  AuthResponse,
  AuthError,
  SignUpCredentials,
  SignInCredentials,
  OAuthInitResponse,
  OAuthCallbackResponse,
} from '../types/auth.types';

/**
 * Map Supabase auth errors to user-friendly messages
 */
const mapAuthError = (errorMessage: string): string => {
  const errorMappings: Record<string, string> = {
    'User already registered': 'An account with this email already exists',
    'Invalid login credentials': 'Invalid email or password',
    'Email not confirmed': 'Please check your email and confirm your account',
    // Supabase may return 6-char error; our client validates 8 chars so this shouldn't normally appear
    'Password should be at least 6 characters': 'Password must be at least 6 characters',
    'Unable to validate email address: invalid format': 'Please enter a valid email address',
    'Signup requires a valid password': 'Password is required',
    'Anonymous sign-ins are disabled': 'Please provide an email and password',
  };

  // Check for partial matches in error message
  for (const [key, value] of Object.entries(errorMappings)) {
    if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  // Check for specific patterns
  if (errorMessage.includes('already registered')) {
    return 'An account with this email already exists';
  }

  if (errorMessage.includes('password')) {
    return 'Invalid password';
  }

  if (errorMessage.includes('email')) {
    return 'Please enter a valid email address';
  }

  // Network/connection errors
  if (
    errorMessage.includes('fetch') ||
    errorMessage.includes('network') ||
    errorMessage.includes('Failed to fetch')
  ) {
    return 'Unable to connect. Please check your internet connection and try again.';
  }

  // Default error message
  return 'An error occurred. Please try again.';
};

/**
 * Create an AuthError from a Supabase error or generic error
 */
const createAuthError = (error: unknown): AuthError => {
  if (error && typeof error === 'object' && 'message' in error) {
    const errorObj = error as { message: string; code?: string };
    return {
      message: mapAuthError(errorObj.message),
      code: errorObj.code,
      originalError: error as Error,
    };
  }

  return {
    message: 'An unexpected error occurred. Please try again.',
    originalError: error instanceof Error ? error : null,
  };
};

/**
 * Sign up a new user with email and password
 *
 * @param credentials - Email and password for registration
 * @returns AuthResponse with user and session on success, error on failure
 *
 * @example
 * ```typescript
 * const result = await signUp({ email: 'user@example.com', password: 'password123' });
 * if (result.success) {
 *   console.log('User created:', result.user);
 * } else {
 *   console.error('Error:', result.error?.message);
 * }
 * ```
 */
export const signUp = async (credentials: SignUpCredentials): Promise<AuthResponse> => {
  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: {
        message: 'Authentication service is not configured. Please contact support.',
        code: 'NOT_CONFIGURED',
      },
    };
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      return {
        success: false,
        error: createAuthError(error),
      };
    }

    // Check if email confirmation is required
    // When email confirmation is enabled, user is returned but session is null
    const emailConfirmationRequired = !!(data.user && !data.session);

    return {
      success: true,
      user: data.user,
      session: data.session,
      emailConfirmationRequired,
    };
  } catch (error) {
    return {
      success: false,
      error: createAuthError(error),
    };
  }
};

/**
 * Sign in a user with email and password
 *
 * @param credentials - Email and password for login
 * @returns AuthResponse with user and session on success, error on failure
 *
 * Story: 2.3 - Implement Email/Password Login
 * Loads user profile from users table after authentication per Architecture requirements.
 */
export const signIn = async (credentials: SignInCredentials): Promise<AuthResponse> => {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: {
        message: 'Authentication service is not configured. Please contact support.',
        code: 'NOT_CONFIGURED',
      },
    };
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      return {
        success: false,
        error: createAuthError(error),
      };
    }

    // Load user profile from users table after successful authentication
    // This ensures we have the full user profile (display_name, avatar_url, etc.)
    // not just the auth user data from Supabase Auth
    if (data.user && data.session) {
      try {
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        // Merge profile data into user_metadata of the auth user
        // This preserves the Supabase User type while adding profile data
        if (userProfile) {
          const enrichedUser = {
            ...data.user,
            user_metadata: {
              ...data.user.user_metadata,
              display_name: userProfile.display_name,
              avatar_url: userProfile.avatar_url,
              is_admin: userProfile.is_admin,
            },
          };
          return {
            success: true,
            user: enrichedUser,
            session: data.session,
          };
        }

        // Profile not found - return auth user as-is
        return {
          success: true,
          user: data.user,
          session: data.session,
        };
      } catch {
        // Profile lookup failed but auth succeeded - still return success
        // with the auth user data (graceful degradation)
        return {
          success: true,
          user: data.user,
          session: data.session,
        };
      }
    }

    return {
      success: true,
      user: data.user,
      session: data.session,
    };
  } catch (error) {
    return {
      success: false,
      error: createAuthError(error),
    };
  }
};

/**
 * Sign out the current user
 *
 * Note: Will be fully implemented in Story 2.5
 */
export const signOut = async (): Promise<{ success: boolean; error?: AuthError }> => {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: {
        message: 'Authentication service is not configured. Please contact support.',
        code: 'NOT_CONFIGURED',
      },
    };
  }

  try {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        error: createAuthError(error),
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: createAuthError(error),
    };
  }
};

/**
 * Get the current session
 */
export const getSession = async () => {
  if (!isSupabaseConfigured()) {
    return { session: null, error: null };
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.getSession();

    return {
      session: data.session,
      error: error ? createAuthError(error) : null,
    };
  } catch (error) {
    return {
      session: null,
      error: createAuthError(error),
    };
  }
};

/**
 * Listen for auth state changes
 *
 * @param callback - Function to call when auth state changes
 * @returns Unsubscribe function
 */
export const onAuthStateChange = (
  callback: (event: string, session: import('@supabase/supabase-js').Session | null) => void
) => {
  if (!isSupabaseConfigured()) {
    // Return no-op unsubscribe if not configured
    return { unsubscribe: () => {} };
  }

  const supabase = getSupabase();
  const { data } = supabase.auth.onAuthStateChange(callback);

  return data.subscription;
};

/**
 * Map OAuth-specific errors to user-friendly messages
 * Story: 2.4 - Implement Google OAuth Authentication
 */
const mapOAuthError = (errorMessage: string): string => {
  const lowerMessage = errorMessage.toLowerCase();

  // User denied permission
  if (
    lowerMessage.includes('denied') ||
    lowerMessage.includes('cancel') ||
    lowerMessage.includes('access_denied')
  ) {
    return 'You must grant permission to continue';
  }

  // Invalid OAuth configuration
  if (
    lowerMessage.includes('configuration') ||
    lowerMessage.includes('client_id') ||
    lowerMessage.includes('redirect')
  ) {
    return 'Authentication service is misconfigured. Please contact support.';
  }

  // Missing email permission
  if (lowerMessage.includes('email') && lowerMessage.includes('permission')) {
    return 'Email permission is required to create your account';
  }

  // Network errors
  if (
    lowerMessage.includes('fetch') ||
    lowerMessage.includes('network') ||
    lowerMessage.includes('connection')
  ) {
    return 'Unable to connect to Google. Please try again.';
  }

  // Provider not enabled
  if (lowerMessage.includes('provider') && lowerMessage.includes('enabled')) {
    return 'Google sign-in is not available. Please contact support.';
  }

  // Default OAuth error
  return 'Unable to sign in with Google. Please try again.';
};

/**
 * Sign in with Google OAuth
 *
 * Initiates the Google OAuth flow by redirecting to Google's consent screen.
 * After user grants permission, Google redirects back to the application.
 *
 * Story: 2.4 - Implement Google OAuth Authentication
 *
 * @returns OAuthInitResponse with success status
 *
 * @example
 * ```typescript
 * const result = await signInWithGoogle();
 * if (!result.success) {
 *   console.error('OAuth error:', result.error);
 * }
 * // Redirect to Google happens automatically on success
 * ```
 */
export const signInWithGoogle = async (): Promise<OAuthInitResponse> => {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: 'Authentication service is not configured. Please contact support.',
    };
  }

  try {
    const supabase = getSupabase();

    // Build the redirect URL - use current origin + /login for callback
    const redirectTo = `${window.location.origin}/login`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        // PKCE (Proof Key for Code Exchange) for OAuth 2.0 security (NFR-S1)
        // Protects against authorization code interception attacks
        skipBrowserRedirect: false,
        queryParams: {
          access_type: 'offline', // Request refresh token
          prompt: 'consent', // Force consent screen to ensure permissions
        },
      },
    });

    if (error) {
      if (import.meta.env.DEV) {
        console.error('[OAuth] Sign in with Google error:', error);
      }
      return {
        success: false,
        error: mapOAuthError(error.message),
      };
    }

    // Redirect happens automatically via Supabase
    return {
      success: true,
      url: data.url ?? undefined,
      provider: 'google',
    };
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error('[OAuth] Unexpected error during Google sign in:', err);
    }
    return {
      success: false,
      error: 'Unable to connect to Google. Please try again.',
    };
  }
};

/**
 * Handle OAuth callback after redirect from provider
 *
 * Called on page load to check for and process OAuth callback.
 * Extracts session from Supabase Auth and loads user profile.
 *
 * Story: 2.4 - Implement Google OAuth Authentication
 *
 * @returns OAuthCallbackResponse with user and session on success
 *
 * @example
 * ```typescript
 * // In useEffect on login page:
 * useEffect(() => {
 *   const processCallback = async () => {
 *     const result = await handleOAuthCallback();
 *     if (result.success) {
 *       navigate('/leagues');
 *     }
 *   };
 *   processCallback();
 * }, []);
 * ```
 */
export const handleOAuthCallback = async (): Promise<OAuthCallbackResponse> => {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: 'Authentication service is not configured. Please contact support.',
    };
  }

  try {
    const supabase = getSupabase();

    // Get session from Supabase - it automatically handles the OAuth callback
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      if (import.meta.env.DEV) {
        console.error('[OAuth] Session retrieval error:', sessionError);
      }
      return {
        success: false,
        error: mapOAuthError(sessionError.message),
      };
    }

    if (!session) {
      // No session means no OAuth callback to process
      return {
        success: false,
        error: 'No active session found',
      };
    }

    // Session exists - load user profile from users table
    // The handle_new_user() trigger from Story 2.1 auto-creates the profile
    try {
      const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      // Merge profile data into user_metadata
      if (userProfile) {
        const enrichedUser = {
          ...session.user,
          user_metadata: {
            ...session.user.user_metadata,
            display_name: userProfile.display_name,
            avatar_url: userProfile.avatar_url,
            is_admin: userProfile.is_admin,
          },
        };

        return {
          success: true,
          user: enrichedUser,
          session,
        };
      }

      // Profile not found yet (trigger may be processing)
      // Return auth user data as-is
      return {
        success: true,
        user: session.user,
        session,
      };
    } catch (profileError) {
      // Profile lookup failed but session is valid
      // Return success with auth user data (graceful degradation)
      if (import.meta.env.DEV) {
        console.warn('[OAuth] Profile lookup failed, using auth user data:', profileError);
      }
      return {
        success: true,
        user: session.user,
        session,
      };
    }
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error('[OAuth] Unexpected error during callback handling:', err);
    }
    return {
      success: false,
      error: 'An error occurred during sign in. Please try again.',
    };
  }
};
