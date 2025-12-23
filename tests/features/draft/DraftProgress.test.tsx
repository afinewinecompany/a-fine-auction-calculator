/**
 * Tests for DraftProgress Component
 *
 * Story: 7.8 - Track Overall Draft Progress
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DraftProgress } from '@/features/draft/components/DraftProgress';

describe('DraftProgress', () => {
  describe('rendering', () => {
    it('should render the draft progress container', () => {
      render(<DraftProgress playersDrafted={85} totalPlayers={276} />);
      expect(screen.getByTestId('draft-progress')).toBeInTheDocument();
    });

    it('should render status text with player counts', () => {
      render(<DraftProgress playersDrafted={85} totalPlayers={276} />);
      expect(screen.getByTestId('draft-status-text')).toHaveTextContent('85');
      expect(screen.getByTestId('draft-status-text')).toHaveTextContent('276');
    });

    it('should render progress bar', () => {
      render(<DraftProgress playersDrafted={85} totalPlayers={276} />);
      expect(screen.getByTestId('draft-progress-bar')).toBeInTheDocument();
    });
  });

  describe('progress calculation', () => {
    it('should calculate 0% when no players drafted', () => {
      render(<DraftProgress playersDrafted={0} totalPlayers={276} />);
      expect(screen.getByTestId('draft-progress-percentage')).toHaveTextContent('0% complete');
    });

    it('should calculate 50% when half players drafted', () => {
      render(<DraftProgress playersDrafted={138} totalPlayers={276} />);
      expect(screen.getByTestId('draft-progress-percentage')).toHaveTextContent('50% complete');
    });

    it('should calculate 100% when all players drafted', () => {
      render(<DraftProgress playersDrafted={276} totalPlayers={276} />);
      expect(screen.getByTestId('draft-progress-percentage')).toHaveTextContent('100% complete');
    });
  });

  describe('draft complete state', () => {
    it('should show Draft Complete! text', () => {
      render(<DraftProgress playersDrafted={276} totalPlayers={276} />);
      expect(screen.getByTestId('draft-complete-text')).toHaveTextContent('Draft Complete!');
    });

    it('should show checkmark icon', () => {
      render(<DraftProgress playersDrafted={276} totalPlayers={276} />);
      expect(screen.getByTestId('draft-complete-icon')).toBeInTheDocument();
    });
  });

  describe('time estimation', () => {
    it('should show time estimate when provided', () => {
      render(<DraftProgress playersDrafted={100} totalPlayers={276} estimatedTimeRemaining={45} />);
      expect(screen.getByTestId('time-estimate')).toHaveTextContent('~45 minutes remaining');
    });

    it('should not show time estimate when undefined', () => {
      render(<DraftProgress playersDrafted={100} totalPlayers={276} />);
      expect(screen.queryByTestId('time-estimate')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have region role on container', () => {
      render(<DraftProgress playersDrafted={85} totalPlayers={276} />);
      expect(screen.getByTestId('draft-progress')).toHaveAttribute('role', 'region');
    });
  });

  describe('className prop', () => {
    it('should apply custom className to container', () => {
      render(<DraftProgress playersDrafted={85} totalPlayers={276} className="custom-class" />);
      expect(screen.getByTestId('draft-progress')).toHaveClass('custom-class');
    });
  });
});
