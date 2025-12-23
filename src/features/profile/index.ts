/**
 * Profile Feature Exports
 *
 * Central export point for all profile-related functionality.
 *
 * Story: 2.6 - Implement Profile Management
 */

// Components
export { ProfileView } from './components/ProfileView';
export { ProfileEdit } from './components/ProfileEdit';
export { AvatarUpload } from './components/AvatarUpload';
export { ProfileErrorBoundary } from './components/ProfileErrorBoundary';

// Store and hooks
export {
  useProfileStore,
  useProfile,
  useProfileLoading,
  useProfileUploading,
  useProfileSaving,
  useProfileError,
} from './stores/profileStore';
export { useProfileHook } from './hooks/useProfile';

// Types
export type {
  Profile,
  ProfileUpdate,
  AvatarUploadResult,
  ProfileState,
  ProfileActions,
  ProfileStore,
  ProfileFormData,
} from './types/profile.types';
export { PROFILE_VALIDATION } from './types/profile.types';

// Utilities
export {
  validateDisplayName,
  validateAvatarFile,
  generateAvatarPath,
  getUserInitials,
} from './utils/profileValidation';
