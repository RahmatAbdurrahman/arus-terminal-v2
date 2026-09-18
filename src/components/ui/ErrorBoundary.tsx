'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="terminal-panel border-signal-distribution/40 p-6 text-center">
          <span className="text-2xl mb-2 block" aria-hidden="true">⚠️</span>
          <p className="text-signal-distribution font-mono text-sm mb-2">Something went wrong</p>
          <p className="text-text-tertiary font-mono text-xs mb-4">
            {this.state.error?.message || 'Unknown error'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-1.5 text-xs font-mono bg-btn-bg border border-btn-border rounded hover:bg-btn-bg-hover text-text-primary transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
