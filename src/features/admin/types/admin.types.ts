/**
 * Admin Feature Type Definitions
 *
 * TypeScript interfaces for admin-related data and components.
 *
 * Story: 13.1 - Create Admin Dashboard Route
 */

import type { Tables } from '@/types/database.types';

/**
 * API Health Status for monitoring integrations
 * Story: 13.3 - Monitor API Health for Integrations
 */
export type APIHealthStatusType = 'healthy' | 'degraded' | 'down';

/**
 * API Health Status interface for individual API monitoring
 * Story: 13.3 - Monitor API Health for Integrations
 */
export interface APIHealthStatus {
  /** Display name of the API */
  name: string;
  /** Current health status */
  status: APIHealthStatusType;
  /** Timestamp of last successful API call (ISO string) */
  lastSuccessfulCall: string | null;
  /** Response time in milliseconds */
  responseTime: number | null;
  /** Error rate percentage (0-100) */
  errorRate: number;
  /** Recent error messages */
  recentErrors: string[];
}

/**
 * Admin user extends base user with is_admin flag
 * This is the base Users type from database which already includes is_admin
 */
export type AdminUser = Tables<'users'>;

/**
 * Admin dashboard props
 */
export interface AdminDashboardProps {
  /** Optional class name for styling */
  className?: string;
}

/**
 * Result from useAdminCheck hook
 */
export interface AdminCheckResult {
  /** Whether the current user has admin privileges */
  isAdmin: boolean;
  /** Whether the admin check is still loading */
  loading: boolean;
  /** Error message if admin check failed */
  error: string | null;
}

/**
 * Admin navigation item configuration
 */
export interface AdminNavItem {
  /** Unique identifier for the nav item */
  id: string;
  /** Display label */
  label: string;
  /** Route path */
  path?: string;
  /** Whether this is the current page */
  active: boolean;
  /** Whether the feature is not yet implemented */
  disabled: boolean;
}

/**
 * Draft status type for active drafts monitoring
 * Story: 13.2 - Display Active Drafts List
 */
export type DraftStatus = 'active' | 'paused' | 'completed' | 'error';

/**
 * Error rate trend direction
 * Story: 13.4 - View Error Rates with Automated Alerts
 */
export type ErrorRateTrend = 'up' | 'down' | 'stable';

/**
 * Error rate data for a single API
 * Story: 13.4 - View Error Rates with Automated Alerts
 */
export interface ErrorRate {
  /** API name (display name) */
  apiName: string;
  /** API name as stored in database */
  apiKey: 'couch_managers' | 'fangraphs' | 'google_sheets';
  /** Error rate percentage over last 24 hours */
  errorRate24h: number;
  /** Number of errors in last 24 hours */
  errorCount: number;
  /** Total health checks in last 24 hours */
  totalChecks: number;
  /** Trend direction comparing last 1h to previous 23h */
  trend: ErrorRateTrend;
  /** Whether error rate is at or above 5% threshold */
  isAboveThreshold: boolean;
}

/**
 * Active draft data structure returned from database query
 * Includes joined data from leagues and users tables
 * Story: 13.2 - Display Active Drafts List
 */
export interface ActiveDraft {
  /** Unique draft identifier */
  id: string;
  /** Current draft status */
  status: DraftStatus;
  /** When the draft was started */
  started_at: string;
  /** Timestamp of last activity (sync or user action) */
  last_activity: string;
  /** Error message if status is 'error' */
  error_message: string | null;
  /** League information (joined from leagues table) */
  league: {
    name: string;
    team_count: number;
    budget: number;
  };
  /** User information (joined from users table) */
  user: {
    email: string;
    full_name: string | null;
  };
}

/**
 * Daily success rate data point for trend chart
 * Story: 13.5 - View Connection Success Metrics
 */
export interface DailySuccessRate {
  /** Date string (YYYY-MM-DD format) */
  date: string;
  /** Success rate percentage (0-100) */
  successRate: number;
}

/**
 * Connection metrics for a single API over 7 days
 * Story: 13.5 - View Connection Success Metrics
 */
export interface ConnectionMetrics {
  /** API display name */
  apiName: string;
  /** API key as stored in database */
  apiKey: 'couch_managers' | 'fangraphs' | 'google_sheets';
  /** Success rate percentage over last 7 days */
  successRate7d: number;
  /** Total number of API calls */
  totalCalls: number;
  /** Number of successful calls (status = 'healthy') */
  successfulCalls: number;
  /** Number of failed calls (status = 'degraded' or 'down') */
  failedCalls: number;
  /** Daily success rates for the last 7 days (for trend chart) */
  dailyRates: DailySuccessRate[];
}

/**
 * Detailed metrics for a specific day (drill-down)
 * Story: 13.5 - View Connection Success Metrics
 */
export interface DailyConnectionDetails {
  /** API display name */
  apiName: string;
  /** Success rate percentage */
  successRate: number;
  /** Total calls on that day */
  totalCalls: number;
  /** Successful calls on that day */
  successfulCalls: number;
  /** Failed calls on that day */
  failedCalls: number;
  /** Average response time in milliseconds */
  avgResponseTimeMs: number | null;
}

/**
 * Notification type for admin broadcasts
 * Story: 13.7 - Broadcast In-App Notifications
 */
export type NotificationType = 'info' | 'warning' | 'error';

/**
 * Notification data structure
 * Story: 13.7 - Broadcast In-App Notifications
 */
export interface Notification {
  /** Unique notification identifier */
  id: string;
  /** Notification title */
  title: string;
  /** Notification message body */
  message: string;
  /** Type of notification: info, warning, or error */
  type: NotificationType;
  /** Target user ID (null for broadcast to all users) */
  targetUserId: string | null;
  /** ID of the admin who sent the notification */
  sentBy: string;
  /** Timestamp when the notification was sent (ISO string) */
  sentAt: string;
}

/**
 * Input data for sending a notification
 * Story: 13.7 - Broadcast In-App Notifications
 */
export interface SendNotificationInput {
  /** Notification title */
  title: string;
  /** Notification message body */
  message: string;
  /** Type of notification: info, warning, or error */
  type: NotificationType;
  /** Target user email (null for broadcast to all users) */
  targetEmail: string | null;
}

/**
 * Notification history item with sender information
 * Story: 13.7 - Broadcast In-App Notifications
 */
export interface NotificationHistoryItem extends Notification {
  /** Email of the sender (joined from users table) */
  senderEmail?: string;
  /** Email of the target user (joined from users table) */
  targetEmail?: string | null;
}

/**
 * Projection sync type (source system)
 * Story: 13.6 - View Projection Sync Logs
 */
export type ProjectionSyncType = 'fangraphs' | 'google_sheets';

/**
 * Projection sync status
 * Story: 13.6 - View Projection Sync Logs
 */
export type ProjectionSyncStatus = 'success' | 'failure';

/**
 * Projection sync log entry
 * Story: 13.6 - View Projection Sync Logs
 */
export interface ProjectionSyncLog {
  /** Unique log identifier */
  id: string;
  /** Source system (fangraphs or google_sheets) */
  syncType: ProjectionSyncType;
  /** Sync operation status */
  status: ProjectionSyncStatus;
  /** Number of players updated (null if failed) */
  playersUpdated: number | null;
  /** Error message (only present for failures) */
  errorMessage: string | null;
  /** When the sync operation started (ISO string) */
  startedAt: string;
  /** When the sync operation completed (ISO string, null if still running) */
  completedAt: string | null;
}

/**
 * Daily completion rate data point for trend chart
 * Story: 13.8 - Track Draft Completion Rates
 */
export interface DailyCompletionRate {
  /** Date string (YYYY-MM-DD format) */
  date: string;
  /** Completion rate percentage (0-100) */
  completionRate: number;
}

/**
 * Draft completion metrics for admin dashboard
 * Story: 13.8 - Track Draft Completion Rates
 */
export interface DraftCompletionMetrics {
  /** Total number of drafts in the last 30 days */
  totalDrafts: number;
  /** Number of drafts that completed successfully */
  completedDrafts: number;
  /** Number of drafts that were abandoned */
  abandonedDrafts: number;
  /** Number of drafts that ended in error */
  errorDrafts: number;
  /** Overall completion rate percentage (0-100) */
  completionRate: number;
  /** Daily completion rates for trend chart (last 30 days) */
  dailyRates: DailyCompletionRate[];
}

/**
 * Completion rate color category
 * Story: 13.8 - Track Draft Completion Rates
 */
export type CompletionRateColor = 'green' | 'yellow' | 'red';

/**
 * Thresholds for completion rate color coding
 * Story: 13.8 - Track Draft Completion Rates
 */
export const COMPLETION_RATE_THRESHOLDS = {
  /** Green threshold: >= 80% */
  GREEN: 80,
  /** Yellow threshold: >= 70% (between 70-80%) */
  YELLOW: 70,
} as const;

/**
 * Get completion rate color based on rate percentage
 * Story: 13.8 - Track Draft Completion Rates
 */
export function getCompletionRateColor(rate: number): CompletionRateColor {
  if (rate >= COMPLETION_RATE_THRESHOLDS.GREEN) return 'green';
  if (rate >= COMPLETION_RATE_THRESHOLDS.YELLOW) return 'yellow';
  return 'red';
}

/**
 * Incident type for categorizing system failures
 * Story: 13.9 - View Detailed Incident Logs
 */
export type IncidentType = 'api_failure' | 'draft_error' | 'sync_failure' | 'system_error';

/**
 * Incident severity level
 * Story: 13.9 - View Detailed Incident Logs
 */
export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';

/**
 * Incident log entry from database
 * Story: 13.9 - View Detailed Incident Logs
 */
export interface IncidentLog {
  /** Unique incident identifier */
  id: string;
  /** Type of incident: api_failure, draft_error, sync_failure, system_error */
  incidentType: IncidentType;
  /** Severity level: critical, high, medium, low */
  severity: IncidentSeverity;
  /** Short title describing the incident */
  title: string;
  /** Detailed description of what happened */
  description: string;
  /** Number of users affected by this incident */
  affectedUsersCount: number;
  /** List of recovery actions taken */
  recoveryActions: string[];
  /** When the incident occurred (ISO string) */
  occurredAt: string;
  /** When the incident was resolved (ISO string, null if unresolved) */
  resolvedAt: string | null;
  /** Time taken to resolve in minutes (null if unresolved) */
  resolutionTimeMinutes: number | null;
}

/**
 * Summary statistics for incident logs
 * Story: 13.9 - View Detailed Incident Logs
 */
export interface IncidentLogsSummary {
  /** Total number of incidents in the time period */
  totalIncidents: number;
  /** Average resolution time in minutes */
  avgResolutionTimeMinutes: number;
  /** Breakdown by severity */
  bySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  /** Breakdown by type */
  byType: {
    api_failure: number;
    draft_error: number;
    sync_failure: number;
    system_error: number;
  };
}

/**
 * Severity color mapping for UI display
 * Story: 13.9 - View Detailed Incident Logs
 */
export const SEVERITY_COLORS: Record<IncidentSeverity, string> = {
  critical: 'red',
  high: 'orange',
  medium: 'yellow',
  low: 'blue',
} as const;

/**
 * Get Tailwind CSS color classes for severity badge
 * Story: 13.9 - View Detailed Incident Logs
 */
export function getSeverityColorClasses(severity: IncidentSeverity): string {
  switch (severity) {
    case 'critical':
      return 'bg-red-500/20 text-red-400 border-red-500/50';
    case 'high':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
    case 'medium':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    case 'low':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
  }
}

/**
 * Get display name for incident type
 * Story: 13.9 - View Detailed Incident Logs
 */
export function getIncidentTypeDisplayName(type: IncidentType): string {
  switch (type) {
    case 'api_failure':
      return 'API Failure';
    case 'draft_error':
      return 'Draft Error';
    case 'sync_failure':
      return 'Sync Failure';
    case 'system_error':
      return 'System Error';
  }
}

/**
 * API name type for error logs
 * Story: 13.10 - Drill Down into Error Logs
 */
export type APIName = 'couch_managers' | 'fangraphs' | 'google_sheets';

/**
 * Error status type (only degraded or down)
 * Story: 13.10 - Drill Down into Error Logs
 */
export type ErrorStatus = 'degraded' | 'down';

/**
 * Error log entry from api_health_logs table
 * Story: 13.10 - Drill Down into Error Logs
 */
export interface ErrorLog {
  /** Unique log identifier */
  id: string;
  /** API name: couch_managers, fangraphs, or google_sheets */
  apiName: APIName;
  /** Error status: degraded or down */
  status: ErrorStatus;
  /** HTTP status code (e.g., 500, 503, 429) */
  statusCode: number | null;
  /** Error message describing the failure */
  errorMessage: string;
  /** API endpoint URL that was called */
  requestUrl: string | null;
  /** Response time in milliseconds */
  responseTimeMs: number | null;
  /** Timestamp when the error occurred (ISO string) */
  checkedAt: string;
}

/**
 * Date range filter options for error logs
 * Story: 13.10 - Drill Down into Error Logs
 */
export type DateRangeOption = '24h' | '7d' | '30d' | 'custom';

/**
 * Filter state for error logs page
 * Story: 13.10 - Drill Down into Error Logs
 */
export interface ErrorLogsFilter {
  /** Date range preset or 'custom' for custom range */
  dateRange: DateRangeOption;
  /** Custom start date (ISO string) - only used when dateRange is 'custom' */
  customStartDate?: string;
  /** Custom end date (ISO string) - only used when dateRange is 'custom' */
  customEndDate?: string;
  /** Search query for filtering by error message or status code */
  searchQuery: string;
}

/**
 * Error frequency data point for chart
 * Story: 13.10 - Drill Down into Error Logs
 */
export interface ErrorFrequencyPoint {
  /** Time bucket (hour or day, ISO string) */
  time: string;
  /** Number of errors in this time bucket */
  count: number;
}

/**
 * API display name mapping
 * Story: 13.10 - Drill Down into Error Logs
 */
export const API_DISPLAY_NAMES: Record<APIName, string> = {
  couch_managers: 'Couch Managers',
  fangraphs: 'Fangraphs',
  google_sheets: 'Google Sheets',
} as const;

/**
 * Get display name for an API
 * Story: 13.10 - Drill Down into Error Logs
 */
export function getAPIDisplayName(apiName: APIName): string {
  return API_DISPLAY_NAMES[apiName];
}

// =============================================================================
// Inflation Performance Metrics (Story 13.11)
// =============================================================================

/**
 * Hourly latency data point for 24h trend chart
 * Story: 13.11 - View Inflation Calculation Performance Metrics
 */
export interface HourlyLatencyPoint {
  /** Hour timestamp (ISO string) */
  hour: string;
  /** Median latency for the hour in milliseconds */
  medianLatency: number;
}

/**
 * Inflation calculation performance metrics from the database
 * Story: 13.11 - View Inflation Calculation Performance Metrics
 */
export interface InflationPerformanceMetrics {
  /** Median latency in milliseconds (50th percentile) */
  medianLatency: number;
  /** 95th percentile latency in milliseconds */
  p95Latency: number;
  /** 99th percentile latency in milliseconds */
  p99Latency: number;
  /** Total number of calculations in the last 24 hours */
  totalCalculations: number;
  /** Calculations per minute (averaged over 24 hours) */
  calculationsPerMinute: number;
  /** Hourly latency data points for trend chart */
  hourlyLatencies: HourlyLatencyPoint[];
}

/**
 * Latency threshold level for color coding
 * Story: 13.11 - View Inflation Calculation Performance Metrics
 */
export type LatencyThresholdLevel = 'excellent' | 'warning' | 'critical';

/**
 * Thresholds for latency color coding (NFR-M4)
 * Story: 13.11 - View Inflation Calculation Performance Metrics
 *
 * - Green (excellent): <100ms median
 * - Yellow (warning): 100-200ms median
 * - Red (critical): >200ms median
 */
export const LATENCY_THRESHOLDS = {
  /** Excellent threshold: median < 100ms */
  EXCELLENT: 100,
  /** Warning threshold: median >= 100ms and < 200ms */
  WARNING: 200,
  /** P99 alert threshold: p99 > 500ms */
  P99_ALERT: 500,
} as const;

/**
 * Get latency threshold level based on median latency
 * Story: 13.11 - View Inflation Calculation Performance Metrics
 *
 * @param medianLatency - Median latency in milliseconds
 * @returns Threshold level for color coding
 */
export function getLatencyThresholdLevel(medianLatency: number): LatencyThresholdLevel {
  if (medianLatency < LATENCY_THRESHOLDS.EXCELLENT) return 'excellent';
  if (medianLatency < LATENCY_THRESHOLDS.WARNING) return 'warning';
  return 'critical';
}

/**
 * Check if p99 latency exceeds alert threshold (500ms)
 * Story: 13.11 - View Inflation Calculation Performance Metrics
 *
 * @param p99Latency - 99th percentile latency in milliseconds
 * @returns True if p99 exceeds 500ms threshold
 */
export function isP99AlertTriggered(p99Latency: number): boolean {
  return p99Latency > LATENCY_THRESHOLDS.P99_ALERT;
}

/**
 * Get Tailwind CSS color classes for latency display
 * Story: 13.11 - View Inflation Calculation Performance Metrics
 */
export function getLatencyColorClasses(level: LatencyThresholdLevel): {
  text: string;
  bg: string;
  border: string;
  indicator: string;
  chart: string;
} {
  switch (level) {
    case 'excellent':
      return {
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/20',
        border: 'border-emerald-500/40',
        indicator: 'bg-emerald-500',
        chart: '#10b981',
      };
    case 'warning':
      return {
        text: 'text-yellow-400',
        bg: 'bg-yellow-500/20',
        border: 'border-yellow-500/40',
        indicator: 'bg-yellow-500',
        chart: '#eab308',
      };
    case 'critical':
      return {
        text: 'text-red-400',
        bg: 'bg-red-500/20',
        border: 'border-red-500/40',
        indicator: 'bg-red-500',
        chart: '#ef4444',
      };
  }
}
