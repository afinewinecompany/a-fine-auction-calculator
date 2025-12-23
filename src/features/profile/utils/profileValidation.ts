/**
 * Profile Validation Utilities
 *
 * Validation rules and helper functions for profile fields.
 * Used with React Hook Form for form validation.
 *
 * Story: 2.6 - Implement Profile Management
 */

import { PROFILE_VALIDATION } from '../types/profile.types';

/**
 * Validate display name
 *
 * @param value - Display name to validate
 * @returns Error message or undefined if valid
 */
export const validateDisplayName = (value: string): string | undefined => {
  const trimmed = value.trim();

  if (!trimmed) {
    return 'Display name is required';
  }

  if (trimmed.length < PROFILE_VALIDATION.displayName.minLength) {
    return `Display name must be at least ${PROFILE_VALIDATION.displayName.minLength} characters`;
  }

  if (trimmed.length > PROFILE_VALIDATION.displayName.maxLength) {
    return `Display name must be at most ${PROFILE_VALIDATION.displayName.maxLength} characters`;
  }

  if (!PROFILE_VALIDATION.displayName.pattern.test(trimmed)) {
    return PROFILE_VALIDATION.displayName.patternMessage;
  }

  return undefined;
};

/**
 * Validate avatar file
 *
 * @param file - File to validate
 * @returns Error message or undefined if valid
 */
export const validateAvatarFile = (file: File): string | undefined => {
  // Check file type - cast to readonly string array for includes check
  const acceptedTypes: readonly string[] = PROFILE_VALIDATION.avatar.acceptedTypes;
  if (!acceptedTypes.includes(file.type)) {
    return `File type must be JPEG, PNG, or WebP`;
  }

  // Check file size
  if (file.size > PROFILE_VALIDATION.avatar.maxSizeBytes) {
    return `File size must be less than ${PROFILE_VALIDATION.avatar.maxSizeMB}MB`;
  }

  return undefined;
};

/**
 * Generate unique avatar filename
 *
 * @param userId - User's UUID
 * @param file - Original file for extension
 * @returns Unique filename with path
 */
export const generateAvatarPath = (userId: string, file: File): string => {
  const timestamp = Date.now();
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  return `${userId}/${timestamp}-avatar.${extension}`;
};

/**
 * Get user initials for avatar fallback
 *
 * @param displayName - User's display name
 * @param email - User's email (fallback)
 * @returns 1-2 character initials string
 */
export const getUserInitials = (displayName: string | null, email: string): string => {
  if (displayName && displayName.trim().length > 0) {
    const words = displayName.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return displayName.trim().substring(0, 2).toUpperCase();
  }

  // Fallback to email username
  const emailUsername = email.split('@')[0];
  if (emailUsername && emailUsername.length > 0) {
    return emailUsername.substring(0, 2).toUpperCase();
  }

  return 'U';
};
