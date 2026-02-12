"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState((prev) => ({
      hasError: false,
      error: null,
      retryCount: prev.retryCount + 1,
    }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
          <AlertTriangle className="w-10 h-10 text-accent-theme mb-4" aria-hidden="true" />
          <h2 className="text-2xl text-text-primary mb-2 font-display">
            Something went wrong
          </h2>
          <p className="text-sm text-text-muted mb-6 text-center max-w-md">
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={this.handleRetry}
            className="px-4 py-2 text-[11px] uppercase tracking-[0.08em] font-mono bg-accent-theme text-accent-contrast rounded-lg hover:bg-accent-hover transition-colors duration-150"
          >
            Retry
          </button>
        </div>
      );
    }

    return <div key={this.state.retryCount}>{this.props.children}</div>;
  }
}
