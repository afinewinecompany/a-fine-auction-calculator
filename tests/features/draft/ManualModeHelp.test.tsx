/**
 * ManualModeHelp Component Tests
 *
 * Tests for Story 10.2 - Enable Manual Sync Mode
 * Validates:
 * - Help modal displays with correct content
 * - Step-by-step instructions are shown
 * - Modal can be opened and closed
 * - Accessibility requirements
 */

import { vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ManualModeHelp } from '@/features/draft/components/ManualModeHelp';

describe('ManualModeHelp Component', () => {
  describe('Trigger Mode', () => {
    it('should render trigger button when asTrigger is true', () => {
      render(<ManualModeHelp asTrigger />);

      expect(screen.getByText('How to use Manual Mode')).toBeInTheDocument();
    });

    it('should open dialog when trigger button is clicked', async () => {
      const user = userEvent.setup();
      render(<ManualModeHelp asTrigger />);

      const triggerButton = screen.getByText('How to use Manual Mode');
      await user.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('should display dialog title when opened', async () => {
      const user = userEvent.setup();
      render(<ManualModeHelp asTrigger />);

      await user.click(screen.getByText('How to use Manual Mode'));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Manual Sync Mode/i })).toBeInTheDocument();
      });
    });
  });

  describe('Controlled Mode', () => {
    it('should render dialog when open is true', () => {
      render(<ManualModeHelp open={true} onOpenChange={vi.fn()} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should not render dialog when open is false', () => {
      render(<ManualModeHelp open={false} onOpenChange={vi.fn()} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should call onOpenChange when dialog is closed', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      render(<ManualModeHelp open={true} onOpenChange={onOpenChange} />);

      // Press Escape to close
      await user.keyboard('{Escape}');

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Content', () => {
    it('should display introduction text', async () => {
      const user = userEvent.setup();
      render(<ManualModeHelp asTrigger />);

      await user.click(screen.getByText('How to use Manual Mode'));

      await waitFor(() => {
        expect(
          screen.getByText(/connection to the draft room is lost/i)
        ).toBeInTheDocument();
      });
    });

    it('should display step 1 instructions', async () => {
      const user = userEvent.setup();
      render(<ManualModeHelp asTrigger />);

      await user.click(screen.getByText('How to use Manual Mode'));

      await waitFor(() => {
        expect(screen.getByText(/Enter the winning bid/i)).toBeInTheDocument();
        expect(screen.getByText(/Press Enter or click away/i)).toBeInTheDocument();
      });
    });

    it('should display step 2 instructions', async () => {
      const user = userEvent.setup();
      render(<ManualModeHelp asTrigger />);

      await user.click(screen.getByText('How to use Manual Mode'));

      await waitFor(() => {
        expect(screen.getByText(/Check "My Team"/i)).toBeInTheDocument();
        expect(screen.getByText(/tracks your roster and remaining budget/i)).toBeInTheDocument();
      });
    });

    it('should display step 3 instructions', async () => {
      const user = userEvent.setup();
      render(<ManualModeHelp asTrigger />);

      await user.click(screen.getByText('How to use Manual Mode'));

      await waitFor(() => {
        expect(screen.getByText(/Inflation updates automatically/i)).toBeInTheDocument();
      });
    });

    it('should display tips section', async () => {
      const user = userEvent.setup();
      render(<ManualModeHelp asTrigger />);

      await user.click(screen.getByText('How to use Manual Mode'));

      await waitFor(() => {
        expect(screen.getByText('Tips')).toBeInTheDocument();
        expect(screen.getByText(/Use the search bar/i)).toBeInTheDocument();
      });
    });

    it('should display reconnection info', async () => {
      const user = userEvent.setup();
      render(<ManualModeHelp asTrigger />);

      await user.click(screen.getByText('How to use Manual Mode'));

      await waitFor(() => {
        expect(
          screen.getByText(/When connection is restored/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have dialog role', async () => {
      const user = userEvent.setup();
      render(<ManualModeHelp asTrigger />);

      await user.click(screen.getByText('How to use Manual Mode'));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('should have accessible title', async () => {
      const user = userEvent.setup();
      render(<ManualModeHelp asTrigger />);

      await user.click(screen.getByText('How to use Manual Mode'));

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAccessibleName();
      });
    });

    it('should have numbered steps for clear progression', async () => {
      const user = userEvent.setup();
      render(<ManualModeHelp asTrigger />);

      await user.click(screen.getByText('How to use Manual Mode'));

      await waitFor(() => {
        // Check for step numbers 1, 2, 3
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
      });
    });
  });
});
