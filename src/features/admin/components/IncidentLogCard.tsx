/**
 * IncidentLogCard Component
 *
 * Displays a single incident log entry with severity indicator.
 * Features:
 * - Color-coded severity badge (critical=red, high=orange, medium=yellow, low=blue)
 * - Timestamp display with resolution time
 * - Incident type label
 * - Affected users count
 * - Expandable recovery actions section
 *
 * Story: 13.9 - View Detailed Incident Logs
 *
 * @example
 * ```tsx
 * <IncidentLogCard incident={incidentLog} />
 * // With expanded details
 * <IncidentLogCard incident={incidentLog} expanded />
 * ```
 */

import { useState } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  Users,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import type { IncidentLog, IncidentSeverity, IncidentType } from '../types/admin.types';
import { getSeverityColorClasses, getIncidentTypeDisplayName } from '../types/admin.types';

interface IncidentLogCardProps {
  /** The incident log entry to display */
  incident: IncidentLog;
  /** Whether to show the card in expanded state by default */
  expanded?: boolean;
  /** Callback when card is clicked for detail view */
  onClick?: () => void;
}

/**
 * Formats a timestamp to a human-readable format
 */
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formats resolution time in minutes to a human-readable format
 */
function formatResolutionTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Gets the icon component for a severity level
 */
function getSeverityIcon(severity: IncidentSeverity) {
  switch (severity) {
    case 'critical':
      return <XCircle className="h-4 w-4" />;
    case 'high':
      return <AlertTriangle className="h-4 w-4" />;
    case 'medium':
      return <AlertCircle className="h-4 w-4" />;
    case 'low':
      return <Info className="h-4 w-4" />;
  }
}

/**
 * Gets the icon component for an incident type
 */
function getIncidentTypeIcon(type: IncidentType) {
  switch (type) {
    case 'api_failure':
      return <AlertTriangle className="h-3 w-3" />;
    case 'draft_error':
      return <AlertCircle className="h-3 w-3" />;
    case 'sync_failure':
      return <AlertTriangle className="h-3 w-3" />;
    case 'system_error':
      return <XCircle className="h-3 w-3" />;
  }
}

export function IncidentLogCard({ incident, expanded = false, onClick }: IncidentLogCardProps) {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const isResolved = incident.resolvedAt !== null;
  const severityClasses = getSeverityColorClasses(incident.severity);
  const hasRecoveryActions = incident.recoveryActions.length > 0;

  const toggleExpanded = () => {
    setIsExpanded(prev => !prev);
  };

  return (
    <div
      className={`bg-slate-800 rounded-lg border border-slate-700 overflow-hidden ${onClick ? 'cursor-pointer hover:bg-slate-750' : ''}`}
      data-testid="incident-log-card"
      onClick={onClick}
    >
      {/* Header with severity and timestamp */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {/* Severity badge */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${severityClasses}`}
              data-testid="severity-badge"
            >
              {getSeverityIcon(incident.severity)}
              <span className="capitalize">{incident.severity}</span>
            </span>
            {/* Resolution status */}
            {isResolved ? (
              <span
                className="inline-flex items-center gap-1 text-xs text-emerald-400"
                data-testid="resolved-badge"
              >
                <CheckCircle className="h-3 w-3" />
                Resolved
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1 text-xs text-amber-400"
                data-testid="unresolved-badge"
              >
                <Clock className="h-3 w-3" />
                Active
              </span>
            )}
          </div>
          <span className="text-xs text-slate-400" data-testid="timestamp">
            {formatTimestamp(incident.occurredAt)}
          </span>
        </div>

        {/* Title */}
        <h3
          className="text-sm font-medium text-white mb-1 line-clamp-1"
          data-testid="incident-title"
        >
          {incident.title}
        </h3>

        {/* Incident type and affected users */}
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1" data-testid="incident-type">
            {getIncidentTypeIcon(incident.incidentType)}
            {getIncidentTypeDisplayName(incident.incidentType)}
          </span>
          <span className="inline-flex items-center gap-1" data-testid="affected-users">
            <Users className="h-3 w-3" />
            {incident.affectedUsersCount} affected
          </span>
          {isResolved && incident.resolutionTimeMinutes !== null && (
            <span className="inline-flex items-center gap-1" data-testid="resolution-time">
              <Clock className="h-3 w-3" />
              {formatResolutionTime(incident.resolutionTimeMinutes)}
            </span>
          )}
        </div>
      </div>

      {/* Expandable section */}
      {(hasRecoveryActions || incident.description) && (
        <>
          <button
            className="w-full flex items-center justify-center gap-1 py-1.5 text-xs text-slate-400 hover:text-slate-300 bg-slate-850 border-t border-slate-700"
            onClick={e => {
              e.stopPropagation();
              toggleExpanded();
            }}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Hide details' : 'Show details'}
            data-testid="expand-button"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3" />
                Hide details
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" />
                Show details
              </>
            )}
          </button>

          {isExpanded && (
            <div
              className="p-3 border-t border-slate-700 bg-slate-850"
              data-testid="expanded-content"
            >
              {/* Description */}
              <div className="mb-3">
                <h4 className="text-xs font-medium text-slate-400 mb-1">Description</h4>
                <p className="text-sm text-slate-300" data-testid="description">
                  {incident.description}
                </p>
              </div>

              {/* Recovery actions */}
              {hasRecoveryActions && (
                <div>
                  <h4 className="text-xs font-medium text-slate-400 mb-1">Recovery Actions</h4>
                  <ul className="space-y-1 text-sm text-slate-300" data-testid="recovery-actions">
                    {incident.recoveryActions.map((action, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-3 w-3 mt-1 text-emerald-500 flex-shrink-0" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
