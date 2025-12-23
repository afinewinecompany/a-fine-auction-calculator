/**
 * Budget Validation Tests
 *
 * Tests for budget validation in BidInput when "My Team" is checked.
 * Ensures bids cannot exceed remaining budget for user's own picks.
 *
 * Story: 10.4 - Implement My Team Checkbox
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BidInput } from '@/features/draft/components/BidInput';

describe('Budget Validation', () => {
  const defaultProps = {
    playerId: 'player-123',
    playerName: 'Mike Trout',
    onSubmit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('When isMyTeam is false (other team pick)', () => {
    it('allows bids up to maxBid regardless of remainingBudget', async () => {
      const onSubmit = vi.fn();
      render(
        <BidInput
          {...defaultProps}
          onSubmit={onSubmit}
          isMyTeam={false}
          remainingBudget={50}
          maxBid={260}
        />
      );

      const input = screen.getByTestId('bid-input-player-123');
      fireEvent.change(input, { target: { value: '100' } });

      const form = screen.getByTestId('bid-form-player-123');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith('player-123', 100, false);
      });
    });

    it('does not show budget-related error messages', async () => {
      render(
        <BidInput
          {...defaultProps}
          isMyTeam={false}
          remainingBudget={50}
          maxBid={260}
        />
      );

      const input = screen.getByTestId('bid-input-player-123');
      fireEvent.change(input, { target: { value: '100' } });

      const form = screen.getByTestId('bid-form-player-123');
      fireEvent.submit(form);

      // Should not show "exceeds remaining budget" error
      expect(screen.queryByText(/remaining budget/i)).not.toBeInTheDocument();
    });
  });

  describe('When isMyTeam is true (user pick)', () => {
    it('limits max bid to remainingBudget', async () => {
      render(
        <BidInput
          {...defaultProps}
          isMyTeam={true}
          remainingBudget={50}
          maxBid={260}
        />
      );

      const input = screen.getByTestId('bid-input-player-123');
      fireEvent.change(input, { target: { value: '100' } });

      const form = screen.getByTestId('bid-form-player-123');
      fireEvent.submit(form);

      // Should show error about exceeding budget
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/cannot exceed \$50/i)).toBeInTheDocument();
      });
    });

    it('allows bids within remainingBudget', async () => {
      const onSubmit = vi.fn();
      render(
        <BidInput
          {...defaultProps}
          onSubmit={onSubmit}
          isMyTeam={true}
          remainingBudget={50}
          maxBid={260}
        />
      );

      const input = screen.getByTestId('bid-input-player-123');
      fireEvent.change(input, { target: { value: '45' } });

      const form = screen.getByTestId('bid-form-player-123');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith('player-123', 45, true);
      });
    });

    it('allows bids exactly equal to remainingBudget', async () => {
      const onSubmit = vi.fn();
      render(
        <BidInput
          {...defaultProps}
          onSubmit={onSubmit}
          isMyTeam={true}
          remainingBudget={50}
          maxBid={260}
        />
      );

      const input = screen.getByTestId('bid-input-player-123');
      fireEvent.change(input, { target: { value: '50' } });

      const form = screen.getByTestId('bid-form-player-123');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith('player-123', 50, true);
      });
    });

    it('uses lower of remainingBudget and maxBid', async () => {
      render(
        <BidInput
          {...defaultProps}
          isMyTeam={true}
          remainingBudget={50}
          maxBid={30} // maxBid is lower than remainingBudget
        />
      );

      const input = screen.getByTestId('bid-input-player-123');
      fireEvent.change(input, { target: { value: '40' } });

      const form = screen.getByTestId('bid-form-player-123');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText(/cannot exceed \$30/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error message display', () => {
    it('shows descriptive error message for budget exceeded', async () => {
      render(
        <BidInput
          {...defaultProps}
          isMyTeam={true}
          remainingBudget={25}
        />
      );

      const input = screen.getByTestId('bid-input-player-123');
      fireEvent.change(input, { target: { value: '50' } });

      const form = screen.getByTestId('bid-form-player-123');
      fireEvent.submit(form);

      await waitFor(() => {
        const error = screen.getByRole('alert');
        expect(error).toHaveTextContent('$25');
      });
    });

    it('clears error when user types new value', async () => {
      render(
        <BidInput
          {...defaultProps}
          isMyTeam={true}
          remainingBudget={25}
        />
      );

      const input = screen.getByTestId('bid-input-player-123');

      // First, trigger an error
      fireEvent.change(input, { target: { value: '50' } });
      const form = screen.getByTestId('bid-form-player-123');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      // Type new value - error should clear
      fireEvent.change(input, { target: { value: '20' } });

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });
  });

  describe('Min bid validation', () => {
    it('enforces minimum bid of $1', async () => {
      render(<BidInput {...defaultProps} />);

      const input = screen.getByTestId('bid-input-player-123');
      fireEvent.change(input, { target: { value: '0' } });

      const form = screen.getByTestId('bid-form-player-123');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText(/at least \$1/i)).toBeInTheDocument();
      });
    });

    it('allows custom minimum bid', async () => {
      render(<BidInput {...defaultProps} minBid={5} />);

      const input = screen.getByTestId('bid-input-player-123');
      fireEvent.change(input, { target: { value: '3' } });

      const form = screen.getByTestId('bid-form-player-123');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText(/at least \$5/i)).toBeInTheDocument();
      });
    });
  });

  describe('Edge cases', () => {
    it('handles remainingBudget of 0', async () => {
      render(
        <BidInput
          {...defaultProps}
          isMyTeam={true}
          remainingBudget={0}
        />
      );

      const input = screen.getByTestId('bid-input-player-123');
      fireEvent.change(input, { target: { value: '1' } });

      const form = screen.getByTestId('bid-form-player-123');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText(/cannot exceed \$0/i)).toBeInTheDocument();
      });
    });

    it('handles undefined remainingBudget with isMyTeam true', async () => {
      const onSubmit = vi.fn();
      render(
        <BidInput
          {...defaultProps}
          onSubmit={onSubmit}
          isMyTeam={true}
          remainingBudget={undefined}
          maxBid={260}
        />
      );

      const input = screen.getByTestId('bid-input-player-123');
      fireEvent.change(input, { target: { value: '100' } });

      const form = screen.getByTestId('bid-form-player-123');
      fireEvent.submit(form);

      // Without remainingBudget, should use maxBid
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith('player-123', 100, true);
      });
    });
  });
});
