/**
 * Login Page Component
 *
 * User login form with email/password and Google OAuth authentication.
 * Uses React Hook Form for validation and Zustand for state management.
 * Supports returnTo query parameter for redirect after authentication.
 *
 * Story: 2.3 - Implement Email/Password Login
 * Story: 2.4 - Implement Google OAuth Authentication
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/components/ui/utils';

import { useAuthStore, useIsAuthenticated } from '../stores/authStore';
import type { LoginFormData } from '../types/auth.types';
import { routes } from '@/routes';

/**
 * Google "G" Logo SVG Component
 * Following Google Brand Guidelines for sign-in button
 * Story: 2.4 - Implement Google OAuth Authentication
 */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

/**
 * Validates a returnTo URL for safe redirect.
 * Prevents open redirect vulnerabilities by only allowing:
 * - URLs starting with a single forward slash
 * - NOT protocol-relative URLs (//example.com)
 * - NOT URLs with protocols (http://, https://, etc.)
 *
 * @param url - The URL to validate
 * @returns true if the URL is safe for redirect
 */
const isValidReturnToUrl = (url: string | null): url is string => {
  if (!url) return false;
  // Must start with exactly one slash (not //)
  // Must not contain protocol indicators
  return url.startsWith('/') && !url.startsWith('//') && !url.includes('://');
};

/**
 * Gets the safe redirect URL from returnTo parameter or returns default.
 *
 * @param returnTo - The returnTo query parameter value
 * @returns Safe redirect URL
 */
const getRedirectUrl = (returnTo: string | null): string => {
  return isValidReturnToUrl(returnTo) ? returnTo : routes.protected.leagues;
};

/**
 * OAuth callback detection result
 */
interface OAuthCallbackInfo {
  isCallback: boolean;
  hasError: boolean;
  errorDescription?: string;
}

/**
 * Checks if the current URL contains OAuth callback indicators
 * Supabase OAuth callback includes access_token in hash or code in query params
 * Uses specific patterns to avoid false positives from legitimate URL fragments
 */
const detectOAuthCallback = (): OAuthCallbackInfo => {
  const hash = window.location.hash;
  const searchParams = new URLSearchParams(window.location.search);

  // Check for specific OAuth callback patterns (not just partial string matches)
  // Access token in hash follows pattern: #access_token=...
  const hasAccessToken = hash.startsWith('#access_token=') || hash.includes('&access_token=');

  // Error in hash follows pattern: #error=...
  const hasHashError = hash.startsWith('#error=') || hash.includes('&error=');
  const hashErrorMatch = hash.match(/[#&]error=([^&]*)/);
  const hashErrorDesc = hash.match(/[#&]error_description=([^&]*)/);

  // Authorization code flow uses 'code' query param
  const hasCode = searchParams.has('code');

  // Error in query params
  const hasQueryError = searchParams.has('error');
  const queryErrorDesc = searchParams.get('error_description');

  const isCallback = hasAccessToken || hasHashError || hasCode || hasQueryError;
  const hasError = hasHashError || hasQueryError;

  let errorDescription: string | undefined;
  if (hasError) {
    errorDescription =
      queryErrorDesc ||
      (hashErrorDesc ? decodeURIComponent(hashErrorDesc[1]) : undefined) ||
      (hashErrorMatch ? decodeURIComponent(hashErrorMatch[1]) : undefined);
  }

  return { isCallback, hasError, errorDescription };
};

/**
 * Login Page Component
 *
 * Renders login form with email/password fields and Google OAuth button.
 * Handles authentication via Supabase Auth.
 * Supports returnTo redirect for deep linking.
 * Processes OAuth callbacks on page load.
 */
export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAuthenticated = useIsAuthenticated();
  const { signIn, signInWithGoogle, handleOAuthCallback, isLoading, error, clearError } =
    useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPasswordDialog, setShowForgotPasswordDialog] = useState(false);
  const [isProcessingOAuth, setIsProcessingOAuth] = useState(false);

  // Track if OAuth callback has been processed to prevent duplicate calls
  const oauthProcessedRef = useRef(false);

  // Get returnTo URL from query params (for deep linking)
  const returnTo = searchParams.get('returnTo');

  // Memoize clearError to use in dependency array
  const handleClearError = useCallback(() => {
    if (error) {
      clearError();
    }
  }, [error, clearError]);

  // Handle OAuth callback on page load
  // This effect runs once on mount to detect and process OAuth callbacks
  // We use a ref to prevent double processing and coordinate with the auth store
  useEffect(() => {
    const processOAuthCallback = async () => {
      // Prevent duplicate processing
      if (oauthProcessedRef.current) return;

      // Detect OAuth callback with improved pattern matching
      const callbackInfo = detectOAuthCallback();

      // Not an OAuth callback - nothing to process
      if (!callbackInfo.isCallback) return;

      // Mark as processed immediately to prevent race conditions
      oauthProcessedRef.current = true;
      setIsProcessingOAuth(true);

      // Clean up URL first to prevent re-processing on re-renders
      // Preserve the returnTo parameter in the clean URL
      const cleanUrl = returnTo
        ? `${window.location.pathname}?returnTo=${encodeURIComponent(returnTo)}`
        : window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);

      try {
        // If OAuth returned an error directly in the URL, set it without calling handleOAuthCallback
        if (callbackInfo.hasError && callbackInfo.errorDescription) {
          // Let the auth store know about the error
          useAuthStore.getState().setError(callbackInfo.errorDescription);
          return;
        }

        // Process the OAuth callback through the store
        // This retrieves the session that Supabase has already established
        const result = await handleOAuthCallback();

        if (result.success) {
          navigate(getRedirectUrl(returnTo), { replace: true });
        }
        // On error, the store will have set the error state
      } finally {
        setIsProcessingOAuth(false);
      }
    };

    processOAuthCallback();
    // Only run on mount - dependencies are stable refs/functions
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redirect if already authenticated (and not processing OAuth)
  useEffect(() => {
    if (isAuthenticated && !isProcessingOAuth) {
      navigate(getRedirectUrl(returnTo), { replace: true });
    }
  }, [isAuthenticated, isProcessingOAuth, navigate, returnTo]);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Watch form values to clear errors on change
  const email = watch('email');
  const password = watch('password');

  // Clear error when form values change
  useEffect(() => {
    handleClearError();
  }, [email, password, handleClearError]);

  /**
   * Handle email/password form submission
   */
  const onSubmit = async (data: LoginFormData) => {
    const result = await signIn(data.email, data.password);

    if (result.success) {
      navigate(getRedirectUrl(returnTo), { replace: true });
    }
  };

  /**
   * Handle Google OAuth sign-in
   * Story: 2.4 - Implement Google OAuth Authentication
   */
  const handleGoogleSignIn = async () => {
    clearError();
    const result = await signInWithGoogle();

    // If there's an error, it will be set in the store
    // If successful, redirect to Google happens automatically
    if (!result.success && import.meta.env.DEV) {
      console.error('[LoginPage] Google sign in failed:', result.error);
    }
  };

  // Show loading state while processing OAuth callback
  if (isProcessingOAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 p-4">
        <Card className="w-full max-w-md bg-slate-900 border-slate-800">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mb-4" />
            <p className="text-slate-300 text-center">Completing sign in...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 p-4">
      <Card className="w-full max-w-md bg-slate-900 border-slate-800">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-white">Welcome back</CardTitle>
          <CardDescription className="text-slate-400">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Google OAuth Button - Per Google Brand Guidelines */}
            <Button
              type="button"
              variant="outline"
              className={cn(
                'w-full h-11 bg-white hover:bg-gray-50 text-gray-900 border-gray-300',
                'font-medium transition-colors'
              )}
              onClick={handleGoogleSignIn}
              disabled={isLoading || isSubmitting}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <GoogleIcon className="mr-2 h-5 w-5" />
                  Sign in with Google
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-2 text-slate-500">Or continue with email</span>
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                disabled={isLoading || isSubmitting}
                aria-invalid={!!errors.email}
                className={cn(
                  'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500',
                  'focus:border-emerald-500 focus:ring-emerald-500/20',
                  errors.email && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                )}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Please enter a valid email address',
                  },
                })}
              />
              {errors.email && (
                <p className="text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={isLoading || isSubmitting}
                  aria-invalid={!!errors.password}
                  className={cn(
                    'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 pr-10',
                    'focus:border-emerald-500 focus:ring-emerald-500/20',
                    errors.password && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  )}
                  {...register('password', {
                    required: 'Password is required',
                    // Note: No minLength validation on login (only on registration)
                    // Security best practice: don't reveal password requirements on login
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotPasswordDialog(true)}
                className="text-sm text-emerald-400 hover:text-emerald-300 underline-offset-4 hover:underline"
              >
                Forgot password?
              </button>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11"
              disabled={isLoading || isSubmitting}
            >
              {isLoading || isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in with email'
              )}
            </Button>

            {/* Register Link */}
            <p className="text-center text-sm text-slate-400">
              Don&apos;t have an account?{' '}
              <Link
                to={routes.public.register}
                className="text-emerald-400 hover:text-emerald-300 underline-offset-4 hover:underline"
              >
                Create account
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>

      {/* Forgot Password Dialog */}
      <AlertDialog open={showForgotPasswordDialog} onOpenChange={setShowForgotPasswordDialog}>
        <AlertDialogContent className="bg-slate-900 border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Password Reset</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Password reset functionality will be available in a future update. Please contact
              support if you need immediate assistance with your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Got it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default LoginPage;
