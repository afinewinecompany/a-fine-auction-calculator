/**
 * Admin Feature Exports
 *
 * Central export point for admin feature components, hooks, and types.
 *
 * Story: 13.1 - Create Admin Dashboard Route
 * Story: 13.2 - Display Active Drafts List
 * Story: 13.3 - Monitor API Health for Integrations
 * Story: 13.4 - View Error Rates with Automated Alerts
 * Story: 13.5 - View Connection Success Metrics
 * Story: 13.6 - View Projection Sync Logs
 * Story: 13.7 - Broadcast In-App Notifications
 * Story: 13.8 - Track Draft Completion Rates
 * Story: 13.9 - View Detailed Incident Logs
 * Story: 13.10 - Drill Down into Error Logs
 * Story: 13.11 - View Inflation Calculation Performance Metrics
 */

// Components
export { AdminDashboard } from './components/AdminDashboard';
export { ActiveDraftsWidget } from './components/ActiveDraftsWidget';
export { DraftStatusBadge } from './components/DraftStatusBadge';
export { APIHealthWidget } from './components/APIHealthWidget';
export { APIStatusCard } from './components/APIStatusCard';
export { ErrorRatesWidget } from './components/ErrorRatesWidget';
export { ErrorRateCard } from './components/ErrorRateCard';
export { ConnectionMetricsWidget } from './components/ConnectionMetricsWidget';
export { ProjectionSyncLogsWidget } from './components/ProjectionSyncLogsWidget';
export { ProjectionSyncLogCard } from './components/ProjectionSyncLogCard';
export { BroadcastNotificationDialog } from './components/BroadcastNotificationDialog';
export { NotificationHistoryWidget } from './components/NotificationHistoryWidget';
export { DraftCompletionWidget } from './components/DraftCompletionWidget';
export { IncidentLogsWidget } from './components/IncidentLogsWidget';
export { IncidentLogCard } from './components/IncidentLogCard';
export { ErrorLogsPage } from './components/ErrorLogsPage';
export { ErrorLogTable } from './components/ErrorLogTable';
export { ErrorFrequencyChart } from './components/ErrorFrequencyChart';
export { InflationPerformanceWidget } from './components/InflationPerformanceWidget';

// Hooks
export { useAdminCheck } from './hooks/useAdminCheck';
export { useActiveDrafts } from './hooks/useActiveDrafts';
export { useAPIHealth } from './hooks/useAPIHealth';
export { useErrorRates } from './hooks/useErrorRates';
export { useConnectionMetrics } from './hooks/useConnectionMetrics';
export { useProjectionSyncLogs } from './hooks/useProjectionSyncLogs';
export { useNotificationHistory } from './hooks/useNotificationHistory';
export { useNotifications } from './hooks/useNotifications';
export { useDraftCompletionMetrics } from './hooks/useDraftCompletionMetrics';
export { useIncidentLogs } from './hooks/useIncidentLogs';
export { useErrorLogs } from './hooks/useErrorLogs';
export { useInflationPerformanceMetrics } from './hooks/useInflationPerformanceMetrics';

// Services
export { checkAllAPIs, checkSingleAPI } from './services/apiHealthService';
export {
  getErrorRates,
  countAlertsAboveThreshold,
  ERROR_THRESHOLD,
} from './services/errorRateService';
export {
  getConnectionMetrics,
  getDailyConnectionDetails,
  countLowSuccessRateApis,
  getSuccessRateColor,
  SUCCESS_THRESHOLDS,
} from './services/connectionMetricsService';
export {
  broadcastNotification,
  getNotificationHistory,
  getUserNotifications,
} from './services/notificationService';
export { getDraftCompletionMetrics, isBelowTarget } from './services/draftCompletionService';
export { getInflationPerformanceMetrics } from './services/inflationPerformanceService';
export { generateCSV, downloadCSV, exportErrorLogsToCSV } from './utils/exportErrorLogs';

// Types
export type {
  AdminUser,
  AdminDashboardProps,
  AdminCheckResult,
  AdminNavItem,
  DraftStatus,
  ActiveDraft,
  APIHealthStatus,
  APIHealthStatusType,
  ErrorRate,
  ErrorRateTrend,
  ConnectionMetrics,
  DailySuccessRate,
  DailyConnectionDetails,
  ProjectionSyncLog,
  ProjectionSyncType,
  ProjectionSyncStatus,
  Notification,
  NotificationType,
  SendNotificationInput,
  NotificationHistoryItem,
  DraftCompletionMetrics,
  DailyCompletionRate,
  CompletionRateColor,
  IncidentLog,
  IncidentType,
  IncidentSeverity,
  IncidentLogsSummary,
  APIName,
  ErrorStatus,
  ErrorLog,
  DateRangeOption,
  ErrorLogsFilter,
  ErrorFrequencyPoint,
  InflationPerformanceMetrics,
  HourlyLatencyPoint,
  LatencyThresholdLevel,
} from './types/admin.types';

export {
  getCompletionRateColor,
  COMPLETION_RATE_THRESHOLDS,
  getSeverityColorClasses,
  getIncidentTypeDisplayName,
  SEVERITY_COLORS,
  API_DISPLAY_NAMES,
  getAPIDisplayName,
  LATENCY_THRESHOLDS,
  getLatencyThresholdLevel,
  getLatencyColorClasses,
  isP99AlertTriggered,
} from './types/admin.types';

// Hook result types
export type { UseActiveDraftsResult } from './hooks/useActiveDrafts';
export type { UseAPIHealthResult } from './hooks/useAPIHealth';
export type { UseErrorRatesResult } from './hooks/useErrorRates';
export type { UseConnectionMetricsResult } from './hooks/useConnectionMetrics';
export type { UseProjectionSyncLogsResult } from './hooks/useProjectionSyncLogs';
export type { UseNotificationHistoryResult } from './hooks/useNotificationHistory';
export type { UseNotificationsResult } from './hooks/useNotifications';
export type { UseDraftCompletionMetricsResult } from './hooks/useDraftCompletionMetrics';
export type { UseIncidentLogsResult, UseIncidentLogsOptions } from './hooks/useIncidentLogs';
export type { UseErrorLogsResult } from './hooks/useErrorLogs';
export type { UseInflationPerformanceMetricsResult } from './hooks/useInflationPerformanceMetrics';
