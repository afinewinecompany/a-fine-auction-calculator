/**
 * Incident Logs Widget Component
 *
 * Dashboard widget that displays system incident history.
 * Features:
 * - List of incidents from the last 30 days
 * - Color-coded severity badges (critical=red, high=orange, medium=yellow, low=blue)
 * - Filter by incident type: API failure, draft error, sync failure
 * - Filter by severity level
 * - Total incidents and average resolution time summary
 * - Automatic 2-minute polling for real-time updates
 * - Expandable recovery actions
 *
 * Story: 13.9 - View Detailed Incident Logs
 *
 * @example
 * ```tsx
 * <IncidentLogsWidget />
 * ```
 */

import { useState } from 'react';
import { FileWarning, RefreshCw, AlertCircle, XCircle, Clock, Filter } from 'lucide-react';
import { useIncidentLogs } from '../hooks/useIncidentLogs';
import { IncidentLogCard } from './IncidentLogCard';
import type { IncidentType, IncidentSeverity } from '../types/admin.types';

/** Available incident type filter options */
const INCIDENT_TYPE_OPTIONS: { value: IncidentType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'api_failure', label: 'API Failure' },
  { value: 'draft_error', label: 'Draft Error' },
  { value: 'sync_failure', label: 'Sync Failure' },
  { value: 'system_error', label: 'System Error' },
];

/** Available severity filter options */
const SEVERITY_OPTIONS: { value: IncidentSeverity | 'all'; label: string }[] = [
  { value: 'all', label: 'All Severities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

/**
 * Loading skeleton for incident logs
 */
function LoadingSkeleton() {
  return (
    <div className="space-y-3 animate-pulse" data-testid="loading-skeleton">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="bg-slate-800 rounded-lg p-3 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="h-5 w-16 bg-slate-700 rounded" />
              <div className="h-4 w-12 bg-slate-700 rounded" />
            </div>
            <div className="h-3 w-24 bg-slate-700 rounded" />
          </div>
          <div className="h-4 w-48 bg-slate-700 rounded mb-2" />
          <div className="h-3 w-32 bg-slate-700 rounded" />
        </div>
      ))}
    </div>
  );
}

/**
 * Empty state when no incidents match the filters
 */
function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="text-center py-8 text-slate-400" data-testid="empty-state">
      <FileWarning className="h-8 w-8 mx-auto mb-2 opacity-50" />
      {hasFilters ? (
        <>
          <p>No incidents match your filters</p>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your filter criteria</p>
        </>
      ) : (
        <>
          <p>No incidents in the last 30 days</p>
          <p className="text-xs text-slate-500 mt-1">System is running smoothly</p>
        </>
      )}
    </div>
  );
}

export function IncidentLogsWidget() {
  const [typeFilter, setTypeFilter] = useState<IncidentType | null>(null);
  const [severityFilter, setSeverityFilter] = useState<IncidentSeverity | null>(null);

  const { incidents, loading, error, summary, refetch } = useIncidentLogs({
    typeFilter,
    severityFilter,
  });

  const hasFilters = typeFilter !== null || severityFilter !== null;
  const hasCriticalIncidents = summary.bySeverity.critical > 0;

  // Determine border color based on severity of incidents
  const getBorderClass = () => {
    if (summary.bySeverity.critical > 0) return 'border-red-500/50';
    if (summary.bySeverity.high > 0) return 'border-orange-500/50';
    return 'border-slate-800';
  };

  const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setTypeFilter(value === 'all' ? null : (value as IncidentType));
  };

  const handleSeverityFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSeverityFilter(value === 'all' ? null : (value as IncidentSeverity));
  };

  const clearFilters = () => {
    setTypeFilter(null);
    setSeverityFilter(null);
  };

  return (
    <div
      className={`bg-slate-900 border rounded-lg p-6 ${getBorderClass()}`}
      data-testid="incident-logs-widget"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileWarning
            className={`h-5 w-5 ${hasCriticalIncidents ? 'text-red-500' : 'text-emerald-500'}`}
            aria-hidden="true"
          />
          <h2 className="text-xl font-semibold text-white">Incident Logs</h2>
          {hasCriticalIncidents && (
            <span
              className="px-2 py-0.5 text-xs font-bold bg-red-600 text-white rounded-full"
              data-testid="critical-badge"
            >
              {summary.bySeverity.critical} critical
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Refresh button */}
          <button
            onClick={() => refetch()}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-slate-800"
            title="Refresh incident logs"
            aria-label="Refresh incident logs"
            data-testid="refresh-button"
            type="button"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${
                hasCriticalIncidents ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'
              }`}
              aria-hidden="true"
              data-testid="status-indicator"
            />
            <span
              className={`text-sm ${hasCriticalIncidents ? 'text-red-400' : 'text-slate-400'}`}
              data-testid="widget-status-text"
            >
              {hasCriticalIncidents ? 'Critical incidents' : 'No critical incidents'}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4" data-testid="summary-stats">
        {/* Total incidents */}
        <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
          <div className="flex items-center gap-2 text-slate-400">
            <FileWarning className="h-4 w-4" aria-hidden="true" />
            <span className="text-sm font-medium">Total</span>
          </div>
          <p className="text-2xl font-bold text-white mt-1" data-testid="total-incidents">
            {summary.totalIncidents}
          </p>
        </div>

        {/* Avg Resolution Time */}
        <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
          <div className="flex items-center gap-2 text-slate-400">
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span className="text-sm font-medium">Avg Resolution</span>
          </div>
          <p className="text-2xl font-bold text-white mt-1" data-testid="avg-resolution-time">
            {summary.avgResolutionTimeMinutes}m
          </p>
        </div>

        {/* Severity breakdown - Critical/High */}
        <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
          <div className="flex items-center gap-2 text-red-400">
            <XCircle className="h-4 w-4" aria-hidden="true" />
            <span className="text-sm font-medium">Critical/High</span>
          </div>
          <p className="text-2xl font-bold text-white mt-1" data-testid="critical-high-count">
            {summary.bySeverity.critical + summary.bySeverity.high}
          </p>
        </div>

        {/* Severity breakdown - Medium/Low */}
        <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
          <div className="flex items-center gap-2 text-yellow-400">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <span className="text-sm font-medium">Medium/Low</span>
          </div>
          <p className="text-2xl font-bold text-white mt-1" data-testid="medium-low-count">
            {summary.bySeverity.medium + summary.bySeverity.low}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-slate-800 rounded-lg border border-slate-700">
        <div className="flex items-center gap-2 text-slate-400">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filters:</span>
        </div>

        {/* Type filter */}
        <select
          value={typeFilter || 'all'}
          onChange={handleTypeFilterChange}
          className="bg-slate-700 text-white text-sm rounded px-3 py-1.5 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          data-testid="type-filter"
          aria-label="Filter by incident type"
        >
          {INCIDENT_TYPE_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Severity filter */}
        <select
          value={severityFilter || 'all'}
          onChange={handleSeverityFilterChange}
          className="bg-slate-700 text-white text-sm rounded px-3 py-1.5 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          data-testid="severity-filter"
          aria-label="Filter by severity"
        >
          {SEVERITY_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Clear filters button */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-slate-400 hover:text-white transition-colors"
            data-testid="clear-filters-button"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div
          className="flex items-center gap-2 p-3 mb-4 bg-red-950 border border-red-800 rounded-lg"
          data-testid="widget-error-message"
        >
          <FileWarning className="h-4 w-4 text-red-400" />
          <span className="text-sm text-red-400">{error}</span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <LoadingSkeleton />
      ) : incidents.length === 0 ? (
        <EmptyState hasFilters={hasFilters} />
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2" data-testid="incidents-list">
          {incidents.map(incident => (
            <IncidentLogCard key={incident.id} incident={incident} />
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 flex justify-between text-xs text-slate-500">
        <span>
          Showing {incidents.length}
          {hasFilters ? ' filtered' : ''} of {summary.totalIncidents} incidents (last 30 days)
        </span>
        <span>Auto-refreshes every 2 minutes</span>
      </div>
    </div>
  );
}
