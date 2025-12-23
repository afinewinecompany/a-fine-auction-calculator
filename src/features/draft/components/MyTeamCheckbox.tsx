/**
 * MyTeamCheckbox Component
 *
 * Checkbox for marking a player as drafted by the user's team during Manual Sync Mode.
 * Styled to match the dark theme with an emerald accent when checked.
 *
 * Story: 10.2 - Enable Manual Sync Mode
 *
 * Features:
 * - Custom styled checkbox matching dark theme
 * - Emerald color when checked (matching my-team status)
 * - Accessible with proper labels
 * - Prevents row selection when clicked
 */

import { useCallback } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/components/ui/utils';

/**
 * Props for MyTeamCheckbox component
 */
export interface MyTeamCheckboxProps {
  /** Player ID for this checkbox */
  playerId: string;
  /** Player name for accessibility label */
  playerName: string;
  /** Whether the player is on user's team */
  isChecked: boolean;
  /** Callback when checkbox is toggled */
  onToggle: (playerId: string, isMyTeam: boolean) => void;
  /** Whether the checkbox is disabled */
  disabled?: boolean;
  /** Optional CSS class name */
  className?: string;
}

/**
 * MyTeamCheckbox Component
 *
 * Renders a checkbox for marking players as part of the user's team
 * during Manual Sync Mode.
 *
 * @example
 * ```tsx
 * <MyTeamCheckbox
 *   playerId="player-123"
 *   playerName="Mike Trout"
 *   isChecked={false}
 *   onToggle={(id, isMyTeam) => console.log(`Player ${id} is my team: ${isMyTeam}`)}
 * />
 * ```
 */
export function MyTeamCheckbox({
  playerId,
  playerName,
  isChecked,
  onToggle,
  disabled = false,
  className,
}: MyTeamCheckboxProps) {
  /**
   * Handle checkbox change
   */
  const handleChange = useCallback(
    (checked: boolean | 'indeterminate') => {
      // Only handle boolean values, not indeterminate
      if (typeof checked === 'boolean') {
        onToggle(playerId, checked);
      }
    },
    [playerId, onToggle]
  );

  /**
   * Handle click - prevent row selection
   */
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  /**
   * Handle key down - prevent row selection when using keyboard
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <div
      className={cn('flex items-center justify-center', className)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <Checkbox
        id={`my-team-${playerId}`}
        checked={isChecked}
        onCheckedChange={handleChange}
        disabled={disabled}
        aria-label={`Mark ${playerName} as my team`}
        className={cn(
          'h-5 w-5 border-slate-600',
          'data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600',
          'focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900'
        )}
        data-testid={`my-team-checkbox-${playerId}`}
      />
    </div>
  );
}

export default MyTeamCheckbox;
