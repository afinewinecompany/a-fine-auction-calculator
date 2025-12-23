/**
 * ProfileView Component
 *
 * Main profile page displaying user information.
 * Includes edit functionality via ProfileEdit modal.
 *
 * Story: 2.6 - Implement Profile Management
 */

import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Calendar, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/features/auth/stores/authStore';
import { useProfileStore } from '../stores/profileStore';
import { ProfileEdit } from './ProfileEdit';
import { getUserInitials } from '../utils/profileValidation';

/**
 * ProfileView page component
 *
 * Displays user profile information with edit capability.
 * Fetches profile data on mount and refreshes after edits.
 *
 * @example
 * ```tsx
 * // In router configuration:
 * { path: '/profile', element: <ProfileView /> }
 * ```
 */
export function ProfileView() {
  const user = useUser();
  const { profile, isLoading, error, fetchProfile, clearError } = useProfileStore();
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id);
    }
  }, [user?.id, fetchProfile]);

  /**
   * Handle edit button click
   */
  const handleEditClick = useCallback(() => {
    clearError();
    setIsEditOpen(true);
  }, [clearError]);

  /**
   * Handle edit dialog close
   */
  const handleEditClose = useCallback(() => {
    setIsEditOpen(false);
  }, []);

  /**
   * Handle successful save
   */
  const handleSaveSuccess = useCallback(() => {
    toast.success('Profile updated successfully!');
    // Refetch profile to ensure UI is in sync
    if (user?.id) {
      fetchProfile(user.id);
    }
  }, [user?.id, fetchProfile]);

  /**
   * Format date for display
   */
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Loading state
  if (isLoading && !profile) {
    return <ProfileViewSkeleton />;
  }

  // Error state (when no profile loaded)
  if (error && !profile) {
    return (
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-8 text-center">
            <div className="text-red-400 mb-4">
              <User className="h-12 w-12 mx-auto opacity-50" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Unable to Load Profile</h2>
            <p className="text-slate-400 mb-4">{error}</p>
            <Button
              onClick={() => user?.id && fetchProfile(user.id)}
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No user state (shouldn't happen on protected route)
  if (!user) {
    return (
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-8 text-center">
            <p className="text-slate-400">
              Please sign in to view your profile.{' '}
              <Link to="/login" className="text-emerald-400 hover:text-emerald-300 underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get display values
  const displayName = profile?.display_name || user?.user_metadata?.display_name;
  const emailUsername = user?.email?.split('@')[0];
  const fallbackName = emailUsername && emailUsername.length > 0 ? emailUsername : 'User';
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;
  const initials = getUserInitials(displayName || null, user?.email || '');

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Profile</CardTitle>
              <CardDescription className="text-slate-400">
                Manage your profile information
              </CardDescription>
            </div>
            <Button
              onClick={handleEditClick}
              size="sm"
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Avatar and Name Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="h-24 w-24 border-2 border-slate-700">
              {avatarUrl ? (
                <AvatarImage
                  src={avatarUrl}
                  alt={displayName || 'User avatar'}
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback className="bg-slate-800 text-slate-300 text-2xl">
                {initials || <User className="h-10 w-10" />}
              </AvatarFallback>
            </Avatar>

            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold text-white">{displayName || fallbackName}</h2>
              {!displayName && <p className="text-sm text-slate-500 mt-1">No display name set</p>}
            </div>
          </div>

          {/* Profile Details */}
          <div className="space-y-4">
            {/* Email */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50">
              <Mail className="h-5 w-5 text-slate-500" />
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Email</p>
                <p className="text-white">{user?.email}</p>
              </div>
            </div>

            {/* Member Since */}
            {profile?.created_at && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50">
                <Calendar className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Member Since</p>
                  <p className="text-white">{formatDate(profile.created_at)}</p>
                </div>
              </div>
            )}

            {/* Last Updated */}
            {profile?.updated_at && profile.updated_at !== profile.created_at && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50">
                <Calendar className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Last Updated</p>
                  <p className="text-white">{formatDate(profile.updated_at)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 rounded-md bg-red-900/20 border border-red-900/50">
              <p className="text-sm text-red-400" role="alert">
                {error}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Profile Dialog */}
      {profile && (
        <ProfileEdit
          isOpen={isEditOpen}
          onClose={handleEditClose}
          profile={profile}
          userId={user.id}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </div>
  );
}

/**
 * Skeleton loading state for ProfileView
 */
function ProfileViewSkeleton() {
  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-6 w-20 bg-slate-800" />
              <Skeleton className="h-4 w-48 mt-2 bg-slate-800" />
            </div>
            <Skeleton className="h-9 w-28 bg-slate-800" />
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Avatar and Name Skeleton */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Skeleton className="h-24 w-24 rounded-full bg-slate-800" />
            <div className="text-center sm:text-left">
              <Skeleton className="h-8 w-48 bg-slate-800" />
            </div>
          </div>

          {/* Details Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-20 w-full bg-slate-800 rounded-lg" />
            <Skeleton className="h-20 w-full bg-slate-800 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProfileView;
