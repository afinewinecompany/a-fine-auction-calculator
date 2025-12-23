/**
 * ShareButton Component Tests
 *
 * Tests for the ShareButton component that handles sharing draft results.
 * Uses Web Share API for mobile and clipboard fallback for desktop.
 *
 * Story: 12.5 - Show Competitive Advantage Summary
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ShareButton } from '@/features/draft/components/ShareButton';

// Mock clipboard API
const mockClipboard = {
  writeText: vi.fn().mockResolvedValue(undefined),
};

// Mock navigator.share
const mockShare = vi.fn().mockResolvedValue(undefined);

describe('ShareButton', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup clipboard mock
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render share button', () => {
    render(<ShareButton shareText="Test share text" />);

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should display "Share your results" text', () => {
    render(<ShareButton shareText="Test share text" />);

    expect(screen.getByText(/share/i)).toBeInTheDocument();
  });

  it('should have emerald gradient styling', () => {
    render(<ShareButton shareText="Test share text" />);

    const button = screen.getByRole('button');
    expect(button.className).toMatch(/emerald/i);
  });

  it('should copy to clipboard when Web Share API is not available', async () => {
    // Ensure Web Share API is not available
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    render(<ShareButton shareText="Test share text" />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalledWith('Test share text');
    });
  });

  it('should show "Copied to clipboard!" confirmation after copying', async () => {
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    render(<ShareButton shareText="Test share text" />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/copied/i)).toBeInTheDocument();
    });
  });

  it('should use Web Share API when available', async () => {
    Object.defineProperty(navigator, 'share', {
      value: mockShare,
      writable: true,
      configurable: true,
    });

    render(<ShareButton shareText="Test share text" />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockShare).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Test share text',
        })
      );
    });
  });

  it('should include share icon', () => {
    render(<ShareButton shareText="Test share text" />);

    // Button should contain an SVG icon
    const button = screen.getByRole('button');
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('should handle share cancellation gracefully', async () => {
    // Simulate user cancelling share dialog
    const shareError = new Error('Share canceled');
    shareError.name = 'AbortError';
    mockShare.mockRejectedValueOnce(shareError);

    Object.defineProperty(navigator, 'share', {
      value: mockShare,
      writable: true,
      configurable: true,
    });

    render(<ShareButton shareText="Test share text" />);

    const button = screen.getByRole('button');

    // Should not throw
    expect(() => fireEvent.click(button)).not.toThrow();
  });

  it('should fall back to clipboard on Web Share API error', async () => {
    const shareError = new Error('Share failed');
    mockShare.mockRejectedValueOnce(shareError);

    Object.defineProperty(navigator, 'share', {
      value: mockShare,
      writable: true,
      configurable: true,
    });

    render(<ShareButton shareText="Test share text" />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalled();
    });
  });
});

describe('ShareButton accessibility', () => {
  it('should have accessible button role', () => {
    render(<ShareButton shareText="Test" />);

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should have accessible name', () => {
    render(<ShareButton shareText="Test" />);

    const button = screen.getByRole('button');
    expect(button).toHaveAccessibleName();
  });
});

describe('ShareButton styling', () => {
  it('should have rounded corners', () => {
    render(<ShareButton shareText="Test" />);

    const button = screen.getByRole('button');
    expect(button.className).toMatch(/rounded/);
  });

  it('should have padding for proper sizing', () => {
    render(<ShareButton shareText="Test" />);

    const button = screen.getByRole('button');
    expect(button.className).toMatch(/p[x|y]?-/);
  });
});
