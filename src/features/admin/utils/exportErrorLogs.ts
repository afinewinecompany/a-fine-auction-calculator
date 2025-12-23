/**
 * Error Logs Export Utility
 *
 * Utility functions for exporting error logs to CSV format.
 *
 * Story: 13.10 - Drill Down into Error Logs
 *
 * @example
 * ```tsx
 * const csvContent = generateCSV(logs);
 * downloadCSV(csvContent, 'couch_managers-errors-2024-01-15.csv');
 * ```
 */

import { format } from 'date-fns';
import type { ErrorLog, APIName } from '../types/admin.types';
import { API_DISPLAY_NAMES } from '../types/admin.types';

/**
 * Escape a value for CSV format
 * Wraps in quotes if contains comma, newline, or quotes
 */
function escapeCSV(value: string | number | null): string {
  if (value === null) return '';
  const str = String(value);
  // If contains comma, newline, or quote, wrap in quotes and escape internal quotes
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generate CSV content from error logs
 */
export function generateCSV(logs: ErrorLog[]): string {
  // CSV headers
  const headers = [
    'Timestamp',
    'API Name',
    'Status',
    'Status Code',
    'Error Message',
    'Request URL',
    'Response Time (ms)',
  ];

  // Build CSV rows
  const rows = logs.map(log => [
    format(new Date(log.checkedAt), 'yyyy-MM-dd HH:mm:ss'),
    API_DISPLAY_NAMES[log.apiName],
    log.status,
    log.statusCode !== null ? String(log.statusCode) : '',
    escapeCSV(log.errorMessage),
    escapeCSV(log.requestUrl || ''),
    log.responseTimeMs !== null ? String(log.responseTimeMs) : '',
  ]);

  // Combine headers and rows
  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

  return csvContent;
}

/**
 * Generate filename for CSV export
 */
export function generateFilename(apiName: APIName): string {
  const dateStr = format(new Date(), 'yyyy-MM-dd_HHmmss');
  return `${apiName}-error-logs-${dateStr}.csv`;
}

/**
 * Trigger CSV download in browser
 */
export function downloadCSV(content: string, filename: string): void {
  // Create blob with CSV content
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });

  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  // Trigger download
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export error logs to CSV file
 * Combines CSV generation and download
 */
export function exportErrorLogsToCSV(logs: ErrorLog[], apiName: APIName): void {
  const csvContent = generateCSV(logs);
  const filename = generateFilename(apiName);
  downloadCSV(csvContent, filename);
}

export default exportErrorLogsToCSV;
