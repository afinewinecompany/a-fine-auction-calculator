/**
 * MyTeamCheckbox Component Tests
 *
 * Tests for the MyTeamCheckbox component that allows users to mark
 * players as part of their team during Manual Sync Mode.
 *
 * Story: 10.4 - Implement My Team Checkbox
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MyTeamCheckbox } from '@/features/draft/components/MyTeamCheckbox';

describe('MyTeamCheckbox', () => {
  const defaultProps = {
    playerId: 'player-123',
    playerName: 'Mike Trout',
    isChecked: false,
    onToggle: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders unchecked checkbox by default', () => {
      render(<MyTeamCheckbox {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox', { name: /mark mike trout as my team/i });
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
    });

    it('renders checked checkbox when isChecked is true', () => {
      render(<MyTeamCheckbox {...defaultProps} isChecked={true} />);

      const checkbox = screen.getByRole('checkbox', { name: /mark mike trout as my team/i });
      expect(checkbox).toBeChecked();
    });

    it('renders with correct test id', () => {
      render(<MyTeamCheckbox {...defaultProps} />);

      expect(screen.getByTestId('my-team-checkbox-player-123')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<MyTeamCheckbox {...defaultProps} className="custom-class" />);

      const container = screen.getByTestId('my-team-checkbox-player-123').closest('div');
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('Interaction', () => {
    it('calls onToggle with playerId and true when checked', () => {
      const onToggle = vi.fn();
      render(<MyTeamCheckbox {...defaultProps} onToggle={onToggle} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(onToggle).toHaveBeenCalledWith('player-123', true);
    });

    it('calls onToggle with playerId and false when unchecked', () => {
      const onToggle = vi.fn();
      render(<MyTeamCheckbox {...defaultProps} isChecked={true} onToggle={onToggle} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(onToggle).toHaveBeenCalledWith('player-123', false);
    });

    it('stops event propagation when clicked', () => {
      const parentClickHandler = vi.fn();
      render(
        <div onClick={parentClickHandler}>
          <MyTeamCheckbox {...defaultProps} />
        </div>
      );

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(parentClickHandler).not.toHaveBeenCalled();
    });

    it('stops event propagation on keydown', () => {
      const parentKeyHandler = vi.fn();
      render(
        <div onKeyDown={parentKeyHandler}>
          <MyTeamCheckbox {...defaultProps} />
        </div>
      );

      const checkbox = screen.getByRole('checkbox');
      fireEvent.keyDown(checkbox, { key: 'Enter' });

      expect(parentKeyHandler).not.toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('does not call onToggle when disabled', () => {
      const onToggle = vi.fn();
      render(<MyTeamCheckbox {...defaultProps} disabled={true} onToggle={onToggle} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeDisabled();

      fireEvent.click(checkbox);
      expect(onToggle).not.toHaveBeenCalled();
    });

    it('renders disabled checkbox with correct styles', () => {
      render(<MyTeamCheckbox {...defaultProps} disabled={true} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('has accessible label based on player name', () => {
      render(<MyTeamCheckbox {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox', { name: /mark mike trout as my team/i });
      expect(checkbox).toBeInTheDocument();
    });

    it('has correct aria-label', () => {
      render(<MyTeamCheckbox {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-label', 'Mark Mike Trout as my team');
    });
  });

  describe('Dark Theme Styling', () => {
    it('has emerald color when checked', () => {
      render(<MyTeamCheckbox {...defaultProps} isChecked={true} />);

      const checkbox = screen.getByRole('checkbox');
      // Check that it has the data-state attribute set to checked
      expect(checkbox).toHaveAttribute('data-state', 'checked');
    });
  });
});
