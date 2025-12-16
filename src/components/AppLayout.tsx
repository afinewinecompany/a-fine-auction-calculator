/**
 * App Layout Component
 *
 * Main application layout with header navigation and logout functionality.
 * Used to wrap protected routes with consistent navigation UI.
 *
 * Story: 2.5 - Implement Logout Functionality
 */

import { Outlet } from 'react-router-dom';
import { LogoutButton } from './LogoutButton';
import { useUser } from '@/features/auth/stores/authStore';

/**
 * AppLayout component
 *
 * Provides a consistent layout for authenticated pages including:
 * - Header with app branding and logout button
 * - Main content area via Outlet
 *
 * @example
 * ```tsx
 * // In router configuration:
 * {
 *   element: <AppLayout />,
 *   children: [
 *     { path: '/dashboard', element: <Dashboard /> },
 *   ]
 * }
 * ```
 */
export function AppLayout() {
  const user = useUser();

  // Get display name from user metadata or email
  // Handle edge case where email might be empty string
  const emailUsername = user?.email?.split('@')[0];
  const displayName =
    user?.user_metadata?.display_name ||
    (emailUsername && emailUsername.length > 0 ? emailUsername : null) ||
    'User';

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
        <div className="container flex h-14 max-w-screen-2xl items-center px-4">
          {/* Logo/Branding */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-emerald-400">Auction Projections</span>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* User info and logout */}
          <div className="flex items-center gap-4">
            {/* User display name */}
            <span className="text-sm text-slate-400 hidden sm:block">{displayName}</span>

            {/* Logout button */}
            <LogoutButton
              variant="ghost"
              size="sm"
              showIcon
              className="text-slate-300 hover:text-white hover:bg-slate-800"
            />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
