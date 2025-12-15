/**
 * useToast Hook
 *
 * Placeholder for toast notification hook.
 * Will integrate with sonner (already installed via shadcn/ui) in future stories.
 *
 * @example
 * const { toast } = useToast();
 * toast({ title: 'Success', description: 'Player drafted!' });
 */

import { toast as sonnerToast } from 'sonner';

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Toast notification hook
 *
 * Uses sonner for toast notifications with a consistent API.
 */
export function useToast() {
  const toast = (options: ToastOptions) => {
    const { title, description, variant = 'default', duration, action } = options;

    const toastOptions = {
      description,
      duration,
      action: action
        ? {
            label: action.label,
            onClick: action.onClick,
          }
        : undefined,
    };

    switch (variant) {
      case 'success':
        sonnerToast.success(title, toastOptions);
        break;
      case 'error':
        sonnerToast.error(title, toastOptions);
        break;
      case 'warning':
        sonnerToast.warning(title, toastOptions);
        break;
      case 'info':
        sonnerToast.info(title, toastOptions);
        break;
      default:
        sonnerToast(title, toastOptions);
    }
  };

  return {
    toast,
    success: (title: string, description?: string) =>
      toast({ title, description, variant: 'success' }),
    error: (title: string, description?: string) => toast({ title, description, variant: 'error' }),
    warning: (title: string, description?: string) =>
      toast({ title, description, variant: 'warning' }),
    info: (title: string, description?: string) => toast({ title, description, variant: 'info' }),
  };
}

export default useToast;
