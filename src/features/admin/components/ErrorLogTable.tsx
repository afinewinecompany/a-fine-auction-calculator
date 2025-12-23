/**
 * Error Log Table Component
 *
 * Displays error logs in a sortable table format with columns for:
 * - Timestamp
 * - Status code
 * - Error message
 * - Request URL
 * - Response time
 *
 * Story: 13.10 - Drill Down into Error Logs
 *
 * @example
 * ```tsx
 * <ErrorLogTable logs={logs} loading={loading} />
 * ```
 */

import { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, AlertCircle, Clock, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import type { ErrorLog } from '../types/admin.types';

/** Sortable column identifiers */
type SortColumn = 'checkedAt' | 'statusCode' | 'errorMessage' | 'responseTimeMs';

/** Sort direction */
type SortDirection = 'asc' | 'desc';

interface ErrorLogTableProps {
  /** Error log entries to display */
  logs: ErrorLog[];
  /** Loading state */
  loading?: boolean;
  /** Maximum rows to display per page (pagination) */
  pageSize?: number;
}

/**
 * Get status code badge color classes
 */
function getStatusCodeColor(statusCode: number | null): string {
  if (statusCode === null) return 'bg-slate-500/20 text-slate-400';
  if (statusCode >= 500) return 'bg-red-500/20 text-red-400';
  if (statusCode >= 400) return 'bg-orange-500/20 text-orange-400';
  return 'bg-yellow-500/20 text-yellow-400';
}

/**
 * Format response time for display
 */
function formatResponseTime(ms: number | null): string {
  if (ms === null) return '--';
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${ms}ms`;
}

/**
 * Truncate long text with ellipsis
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Loading skeleton for table rows
 */
function TableSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5].map(i => (
        <tr key={i} className="animate-pulse">
          <td className="px-4 py-3">
            <div className="h-4 w-32 bg-slate-700 rounded" />
          </td>
          <td className="px-4 py-3">
            <div className="h-6 w-12 bg-slate-700 rounded" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-48 bg-slate-700 rounded" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-40 bg-slate-700 rounded" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-16 bg-slate-700 rounded" />
          </td>
        </tr>
      ))}
    </>
  );
}

/**
 * Empty state when no logs are available
 */
function EmptyState() {
  return (
    <tr>
      <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
        <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No error logs found</p>
        <p className="text-xs text-slate-500 mt-1">
          Try adjusting the date range or search criteria
        </p>
      </td>
    </tr>
  );
}

/**
 * Sortable column header component
 */
interface SortableHeaderProps {
  label: string;
  column: SortColumn;
  currentColumn: SortColumn;
  direction: SortDirection;
  onSort: (column: SortColumn) => void;
}

function SortableHeader({ label, column, currentColumn, direction, onSort }: SortableHeaderProps) {
  const isActive = currentColumn === column;

  return (
    <button
      onClick={() => onSort(column)}
      className="flex items-center gap-1 text-xs font-medium uppercase text-slate-400 hover:text-white transition-colors"
      type="button"
    >
      {label}
      {isActive ? (
        direction === 'asc' ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3" />
        )
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      )}
    </button>
  );
}

export function ErrorLogTable({ logs, loading = false, pageSize = 20 }: ErrorLogTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('checkedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(0);

  /**
   * Handle column sort
   */
  const handleSort = (column: SortColumn) => {
    if (column === sortColumn) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  /**
   * Sort and paginate logs
   */
  const displayedLogs = useMemo(() => {
    const sorted = [...logs].sort((a, b) => {
      let comparison = 0;

      switch (sortColumn) {
        case 'checkedAt':
          comparison = new Date(a.checkedAt).getTime() - new Date(b.checkedAt).getTime();
          break;
        case 'statusCode':
          comparison = (a.statusCode || 0) - (b.statusCode || 0);
          break;
        case 'errorMessage':
          comparison = a.errorMessage.localeCompare(b.errorMessage);
          break;
        case 'responseTimeMs':
          comparison = (a.responseTimeMs || 0) - (b.responseTimeMs || 0);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    // Apply pagination
    const start = currentPage * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [logs, sortColumn, sortDirection, currentPage, pageSize]);

  const totalPages = Math.ceil(logs.length / pageSize);

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-700">
        <table className="w-full text-sm" data-testid="error-log-table">
          <thead className="bg-slate-800">
            <tr>
              <th className="px-4 py-3 text-left">
                <SortableHeader
                  label="Timestamp"
                  column="checkedAt"
                  currentColumn={sortColumn}
                  direction={sortDirection}
                  onSort={handleSort}
                />
              </th>
              <th className="px-4 py-3 text-left">
                <SortableHeader
                  label="Status"
                  column="statusCode"
                  currentColumn={sortColumn}
                  direction={sortDirection}
                  onSort={handleSort}
                />
              </th>
              <th className="px-4 py-3 text-left">
                <SortableHeader
                  label="Error Message"
                  column="errorMessage"
                  currentColumn={sortColumn}
                  direction={sortDirection}
                  onSort={handleSort}
                />
              </th>
              <th className="px-4 py-3 text-left">
                <span className="text-xs font-medium uppercase text-slate-400">Request URL</span>
              </th>
              <th className="px-4 py-3 text-left">
                <SortableHeader
                  label="Response Time"
                  column="responseTimeMs"
                  currentColumn={sortColumn}
                  direction={sortDirection}
                  onSort={handleSort}
                />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {loading ? (
              <TableSkeleton />
            ) : displayedLogs.length === 0 ? (
              <EmptyState />
            ) : (
              displayedLogs.map(log => (
                <tr
                  key={log.id}
                  className="hover:bg-slate-800/50 transition-colors"
                  data-testid={`error-log-row-${log.id}`}
                >
                  {/* Timestamp */}
                  <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-slate-500" />
                      {format(new Date(log.checkedAt), 'MMM d, yyyy HH:mm:ss')}
                    </div>
                  </td>

                  {/* Status Code */}
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusCodeColor(log.statusCode)}`}
                    >
                      {log.statusCode !== null ? log.statusCode : 'N/A'}
                    </span>
                  </td>

                  {/* Error Message */}
                  <td className="px-4 py-3 text-slate-300 max-w-xs">
                    <span title={log.errorMessage}>{truncateText(log.errorMessage, 50)}</span>
                  </td>

                  {/* Request URL */}
                  <td className="px-4 py-3 text-slate-400 max-w-xs">
                    {log.requestUrl ? (
                      <div className="flex items-center gap-1">
                        <span title={log.requestUrl}>{truncateText(log.requestUrl, 40)}</span>
                        <ExternalLink className="h-3 w-3 text-slate-500" />
                      </div>
                    ) : (
                      <span className="text-slate-500">--</span>
                    )}
                  </td>

                  {/* Response Time */}
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                    {formatResponseTime(log.responseTimeMs)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && logs.length > pageSize && (
        <div className="flex items-center justify-between px-2">
          <span className="text-sm text-slate-400">
            Showing {currentPage * pageSize + 1}-
            {Math.min((currentPage + 1) * pageSize, logs.length)} of {logs.length} logs
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="px-3 py-1 text-sm bg-slate-800 text-slate-300 rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              type="button"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-slate-400">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage >= totalPages - 1}
              className="px-3 py-1 text-sm bg-slate-800 text-slate-300 rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              type="button"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ErrorLogTable;
