/**
 * StatusFilter Component
 *
 * Toggle group for filtering players by draft status.
 * Displays counts for each filter option.
 *
 * Story: 6.8 - Implement Filter by Draft Status
 * Updated: 6.10 - Implement Mobile-Responsive Design
 */

import { cn } from '@/components/ui/utils';
import type { StatusFilter as StatusFilterType, FilterCounts } from '../types/draft.types';

export interface StatusFilterProps {
  /** Current filter value */
  value: StatusFilterType;
  /** Callback when filter changes */
  onChange: (status: StatusFilterType) => void;
  /** Counts for each filter option */
  counts: FilterCounts;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Filter option configuration
 */
interface FilterOption {
  value: StatusFilterType;
  label: string;
  countKey: keyof FilterCounts;
}

const FILTER_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'All', countKey: 'all' },
  { value: 'available', label: 'Available', countKey: 'available' },
  { value: 'my-team', label: 'My Team', countKey: 'myTeam' },
];

/**
 * StatusFilter component for filtering players by draft status
 *
 * @example
 * ```tsx
 * <StatusFilter
 *   value={filterState.status}
 *   onChange={(status) => setFilter({ status })}
 *   counts={{ all: 250, available: 180, myTeam: 8 }}
 * />
 * ```
 */
export function StatusFilter({ value, onChange, counts, className }: StatusFilterProps) {
  return (
    <div
      className={cn('flex sm:inline-flex w-full sm:w-auto rounded-lg bg-slate-900 p-1', className)}
      role="group"
      aria-label="Filter players by status"
    >
      {FILTER_OPTIONS.map(option => {
        const isActive = value === option.value;
        const count = counts[option.countKey];

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'px-3 py-2 min-h-[44px] text-sm font-medium rounded-md transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900',
              isActive
                ? 'bg-slate-700 text-slate-100 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            )}
            aria-pressed={isActive}
            aria-label={`${option.label} (${count} players)`}
            data-testid={`status-filter-${option.value}`}
          >
            {option.label}
            <span
              className={cn(
                'ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs rounded-full',
                isActive ? 'bg-slate-600 text-slate-200' : 'bg-slate-800 text-slate-500'
              )}
              aria-hidden="true"
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default StatusFilter;
