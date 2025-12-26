import { Component, ErrorInfo, ReactNode } from 'react';
import { Button, Card, CardBody } from '@heroui/react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error boundary component that catches JavaScript errors anywhere in the child
 * component tree, logs those errors, and displays a fallback UI.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // TODO: Send to error tracking service (e.g., Sentry)
    // if (import.meta.env.PROD) {
    //   Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
    // }
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleReload = (): void => {
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full">
            <CardBody className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger-100 flex items-center justify-center">
                <ExclamationTriangleIcon className="w-8 h-8 text-danger-500" />
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Something went wrong
              </h1>

              <p className="text-gray-600 mb-6">
                We're sorry, but something unexpected happened. Please try refreshing
                the page or contact support if the problem persists.
              </p>

              {import.meta.env.DEV && this.state.error && (
                <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left overflow-auto max-h-48">
                  <p className="text-sm font-mono text-danger-600 mb-2">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <pre className="text-xs font-mono text-gray-600 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <Button
                  color="default"
                  variant="bordered"
                  startContent={<ArrowPathIcon className="w-4 h-4" />}
                  onPress={this.handleReset}
                >
                  Try Again
                </Button>
                <Button
                  color="primary"
                  onPress={this.handleReload}
                >
                  Refresh Page
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Smaller error boundary for specific sections/components.
 * Shows a less intrusive error message.
 */
export class SectionErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    console.error('SectionErrorBoundary caught an error:', error, errorInfo);
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 text-center bg-gray-50 rounded-lg border border-gray-200">
          <ExclamationTriangleIcon className="w-8 h-8 text-warning-500 mx-auto mb-2" />
          <p className="text-gray-600 mb-3">Failed to load this section</p>
          <Button
            size="sm"
            variant="flat"
            color="primary"
            onPress={this.handleRetry}
          >
            Retry
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
