/**
 * ProfileErrorBoundary Component
 *
 * Error boundary specifically for the profile feature.
 * Catches errors in profile components and displays a recovery UI.
 *
 * Story: 2.6 - Implement Profile Management
 */

import { Component, type ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ProfileErrorBoundaryProps {
  children: ReactNode;
}

interface ProfileErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component for profile feature
 *
 * Catches JavaScript errors in child components and displays
 * a profile-specific error recovery UI.
 *
 * @example
 * ```tsx
 * <ProfileErrorBoundary>
 *   <ProfileView />
 * </ProfileErrorBoundary>
 * ```
 */
export class ProfileErrorBoundary extends Component<
  ProfileErrorBoundaryProps,
  ProfileErrorBoundaryState
> {
  constructor(props: ProfileErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ProfileErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error for debugging (could be sent to error tracking service)
    console.error('Profile Error Boundary caught error:', error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="container max-w-2xl mx-auto py-8 px-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-8 text-center">
              <div className="text-red-400 mb-4">
                <AlertCircle className="h-12 w-12 mx-auto" />
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">Something went wrong</h2>
              <p className="text-slate-400 mb-4">
                We encountered an error loading your profile. Please try again.
              </p>
              {this.state.error && (
                <p className="text-xs text-slate-500 mb-4 font-mono">{this.state.error.message}</p>
              )}
              <Button
                onClick={this.handleRetry}
                variant="outline"
                className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ProfileErrorBoundary;
