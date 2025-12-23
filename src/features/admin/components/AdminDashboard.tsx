/**
 * Admin Dashboard Component
 *
 * Main dashboard component for admin operations and monitoring.
 * Displays navigation to all admin features and overview widgets.
 *
 * Story: 13.1 - Create Admin Dashboard Route
 * Story: 13.2 - Display Active Drafts List
 * Story: 13.6 - View Projection Sync Logs
 * Story: 13.8 - Track Draft Completion Rates
 * Story: 13.9 - View Detailed Incident Logs
 * Story: 13.11 - View Inflation Calculation Performance Metrics
 *
 * @example
 * ```tsx
 * // Used within AdminRoute wrapper
 * <AdminRoute>
 *   <AdminDashboard />
 * </AdminRoute>
 * ```
 */

import {
  Shield,
  LayoutDashboard,
  Users,
  Activity,
  AlertTriangle,
  Wifi,
  FileText,
  Bell,
  CheckCircle,
  FileWarning,
  Search,
  Gauge,
} from 'lucide-react';
import { ActiveDraftsWidget } from './ActiveDraftsWidget';
import { APIHealthWidget } from './APIHealthWidget';
import { ErrorRatesWidget } from './ErrorRatesWidget';
import { ConnectionMetricsWidget } from './ConnectionMetricsWidget';
import { ProjectionSyncLogsWidget } from './ProjectionSyncLogsWidget';
import { NotificationHistoryWidget } from './NotificationHistoryWidget';
import { DraftCompletionWidget } from './DraftCompletionWidget';
import { IncidentLogsWidget } from './IncidentLogsWidget';
import { InflationPerformanceWidget } from './InflationPerformanceWidget';

/** Navigation item configuration */
interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  disabled: boolean;
}

/** Admin navigation items - features from Epic 13 stories */
const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-4 w-4" />,
    active: true,
    disabled: false,
  },
  {
    id: 'drafts',
    label: 'Active Drafts',
    icon: <Users className="h-4 w-4" />,
    active: false,
    disabled: true,
  },
  {
    id: 'api-health',
    label: 'API Health',
    icon: <Activity className="h-4 w-4" />,
    active: false,
    disabled: true,
  },
  {
    id: 'error-rates',
    label: 'Error Rates',
    icon: <AlertTriangle className="h-4 w-4" />,
    active: false,
    disabled: true,
  },
  {
    id: 'connections',
    label: 'Connections',
    icon: <Wifi className="h-4 w-4" />,
    active: false,
    disabled: true,
  },
  {
    id: 'sync-logs',
    label: 'Sync Logs',
    icon: <FileText className="h-4 w-4" />,
    active: false,
    disabled: true,
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: <Bell className="h-4 w-4" />,
    active: false,
    disabled: true,
  },
  {
    id: 'completion',
    label: 'Completion Rates',
    icon: <CheckCircle className="h-4 w-4" />,
    active: false,
    disabled: true,
  },
  {
    id: 'incidents',
    label: 'Incident Logs',
    icon: <FileWarning className="h-4 w-4" />,
    active: false,
    disabled: true,
  },
  {
    id: 'errors',
    label: 'Error Logs',
    icon: <Search className="h-4 w-4" />,
    active: false,
    disabled: true,
  },
  {
    id: 'performance',
    label: 'Performance',
    icon: <Gauge className="h-4 w-4" />,
    active: false,
    disabled: true,
  },
];

export function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-6">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-emerald-500" aria-hidden="true" />
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-slate-400">Real-time system monitoring</p>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-slate-900 border-b border-slate-800 p-4" aria-label="Admin navigation">
        <div className="flex gap-2 flex-wrap">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-md transition-colors
                ${
                  item.active
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : item.disabled
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }
              `}
              disabled={item.disabled}
              aria-current={item.active ? 'page' : undefined}
              title={item.disabled ? 'Coming in future stories' : item.label}
            >
              {item.icon}
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Active Drafts Widget - Full width on small/medium, 2 cols on large */}
          <div className="col-span-full lg:col-span-2">
            <ActiveDraftsWidget />
          </div>

          {/* API Health Widget - Story 13.3 */}
          <div className="col-span-full">
            <APIHealthWidget />
          </div>

          {/* Error Rates Widget - Story 13.4 */}
          <div className="col-span-full">
            <ErrorRatesWidget />
          </div>

          {/* Connection Metrics Widget - Story 13.5 */}
          <div className="col-span-full">
            <ConnectionMetricsWidget />
          </div>

          {/* Projection Sync Logs Widget - Story 13.6 */}
          <div className="col-span-full lg:col-span-2">
            <ProjectionSyncLogsWidget />
          </div>

          {/* Notification History Widget - Story 13.7 */}
          <div className="col-span-full lg:col-span-1">
            <NotificationHistoryWidget />
          </div>

          {/* Draft Completion Widget - Story 13.8 */}
          <div className="col-span-full lg:col-span-2">
            <DraftCompletionWidget />
          </div>

          {/* Incident Logs Widget - Story 13.9 */}
          <div className="col-span-full lg:col-span-2">
            <IncidentLogsWidget />
          </div>

          {/* Inflation Performance Widget - Story 13.11 */}
          <div className="col-span-full lg:col-span-2">
            <InflationPerformanceWidget />
          </div>

          {/* Quick Stats Card (Placeholder) */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              Quick Stats
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-3xl font-bold text-emerald-400">--</p>
                <p className="text-sm text-slate-400">Users Online</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-emerald-400">--</p>
                <p className="text-sm text-slate-400">API Requests/min</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-emerald-400">--</p>
                <p className="text-sm text-slate-400">Error Rate</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4">Live metrics coming in Stories 13.3-13.11</p>
          </div>
        </div>
      </main>
    </div>
  );
}
