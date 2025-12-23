/**
 * EmptyLeaguesState Component Tests
 *
 * Tests for the EmptyLeaguesState component including:
 * - Rendering empty state message
 * - Descriptive subtext
 * - Create button link
 *
 * Story: 3.3 - Display Saved Leagues List
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { EmptyLeaguesState } from '@/features/leagues/components/EmptyLeaguesState';

/**
 * Helper to render EmptyLeaguesState with router context
 */
function renderEmptyLeaguesState() {
  return render(
    <BrowserRouter>
      <EmptyLeaguesState />
    </BrowserRouter>
  );
}

describe('EmptyLeaguesState', () => {
  describe('Rendering', () => {
    it('should render empty message heading', () => {
      renderEmptyLeaguesState();

      expect(
        screen.getByRole('heading', { name: /no leagues yet/i })
      ).toBeInTheDocument();
    });

    it('should render descriptive subtext', () => {
      renderEmptyLeaguesState();

      expect(
        screen.getByText(/create your first league/i)
      ).toBeInTheDocument();
    });

    it('should render "Create New League" button', () => {
      renderEmptyLeaguesState();

      expect(
        screen.getByRole('link', { name: /create new league/i })
      ).toBeInTheDocument();
    });

    it('should have test id for component', () => {
      renderEmptyLeaguesState();

      expect(screen.getByTestId('empty-leagues-state')).toBeInTheDocument();
    });
  });

  describe('Links', () => {
    it('should link to /leagues/new', () => {
      renderEmptyLeaguesState();

      const createLink = screen.getByRole('link', { name: /create new league/i });
      expect(createLink).toHaveAttribute('href', '/leagues/new');
    });
  });

  describe('Styling', () => {
    it('should have centered text alignment', () => {
      renderEmptyLeaguesState();

      const container = screen.getByTestId('empty-leagues-state');
      expect(container).toHaveClass('text-center');
    });

    it('should have proper padding', () => {
      renderEmptyLeaguesState();

      const container = screen.getByTestId('empty-leagues-state');
      expect(container).toHaveClass('py-12');
    });
  });

  describe('Content', () => {
    it('should mention draft tracking in description', () => {
      renderEmptyLeaguesState();

      expect(
        screen.getByText(/draft tracking/i)
      ).toBeInTheDocument();
    });

    it('should have encouraging tone in message', () => {
      renderEmptyLeaguesState();

      // Check for encouraging text
      expect(
        screen.getByText(/get started/i)
      ).toBeInTheDocument();
    });
  });
});
