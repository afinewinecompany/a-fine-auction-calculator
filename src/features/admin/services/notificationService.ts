/**
 * Notification Service
 *
 * Provides notification broadcasting and retrieval for admin communication.
 * Admins can broadcast notifications to all users or specific users by email.
 *
 * Story: 13.7 - Broadcast In-App Notifications
 */

import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type {
  Notification,
  NotificationHistoryItem,
  SendNotificationInput,
} from '../types/admin.types';

/**
 * Database row type for notifications table
 */
interface NotificationRow {
  id: string;
  title: string;
  message: string;
  type: string;
  target_user_id: string | null;
  sent_by: string;
  sent_at: string;
  created_at: string;
}

/**
 * Database row type for notifications with joined user data
 */
interface NotificationWithUsersRow extends NotificationRow {
  sender?: { email: string } | null;
  target_user?: { email: string } | null;
}

/**
 * Transform a database notification row to Notification type
 */
function transformNotification(row: NotificationRow): Notification {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    type: row.type as Notification['type'],
    targetUserId: row.target_user_id,
    sentBy: row.sent_by,
    sentAt: row.sent_at,
  };
}

/**
 * Transform a database notification row with user data to NotificationHistoryItem
 */
function transformNotificationWithUsers(row: NotificationWithUsersRow): NotificationHistoryItem {
  return {
    ...transformNotification(row),
    senderEmail: row.sender?.email,
    targetEmail: row.target_user?.email ?? null,
  };
}

/**
 * Broadcast a notification to all users or a specific user
 *
 * @param input - Notification data including title, message, type, and optional target email
 * @returns The created notification
 * @throws Error if the operation fails
 */
export async function broadcastNotification(input: SendNotificationInput): Promise<Notification> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }

  const supabase = getSupabase();

  // If targeting a specific user, look up their user ID by email
  let targetUserId: string | null = null;
  if (input.targetEmail) {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', input.targetEmail)
      .single();

    if (userError || !userData) {
      throw new Error(`User with email "${input.targetEmail}" not found`);
    }
    targetUserId = userData.id;
  }

  // Insert the notification
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      title: input.title,
      message: input.message,
      type: input.type,
      target_user_id: targetUserId,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to broadcast notification:', error);
    throw new Error('Failed to send notification');
  }

  return transformNotification(data as NotificationRow);
}

/**
 * Get notification history for admin dashboard
 * Returns the most recent notifications with sender and target user information
 *
 * @param limit - Maximum number of notifications to return (default: 20)
 * @returns Array of notification history items
 */
export async function getNotificationHistory(
  limit: number = 20
): Promise<NotificationHistoryItem[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('notifications')
    .select(
      `
      id,
      title,
      message,
      type,
      target_user_id,
      sent_by,
      sent_at,
      created_at,
      sender:users!notifications_sent_by_fkey(email),
      target_user:users!notifications_target_user_id_fkey(email)
    `
    )
    .order('sent_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to fetch notification history:', error);
    throw new Error('Failed to fetch notification history');
  }

  return (data ?? []).map(row => transformNotificationWithUsers(row as NotificationWithUsersRow));
}

/**
 * Get notifications for the current user (for user-side polling)
 * Returns notifications that are either global (no target) or targeted at the current user
 *
 * @param since - Only return notifications sent after this timestamp (ISO string)
 * @param limit - Maximum number of notifications to return (default: 10)
 * @returns Array of notifications
 */
export async function getUserNotifications(
  since?: string,
  limit: number = 10
): Promise<Notification[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = getSupabase();

  let query = supabase
    .from('notifications')
    .select('*')
    .order('sent_at', { ascending: false })
    .limit(limit);

  // Filter by timestamp if provided
  if (since) {
    query = query.gt('sent_at', since);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch user notifications:', error);
    // Don't throw - just return empty array for user-side polling
    return [];
  }

  return (data ?? []).map(row => transformNotification(row as NotificationRow));
}
