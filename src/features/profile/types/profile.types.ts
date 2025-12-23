/**
 * Profile Type Definitions
 *
 * TypeScript types for profile management operations.
 * Used across profile store, components, and service functions.
 *
 * Story: 2.6 - Implement Profile Management
 */

/**
 * Profile data from users table
 */
export interface Profile {
  /** UUID primary key, references auth.users(id) */
  id: string;
  /** User's email address */
  email: string;
  /** User's display name */
  display_name: string | null;
  /** URL to user's avatar in Supabase Storage */
  avatar_url: string | null;
  /** Whether user has completed onboarding flow */
  onboarding_completed: boolean | null;
  /** Record creation timestamp */
  created_at: string;
  /** Record last update timestamp */
  updated_at: string;
}

/**
 * Data for updating profile
 */
export interface ProfileUpdate {
  /** Updated display name */
  display_name?: string;
  /** Updated avatar URL */
  avatar_url?: string;
  /** Updated onboarding completion status */
  onboarding_completed?: boolean;
}

/**
 * Result from avatar upload operation
 */
export interface AvatarUploadResult {
  /** Public URL of the uploaded avatar */
  url: string;
  /** Storage path of the uploaded file */
  path: string;
}

/**
 * Profile store state shape
 */
export interface ProfileState {
  /** Current user's profile data */
  profile: Profile | null;
  /** Whether profile data is being loaded */
  isLoading: boolean;
  /** Whether avatar is being uploaded */
  isUploading: boolean;
  /** Whether profile is being saved */
  isSaving: boolean;
  /** Current error message */
  error: string | null;
}

/**
 * Profile store actions
 */
export interface ProfileActions {
  /** Fetch profile data for a user */
  fetchProfile: (userId: string) => Promise<void>;
  /** Update profile data */
  updateProfile: (userId: string, data: ProfileUpdate) => Promise<boolean>;
  /** Upload avatar to storage and update profile */
  uploadAvatar: (userId: string, file: File) => Promise<AvatarUploadResult | null>;
  /** Clear current error */
  clearError: () => void;
  /** Reset store to initial state */
  reset: () => void;
  /** Set profile directly (for optimistic updates) */
  setProfile: (profile: Profile | null) => void;
}

/**
 * Complete profile store type
 */
export type ProfileStore = ProfileState & ProfileActions;

/**
 * Form data for profile edit form (React Hook Form)
 */
export interface ProfileFormData {
  /** Display name (required, 3-50 characters) */
  display_name: string;
}

/**
 * Validation constants for profile fields
 */
export const PROFILE_VALIDATION = {
  displayName: {
    minLength: 3,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9\s\-_]+$/,
    patternMessage:
      'Display name can only contain letters, numbers, spaces, hyphens, and underscores',
  },
  avatar: {
    maxSizeBytes: 2 * 1024 * 1024, // 2MB
    maxSizeMB: 2,
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    acceptedExtensions: '.jpg,.jpeg,.png,.webp',
  },
} as const;
