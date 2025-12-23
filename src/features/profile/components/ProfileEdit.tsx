/**
 * ProfileEdit Component
 *
 * Modal dialog for editing user profile information.
 * Uses React Hook Form for form validation.
 * Integrates AvatarUpload for avatar management.
 *
 * Story: 2.6 - Implement Profile Management
 */

import { useCallback, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { AvatarUpload } from './AvatarUpload';
import { useProfileStore } from '../stores/profileStore';
import type { Profile, ProfileFormData } from '../types/profile.types';
import { PROFILE_VALIDATION } from '../types/profile.types';
import { validateDisplayName } from '../utils/profileValidation';

interface ProfileEditProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback to close the dialog */
  onClose: () => void;
  /** Current user profile data */
  profile: Profile;
  /** User ID for updates */
  userId: string;
  /** Callback after successful save */
  onSaveSuccess?: () => void;
}

/**
 * ProfileEdit dialog component for editing profile information
 *
 * @example
 * ```tsx
 * <ProfileEdit
 *   isOpen={isEditOpen}
 *   onClose={() => setIsEditOpen(false)}
 *   profile={profile}
 *   userId={user.id}
 *   onSaveSuccess={() => toast.success('Profile updated!')}
 * />
 * ```
 */
export function ProfileEdit({ isOpen, onClose, profile, userId, onSaveSuccess }: ProfileEditProps) {
  const { updateProfile, uploadAvatar, isSaving, isUploading, error, clearError } =
    useProfileStore();

  // Track if avatar was changed (for success message)
  const [avatarChanged, setAvatarChanged] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize form with React Hook Form
  const form = useForm<ProfileFormData>({
    defaultValues: {
      display_name: profile.display_name || '',
    },
  });

  // Reset form when profile changes or dialog opens
  useEffect(() => {
    if (isOpen) {
      form.reset({
        display_name: profile.display_name || '',
      });
      setAvatarChanged(false);
      setSaveSuccess(false);
      clearError();
    }
  }, [isOpen, profile.display_name, form, clearError]);

  /**
   * Handle avatar file selection
   */
  const handleAvatarSelect = useCallback(
    async (file: File) => {
      setAvatarChanged(true);
      await uploadAvatar(userId, file);
    },
    [userId, uploadAvatar]
  );

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    async (data: ProfileFormData) => {
      setSaveSuccess(false);

      // Trim and validate display name
      const trimmedName = data.display_name.trim();
      const validationError = validateDisplayName(trimmedName);
      if (validationError) {
        form.setError('display_name', { message: validationError });
        return;
      }

      // Only update if display name actually changed
      if (trimmedName !== profile.display_name) {
        const success = await updateProfile(userId, { display_name: trimmedName });
        if (success) {
          setSaveSuccess(true);
          onSaveSuccess?.();
          // Close dialog after short delay to show success
          setTimeout(() => {
            onClose();
          }, 500);
        }
      } else if (avatarChanged) {
        // Avatar was changed but not display name - still consider it a success
        setSaveSuccess(true);
        onSaveSuccess?.();
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        // No changes - just close
        onClose();
      }
    },
    [profile.display_name, userId, updateProfile, avatarChanged, onSaveSuccess, onClose, form]
  );

  /**
   * Handle cancel button click
   */
  const handleCancel = useCallback(() => {
    form.reset();
    clearError();
    onClose();
  }, [form, clearError, onClose]);

  // Combined loading state
  const isLoading = isSaving || isUploading;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && handleCancel()}>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Profile</DialogTitle>
          <DialogDescription className="text-slate-400">
            Update your profile information. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Avatar Upload Section */}
            <div className="flex justify-center py-4">
              <AvatarUpload
                currentAvatarUrl={profile.avatar_url}
                displayName={profile.display_name}
                email={profile.email}
                isUploading={isUploading}
                onFileSelect={handleAvatarSelect}
                error={error && isUploading ? error : null}
                disabled={isSaving}
              />
            </div>

            {/* Display Name Field */}
            <FormField
              control={form.control}
              name="display_name"
              rules={{
                required: 'Display name is required',
                minLength: {
                  value: PROFILE_VALIDATION.displayName.minLength,
                  message: `Display name must be at least ${PROFILE_VALIDATION.displayName.minLength} characters`,
                },
                maxLength: {
                  value: PROFILE_VALIDATION.displayName.maxLength,
                  message: `Display name must be at most ${PROFILE_VALIDATION.displayName.maxLength} characters`,
                },
                pattern: {
                  value: PROFILE_VALIDATION.displayName.pattern,
                  message: PROFILE_VALIDATION.displayName.patternMessage,
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Display Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter your display name"
                      disabled={isLoading}
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    />
                  </FormControl>
                  <FormDescription className="text-slate-500">
                    {PROFILE_VALIDATION.displayName.minLength}-
                    {PROFILE_VALIDATION.displayName.maxLength} characters. Letters, numbers, spaces,
                    hyphens, and underscores allowed.
                  </FormDescription>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            {/* Email (read-only) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Email</label>
              <Input
                value={profile.email}
                disabled
                className="bg-slate-800/50 border-slate-700 text-slate-400 cursor-not-allowed"
              />
              <p className="text-xs text-slate-500">Email cannot be changed here.</p>
            </div>

            {/* Error Display */}
            {error && !isUploading && (
              <div className="p-3 rounded-md bg-red-900/20 border border-red-900/50">
                <p className="text-sm text-red-400" role="alert">
                  {error}
                </p>
              </div>
            )}

            {/* Success Message */}
            {saveSuccess && (
              <div className="p-3 rounded-md bg-emerald-900/20 border border-emerald-900/50">
                <p className="text-sm text-emerald-400" role="status">
                  Profile updated successfully!
                </p>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default ProfileEdit;
