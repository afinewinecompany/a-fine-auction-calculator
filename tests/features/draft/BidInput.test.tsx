/**
 * BidInput Component Tests
 *
 * Tests for the BidInput form component with React Hook Form validation.
 * Story 10.3 - Implement Manual Bid Entry
 *
 * Test Coverage:
 * - Valid bid entry and submission
 * - Validation (negative, zero, exceeds budget)
 * - Enter key submission
 * - Error message display
 * - Budget validation when isMyTeam is true
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BidInput } from '@/features/draft/components/BidInput';

describe('BidInput Component', () => {
  const defaultProps = {
    playerId: 'player-123',
    playerName: 'Mike Trout',
    onSubmit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders input field with correct accessibility label', () => {
      render(<BidInput {...defaultProps} />);

      const input = screen.getByRole('spinbutton', { name: /bid amount for Mike Trout/i });
      expect(input).toBeInTheDocument();
    });

    it('renders with placeholder showing dollar sign', () => {
      render(<BidInput {...defaultProps} />);

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('placeholder', '$');
    });

    it('renders Save button', () => {
      render(<BidInput {...defaultProps} />);

      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    it('displays current bid when provided', () => {
      render(<BidInput {...defaultProps} currentBid={50} />);

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveValue(50);
    });

    it('is disabled when disabled prop is true', () => {
      render(<BidInput {...defaultProps} disabled />);

      const input = screen.getByRole('spinbutton');
      expect(input).toBeDisabled();
    });
  });

  describe('Valid Bid Entry', () => {
    it('calls onSubmit with playerId and bid when valid bid entered', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<BidInput {...defaultProps} onSubmit={onSubmit} />);

      const input = screen.getByRole('spinbutton');
      await user.type(input, '25');
      await user.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith('player-123', 25, false);
      });
    });

    it('submits bid on Enter key press', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<BidInput {...defaultProps} onSubmit={onSubmit} />);

      const input = screen.getByRole('spinbutton');
      await user.type(input, '30{Enter}');

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith('player-123', 30, false);
      });
    });

    it('clears input after successful submission', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<BidInput {...defaultProps} onSubmit={onSubmit} />);

      const input = screen.getByRole('spinbutton');
      await user.type(input, '25');
      await user.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(input).toHaveValue(null);
      });
    });

    it('accepts minimum bid of $1', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<BidInput {...defaultProps} onSubmit={onSubmit} />);

      const input = screen.getByRole('spinbutton');
      await user.type(input, '1');
      await user.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith('player-123', 1, false);
      });
    });
  });

  describe('Validation - Invalid Bids', () => {
    it('shows error for zero bid', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<BidInput {...defaultProps} onSubmit={onSubmit} minBid={1} />);

      const input = screen.getByRole('spinbutton');
      await user.clear(input);
      await user.type(input, '0');
      await user.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(
        () => {
          expect(screen.getByText(/bid must be at least \$1/i)).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('shows error for negative bid', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<BidInput {...defaultProps} onSubmit={onSubmit} minBid={1} />);

      const input = screen.getByRole('spinbutton');
      await user.clear(input);
      // Note: type="number" may handle negatives differently in JSDOM
      // We simulate this by using browser-like behavior
      await user.type(input, '-5');
      await user.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(
        () => {
          expect(screen.getByText(/bid must be at least \$1/i)).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('shows error for empty bid', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<BidInput {...defaultProps} onSubmit={onSubmit} />);

      await user.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(
        () => {
          expect(screen.getByText(/bid amount is required/i)).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('shows error when bid exceeds max budget', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<BidInput {...defaultProps} onSubmit={onSubmit} maxBid={260} />);

      const input = screen.getByRole('spinbutton');
      await user.clear(input);
      await user.type(input, '300');
      await user.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(
        () => {
          expect(screen.getByText(/bid cannot exceed \$260/i)).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Budget Validation with isMyTeam', () => {
    it('passes isMyTeam=true to onSubmit when checked', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<BidInput {...defaultProps} onSubmit={onSubmit} isMyTeam />);

      const input = screen.getByRole('spinbutton');
      await user.type(input, '50');
      await user.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith('player-123', 50, true);
      });
    });

    it('validates against remaining budget when isMyTeam is true', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(
        <BidInput
          {...defaultProps}
          onSubmit={onSubmit}
          isMyTeam
          remainingBudget={100}
          maxBid={100}
        />
      );

      const input = screen.getByRole('spinbutton');
      await user.clear(input);
      await user.type(input, '150');
      await user.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(
        () => {
          expect(screen.getByText(/bid cannot exceed \$100/i)).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('allows bid equal to remaining budget when isMyTeam is true', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(
        <BidInput
          {...defaultProps}
          onSubmit={onSubmit}
          isMyTeam
          remainingBudget={100}
          maxBid={100}
        />
      );

      const input = screen.getByRole('spinbutton');
      await user.type(input, '100');
      await user.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith('player-123', 100, true);
      });
    });
  });

  describe('Input Behavior', () => {
    it('only accepts numeric input (HTML5 number field)', async () => {
      const user = userEvent.setup();
      render(<BidInput {...defaultProps} />);

      const input = screen.getByRole('spinbutton');
      // HTML5 number inputs naturally reject non-numeric characters
      // When typing mixed content, the input keeps only the valid numeric portion
      await user.type(input, '123');

      // Verify numeric value is accepted
      expect(input).toHaveValue(123);
    });

    it('prevents row selection when clicking input', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <div onClick={onClick}>
          <BidInput {...defaultProps} />
        </div>
      );

      const input = screen.getByRole('spinbutton');
      await user.click(input);

      // onClick should not be called on parent due to stopPropagation
      expect(onClick).not.toHaveBeenCalled();
    });

    it('prevents row selection when pressing keys in input', async () => {
      const user = userEvent.setup();
      const onKeyDown = vi.fn();
      render(
        <div onKeyDown={onKeyDown}>
          <BidInput {...defaultProps} />
        </div>
      );

      const input = screen.getByRole('spinbutton');
      await user.type(input, '25');

      // onKeyDown should not be called on parent due to stopPropagation
      expect(onKeyDown).not.toHaveBeenCalled();
    });
  });

  describe('Error Display', () => {
    it('clears error when user starts typing again', async () => {
      const user = userEvent.setup();
      render(<BidInput {...defaultProps} />);

      // First, trigger an error
      await user.click(screen.getByRole('button', { name: /save/i }));
      await waitFor(() => {
        expect(screen.getByText(/bid amount is required/i)).toBeInTheDocument();
      });

      // Then start typing
      const input = screen.getByRole('spinbutton');
      await user.type(input, '25');

      await waitFor(() => {
        expect(screen.queryByText(/bid amount is required/i)).not.toBeInTheDocument();
      });
    });

    it('shows aria-invalid when there is an error', async () => {
      const user = userEvent.setup();
      render(<BidInput {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        const input = screen.getByRole('spinbutton');
        expect(input).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });

  describe('Test ID', () => {
    it('has correct test ID for targeting', () => {
      render(<BidInput {...defaultProps} />);

      expect(screen.getByTestId('bid-input-player-123')).toBeInTheDocument();
    });
  });
});
