/**
 * Profile Store (Zustand)
 *
 * Global state management for user profile data.
 * Handles profile fetching, updating, and avatar uploads.
 *
 * Story: 2.6 - Implement Profile Management
 */

import { create } from 'zustand';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuthStore } from '@/features/auth/stores/authStore';
import type {
  ProfileStore,
  Profile,
  ProfileUpdate,
  AvatarUploadResult,
} from '../types/profile.types';
import { generateAvatarPath } from '../utils/profileValidation';

/**
 * Initial profile state
 */
const initialState = {
  profile: null as Profile | null,
  isLoading: false,
  isUploading: false,
  isSaving: false,
  error: null as string | null,
};

/**
 * Map Supabase errors to user-friendly messages
 */
const mapProfileError = (errorMessage: string): string => {
  const lowerMessage = errorMessage.toLowerCase();

  if (lowerMessage.includes('not found') || lowerMessage.includes('no rows')) {
    return 'Profile not found';
  }

  if (lowerMessage.includes('permission') || lowerMessage.includes('policy')) {
    return 'You do not have permission to perform this action';
  }

  if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
    return 'Unable to connect. Please check your internet connection.';
  }

  if (lowerMessage.includes('storage') || lowerMessage.includes('upload')) {
    return 'Failed to upload file. Please try again.';
  }

  if (lowerMessage.includes('size') || lowerMessage.includes('too large')) {
    return 'File is too large. Maximum size is 2MB.';
  }

  if (lowerMessage.includes('type') || lowerMessage.includes('mime')) {
    return 'Invalid file type. Please use JPEG, PNG, or WebP.';
  }

  return 'An error occurred. Please try again.';
};

/**
 * Profile store with Zustand
 *
 * @example
 * ```typescript
 * const { profile, fetchProfile, updateProfile } = useProfileStore();
 *
 * // Fetch profile on mount
 * useEffect(() => {
 *   if (userId) {
 *     fetchProfile(userId);
 *   }
 * }, [userId]);
 *
 * // Update profile
 * const handleSave = async () => {
 *   const success = await updateProfile(userId, { display_name: newName });
 * };
 * ```
 */
export const useProfileStore = create<ProfileStore>((set, get) => ({
  // State
  ...initialState,

  // Actions

  /**
   * Fetch profile data from users table
   * Note: Uses .maybeSingle() to avoid 406 errors when profile doesn't exist yet
   * (e.g., race condition with handle_new_user() trigger after OAuth signup)
   */
  fetchProfile: async (userId: string): Promise<void> => {
    if (!isSupabaseConfigured()) {
      set({ error: 'Profile service is not configured', isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('users')
        .select('id, email, display_name, avatar_url, onboarding_completed, created_at, updated_at')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        set({
          profile: null,
          isLoading: false,
          error: mapProfileError(error.message),
        });
        return;
      }

      // Profile may be null if user record doesn't exist yet (trigger still processing)
      // This is a valid state - the profile will be fetched on next attempt
      if (!data) {
        set({
          profile: null,
          isLoading: false,
          error: null, // Not an error, just not ready yet
        });
        return;
      }

      set({
        profile: data as Profile,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile';
      set({
        profile: null,
        isLoading: false,
        error: mapProfileError(errorMessage),
      });
    }
  },

  /**
   * Update profile data in users table
   */
  updateProfile: async (userId: string, data: ProfileUpdate): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      set({ error: 'Profile service is not configured', isSaving: false });
      return false;
    }

    set({ isSaving: true, error: null });

    // Optimistic update - store previous profile for rollback
    const previousProfile = get().profile;

    // Apply optimistic update
    if (previousProfile) {
      set({
        profile: {
          ...previousProfile,
          ...data,
          updated_at: new Date().toISOString(),
        },
      });
    }

    try {
      const supabase = getSupabase();

      // Trim display_name if provided
      const updateData: ProfileUpdate = { ...data };
      if (updateData.display_name) {
        updateData.display_name = updateData.display_name.trim();
      }

      const { error } = await supabase.from('users').update(updateData).eq('id', userId);

      if (error) {
        // Rollback optimistic update
        set({
          profile: previousProfile,
          isSaving: false,
          error: mapProfileError(error.message),
        });
        return false;
      }

      // Refetch to get server-side updated_at
      const { data: refreshedProfile } = await supabase
        .from('users')
        .select('id, email, display_name, avatar_url, onboarding_completed, created_at, updated_at')
        .eq('id', userId)
        .maybeSingle();

      if (refreshedProfile) {
        set({
          profile: refreshedProfile as Profile,
          isSaving: false,
          error: null,
        });

        // Sync auth store user metadata so AppLayout header updates immediately
        const authStore = useAuthStore.getState();
        const currentUser = authStore.user;
        if (currentUser) {
          authStore.setUser({
            ...currentUser,
            user_metadata: {
              ...currentUser.user_metadata,
              display_name: refreshedProfile.display_name,
              avatar_url: refreshedProfile.avatar_url,
            },
          });
        }
      } else {
        set({ isSaving: false, error: null });
      }

      return true;
    } catch (err) {
      // Rollback optimistic update
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      set({
        profile: previousProfile,
        isSaving: false,
        error: mapProfileError(errorMessage),
      });
      return false;
    }
  },

  /**
   * Upload avatar to Supabase Storage and update profile
   */
  uploadAvatar: async (userId: string, file: File): Promise<AvatarUploadResult | null> => {
    if (!isSupabaseConfigured()) {
      set({ error: 'Profile service is not configured', isUploading: false });
      return null;
    }

    set({ isUploading: true, error: null });

    try {
      const supabase = getSupabase();
      const filePath = generateAvatarPath(userId, file);

      // Delete previous avatar if exists (to clean up storage)
      const currentProfile = get().profile;
      if (currentProfile?.avatar_url) {
        // Extract path from URL if it's a Supabase storage URL
        try {
          const urlParts = currentProfile.avatar_url.split('/avatars/');
          if (urlParts.length > 1) {
            const oldPath = urlParts[1];
            await supabase.storage.from('avatars').remove([oldPath]);
          }
        } catch {
          // Ignore errors when deleting old avatar
        }
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

      if (uploadError) {
        set({
          isUploading: false,
          error: mapProfileError(uploadError.message),
        });
        return null;
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const avatarUrl = urlData.publicUrl;

      // Update profile with new avatar URL
      const success = await get().updateProfile(userId, { avatar_url: avatarUrl });

      set({ isUploading: false });

      if (!success) {
        return null;
      }

      return {
        url: avatarUrl,
        path: filePath,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload avatar';
      set({
        isUploading: false,
        error: mapProfileError(errorMessage),
      });
      return null;
    }
  },

  /**
   * Clear error message
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * Reset store to initial state
   */
  reset: () => {
    set(initialState);
  },

  /**
   * Set profile directly (for optimistic updates or testing)
   */
  setProfile: (profile: Profile | null) => {
    set({ profile });
  },
}));

// Selector hooks for common patterns
export const useProfile = () => useProfileStore(state => state.profile);
export const useProfileLoading = () => useProfileStore(state => state.isLoading);
export const useProfileUploading = () => useProfileStore(state => state.isUploading);
export const useProfileSaving = () => useProfileStore(state => state.isSaving);
export const useProfileError = () => useProfileStore(state => state.error);
