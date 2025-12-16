/**
 * Authentication Type Definitions
 *
 * TypeScript types for authentication operations in the application.
 * Used across authService, authStore, and auth components.
 *
 * Story: 2.2 - Implement Email/Password Registration
 * Story: 2.4 - Implement Google OAuth Authentication
 */

import type { User, Session, AuthError as SupabaseAuthError } from '@supabase/supabase-js';

/**
 * Credentials for email/password sign-up
 */
export interface SignUpCredentials {
  email: string;
  password: string;
}

/**
 * Credentials for email/password sign-in
 * (Used in Story 2.3, defined here for consistency)
 */
export interface SignInCredentials {
  email: string;
  password: string;
}

/**
 * Supported OAuth providers
 * Story: 2.4 - Implement Google OAuth Authentication
 * Extensible for future providers (e.g., 'apple', 'github')
 */
export type OAuthProvider = 'google';

/**
 * Response from OAuth initiation
 * Story: 2.4 - Implement Google OAuth Authentication
 */
export interface OAuthInitResponse {
  /** Whether the OAuth initiation was successful */
  success: boolean;
  /** OAuth redirect URL (for debugging, redirect happens automatically) */
  url?: string;
  /** Provider used for OAuth */
  provider?: OAuthProvider;
  /** Error if OAuth initiation failed */
  error?: string;
}

/**
 * Response from OAuth callback handling
 * Story: 2.4 - Implement Google OAuth Authentication
 */
export interface OAuthCallbackResponse {
  /** Whether the callback was handled successfully */
  success: boolean;
  /** Authenticated user from OAuth */
  user?: User | null;
  /** Active session from OAuth */
  session?: Session | null;
  /** Error if callback handling failed */
  error?: string;
}

/**
 * Custom auth error with user-friendly message
 */
export interface AuthError {
  /** User-friendly error message for display */
  message: string;
  /** Original error code from Supabase (optional) */
  code?: string;
  /** Original Supabase error for debugging */
  originalError?: SupabaseAuthError | Error | null;
}

/**
 * Response from auth operations (sign up, sign in, etc.)
 */
export interface AuthResponse {
  /** Whether the operation succeeded */
  success: boolean;
  /** Authenticated user (on success) */
  user?: User | null;
  /** Active session (on success) */
  session?: Session | null;
  /** Error details (on failure) */
  error?: AuthError;
  /** Whether email confirmation is required */
  emailConfirmationRequired?: boolean;
}

/**
 * Auth store state shape
 */
export interface AuthState {
  /** Current authenticated user */
  user: User | null;
  /** Current active session */
  session: Session | null;
  /** Whether auth operation is in progress */
  isLoading: boolean;
  /** Current error message */
  error: string | null;
  /** Whether auth state has been initialized from storage */
  isInitialized: boolean;
}

/**
 * Auth store actions
 */
export interface AuthActions {
  /** Sign up with email and password */
  signUp: (email: string, password: string) => Promise<AuthResponse>;
  /** Sign in with email and password (Story 2.3) */
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  /** Sign in with Google OAuth (Story 2.4) */
  signInWithGoogle: () => Promise<OAuthInitResponse>;
  /** Handle OAuth callback after redirect (Story 2.4) */
  handleOAuthCallback: () => Promise<OAuthCallbackResponse>;
  /** Sign out current user (Story 2.5) */
  signOut: () => Promise<void>;
  /** Set user in store */
  setUser: (user: User | null) => void;
  /** Set session in store */
  setSession: (session: Session | null) => void;
  /** Set loading state */
  setLoading: (isLoading: boolean) => void;
  /** Set error message */
  setError: (error: string | null) => void;
  /** Clear error */
  clearError: () => void;
  /** Initialize auth state from storage/session */
  initialize: () => Promise<void>;
}

/**
 * Complete auth store type
 */
export type AuthStore = AuthState & AuthActions;

/**
 * Registration form data shape (for React Hook Form)
 */
export interface RegistrationFormData {
  email: string;
  password: string;
}

/**
 * Login form data shape (for React Hook Form)
 * Note: No password strength validation on login (only on registration)
 * Story: 2.3 - Implement Email/Password Login
 */
export interface LoginFormData {
  email: string;
  password: string;
}

/**
 * Password strength levels
 */
export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

/**
 * Password strength evaluation result
 */
export interface PasswordStrengthResult {
  strength: PasswordStrength;
  score: number; // 0-4
  feedback: string;
}

// Re-export Supabase types for convenience
export type { User, Session } from '@supabase/supabase-js';
