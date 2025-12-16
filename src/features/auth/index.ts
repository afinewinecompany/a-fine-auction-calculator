/**
 * Auth Feature Exports
 *
 * Central export file for the auth feature module.
 *
 * Story: 2.2 - Implement Email/Password Registration
 * Story: 2.3 - Implement Email/Password Login
 * Story: 2.4 - Implement Google OAuth Authentication
 */

// Components
export { RegistrationPage } from './components/RegistrationPage';
export { LoginPage } from './components/LoginPage';

// Stores
export {
  useAuthStore,
  useUser,
  useSession,
  useIsAuthenticated,
  useAuthLoading,
  useAuthError,
} from './stores/authStore';

// Services
export {
  signUp,
  signIn,
  signInWithGoogle,
  handleOAuthCallback,
  signOut,
  getSession,
  onAuthStateChange,
} from './utils/authService';

// Types
export type {
  SignUpCredentials,
  SignInCredentials,
  OAuthProvider,
  OAuthInitResponse,
  OAuthCallbackResponse,
  AuthError,
  AuthResponse,
  AuthState,
  AuthActions,
  AuthStore,
  RegistrationFormData,
  LoginFormData,
  PasswordStrength,
  PasswordStrengthResult,
  User,
  Session,
} from './types/auth.types';
