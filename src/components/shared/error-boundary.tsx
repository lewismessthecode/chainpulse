"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
          <AlertTriangle className="w-10 h-10 text-amber mb-4" />
          <h2
            className="text-2xl text-warm-white mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Something went wrong
          </h2>
          <p className="text-sm text-warm-muted mb-6 text-center max-w-md">
            {this.state.error?.message ?? "An unexpected error occurred."}
          </p>
          <button
            onClick={this.handleRetry}
            className="px-4 py-2 text-[11px] uppercase tracking-[0.08em] font-mono bg-amber text-black hover:bg-amber-dim transition-colors duration-150"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
