/**
 * PlayerSearch Component
 *
 * Instant search input for filtering players by name.
 * Features auto-focus, keyboard shortcuts, and result count display.
 *
 * Story: 6.3 - Implement Instant Player Search
 * Updated: 6.10 - Implement Mobile-Responsive Design
 */

import { useRef, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/components/ui/utils';

export interface PlayerSearchProps {
  /** Current search value */
  value: string;
  /** Callback when search value changes */
  onChange: (value: string) => void;
  /** Total number of players */
  totalCount: number;
  /** Number of players after filtering */
  filteredCount: number;
  /** Whether to auto-focus on mount */
  autoFocus?: boolean;
  /** Optional CSS class name */
  className?: string;
}

/**
 * PlayerSearch component for instant player filtering
 */
export function PlayerSearch({
  value,
  onChange,
  totalCount,
  filteredCount,
  autoFocus = false,
  className,
}: PlayerSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount if enabled
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Handle input change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  // Handle clear button click
  const handleClear = useCallback(() => {
    onChange('');
    inputRef.current?.focus();
  }, [onChange]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        onChange('');
      }
    },
    [onChange]
  );

  const hasValue = value.length > 0;

  return (
    <div
      data-testid="player-search"
      className={cn('flex flex-col gap-1 p-3 bg-slate-900 rounded-lg', className)}
    >
      <div className="relative flex items-center">
        {/* Search icon */}
        <Search
          data-testid="search-icon"
          className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none"
          aria-hidden="true"
        />

        {/* Search input */}
        <Input
          ref={inputRef}
          type="search"
          role="searchbox"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Search players..."
          aria-label="Search players"
          className={cn(
            'pl-10 pr-10 h-11 min-h-[44px]', // 44px minimum touch target
            'bg-slate-800 border-slate-700 text-slate-100',
            'placeholder:text-slate-500',
            'focus:border-slate-600 focus:ring-slate-600'
          )}
        />

        {/* Clear button - 44px minimum touch target per Story 6.10 */}
        {hasValue && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              'absolute right-1 p-2 rounded min-w-[44px] min-h-[44px] flex items-center justify-center',
              'text-slate-400 hover:text-slate-200',
              'hover:bg-slate-700 transition-colors'
            )}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Result count */}
      <p className="text-xs text-slate-500 pl-1">
        {filteredCount} of {totalCount} players
      </p>
    </div>
  );
}

export default PlayerSearch;
