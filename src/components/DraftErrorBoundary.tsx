/**
 * DraftErrorBoundary Component
 *
 * Story: 10.8 - Implement Graceful Degradation Pattern
 *
 * Error boundary that catches errors in draft-related components
 * and displays a fallback UI instead of crashing the app.
 * Implements NFR-I2: No cascading failures.
 *
 * Features:
 * - Catches JavaScript errors anywhere in child component tree
 * - Logs error information without crashing
 * - Displays user-friendly fallback UI
 * - Provides retry functionality
 * - Supports custom fallback components
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Error info passed to fallback render function
 */
export interface FallbackProps {
  error: Error;
  errorInfo: ErrorInfo;
  resetError: () => void;
}

/**
 * Props for DraftErrorBoundary
 */
export interface DraftErrorBoundaryProps {
  children: ReactNode;
  /** Static fallback element */
  fallback?: ReactNode;
  /** Dynamic fallback render function */
  fallbackRender?: (props: FallbackProps) => ReactNode;
  /** Callback when error occurs */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * State for DraftErrorBoundary
 */
interface DraftErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error boundary component for draft features
 *
 * Wraps draft components to catch errors and prevent complete app failure.
 * When an error occurs, shows a fallback UI that indicates draft features
 * are still available with cached data.
 *
 * @example
 * ```tsx
 * <DraftErrorBoundary>
 *   <PlayerQueue />
 *   <RosterPanel />
 * </DraftErrorBoundary>
 * ```
 *
 * @example With custom fallback
 * ```tsx
 * <DraftErrorBoundary
 *   fallbackRender={({ error, resetError }) => (
 *     <CustomErrorUI error={error} onRetry={resetError} />
 *   )}
 * >
 *   <DraftPage />
 * </DraftErrorBoundary>
 * ```
 */
export class DraftErrorBoundary extends Component<
  DraftErrorBoundaryProps,
  DraftErrorBoundaryState
> {
  constructor(props: DraftErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Update state when an error is caught
   */
  static getDerivedStateFromError(error: Error): Partial<DraftErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Log error information and call onError callback
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error for debugging (without crashing the app)
    console.error('[DraftErrorBoundary] Caught error:', error);
    console.error('[DraftErrorBoundary] Component stack:', errorInfo.componentStack);

    // Update state with error info
    this.setState({ errorInfo });

    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  /**
   * Reset error state to attempt recovery
   */
  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  /**
   * Render the component
   */
  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, fallbackRender } = this.props;

    if (hasError && error) {
      // Use custom fallback render function if provided
      if (fallbackRender && errorInfo) {
        return fallbackRender({
          error,
          errorInfo,
          resetError: this.resetError,
        });
      }

      // Use static fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default fallback UI
      return (
        <Card className="border-amber-500/50 bg-amber-500/10" role="alert" aria-live="assertive">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-amber-100">
                  Draft features still available
                </h3>
                <p className="mt-2 text-sm text-amber-200/80">
                  A component encountered an error, but you can continue using the draft. Using
                  cached data while we attempt to recover.
                </p>
                <div className="mt-4">
                  <Button
                    onClick={this.resetError}
                    variant="outline"
                    size="sm"
                    className="border-amber-400/50 text-amber-100 hover:bg-amber-500/20"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return children;
  }
}

export default DraftErrorBoundary;
