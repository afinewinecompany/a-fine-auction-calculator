/**
 * PlayerSearch Component Tests
 *
 * Tests for the instant player search functionality.
 *
 * Story: 6.3 - Implement Instant Player Search
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlayerSearch, PlayerSearchProps } from '@/features/draft/components/PlayerSearch';

describe('PlayerSearch', () => {
  const defaultProps: PlayerSearchProps = {
    value: '',
    onChange: vi.fn(),
    totalCount: 100,
    filteredCount: 100,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders search input', () => {
      render(<PlayerSearch {...defaultProps} />);

      expect(screen.getByRole('searchbox')).toBeInTheDocument();
    });

    it('renders search icon', () => {
      render(<PlayerSearch {...defaultProps} />);

      // Search icon should be present
      expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    });

    it('renders with placeholder text', () => {
      render(<PlayerSearch {...defaultProps} />);

      expect(screen.getByPlaceholderText(/search players/i)).toBeInTheDocument();
    });

    it('displays current value', () => {
      render(<PlayerSearch {...defaultProps} value="Acuña" />);

      expect(screen.getByRole('searchbox')).toHaveValue('Acuña');
    });

    it('displays result count', () => {
      render(<PlayerSearch {...defaultProps} totalCount={500} filteredCount={25} />);

      expect(screen.getByText('25 of 500 players')).toBeInTheDocument();
    });

    it('updates result count dynamically', () => {
      const { rerender } = render(
        <PlayerSearch {...defaultProps} totalCount={100} filteredCount={100} />
      );

      expect(screen.getByText('100 of 100 players')).toBeInTheDocument();

      rerender(<PlayerSearch {...defaultProps} totalCount={100} filteredCount={15} />);

      expect(screen.getByText('15 of 100 players')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls onChange when typing', async () => {
      const onChange = vi.fn();
      render(<PlayerSearch {...defaultProps} onChange={onChange} />);

      const input = screen.getByRole('searchbox');
      await userEvent.type(input, 'test');

      expect(onChange).toHaveBeenCalled();
    });

    it('calls onChange with input value', async () => {
      const onChange = vi.fn();
      render(<PlayerSearch {...defaultProps} onChange={onChange} />);

      const input = screen.getByRole('searchbox');
      fireEvent.change(input, { target: { value: 'Acuña' } });

      expect(onChange).toHaveBeenCalledWith('Acuña');
    });

    it('shows clear button when search has value', () => {
      render(<PlayerSearch {...defaultProps} value="test" />);

      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
    });

    it('hides clear button when search is empty', () => {
      render(<PlayerSearch {...defaultProps} value="" />);

      expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument();
    });

    it('clears input when clear button is clicked', async () => {
      const onChange = vi.fn();
      render(<PlayerSearch {...defaultProps} value="test" onChange={onChange} />);

      const clearButton = screen.getByRole('button', { name: /clear/i });
      await userEvent.click(clearButton);

      expect(onChange).toHaveBeenCalledWith('');
    });

    it('clears input when Escape key is pressed', async () => {
      const onChange = vi.fn();
      render(<PlayerSearch {...defaultProps} value="test" onChange={onChange} />);

      const input = screen.getByRole('searchbox');
      fireEvent.keyDown(input, { key: 'Escape' });

      expect(onChange).toHaveBeenCalledWith('');
    });
  });

  describe('Auto-focus', () => {
    it('receives focus on mount by default', () => {
      render(<PlayerSearch {...defaultProps} autoFocus />);

      expect(screen.getByRole('searchbox')).toHaveFocus();
    });

    it('does not auto-focus when autoFocus is false', () => {
      render(<PlayerSearch {...defaultProps} autoFocus={false} />);

      expect(screen.getByRole('searchbox')).not.toHaveFocus();
    });
  });

  describe('Dark Theme Styling', () => {
    it('applies dark theme classes', () => {
      render(<PlayerSearch {...defaultProps} />);

      const container = screen.getByTestId('player-search');
      expect(container).toHaveClass('bg-slate-900');
    });
  });

  describe('Accessibility', () => {
    it('has proper aria-label', () => {
      render(<PlayerSearch {...defaultProps} />);

      expect(screen.getByRole('searchbox')).toHaveAttribute('aria-label', 'Search players');
    });

    it('clear button has accessible label', () => {
      render(<PlayerSearch {...defaultProps} value="test" />);

      expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument();
    });
  });
});
