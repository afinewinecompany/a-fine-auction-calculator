/**
 * BroadcastNotificationDialog Component
 *
 * Dialog for composing and sending admin notifications to users.
 * Allows selection of notification type (info, warning, error) and
 * optional targeting to a specific user by email.
 *
 * Story: 13.7 - Broadcast In-App Notifications
 *
 * @example
 * ```tsx
 * <BroadcastNotificationDialog onNotificationSent={refetch} />
 * ```
 */

import { useState } from 'react';
import { Loader2, Bell, Send } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { broadcastNotification } from '../services/notificationService';
import type { NotificationType } from '../types/admin.types';

/**
 * Props for BroadcastNotificationDialog component
 */
export interface BroadcastNotificationDialogProps {
  /** Callback when a notification is successfully sent */
  onNotificationSent?: () => void;
}

/**
 * BroadcastNotificationDialog Component
 *
 * Renders a dialog for composing notifications:
 * - Title input (required)
 * - Message body textarea (required)
 * - Notification type selector (info/warning/error)
 * - Optional target email for specific user
 * - Send button with loading state
 */
export function BroadcastNotificationDialog({
  onNotificationSent,
}: BroadcastNotificationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<NotificationType>('info');
  const [targetEmail, setTargetEmail] = useState('');

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setTitle('');
    setMessage('');
    setType('info');
    setTargetEmail('');
  };

  /**
   * Handle send button click
   */
  const handleSend = async () => {
    // Validate required fields
    if (!title.trim()) {
      toast.error('Please enter a notification title');
      return;
    }
    if (!message.trim()) {
      toast.error('Please enter a notification message');
      return;
    }

    setIsSending(true);

    try {
      await broadcastNotification({
        title: title.trim(),
        message: message.trim(),
        type,
        targetEmail: targetEmail.trim() || null,
      });

      const targetText = targetEmail.trim() ? `to ${targetEmail}` : 'to all users';
      toast.success(`Notification sent ${targetText}`);
      resetForm();
      setIsOpen(false);
      onNotificationSent?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send notification';
      toast.error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Handle dialog open state change
   */
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 text-white hover:bg-emerald-700">
          <Bell className="h-4 w-4 mr-2" />
          Broadcast Notification
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800 sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-white">Broadcast Notification</DialogTitle>
          <DialogDescription className="text-slate-400">
            Send an in-app notification to all users or a specific user.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="notificationTitle" className="text-white">
              Title <span className="text-red-400">*</span>
            </Label>
            <Input
              id="notificationTitle"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., System Maintenance"
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              disabled={isSending}
              maxLength={100}
            />
          </div>

          {/* Message Textarea */}
          <div className="space-y-2">
            <Label htmlFor="notificationMessage" className="text-white">
              Message <span className="text-red-400">*</span>
            </Label>
            <Textarea
              id="notificationMessage"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Enter your notification message..."
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 min-h-[100px]"
              disabled={isSending}
              maxLength={500}
            />
            <p className="text-xs text-slate-500">{message.length}/500 characters</p>
          </div>

          {/* Notification Type Select */}
          <div className="space-y-2">
            <Label htmlFor="notificationType" className="text-white">
              Type
            </Label>
            <Select value={type} onValueChange={value => setType(value as NotificationType)}>
              <SelectTrigger
                id="notificationType"
                className="bg-slate-800 border-slate-700 text-white"
              >
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="info" className="text-white hover:bg-slate-700">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Info
                  </span>
                </SelectItem>
                <SelectItem value="warning" className="text-white hover:bg-slate-700">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500" />
                    Warning
                  </span>
                </SelectItem>
                <SelectItem value="error" className="text-white hover:bg-slate-700">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Error
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Target Email Input (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="targetEmail" className="text-white">
              Target User Email{' '}
              <span className="text-slate-500 font-normal">
                (optional - leave empty for all users)
              </span>
            </Label>
            <Input
              id="targetEmail"
              type="email"
              value={targetEmail}
              onChange={e => setTargetEmail(e.target.value)}
              placeholder="user@example.com"
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              disabled={isSending}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isSending}
            className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={isSending || !title.trim() || !message.trim()}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Notification
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default BroadcastNotificationDialog;
