/**
 * BidInput Component
 *
 * Input field for manually entering auction bid amounts during Manual Sync Mode.
 * Uses React Hook Form for validation per Architecture requirements.
 * Styled to match the dark theme and provides validation for bid values.
 *
 * Story: 10.2 - Enable Manual Sync Mode
 * Story: 10.3 - Implement Manual Bid Entry (React Hook Form validation)
 *
 * Features:
 * - Number input with React Hook Form validation
 * - Submit on Enter key or Save button click
 * - Validation: required, min $1, max budget
 * - Dark theme styling matching PlayerQueue
 * - Accessible with proper labels and error messages
 */

import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/utils';

/**
 * Form data for bid input
 */
interface BidFormData {
  bid: number | null;
}

/**
 * Props for BidInput component
 */
export interface BidInputProps {
  /** Player ID for this bid input */
  playerId: string;
  /** Player name for accessibility label */
  playerName: string;
  /** Current bid value (if any) */
  currentBid?: number;
  /** Callback when bid is submitted: (playerId, bid, isMyTeam) */
  onSubmit: (playerId: string, bid: number, isMyTeam: boolean) => void;
  /** Minimum allowed bid (default: 1) */
  minBid?: number;
  /** Maximum allowed bid (default: 260) */
  maxBid?: number;
  /** Whether this player is on user's team (for budget validation) */
  isMyTeam?: boolean;
  /** Remaining budget when isMyTeam is true */
  remainingBudget?: number;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Optional CSS class name */
  className?: string;
}

/**
 * BidInput Component
 *
 * Renders an input field with Save button for entering auction bids during Manual Sync Mode.
 * Validates input using React Hook Form and displays inline error messages.
 *
 * @example
 * ```tsx
 * <BidInput
 *   playerId="player-123"
 *   playerName="Mike Trout"
 *   onSubmit={(id, bid, isMyTeam) => console.log(`Bid ${bid} for player ${id}`)}
 * />
 * ```
 */
export function BidInput({
  playerId,
  playerName,
  currentBid,
  onSubmit,
  minBid = 1,
  maxBid = 260,
  isMyTeam = false,
  remainingBudget,
  disabled = false,
  className,
}: BidInputProps) {
  // Determine effective max bid - if isMyTeam and remainingBudget provided, use that
  const effectiveMaxBid =
    isMyTeam && remainingBudget !== undefined ? Math.min(maxBid, remainingBudget) : maxBid;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    clearErrors,
  } = useForm<BidFormData>({
    defaultValues: {
      bid: currentBid ?? null,
    },
  });

  // Update internal value when currentBid prop changes
  useEffect(() => {
    if (currentBid !== undefined) {
      setValue('bid', currentBid);
    }
  }, [currentBid, setValue]);

  /**
   * Handle form submission
   */
  const onFormSubmit = useCallback(
    (data: BidFormData) => {
      if (data.bid !== null && data.bid !== undefined) {
        onSubmit(playerId, data.bid, isMyTeam);
        // Clear input after successful submission
        reset({ bid: null });
      }
    },
    [playerId, isMyTeam, onSubmit, reset]
  );

  /**
   * Handle click - prevent row selection
   */
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  /**
   * Handle key down - prevent row selection on typing
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    e.stopPropagation();
  }, []);

  /**
   * Handle input change - clear errors when user types
   */
  const handleChange = useCallback(() => {
    if (errors.bid) {
      clearErrors('bid');
    }
  }, [errors.bid, clearErrors]);

  // Get error message
  const errorMessage = errors.bid?.message;

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      noValidate // Disable native HTML5 validation so React Hook Form handles all validation
      className={cn('flex items-center gap-1', className)}
      data-testid={`bid-form-${playerId}`}
    >
      <div className="flex flex-col">
        <Input
          type="number"
          inputMode="numeric"
          min={minBid}
          max={effectiveMaxBid}
          step={1}
          disabled={disabled}
          placeholder="$"
          aria-label={`Bid amount for ${playerName}`}
          aria-invalid={!!errors.bid}
          aria-describedby={errors.bid ? `bid-error-${playerId}` : undefined}
          className={cn(
            'w-16 h-8 px-2 text-sm text-right',
            'bg-slate-800 border-slate-700',
            'text-slate-100 placeholder:text-slate-500',
            'focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500',
            errors.bid && 'border-red-500 focus:border-red-500 focus:ring-red-500'
          )}
          data-testid={`bid-input-${playerId}`}
          {...register('bid', {
            required: 'Bid amount is required',
            valueAsNumber: true,
            min: {
              value: minBid,
              message: `Bid must be at least $${minBid}`,
            },
            max: {
              value: effectiveMaxBid,
              message: `Bid cannot exceed $${effectiveMaxBid}`,
            },
            validate: value => {
              if (value === null || value === undefined || isNaN(value)) {
                return 'Bid amount is required';
              }
              return true;
            },
            onChange: handleChange,
          })}
        />
        {errorMessage && (
          <span
            id={`bid-error-${playerId}`}
            className="text-xs text-red-400 mt-0.5 whitespace-nowrap"
            role="alert"
          >
            {errorMessage}
          </span>
        )}
      </div>
      <Button
        type="submit"
        size="sm"
        variant="secondary"
        disabled={disabled}
        className="h-8 px-2 text-xs bg-slate-700 hover:bg-slate-600 text-slate-100"
        aria-label={`Save bid for ${playerName}`}
      >
        Save
      </Button>
    </form>
  );
}

export default BidInput;
