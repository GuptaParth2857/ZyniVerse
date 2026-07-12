"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  label?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[ErrorBoundary${this.props.label ? `:${this.props.label}` : ""}]`, error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-8 text-center">
          <div className="font-display text-4xl font-bold text-red-500/30">!</div>
          <p className="mt-2 text-sm text-[var(--color-mute)]">
            {this.props.label || "This section"} failed to load.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 rounded-full border border-[var(--color-cyan)] px-5 py-2.5 text-xs font-semibold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/10 transition-all"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
