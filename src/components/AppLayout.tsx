/**
 * App Layout Component
 *
 * Main application layout with header navigation and logout functionality.
 * Used to wrap protected routes with consistent navigation UI.
 *
 * Story: 2.5 - Implement Logout Functionality
 * Story: 2.6 - Implement Profile Management (added avatar and profile link)
 * Story: 11.6 - Create Basic Onboarding Flow (added onboarding modal)
 */

import { useEffect, useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { LogoutButton } from './LogoutButton';
import { useUser } from '@/features/auth/stores/authStore';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getUserInitials } from '@/features/profile/utils/profileValidation';
import { routes } from '@/routes/index';
import { useProfileStore } from '@/features/profile/stores/profileStore';
import { OnboardingModal } from '@/features/landing';

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
  const { profile, fetchProfile, updateProfile } = useProfileStore();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Fetch profile on mount when user is available
  useEffect(() => {
    if (user?.id && !profile) {
      fetchProfile(user.id);
    }
  }, [user?.id, profile, fetchProfile]);

  // Check if onboarding should be shown
  useEffect(() => {
    if (
      profile &&
      (profile.onboarding_completed === false || profile.onboarding_completed === null)
    ) {
      setShowOnboarding(true);
    }
  }, [profile]);

  // Handle onboarding completion
  const handleOnboardingComplete = async () => {
    if (user?.id) {
      const success = await updateProfile(user.id, { onboarding_completed: true });
      if (success) {
        setShowOnboarding(false);
      }
    }
  };

  // Get display name from user metadata or email
  // Handle edge case where email might be empty string
  const emailUsername = user?.email?.split('@')[0];
  const displayName =
    user?.user_metadata?.display_name ||
    (emailUsername && emailUsername.length > 0 ? emailUsername : null) ||
    'User';

  // Get avatar URL from user metadata
  const avatarUrl = user?.user_metadata?.avatar_url;

  // Get initials for avatar fallback
  const initials = getUserInitials(user?.user_metadata?.display_name || null, user?.email || '');

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
            {/* User avatar and display name - links to profile */}
            <Link
              to={routes.protected.profile}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <Avatar className="h-8 w-8 border border-slate-700">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={displayName} className="object-cover" />
                ) : null}
                <AvatarFallback className="bg-slate-800 text-slate-300 text-xs">
                  {initials || <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-slate-400 hidden sm:block">{displayName}</span>
            </Link>

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

      {/* Onboarding Modal */}
      <OnboardingModal open={showOnboarding} onComplete={handleOnboardingComplete} />
    </div>
  );
}
