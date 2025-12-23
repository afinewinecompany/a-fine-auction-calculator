/**
 * useProfile Hook
 *
 * Custom hook for profile management.
 * Wraps profileStore selectors for cleaner component usage.
 *
 * Story: 2.6 - Implement Profile Management
 */

import { useCallback, useEffect } from 'react';
import {
  useProfileStore,
  useProfile as useProfileData,
  useProfileLoading,
  useProfileUploading,
  useProfileSaving,
  useProfileError,
} from '../stores/profileStore';
import type { Profile, ProfileUpdate, AvatarUploadResult } from '../types/profile.types';

/**
 * Hook return type for profile management
 */
export interface UseProfileReturn {
  /** Current profile data */
  profile: Profile | null;
  /** Whether profile is loading */
  isLoading: boolean;
  /** Whether avatar is uploading */
  isUploading: boolean;
  /** Whether profile is being saved */
  isSaving: boolean;
  /** Combined loading state (any operation in progress) */
  isProcessing: boolean;
  /** Current error message */
  error: string | null;
  /** Fetch profile data */
  fetchProfile: (userId: string) => Promise<void>;
  /** Update profile data */
  updateProfile: (userId: string, data: ProfileUpdate) => Promise<boolean>;
  /** Upload avatar file */
  uploadAvatar: (userId: string, file: File) => Promise<AvatarUploadResult | null>;
  /** Clear error message */
  clearError: () => void;
  /** Reset store state */
  reset: () => void;
}

/**
 * Custom hook for profile management
 *
 * Provides access to profile state and actions with a cleaner API.
 * Automatically computes combined loading states.
 *
 * @param userId - Optional user ID to auto-fetch profile on mount
 * @returns Profile state and actions
 *
 * @example
 * ```tsx
 * function ProfilePage() {
 *   const { profile, isLoading, updateProfile } = useProfileHook(user?.id);
 *
 *   if (isLoading) return <Skeleton />;
 *
 *   return (
 *     <div>
 *       <h1>{profile?.display_name}</h1>
 *       <button onClick={() => updateProfile(user.id, { display_name: 'New Name' })}>
 *         Update
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useProfileHook(userId?: string): UseProfileReturn {
  const profile = useProfileData();
  const isLoading = useProfileLoading();
  const isUploading = useProfileUploading();
  const isSaving = useProfileSaving();
  const error = useProfileError();

  const { fetchProfile, updateProfile, uploadAvatar, clearError, reset } = useProfileStore();

  // Auto-fetch profile on mount if userId provided
  useEffect(() => {
    if (userId) {
      fetchProfile(userId);
    }
  }, [userId, fetchProfile]);

  // Memoize actions for stable references
  const memoizedFetchProfile = useCallback((id: string) => fetchProfile(id), [fetchProfile]);

  const memoizedUpdateProfile = useCallback(
    (id: string, data: ProfileUpdate) => updateProfile(id, data),
    [updateProfile]
  );

  const memoizedUploadAvatar = useCallback(
    (id: string, file: File) => uploadAvatar(id, file),
    [uploadAvatar]
  );

  return {
    profile,
    isLoading,
    isUploading,
    isSaving,
    isProcessing: isLoading || isUploading || isSaving,
    error,
    fetchProfile: memoizedFetchProfile,
    updateProfile: memoizedUpdateProfile,
    uploadAvatar: memoizedUploadAvatar,
    clearError,
    reset,
  };
}

// Re-export individual selector hooks for granular access
export {
  useProfileData as useProfile,
  useProfileLoading,
  useProfileUploading,
  useProfileSaving,
  useProfileError,
};

export default useProfileHook;
