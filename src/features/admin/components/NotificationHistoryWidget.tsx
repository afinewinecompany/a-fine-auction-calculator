/**
 * NotificationHistoryWidget Component
 *
 * Dashboard widget that displays sent notifications history.
 * Features:
 * - List of recent notifications
 * - Color-coded notification types (info/warning/error)
 * - Sender and target information
 * - Broadcast notification button
 * - Automatic 1-minute polling
 *
 * Story: 13.7 - Broadcast In-App Notifications
 *
 * @example
 * ```tsx
 * <NotificationHistoryWidget />
 * ```
 */

import { Bell, RefreshCw, Info, AlertTriangle, AlertCircle, Users, User } from 'lucide-react';
import { useNotificationHistory } from '../hooks/useNotificationHistory';
import { BroadcastNotificationDialog } from './BroadcastNotificationDialog';
import type { NotificationHistoryItem, NotificationType } from '../types/admin.types';

/**
 * Get color class for notification type
 */
function getTypeColor(type: NotificationType): string {
  switch (type) {
    case 'info':
      return 'text-blue-400';
    case 'warning':
      return 'text-yellow-400';
    case 'error':
      return 'text-red-400';
    default:
      return 'text-slate-400';
  }
}

/**
 * Get background color class for notification type
 */
function getTypeBgColor(type: NotificationType): string {
  switch (type) {
    case 'info':
      return 'bg-blue-500/10 border-blue-500/30';
    case 'warning':
      return 'bg-yellow-500/10 border-yellow-500/30';
    case 'error':
      return 'bg-red-500/10 border-red-500/30';
    default:
      return 'bg-slate-500/10 border-slate-500/30';
  }
}

/**
 * Get icon for notification type
 */
function TypeIcon({ type }: { type: NotificationType }) {
  const colorClass = getTypeColor(type);

  switch (type) {
    case 'info':
      return <Info className={`h-4 w-4 ${colorClass}`} aria-hidden="true" />;
    case 'warning':
      return <AlertTriangle className={`h-4 w-4 ${colorClass}`} aria-hidden="true" />;
    case 'error':
      return <AlertCircle className={`h-4 w-4 ${colorClass}`} aria-hidden="true" />;
    default:
      return <Bell className={`h-4 w-4 ${colorClass}`} aria-hidden="true" />;
  }
}

/**
 * Format timestamp for display
 */
function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

/**
 * Individual notification card
 */
function NotificationCard({ notification }: { notification: NotificationHistoryItem }) {
  const bgColorClass = getTypeBgColor(notification.type);

  return (
    <div
      className={`rounded-lg p-3 border ${bgColorClass}`}
      data-testid={`notification-card-${notification.id}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <TypeIcon type={notification.type} />
          <span className="font-medium text-white text-sm">{notification.title}</span>
        </div>
        <span className="text-xs text-slate-500 whitespace-nowrap">
          {formatTimestamp(notification.sentAt)}
        </span>
      </div>

      <p className="text-sm text-slate-300 mb-2 line-clamp-2">{notification.message}</p>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1">
          {notification.targetEmail ? (
            <>
              <User className="h-3 w-3" aria-hidden="true" />
              <span>To: {notification.targetEmail}</span>
            </>
          ) : (
            <>
              <Users className="h-3 w-3" aria-hidden="true" />
              <span>All users</span>
            </>
          )}
        </div>
        {notification.senderEmail && <span>From: {notification.senderEmail}</span>}
      </div>
    </div>
  );
}

/**
 * Loading skeleton for notifications
 */
function LoadingSkeleton() {
  return (
    <div className="space-y-3 animate-pulse" data-testid="loading-skeleton">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="bg-slate-800 rounded-lg p-3 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-slate-700 rounded" />
              <div className="h-4 w-32 bg-slate-700 rounded" />
            </div>
            <div className="h-3 w-16 bg-slate-700 rounded" />
          </div>
          <div className="h-4 w-full bg-slate-700 rounded mb-2" />
          <div className="h-3 w-24 bg-slate-700 rounded" />
        </div>
      ))}
    </div>
  );
}

/**
 * Empty state when no notifications have been sent
 */
function EmptyState() {
  return (
    <div className="text-center py-8 text-slate-400" data-testid="empty-state">
      <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
      <p>No notifications sent yet</p>
      <p className="text-xs text-slate-500 mt-1">
        Use the button above to broadcast your first notification
      </p>
    </div>
  );
}

/**
 * NotificationHistoryWidget Component
 */
export function NotificationHistoryWidget() {
  const { notifications, loading, error, refetch } = useNotificationHistory();

  return (
    <div
      className="bg-slate-900 border border-slate-800 rounded-lg p-6"
      data-testid="notification-history-widget"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-emerald-500" aria-hidden="true" />
          <h2 className="text-xl font-semibold text-white">Notifications</h2>
          {notifications.length > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-slate-700 text-slate-300 rounded-full">
              {notifications.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-800"
            title="Refresh notifications"
            aria-label="Refresh notification history"
            data-testid="refresh-button"
            type="button"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Broadcast Button */}
      <div className="mb-4">
        <BroadcastNotificationDialog onNotificationSent={refetch} />
      </div>

      {/* Error State */}
      {error && (
        <div
          className="flex items-center gap-2 p-3 mb-4 bg-red-950 border border-red-800 rounded-lg"
          data-testid="error-message"
        >
          <AlertCircle className="h-4 w-4 text-red-400" />
          <span className="text-sm text-red-400">{error}</span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <LoadingSkeleton />
      ) : notifications.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2" data-testid="notifications-list">
          {notifications.map(notification => (
            <NotificationCard key={notification.id} notification={notification} />
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 flex justify-between text-xs text-slate-500">
        <span>
          {notifications.length > 0
            ? `Showing ${notifications.length} notification${notifications.length === 1 ? '' : 's'}`
            : 'No notifications'}
        </span>
        <span>Auto-refreshes every minute</span>
      </div>
    </div>
  );
}
