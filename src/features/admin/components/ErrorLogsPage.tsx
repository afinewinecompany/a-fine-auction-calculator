/**
 * Error Logs Page Component
 *
 * Dedicated page for drilling down into detailed error logs for a specific API.
 * Features:
 * - Error log table with timestamp, status code, message, URL, response time
 * - Date range filtering (24h, 7d, 30d, custom)
 * - Search by error message or status code
 * - CSV export functionality
 * - Error frequency chart
 * - Real-time updates (polls every 60 seconds)
 *
 * Route: /admin/errors/:apiName
 *
 * Story: 13.10 - Drill Down into Error Logs
 *
 * @example
 * ```tsx
 * // Used within AdminRoute wrapper via router
 * <Route path="/admin/errors/:apiName" element={<ErrorLogsPage />} />
 * ```
 */

import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RefreshCw,
  Download,
  Search,
  AlertTriangle,
  Activity,
  Calendar,
  X,
} from 'lucide-react';
import { useErrorLogs } from '../hooks/useErrorLogs';
import { ErrorLogTable } from './ErrorLogTable';
import { ErrorFrequencyChart } from './ErrorFrequencyChart';
import { exportErrorLogsToCSV } from '../utils/exportErrorLogs';
import type { APIName, DateRangeOption } from '../types/admin.types';
import { getAPIDisplayName } from '../types/admin.types';

/** Valid API names for type checking */
const VALID_API_NAMES: APIName[] = ['couch_managers', 'fangraphs', 'google_sheets'];

/**
 * Date range button component
 */
interface DateRangeButtonProps {
  label: string;
  value: DateRangeOption;
  currentValue: DateRangeOption;
  onClick: (value: DateRangeOption) => void;
}

function DateRangeButton({ label, value, currentValue, onClick }: DateRangeButtonProps) {
  const isActive = currentValue === value;

  return (
    <button
      onClick={() => onClick(value)}
      className={`
        px-3 py-1.5 text-sm rounded-md transition-colors
        ${isActive ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}
      `}
      type="button"
    >
      {label}
    </button>
  );
}

/**
 * Invalid API page - shown when apiName param is invalid
 */
function InvalidAPIPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-4xl mx-auto text-center py-16">
        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Invalid API</h1>
        <p className="text-slate-400 mb-6">
          The API name in the URL is not valid. Please select an API from the admin dashboard.
        </p>
        <button
          onClick={() => navigate('/admin')}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors inline-flex items-center gap-2"
          type="button"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export function ErrorLogsPage() {
  const { apiName: apiNameParam } = useParams<{ apiName: string }>();
  const navigate = useNavigate();

  // Validate API name
  const apiName = apiNameParam as APIName;
  const isValidAPI = VALID_API_NAMES.includes(apiName);

  // Use hook (even with invalid API to follow hooks rules)
  const { logs, loading, error, filter, setFilter, frequency, totalCount, refetch } = useErrorLogs(
    isValidAPI ? apiName : 'couch_managers'
  );

  // Handle invalid API
  if (!isValidAPI) {
    return <InvalidAPIPage />;
  }

  const displayName = getAPIDisplayName(apiName);

  /**
   * Handle date range change
   */
  const handleDateRangeChange = (value: DateRangeOption) => {
    setFilter({ dateRange: value });
  };

  /**
   * Handle search input
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter({ searchQuery: e.target.value });
  };

  /**
   * Clear search
   */
  const clearSearch = () => {
    setFilter({ searchQuery: '' });
  };

  /**
   * Handle CSV export
   */
  const handleExport = () => {
    if (logs.length > 0) {
      exportErrorLogsToCSV(logs, apiName);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Back button and title */}
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/admin')}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Back to Dashboard"
              type="button"
              data-testid="back-button"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-red-500" aria-hidden="true" />
              <div>
                <h1 className="text-2xl font-bold text-white">{displayName} Error Logs</h1>
                <p className="text-slate-400 text-sm">
                  {totalCount} error{totalCount !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>
          </div>

          {/* Filter controls */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Date range buttons */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <div className="flex gap-1">
                <DateRangeButton
                  label="24h"
                  value="24h"
                  currentValue={filter.dateRange}
                  onClick={handleDateRangeChange}
                />
                <DateRangeButton
                  label="7d"
                  value="7d"
                  currentValue={filter.dateRange}
                  onClick={handleDateRangeChange}
                />
                <DateRangeButton
                  label="30d"
                  value="30d"
                  currentValue={filter.dateRange}
                  onClick={handleDateRangeChange}
                />
                <DateRangeButton
                  label="Custom"
                  value="custom"
                  currentValue={filter.dateRange}
                  onClick={handleDateRangeChange}
                />
              </div>
            </div>

            {/* Search input */}
            <div className="flex-1 min-w-[200px] max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={filter.searchQuery}
                onChange={handleSearchChange}
                placeholder="Search by error message or status code..."
                className="w-full pl-10 pr-10 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                data-testid="search-input"
              />
              {filter.searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => refetch()}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                title="Refresh logs"
                type="button"
                data-testid="refresh-button"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={handleExport}
                disabled={logs.length === 0}
                className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Export to CSV"
                type="button"
                data-testid="export-button"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Error state */}
          {error && (
            <div
              className="flex items-center gap-2 p-4 bg-red-950 border border-red-800 rounded-lg"
              data-testid="error-message"
            >
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <span className="text-red-400">{error}</span>
            </div>
          )}

          {/* Error Frequency Chart */}
          <ErrorFrequencyChart data={frequency} dateRange={filter.dateRange} />

          {/* Error Log Table */}
          <ErrorLogTable logs={logs} loading={loading} />

          {/* Footer with polling info */}
          <div className="text-center text-xs text-slate-500">Auto-refreshes every 60 seconds</div>
        </div>
      </main>
    </div>
  );
}

export default ErrorLogsPage;
