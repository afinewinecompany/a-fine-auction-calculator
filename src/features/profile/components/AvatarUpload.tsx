/**
 * AvatarUpload Component
 *
 * File upload component for user avatar images.
 * Validates file type and size before upload.
 * Shows preview and upload progress.
 *
 * Story: 2.6 - Implement Profile Management
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, Loader2, User } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PROFILE_VALIDATION } from '../types/profile.types';
import { validateAvatarFile, getUserInitials } from '../utils/profileValidation';

interface AvatarUploadProps {
  /** Current avatar URL */
  currentAvatarUrl: string | null;
  /** User's display name for initials fallback */
  displayName: string | null;
  /** User's email for initials fallback */
  email: string;
  /** Whether upload is in progress */
  isUploading: boolean;
  /** Callback when file is selected and validated */
  onFileSelect: (file: File) => void;
  /** Error message to display */
  error?: string | null;
  /** Whether the component is disabled */
  disabled?: boolean;
}

/**
 * AvatarUpload component for selecting and previewing avatar images
 *
 * @example
 * ```tsx
 * <AvatarUpload
 *   currentAvatarUrl={profile.avatar_url}
 *   displayName={profile.display_name}
 *   email={profile.email}
 *   isUploading={isUploading}
 *   onFileSelect={(file) => uploadAvatar(userId, file)}
 *   error={avatarError}
 * />
 * ```
 */
export function AvatarUpload({
  currentAvatarUrl,
  displayName,
  email,
  isUploading,
  onFileSelect,
  error,
  disabled = false,
}: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  // Get initials for fallback avatar
  const initials = getUserInitials(displayName, email);

  // Combined error (local validation error or prop error)
  const displayError = localError || error;

  /**
   * Handle file input change
   */
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Clear previous errors
      setLocalError(null);

      // Validate file
      const validationError = validateAvatarFile(file);
      if (validationError) {
        setLocalError(validationError);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      // Revoke previous preview URL before creating new one
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      // Create preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Trigger file select callback
      onFileSelect(file);
    },
    [onFileSelect, previewUrl]
  );

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  /**
   * Trigger file input click
   */
  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  /**
   * Clear preview when upload completes or fails
   */
  const displayAvatarUrl = previewUrl || currentAvatarUrl;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Display */}
      <div className="relative">
        <Avatar className="h-24 w-24 border-2 border-slate-700">
          {displayAvatarUrl ? (
            <AvatarImage
              src={displayAvatarUrl}
              alt={displayName || 'User avatar'}
              className="object-cover"
            />
          ) : null}
          <AvatarFallback className="bg-slate-800 text-slate-300 text-2xl">
            {initials || <User className="h-10 w-10" />}
          </AvatarFallback>
        </Avatar>

        {/* Upload overlay when uploading */}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={PROFILE_VALIDATION.avatar.acceptedExtensions}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
        aria-label="Upload avatar image"
      />

      {/* Change Avatar Button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleButtonClick}
        disabled={disabled || isUploading}
        className="gap-2"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Camera className="h-4 w-4" />
            Change Avatar
          </>
        )}
      </Button>

      {/* File requirements hint */}
      <p className="text-xs text-slate-500 text-center">
        JPEG, PNG, or WebP. Max {PROFILE_VALIDATION.avatar.maxSizeMB}MB.
      </p>

      {/* Error message */}
      {displayError && (
        <p className="text-sm text-red-500 text-center" role="alert">
          {displayError}
        </p>
      )}
    </div>
  );
}

export default AvatarUpload;
