/**
 * Notification Service Tests
 *
 * Tests for the notification service that handles admin-to-user
 * notification broadcasting and retrieval.
 *
 * Story: 13.7 - Broadcast In-App Notifications
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock response types
interface MockQueryResult {
  data: unknown;
  error: Error | null;
}

// Mock Supabase responses
let mockSupabaseConfigured = true;
let mockUsersSelectResponse: MockQueryResult = { data: null, error: null };
let mockNotificationsInsertResponse: MockQueryResult = { data: null, error: null };
let mockNotificationsSelectResponse: MockQueryResult = { data: [], error: null };

// Track calls
const mockInsertCalls: unknown[] = [];
const mockSelectCalls: { table: string; columns: string }[] = [];

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: () => mockSupabaseConfigured,
  getSupabase: () => ({
    from: vi.fn((table: string) => {
      if (table === 'users') {
        return {
          select: vi.fn((columns: string) => {
            mockSelectCalls.push({ table, columns });
            return {
              eq: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve(mockUsersSelectResponse)),
              })),
            };
          }),
        };
      }
      if (table === 'notifications') {
        return {
          insert: vi.fn((data: unknown) => {
            mockInsertCalls.push(data);
            return {
              select: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve(mockNotificationsInsertResponse)),
              })),
            };
          }),
          select: vi.fn((columns: string) => {
            mockSelectCalls.push({ table, columns });
            return {
              order: vi.fn(() => ({
                limit: vi.fn(() => Promise.resolve(mockNotificationsSelectResponse)),
                gt: vi.fn(() => ({
                  // For getUserNotifications with since filter
                  order: vi.fn(() => ({
                    limit: vi.fn(() => Promise.resolve(mockNotificationsSelectResponse)),
                  })),
                })),
              })),
              gt: vi.fn(() => ({
                order: vi.fn(() => ({
                  limit: vi.fn(() => Promise.resolve(mockNotificationsSelectResponse)),
                })),
              })),
            };
          }),
        };
      }
      return {
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      };
    }),
  }),
}));

// Import after mocking
import {
  broadcastNotification,
  getNotificationHistory,
  getUserNotifications,
} from '@/features/admin/services/notificationService';

describe('notificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseConfigured = true;
    mockUsersSelectResponse = { data: null, error: null };
    mockNotificationsInsertResponse = { data: null, error: null };
    mockNotificationsSelectResponse = { data: [], error: null };
    mockInsertCalls.length = 0;
    mockSelectCalls.length = 0;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('broadcastNotification', () => {
    it('should throw error when Supabase not configured', async () => {
      mockSupabaseConfigured = false;

      await expect(
        broadcastNotification({
          title: 'Test',
          message: 'Test message',
          type: 'info',
          targetEmail: null,
        })
      ).rejects.toThrow('Supabase is not configured');
    });

    it('should broadcast notification to all users when no targetEmail', async () => {
      mockNotificationsInsertResponse = {
        data: {
          id: 'notif-1',
          title: 'System Maintenance',
          message: 'The system will be down for maintenance.',
          type: 'warning',
          target_user_id: null,
          sent_by: 'admin-123',
          sent_at: '2024-01-15T10:00:00Z',
          created_at: '2024-01-15T10:00:00Z',
        },
        error: null,
      };

      const result = await broadcastNotification({
        title: 'System Maintenance',
        message: 'The system will be down for maintenance.',
        type: 'warning',
        targetEmail: null,
      });

      expect(result).toEqual({
        id: 'notif-1',
        title: 'System Maintenance',
        message: 'The system will be down for maintenance.',
        type: 'warning',
        targetUserId: null,
        sentBy: 'admin-123',
        sentAt: '2024-01-15T10:00:00Z',
      });
    });

    it('should look up user ID when targetEmail is provided', async () => {
      mockUsersSelectResponse = {
        data: { id: 'user-456' },
        error: null,
      };
      mockNotificationsInsertResponse = {
        data: {
          id: 'notif-2',
          title: 'Account Update',
          message: 'Your account has been updated.',
          type: 'info',
          target_user_id: 'user-456',
          sent_by: 'admin-123',
          sent_at: '2024-01-15T10:00:00Z',
          created_at: '2024-01-15T10:00:00Z',
        },
        error: null,
      };

      const result = await broadcastNotification({
        title: 'Account Update',
        message: 'Your account has been updated.',
        type: 'info',
        targetEmail: 'user@example.com',
      });

      expect(result.targetUserId).toBe('user-456');
    });

    it('should throw error when target user not found', async () => {
      mockUsersSelectResponse = {
        data: null,
        error: new Error('Not found'),
      };

      await expect(
        broadcastNotification({
          title: 'Test',
          message: 'Test message',
          type: 'info',
          targetEmail: 'nonexistent@example.com',
        })
      ).rejects.toThrow('User with email "nonexistent@example.com" not found');
    });

    it('should throw error when insert fails', async () => {
      mockNotificationsInsertResponse = {
        data: null,
        error: new Error('Insert failed'),
      };

      await expect(
        broadcastNotification({
          title: 'Test',
          message: 'Test message',
          type: 'info',
          targetEmail: null,
        })
      ).rejects.toThrow('Failed to send notification');
    });
  });

  describe('getNotificationHistory', () => {
    it('should return empty array when Supabase not configured', async () => {
      mockSupabaseConfigured = false;

      const result = await getNotificationHistory();

      expect(result).toEqual([]);
    });

    it('should return notification history with user data', async () => {
      mockNotificationsSelectResponse = {
        data: [
          {
            id: 'notif-1',
            title: 'Alert 1',
            message: 'Message 1',
            type: 'info',
            target_user_id: null,
            sent_by: 'admin-1',
            sent_at: '2024-01-15T10:00:00Z',
            created_at: '2024-01-15T10:00:00Z',
            sender: { email: 'admin@example.com' },
            target_user: null,
          },
          {
            id: 'notif-2',
            title: 'Alert 2',
            message: 'Message 2',
            type: 'warning',
            target_user_id: 'user-1',
            sent_by: 'admin-1',
            sent_at: '2024-01-15T09:00:00Z',
            created_at: '2024-01-15T09:00:00Z',
            sender: { email: 'admin@example.com' },
            target_user: { email: 'user@example.com' },
          },
        ],
        error: null,
      };

      const result = await getNotificationHistory();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'notif-1',
        title: 'Alert 1',
        message: 'Message 1',
        type: 'info',
        targetUserId: null,
        sentBy: 'admin-1',
        sentAt: '2024-01-15T10:00:00Z',
        senderEmail: 'admin@example.com',
        targetEmail: null,
      });
      expect(result[1].targetEmail).toBe('user@example.com');
    });

    it('should throw error when fetch fails', async () => {
      mockNotificationsSelectResponse = {
        data: null,
        error: new Error('Fetch failed'),
      };

      await expect(getNotificationHistory()).rejects.toThrow(
        'Failed to fetch notification history'
      );
    });
  });

  describe('getUserNotifications', () => {
    it('should return empty array when Supabase not configured', async () => {
      mockSupabaseConfigured = false;

      const result = await getUserNotifications();

      expect(result).toEqual([]);
    });

    it('should return user notifications', async () => {
      mockNotificationsSelectResponse = {
        data: [
          {
            id: 'notif-1',
            title: 'System Alert',
            message: 'Important message',
            type: 'error',
            target_user_id: null,
            sent_by: 'admin-1',
            sent_at: '2024-01-15T10:00:00Z',
            created_at: '2024-01-15T10:00:00Z',
          },
        ],
        error: null,
      };

      const result = await getUserNotifications();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'notif-1',
        title: 'System Alert',
        message: 'Important message',
        type: 'error',
        targetUserId: null,
        sentBy: 'admin-1',
        sentAt: '2024-01-15T10:00:00Z',
      });
    });

    it('should return empty array on error (silent fail)', async () => {
      mockNotificationsSelectResponse = {
        data: null,
        error: new Error('Fetch failed'),
      };

      // Should not throw, just return empty array
      const result = await getUserNotifications();
      expect(result).toEqual([]);
    });
  });
});
