/**
 * Error Boundary Components
 * 
 * Provides error boundaries to catch and handle React component errors gracefully.
 * Displays user-friendly error messages and provides recovery options.
 */

"use client";

import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
  level?: "page" | "component" | "feature";
}

/**
 * Main Error Boundary Component
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: this.generateErrorId(),
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
      errorId: this.generateErrorId(),
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error for debugging
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: this.generateErrorId(),
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Render appropriate error UI based on level
      return this.renderErrorUI();
    }

    return this.props.children;
  }

  private renderErrorUI() {
    const { level = "component", showDetails = false } = this.props;
    const { error, errorInfo, errorId } = this.state;

    if (level === "page") {
      return <PageErrorFallback
        error={error}
        errorInfo={errorInfo}
        errorId={errorId}
        onRetry={this.handleRetry}
        onReload={this.handleReload}
        showDetails={showDetails}
      />;
    }

    if (level === "feature") {
      return <FeatureErrorFallback
        error={error}
        errorInfo={errorInfo}
        errorId={errorId}
        onRetry={this.handleRetry}
        showDetails={showDetails}
      />;
    }

    return <ComponentErrorFallback
      error={error}
      errorInfo={errorInfo}
      errorId={errorId}
      onRetry={this.handleRetry}
      showDetails={showDetails}
    />;
  }
}

/**
 * Page-level error fallback
 */
function PageErrorFallback({
  error,
  errorInfo,
  errorId,
  onRetry,
  onReload,
  showDetails
}: {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string;
  onRetry: () => void;
  onReload: () => void;
  showDetails: boolean;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-destructive/20">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl text-destructive">
            Something went wrong
          </CardTitle>
          <p className="text-muted-foreground">
            We encountered an unexpected error while loading this page.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={onRetry} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
            <Button variant="outline" onClick={onReload} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Reload Page
            </Button>
            <Link href="/">
              <Button variant="outline" className="gap-2 w-full sm:w-auto">
                <Home className="w-4 h-4" />
                Go Home
              </Button>
            </Link>
          </div>

          {showDetails && error && (
            <ErrorDetails error={error} errorInfo={errorInfo} errorId={errorId} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Feature-level error fallback
 */
function FeatureErrorFallback({
  error,
  errorInfo,
  errorId,
  onRetry,
  showDetails
}: {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string;
  onRetry: () => void;
  showDetails: boolean;
}) {
  return (
    <Card className="w-full border-destructive/20 bg-destructive/5">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-semibold text-destructive">Feature Unavailable</h3>
              <p className="text-sm text-muted-foreground">
                This feature encountered an error and could not load properly.
              </p>
            </div>

            <Button size="sm" onClick={onRetry} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Retry
            </Button>

            {showDetails && error && (
              <ErrorDetails error={error} errorInfo={errorInfo} errorId={errorId} compact />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Component-level error fallback
 */
function ComponentErrorFallback({
  error,
  errorInfo,
  errorId,
  onRetry,
  showDetails
}: {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string;
  onRetry: () => void;
  showDetails: boolean;
}) {
  return (
    <div className="border border-destructive/20 bg-destructive/5 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-3">
        <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
        <div>
          <p className="font-medium text-destructive text-sm">Component Error</p>
          <p className="text-xs text-muted-foreground">
            This component failed to render
          </p>
        </div>
      </div>

      <Button size="sm" variant="outline" onClick={onRetry} className="gap-2">
        <RefreshCw className="w-3 h-3" />
        Retry
      </Button>

      {showDetails && error && (
        <ErrorDetails error={error} errorInfo={errorInfo} errorId={errorId} compact />
      )}
    </div>
  );
}

/**
 * Error details component
 */
function ErrorDetails({
  error,
  errorInfo,
  errorId,
  compact = false
}: {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string;
  compact?: boolean;
}) {
  const [showTechnical, setShowTechnical] = React.useState(false);

  return (
    <div className={`border-t pt-4 ${compact ? 'mt-3' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Error ID: {errorId}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowTechnical(!showTechnical)}
          className="gap-2 text-xs"
        >
          <Bug className="w-3 h-3" />
          {showTechnical ? 'Hide' : 'Show'} Details
        </Button>
      </div>

      {showTechnical && (
        <div className="bg-muted/50 rounded p-3 text-xs font-mono space-y-2">
          {error && (
            <div>
              <strong>Error:</strong>
              <pre className="whitespace-pre-wrap text-destructive mt-1">
                {error.message}
              </pre>
            </div>
          )}

          {error?.stack && (
            <div>
              <strong>Stack Trace:</strong>
              <pre className="whitespace-pre-wrap text-muted-foreground mt-1 max-h-32 overflow-y-auto">
                {error.stack}
              </pre>
            </div>
          )}

          {errorInfo?.componentStack && (
            <div>
              <strong>Component Stack:</strong>
              <pre className="whitespace-pre-wrap text-muted-foreground mt-1 max-h-32 overflow-y-auto">
                {errorInfo.componentStack}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Hook for error boundary integration
 */
export function useErrorHandler() {
  return (error: Error, errorInfo?: React.ErrorInfo) => {
    console.error('Manual error report:', error, errorInfo);

    // You can integrate with error reporting services here
    // Example: Sentry.captureException(error, { extra: errorInfo });
  };
}

/**
 * Higher-order component for wrapping components with error boundaries
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}