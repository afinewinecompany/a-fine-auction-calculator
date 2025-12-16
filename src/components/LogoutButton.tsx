/**
 * Logout Button Component
 *
 * A shared component that provides logout functionality.
 * Only renders when user is authenticated.
 * Uses existing auth store signOut action and navigates to landing page on success.
 * Shows error toast notification on failure.
 *
 * Story: 2.5 - Implement Logout Functionality
 */

import { useNavigate } from 'react-router-dom';
import { useAuthStore, useIsAuthenticated } from '@/features/auth/stores/authStore';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

/**
 * LogoutButton props
 */
export interface LogoutButtonProps {
  /** Whether to show the icon */
  showIcon?: boolean;
  /** Custom className for styling */
  className?: string;
  /** Button variant from shadcn/ui */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  /** Button size from shadcn/ui */
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

/**
 * Logout button component
 *
 * Renders a logout button that:
 * - Only shows when user is authenticated
 * - Calls auth store signOut() on click
 * - Navigates to landing page (/) with replace: true on success only
 * - Shows error toast notification on failure
 * - Shows loading state during logout
 * - Disables button during logout process
 *
 * @example
 * ```tsx
 * // Basic usage
 * <LogoutButton />
 *
 * // With custom styling
 * <LogoutButton variant="ghost" size="sm" showIcon />
 *
 * // Icon only
 * <LogoutButton size="icon" showIcon />
 * ```
 */
export function LogoutButton({
  showIcon = false,
  className,
  variant = 'outline',
  size = 'default',
}: LogoutButtonProps) {
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const signOut = useAuthStore(state => state.signOut);
  const isLoading = useAuthStore(state => state.isLoading);

  // Don't render if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  /**
   * Handle logout click
   * Calls signOut and only navigates to landing page on success.
   * Shows error toast notification if logout fails.
   */
  const handleLogout = async () => {
    await signOut();

    // Check the store's error state after signOut completes
    // The signOut action sets error state if it fails
    const currentError = useAuthStore.getState().error;

    if (currentError) {
      // Show error toast - user stays on current page
      toast.error('Logout failed', {
        description: currentError,
      });
      return;
    }

    // Only navigate on successful logout
    // Navigate to landing page with replace to prevent back-button issues
    navigate('/', { replace: true });
  };

  // Accessibility attributes for both button types
  const accessibilityProps = {
    'aria-label': isLoading ? 'Logging out...' : 'Logout',
    title: isLoading ? 'Logging out...' : 'Logout',
  };

  // Icon-only button
  if (size === 'icon') {
    return (
      <Button
        onClick={handleLogout}
        disabled={isLoading}
        variant={variant}
        size={size}
        className={className}
        {...accessibilityProps}
      >
        <LogOut className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={className}
      {...accessibilityProps}
    >
      {showIcon && <LogOut className="h-4 w-4 mr-2" />}
      {isLoading ? 'Logging out...' : 'Logout'}
    </Button>
  );
}
