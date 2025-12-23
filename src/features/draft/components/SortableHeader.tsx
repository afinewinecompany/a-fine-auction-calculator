/**
 * SortableHeader Component
 *
 * A reusable table header component that supports column sorting.
 * Displays sort direction indicator and handles click interactions.
 *
 * Story: 6.4 - Implement Sortable Table Columns
 */

import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/components/ui/utils';
import { TableHead } from '@/components/ui/table';
import type { SortColumn, SortState } from '../types/sort.types';

export interface SortableHeaderProps {
  /** Column identifier */
  column: SortColumn;
  /** Display label for the header */
  label: string;
  /** Current sort state */
  currentSort: SortState;
  /** Callback when column is clicked for sorting */
  onSort: (column: SortColumn) => void;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Additional class names */
  className?: string;
  /** Minimum width CSS value */
  minWidth?: string;
  /** Whether column is sticky */
  sticky?: boolean;
}

/**
 * SortableHeader component for sortable table columns
 */
export function SortableHeader({
  column,
  label,
  currentSort,
  onSort,
  align = 'left',
  className,
  minWidth,
  sticky = false,
}: SortableHeaderProps) {
  const isActive = currentSort.column === column;
  const direction = currentSort.direction;

  const handleClick = () => {
    onSort(column);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSort(column);
    }
  };

  // Determine aria-sort value for accessibility
  const ariaSortValue = isActive ? (direction === 'asc' ? 'ascending' : 'descending') : undefined;

  return (
    <TableHead
      className={cn(
        'cursor-pointer select-none transition-colors group',
        'hover:bg-slate-800/50',
        isActive ? 'text-slate-100' : 'text-slate-300',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        sticky && 'sticky left-0 z-10 bg-slate-900',
        className
      )}
      style={minWidth ? { minWidth } : undefined}
      aria-sort={ariaSortValue}
    >
      <button
        type="button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          'inline-flex items-center gap-1 w-full',
          align === 'right' && 'justify-end',
          align === 'center' && 'justify-center'
        )}
        aria-label={`Sort by ${label}`}
      >
        <span>{label}</span>
        {/* Active column: show directional arrow */}
        {isActive && direction === 'asc' && (
          <ChevronUp className="h-4 w-4 text-slate-100" data-testid="sort-asc-icon" />
        )}
        {isActive && direction === 'desc' && (
          <ChevronDown className="h-4 w-4 text-slate-100" data-testid="sort-desc-icon" />
        )}
        {/* Inactive column: show subtle hover indicator */}
        {!isActive && (
          <ChevronsUpDown
            className="h-4 w-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity"
            data-testid="sort-inactive-icon"
          />
        )}
      </button>
    </TableHead>
  );
}

export default SortableHeader;
