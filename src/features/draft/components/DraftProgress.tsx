/**
 * DraftProgress Component
 *
 * Displays overall draft progress with league-wide player counts,
 * progress bar visualization, and optional time estimation.
 * Uses dark slate theme with emerald accents for progress bar.
 *
 * Story: 7.8 - Track Overall Draft Progress
 */

import { memo } from 'react';
import { cn } from '@/components/ui/utils';
import { Progress } from '@/components/ui/progress';

/**
 * Props for DraftProgress component
 */
export interface DraftProgressProps {
  /** Number of players drafted league-wide */
  playersDrafted: number;
  /** Total players to be drafted (teamCount * rosterSpotsPerTeam) */
  totalPlayers: number;
  /** Estimated minutes remaining (optional) */
  estimatedTimeRemaining?: number;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Calculate progress percentage
 */
function calculateProgress(drafted: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min((drafted / total) * 100, 100);
}

/**
 * Format time remaining for display
 */
function formatTimeRemaining(minutes: number): string {
  if (minutes < 1) return '< 1 minute remaining';
  if (minutes === 1) return '~1 minute remaining';
  if (minutes < 60) return `~${Math.round(minutes)} minutes remaining`;

  // Round total minutes first to avoid display issues like "0h 60m"
  const totalMinutes = Math.round(minutes);
  const hours = Math.floor(totalMinutes / 60);
  const remainingMins = totalMinutes % 60;

  if (remainingMins === 0) {
    return `~${hours} hour${hours > 1 ? 's' : ''} remaining`;
  }
  return `~${hours}h ${remainingMins}m remaining`;
}

/**
 * DraftProgress component showing league-wide draft completion
 */
export const DraftProgress = memo(function DraftProgress({
  playersDrafted,
  totalPlayers,
  estimatedTimeRemaining,
  className,
}: DraftProgressProps) {
  const progress = calculateProgress(playersDrafted, totalPlayers);
  const isComplete = playersDrafted >= totalPlayers && totalPlayers > 0;
  const isNotStarted = playersDrafted === 0;

  const showTimeEstimate =
    estimatedTimeRemaining !== undefined &&
    estimatedTimeRemaining > 0 &&
    !isComplete &&
    !isNotStarted;

  return (
    <div
      className={cn('flex flex-col gap-2', className)}
      data-testid="draft-progress"
      role="region"
      aria-label="Draft progress"
    >
      {/* Draft status text */}
      <div className="flex items-center gap-2">
        {isComplete ? (
          <>
            <svg
              className="w-5 h-5 text-emerald-400"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
              data-testid="draft-complete-icon"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span
              className="text-base font-semibold text-emerald-400"
              data-testid="draft-complete-text"
            >
              Draft Complete!
            </span>
          </>
        ) : (
          <span className="text-base font-medium text-slate-200" data-testid="draft-status-text">
            <span className="font-semibold">{playersDrafted}</span> of{' '}
            <span className="font-semibold">{totalPlayers}</span> players drafted
          </span>
        )}
      </div>

      {/* Progress bar */}
      <Progress
        value={progress}
        className="h-2 bg-slate-700"
        data-testid="draft-progress-bar"
        aria-label={`Draft progress: ${Math.round(progress)}% complete`}
      />

      {/* Percentage display */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400" data-testid="draft-progress-percentage">
          {Math.round(progress)}% complete
        </span>

        {/* Time estimation (optional) */}
        {showTimeEstimate && (
          <span className="text-sm italic text-slate-400" data-testid="time-estimate">
            {formatTimeRemaining(estimatedTimeRemaining)}
          </span>
        )}
      </div>
    </div>
  );
});

export default DraftProgress;
