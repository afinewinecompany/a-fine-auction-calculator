/**
 * Registration Page Component
 *
 * User registration form with email/password authentication.
 * Uses React Hook Form for validation and Zustand for state management.
 *
 * Story: 2.2 - Implement Email/Password Registration
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

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
import { cn } from '@/components/ui/utils';

import { useAuthStore, useIsAuthenticated } from '../stores/authStore';
import type {
  RegistrationFormData,
  PasswordStrength,
  PasswordStrengthResult,
} from '../types/auth.types';
import { routes } from '@/routes';

/**
 * Evaluate password strength
 */
const evaluatePasswordStrength = (password: string): PasswordStrengthResult => {
  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Use at least 8 characters');
  }

  if (password.length >= 12) {
    score += 1;
  }

  if (/[A-Z]/.test(password)) {
    score += 0.5;
  } else {
    feedback.push('Add uppercase letters');
  }

  if (/[a-z]/.test(password)) {
    score += 0.5;
  }

  if (/[0-9]/.test(password)) {
    score += 0.5;
  } else {
    feedback.push('Add numbers');
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 0.5;
  } else {
    feedback.push('Add special characters');
  }

  let strength: PasswordStrength;
  if (score < 1.5) {
    strength = 'weak';
  } else if (score < 2.5) {
    strength = 'fair';
  } else if (score < 3.5) {
    strength = 'good';
  } else {
    strength = 'strong';
  }

  return {
    strength,
    score: Math.min(4, Math.floor(score)),
    feedback: feedback.length > 0 ? feedback.join('. ') : 'Strong password!',
  };
};

/**
 * Password strength indicator component
 */
function PasswordStrengthIndicator({ password }: { password: string }) {
  if (!password) return null;

  const { strength, feedback } = evaluatePasswordStrength(password);

  const strengthColors: Record<PasswordStrength, string> = {
    weak: 'bg-red-500',
    fair: 'bg-orange-500',
    good: 'bg-yellow-500',
    strong: 'bg-emerald-500',
  };

  const strengthWidths: Record<PasswordStrength, string> = {
    weak: 'w-1/4',
    fair: 'w-2/4',
    good: 'w-3/4',
    strong: 'w-full',
  };

  return (
    <div className="mt-2 space-y-1">
      <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-300',
            strengthColors[strength],
            strengthWidths[strength]
          )}
        />
      </div>
      <p className="text-xs text-slate-400">
        Password strength: <span className="capitalize">{strength}</span>
        {strength !== 'strong' && ` - ${feedback}`}
      </p>
    </div>
  );
}

/**
 * Registration Page Component
 */
export function RegistrationPage() {
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const { signUp, isLoading, error, clearError } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(routes.protected.leagues, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormData>({
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Watch password for strength indicator
  const password = watch('password', '');

  // Clear error when form values change
  const email = watch('email');
  useEffect(() => {
    if (error) {
      clearError();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, password]);

  /**
   * Handle form submission
   */
  const onSubmit = async (data: RegistrationFormData) => {
    const result = await signUp(data.email, data.password);

    if (result.success) {
      if (result.emailConfirmationRequired) {
        // Show email confirmation message
        setEmailConfirmationRequired(true);
      } else {
        // Redirect to leagues dashboard
        navigate(routes.protected.leagues, { replace: true });
      }
    }
  };

  // Show email confirmation message if required
  if (emailConfirmationRequired) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 p-4">
        <Card className="w-full max-w-md bg-slate-900 border-slate-800">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Check your email</CardTitle>
            <CardDescription className="text-slate-400">
              We&apos;ve sent a confirmation link to your email address. Please check your inbox and
              click the link to activate your account.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setEmailConfirmationRequired(false)}
            >
              Back to registration
            </Button>
            <p className="text-center text-sm text-slate-400">
              Already confirmed?{' '}
              <Link
                to={routes.public.login}
                className="text-emerald-400 hover:text-emerald-300 underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 p-4">
      <Card className="w-full max-w-md bg-slate-900 border-slate-800">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-white">Create an account</CardTitle>
          <CardDescription className="text-slate-400">
            Enter your email and password to get started
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
                  placeholder="Create a password"
                  autoComplete="new-password"
                  disabled={isLoading || isSubmitting}
                  aria-invalid={!!errors.password}
                  className={cn(
                    'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 pr-10',
                    'focus:border-emerald-500 focus:ring-emerald-500/20',
                    errors.password && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  )}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
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
              {/* Password Strength Indicator */}
              <PasswordStrengthIndicator password={password} />
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
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </Button>

            {/* Login Link */}
            <p className="text-center text-sm text-slate-400">
              Already have an account?{' '}
              <Link
                to={routes.public.login}
                className="text-emerald-400 hover:text-emerald-300 underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default RegistrationPage;
