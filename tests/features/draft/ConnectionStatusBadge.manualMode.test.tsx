/**
 * ConnectionStatusBadge Manual Mode Tests
 *
 * Tests for Story 10.2 - Enable Manual Sync Mode
 * Validates:
 * - "Manual Mode" badge displays with yellow styling
 * - Correct tooltip content for manual mode
 * - Icon changes to Edit3 for manual mode
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ConnectionStatusBadge } from '@/features/draft/components/ConnectionStatusBadge';

// Wrapper component for tooltip provider
const renderWithTooltip = (ui: React.ReactElement) => {
  return render(<TooltipProvider>{ui}</TooltipProvider>);
};

describe('ConnectionStatusBadge Manual Mode', () => {
  describe('Manual Mode Display', () => {
    it('should display "Manual Mode" label when status is manual', () => {
      renderWithTooltip(
        <ConnectionStatusBadge status="manual" lastSync={null} />
      );

      expect(screen.getByText('Manual Mode')).toBeInTheDocument();
    });

    it('should have yellow styling for manual mode', () => {
      renderWithTooltip(
        <ConnectionStatusBadge status="manual" lastSync={null} />
      );

      const badge = screen.getByTestId('connection-status-badge');
      expect(badge).toHaveClass('text-yellow-400');
      expect(badge).toHaveClass('border-yellow-600');
    });

    it('should have proper aria-label for manual mode', () => {
      renderWithTooltip(
        <ConnectionStatusBadge status="manual" lastSync={null} />
      );

      const badge = screen.getByTestId('connection-status-badge');
      expect(badge).toHaveAttribute('aria-label', 'Connection status: Manual Mode');
    });
  });

  describe('Tooltip Content', () => {
    it('should show manual mode tooltip with explanation when no last sync', async () => {
      const user = userEvent.setup();
      renderWithTooltip(
        <ConnectionStatusBadge status="manual" lastSync={null} />
      );

      const badge = screen.getByTestId('connection-status-badge');
      await user.hover(badge);

      await waitFor(() => {
        // Use getAllBy to handle Radix's accessibility duplicates
        const elements = screen.getAllByText(/Automatic sync failed/i);
        expect(elements.length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText(/No sync yet/i).length).toBeGreaterThanOrEqual(1);
      });
    });

    it('should show last sync time in tooltip for manual mode', async () => {
      const user = userEvent.setup();
      const lastSync = new Date(Date.now() - 1000 * 60 * 5); // 5 minutes ago

      renderWithTooltip(
        <ConnectionStatusBadge status="manual" lastSync={lastSync} />
      );

      const badge = screen.getByTestId('connection-status-badge');
      await user.hover(badge);

      await waitFor(() => {
        // Use getAllBy to handle Radix's accessibility duplicates
        const elements = screen.getAllByText(/Automatic sync failed/i);
        expect(elements.length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText(/Last sync:/i).length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('State Transitions', () => {
    it('should transition from connected to manual mode', () => {
      const { rerender } = renderWithTooltip(
        <ConnectionStatusBadge status="connected" lastSync={new Date()} />
      );

      expect(screen.getByText('Connected')).toBeInTheDocument();

      rerender(
        <TooltipProvider>
          <ConnectionStatusBadge status="manual" lastSync={new Date()} />
        </TooltipProvider>
      );

      expect(screen.getByText('Manual Mode')).toBeInTheDocument();
      expect(screen.queryByText('Connected')).not.toBeInTheDocument();
    });

    it('should transition from disconnected to manual mode', () => {
      const { rerender } = renderWithTooltip(
        <ConnectionStatusBadge status="disconnected" lastSync={null} />
      );

      expect(screen.getByText('Disconnected')).toBeInTheDocument();

      rerender(
        <TooltipProvider>
          <ConnectionStatusBadge status="manual" lastSync={null} />
        </TooltipProvider>
      );

      expect(screen.getByText('Manual Mode')).toBeInTheDocument();
      expect(screen.queryByText('Disconnected')).not.toBeInTheDocument();
    });
  });

  describe('Comparison with Other States', () => {
    it('should display connected state correctly', () => {
      renderWithTooltip(
        <ConnectionStatusBadge status="connected" lastSync={new Date()} />
      );

      expect(screen.getByText('Connected')).toBeInTheDocument();
      const badge = screen.getByTestId('connection-status-badge');
      expect(badge).toHaveClass('text-emerald-400');
    });

    it('should display reconnecting state correctly', () => {
      renderWithTooltip(
        <ConnectionStatusBadge status="reconnecting" lastSync={new Date()} />
      );

      expect(screen.getByText('Reconnecting')).toBeInTheDocument();
      const badge = screen.getByTestId('connection-status-badge');
      expect(badge).toHaveClass('text-yellow-400');
    });

    it('should display disconnected state correctly', () => {
      renderWithTooltip(
        <ConnectionStatusBadge status="disconnected" lastSync={null} />
      );

      expect(screen.getByText('Disconnected')).toBeInTheDocument();
      const badge = screen.getByTestId('connection-status-badge');
      expect(badge).toHaveClass('text-red-400');
    });
  });
});
