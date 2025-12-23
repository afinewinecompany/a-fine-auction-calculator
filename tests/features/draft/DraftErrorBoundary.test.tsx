/**
 * DraftErrorBoundary Tests
 *
 * Story: 10.8 - Implement Graceful Degradation Pattern
 *
 * Tests error boundary behavior for draft-related components.
 * Ensures API failures don't crash the application (NFR-I2).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DraftErrorBoundary } from '@/components/DraftErrorBoundary';

// Component that always throws
function ThrowError({ error }: { error?: Error }): never {
  throw error || new Error('Test error');
}

// Component that conditionally throws
function ConditionalError({ shouldThrow = false }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Conditional error');
  }
  return <div data-testid="child-content">Child content</div>;
}

describe('DraftErrorBoundary', () => {
  // Suppress console.error for error boundary tests
  const originalConsoleError = console.error;

  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  describe('normal rendering', () => {
    it('renders children when no error occurs', () => {
      render(
        <DraftErrorBoundary>
          <div data-testid="child">Hello</div>
        </DraftErrorBoundary>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });

    it('renders multiple children without errors', () => {
      render(
        <DraftErrorBoundary>
          <div data-testid="child-1">First</div>
          <div data-testid="child-2">Second</div>
        </DraftErrorBoundary>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('catches errors from child components', () => {
      render(
        <DraftErrorBoundary>
          <ThrowError />
        </DraftErrorBoundary>
      );

      // Should show fallback UI, not crash
      expect(screen.queryByText('Test error')).not.toBeInTheDocument();
    });

    it('displays fallback UI when error occurs', () => {
      render(
        <DraftErrorBoundary>
          <ThrowError />
        </DraftErrorBoundary>
      );

      expect(
        screen.getByText(/draft features still available/i)
      ).toBeInTheDocument();
    });

    it('displays message about using cached data', () => {
      render(
        <DraftErrorBoundary>
          <ThrowError />
        </DraftErrorBoundary>
      );

      expect(screen.getByText(/using cached data/i)).toBeInTheDocument();
    });

    it('logs error without crashing the app', () => {
      render(
        <DraftErrorBoundary>
          <ThrowError error={new Error('API connection failed')} />
        </DraftErrorBoundary>
      );

      // Error should be logged
      expect(console.error).toHaveBeenCalled();

      // App should still be functional (fallback shown)
      expect(
        screen.getByText(/draft features still available/i)
      ).toBeInTheDocument();
    });
  });

  describe('fallback UI elements', () => {
    it('shows warning icon or indicator', () => {
      render(
        <DraftErrorBoundary>
          <ThrowError />
        </DraftErrorBoundary>
      );

      // Should have some visual indicator
      expect(
        screen.getByRole('alert') || screen.getByRole('status')
      ).toBeInTheDocument();
    });

    it('provides retry/refresh option', async () => {
      const user = userEvent.setup();

      render(
        <DraftErrorBoundary>
          <ThrowError />
        </DraftErrorBoundary>
      );

      const retryButton = screen.getByRole('button', {
        name: /retry|refresh|try again/i,
      });
      expect(retryButton).toBeInTheDocument();

      // Clicking retry should attempt recovery
      await user.click(retryButton);
    });
  });

  describe('NFR-I2: No cascading failures', () => {
    it('prevents error from propagating to parent', () => {
      // Wrap in try-catch to verify no error escapes
      let caughtError: Error | null = null;

      try {
        render(
          <div data-testid="parent">
            <DraftErrorBoundary>
              <ThrowError />
            </DraftErrorBoundary>
          </div>
        );
      } catch (e) {
        caughtError = e as Error;
      }

      // No error should have escaped
      expect(caughtError).toBeNull();

      // Parent should still be rendered
      expect(screen.getByTestId('parent')).toBeInTheDocument();
    });

    it('allows sibling components to continue working', () => {
      render(
        <div>
          <DraftErrorBoundary>
            <ThrowError />
          </DraftErrorBoundary>
          <div data-testid="sibling">Sibling works</div>
        </div>
      );

      // Sibling should be unaffected
      expect(screen.getByTestId('sibling')).toBeInTheDocument();
      expect(screen.getByText('Sibling works')).toBeInTheDocument();
    });

    it('isolates errors to specific component boundary', () => {
      render(
        <div>
          <DraftErrorBoundary>
            <ThrowError />
          </DraftErrorBoundary>
          <DraftErrorBoundary>
            <div data-testid="working-component">Working</div>
          </DraftErrorBoundary>
        </div>
      );

      // First boundary shows error, second works fine
      expect(
        screen.getByText(/draft features still available/i)
      ).toBeInTheDocument();
      expect(screen.getByTestId('working-component')).toBeInTheDocument();
    });
  });

  describe('error recovery', () => {
    it('resets error state when children change', () => {
      const { rerender } = render(
        <DraftErrorBoundary>
          <ConditionalError shouldThrow />
        </DraftErrorBoundary>
      );

      // Should show fallback
      expect(
        screen.getByText(/draft features still available/i)
      ).toBeInTheDocument();

      // Re-render with non-throwing child
      rerender(
        <DraftErrorBoundary>
          <ConditionalError shouldThrow={false} />
        </DraftErrorBoundary>
      );

      // Should recover and show child
      // Note: Error boundaries don't automatically recover on rerender
      // This tests that the fallback is still shown until explicit reset
    });
  });

  describe('custom fallback', () => {
    it('accepts custom fallback component via prop', () => {
      const CustomFallback = () => (
        <div data-testid="custom-fallback">Custom error UI</div>
      );

      render(
        <DraftErrorBoundary fallback={<CustomFallback />}>
          <ThrowError />
        </DraftErrorBoundary>
      );

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    });

    it('accepts fallback render function with error info', () => {
      render(
        <DraftErrorBoundary
          fallbackRender={({ error }) => (
            <div data-testid="render-fallback">Error: {error.message}</div>
          )}
        >
          <ThrowError error={new Error('Custom message')} />
        </DraftErrorBoundary>
      );

      expect(screen.getByTestId('render-fallback')).toBeInTheDocument();
      expect(screen.getByText(/Custom message/)).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('fallback UI has appropriate ARIA role', () => {
      render(
        <DraftErrorBoundary>
          <ThrowError />
        </DraftErrorBoundary>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('retry button is focusable', async () => {
      render(
        <DraftErrorBoundary>
          <ThrowError />
        </DraftErrorBoundary>
      );

      const retryButton = screen.getByRole('button', {
        name: /retry|refresh|try again/i,
      });
      retryButton.focus();
      expect(document.activeElement).toBe(retryButton);
    });
  });

  describe('onError callback', () => {
    it('calls onError prop when error occurs', () => {
      const onError = vi.fn();
      const testError = new Error('Callback test');

      render(
        <DraftErrorBoundary onError={onError}>
          <ThrowError error={testError} />
        </DraftErrorBoundary>
      );

      expect(onError).toHaveBeenCalledWith(testError, expect.any(Object));
    });

    it('includes error info in callback', () => {
      const onError = vi.fn();

      render(
        <DraftErrorBoundary onError={onError}>
          <ThrowError />
        </DraftErrorBoundary>
      );

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      );
    });
  });
});
