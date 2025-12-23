/**
 * ClearFiltersButton Component
 *
 * Button to reset all filters to default values.
 * Only visible when filters are active.
 *
 * Story: 6.8 - Implement Filter by Draft Status
 * Updated: 6.10 - Implement Mobile-Responsive Design
 */

import { X } from 'lucide-react';
import { cn } from '@/components/ui/utils';

export interface ClearFiltersButtonProps {
  /** Callback when clear is clicked */
  onClear: () => void;
  /** Whether any filters are active */
  isActive: boolean;
  /** Optional CSS class name */
  className?: string;
}

/**
 * ClearFiltersButton component for resetting all filters
 *
 * @example
 * ```tsx
 * <ClearFiltersButton
 *   onClear={clearFilters}
 *   isActive={hasActiveFilters}
 * />
 * ```
 */
export function ClearFiltersButton({ onClear, isActive, className }: ClearFiltersButtonProps) {
  // Don't render if no filters are active
  if (!isActive) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onClear}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[44px] text-sm font-medium rounded-md',
        'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950',
        'transition-colors',
        className
      )}
      aria-label="Clear all filters"
      data-testid="clear-filters-button"
    >
      <X className="h-4 w-4" aria-hidden="true" />
      Clear All
    </button>
  );
}

export default ClearFiltersButton;
