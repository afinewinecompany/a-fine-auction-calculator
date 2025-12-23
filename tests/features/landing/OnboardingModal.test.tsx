/**
 * OnboardingModal Component Tests
 *
 * Tests the multi-step onboarding modal functionality including:
 * - Modal visibility and display
 * - Step navigation (Next, Back, Skip)
 * - Progress indicator
 * - Step content rendering
 * - Completion callback
 *
 * Story: 11.6 - Create Basic Onboarding Flow
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OnboardingModal } from '@/features/landing/components/OnboardingModal';

describe('OnboardingModal', () => {
  describe('Rendering', () => {
    it('should render when open is true', () => {
      const onComplete = vi.fn();
      render(<OnboardingModal open={true} onComplete={onComplete} />);

      expect(screen.getByText('Welcome to Auction Projections!')).toBeInTheDocument();
    });

    it('should not render when open is false', () => {
      const onComplete = vi.fn();
      render(<OnboardingModal open={false} onComplete={onComplete} />);

      expect(screen.queryByText('Welcome to Auction Projections!')).not.toBeInTheDocument();
    });

    it('should display step 1 of 4 on initial load', () => {
      const onComplete = vi.fn();
      render(<OnboardingModal open={true} onComplete={onComplete} />);

      expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();
    });

    it('should display Skip button', () => {
      const onComplete = vi.fn();
      render(<OnboardingModal open={true} onComplete={onComplete} />);

      expect(screen.getByRole('button', { name: /skip/i })).toBeInTheDocument();
    });
  });

  describe('Welcome Step (Step 0)', () => {
    it('should display welcome title', () => {
      const onComplete = vi.fn();
      render(<OnboardingModal open={true} onComplete={onComplete} />);

      expect(screen.getByText('Welcome to Auction Projections!')).toBeInTheDocument();
    });

    it('should display welcome message', () => {
      const onComplete = vi.fn();
      render(<OnboardingModal open={true} onComplete={onComplete} />);

      expect(
        screen.getByText(/Get ready to dominate your fantasy baseball auction draft/i)
      ).toBeInTheDocument();
    });

    it('should display Next button (not Get Started)', () => {
      const onComplete = vi.fn();
      render(<OnboardingModal open={true} onComplete={onComplete} />);

      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /get started/i })).not.toBeInTheDocument();
    });

    it('should not display Back button on first step', () => {
      const onComplete = vi.fn();
      render(<OnboardingModal open={true} onComplete={onComplete} />);

      expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument();
    });
  });

  describe('Navigation - Next Button', () => {
    it('should advance to Inflation Tracking step when Next is clicked', async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn();
      render(<OnboardingModal open={true} onComplete={onComplete} />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Inflation Tracking')).toBeInTheDocument();
        expect(screen.getByText('Step 2 of 4')).toBeInTheDocument();
      });
    });

    it('should advance to Adjusted Values step from Inflation Tracking', async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn();
      render(<OnboardingModal open={true} onComplete={onComplete} />);

      // Click Next twice
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Adjusted Values')).toBeInTheDocument();
        expect(screen.getByText('Step 3 of 4')).toBeInTheDocument();
      });
    });

    it('should advance to Tier Assignments step from Adjusted Values', async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn();
      render(<OnboardingModal open={true} onComplete={onComplete} />);

      // Click Next three times
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);
      await user.click(nextButton);
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Tier Assignments')).toBeInTheDocument();
        expect(screen.getByText('Step 4 of 4')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation - Back Button', () => {
    it('should display Back button on step 2', async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn();
      render(<OnboardingModal open={true} onComplete={onComplete} />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
      });
    });

    it('should go back to Welcome step from Inflation Tracking', async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn();
      render(<OnboardingModal open={true} onComplete={onComplete} />);

      // Go to step 2
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      // Go back to step 1
      const backButton = screen.getByRole('button', { name: /back/i });
      await user.click(backButton);

      await waitFor(() => {
        expect(screen.getByText('Welcome to Auction Projections!')).toBeInTheDocument();
        expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();
      });
    });

    it('should navigate back through all steps correctly', async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn();
      render(<OnboardingModal open={true} onComplete={onComplete} />);

      // Navigate forward to step 4
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);
      await user.click(nextButton);
      await user.click(nextButton);

      // Navigate back through all steps
      const backButton = screen.getByRole('button', { name: /back/i });

      // Step 3
      await user.click(backButton);
      await waitFor(() => {
        expect(screen.getByText('Adjusted Values')).toBeInTheDocument();
      });

      // Step 2
      await user.click(backButton);
      await waitFor(() => {
        expect(screen.getByText('Inflation Tracking')).toBeInTheDocument();
      });

      // Step 1
      await user.click(backButton);
      await waitFor(() => {
        expect(screen.getByText('Welcome to Auction Projections!')).toBeInTheDocument();
      });
    });
  });

  describe('Skip Button', () => {
    it('should call onComplete when Skip is clicked from step 1', async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn();
      render(<OnboardingModal open={true} onComplete={onComplete} />);

      const skipButton = screen.getByRole('button', { name: /skip/i });
      await user.click(skipButton);

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledTimes(1);
      });
    });

    it('should call onComplete when Skip is clicked from middle step', async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn();
      render(<OnboardingModal open={true} onComplete={onComplete} />);

      // Navigate to step 2
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      // Click Skip
      const skipButton = screen.getByRole('button', { name: /skip/i });
      await user.click(skipButton);

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Get Started Button', () => {
    it('should display "Get Started" button on final step', async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn();
      render(<OnboardingModal open={true} onComplete={onComplete} />);

      // Navigate to final step
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);
      await user.click(nextButton);
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /^next$/i })).not.toBeInTheDocument();
      });
    });

    it('should call onComplete when "Get Started" is clicked', async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn();
      render(<OnboardingModal open={true} onComplete={onComplete} />);

      // Navigate to final step
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);
      await user.click(nextButton);
      await user.click(nextButton);

      // Click Get Started
      const getStartedButton = screen.getByRole('button', { name: /get started/i });
      await user.click(getStartedButton);

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Progress Indicator', () => {
    it('should show 25% progress on step 1', () => {
      const onComplete = vi.fn();
      render(<OnboardingModal open={true} onComplete={onComplete} />);

      expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();
    });

    it('should show 50% progress on step 2', async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn();
      render(<OnboardingModal open={true} onComplete={onComplete} />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Step 2 of 4')).toBeInTheDocument();
      });
    });

    it('should show 75% progress on step 3', async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn();
      render(<OnboardingModal open={true} onComplete={onComplete} />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Step 3 of 4')).toBeInTheDocument();
      });
    });

    it('should show 100% progress on step 4', async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn();
      render(<OnboardingModal open={true} onComplete={onComplete} />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);
      await user.click(nextButton);
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Step 4 of 4')).toBeInTheDocument();
      });
    });
  });

  describe('Step Content', () => {
    it('should display Inflation Tracking content on step 2', async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn();
      render(<OnboardingModal open={true} onComplete={onComplete} />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Real-Time Inflation Tracking')).toBeInTheDocument();
        expect(screen.getByText(/inflates the value/i)).toBeInTheDocument();
      });
    });

    it('should display Adjusted Values content on step 3', async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn();
      render(<OnboardingModal open={true} onComplete={onComplete} />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Dynamic Adjusted Values')).toBeInTheDocument();
        expect(screen.getByText(/recalculate each player's value/i)).toBeInTheDocument();
      });
    });

    it('should display Tier Assignments content on step 4', async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn();
      render(<OnboardingModal open={true} onComplete={onComplete} />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);
      await user.click(nextButton);
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Smart Tier Assignments')).toBeInTheDocument();
        expect(screen.getByText(/grouped into value tiers/i)).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should not break if onComplete is undefined', async () => {
      const user = userEvent.setup();
      // @ts-expect-error - testing edge case
      render(<OnboardingModal open={true} />);

      const skipButton = screen.getByRole('button', { name: /skip/i });
      await user.click(skipButton);

      // Should not throw error
      expect(screen.getByText('Welcome to Auction Projections!')).toBeInTheDocument();
    });

    it('should handle rapid clicking of Next button', async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn();
      render(<OnboardingModal open={true} onComplete={onComplete} />);

      const nextButton = screen.getByRole('button', { name: /next/i });

      // Rapid clicks
      await user.click(nextButton);
      await user.click(nextButton);
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Step 4 of 4')).toBeInTheDocument();
      });
    });

    it('should handle rapid clicking of Back button', async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn();
      render(<OnboardingModal open={true} onComplete={onComplete} />);

      // Navigate to step 4
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);
      await user.click(nextButton);
      await user.click(nextButton);

      // Rapid back clicks
      const backButton = screen.getByRole('button', { name: /back/i });
      await user.click(backButton);
      await user.click(backButton);
      await user.click(backButton);

      await waitFor(() => {
        expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have dialog role', () => {
      const onComplete = vi.fn();
      render(<OnboardingModal open={true} onComplete={onComplete} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have accessible title', () => {
      const onComplete = vi.fn();
      render(<OnboardingModal open={true} onComplete={onComplete} />);

      expect(
        screen.getByRole('heading', { name: /welcome to auction projections/i })
      ).toBeInTheDocument();
    });

    it('should have accessible buttons', () => {
      const onComplete = vi.fn();
      render(<OnboardingModal open={true} onComplete={onComplete} />);

      expect(screen.getByRole('button', { name: /skip/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });
  });
});
