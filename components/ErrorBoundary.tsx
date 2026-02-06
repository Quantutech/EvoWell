
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { errorHandler, ErrorSeverity, AppError } from '../services/error-handler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    errorHandler.logError(new AppError(
      error.message, 
      'REACT_BOUNDARY_ERROR', 
      ErrorSeverity.ERROR, 
      { componentStack: errorInfo.componentStack }
    ));
  }

  public render() {
    if (this.state.hasError) {
      const env = (import.meta as any).env || {};

      return this.props.fallback || (
        <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center bg-slate-50 rounded-3xl border border-slate-100 m-4 shadow-sm animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 text-3xl shadow-sm border border-red-100">
            ⚠️
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">System Glitch</h2>
          <p className="text-slate-500 font-medium mb-10 max-w-md leading-relaxed">
            We encountered an unexpected clinical error. Our engineering team has been automatically notified.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl hover:-translate-y-1"
            >
              Reload System
            </button>
            <button
              onClick={() => {
                 this.setState({ hasError: false, error: null });
                 window.location.hash = '#/';
              }}
              className="px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all hover:border-slate-300"
            >
              Return Home
            </button>
          </div>
          {/* Debug Info in Development */}
          {env.DEV && this.state.error && (
            <div className="mt-12 w-full max-w-2xl text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Debug Info</p>
              <pre className="p-6 bg-red-50 text-red-900 text-xs font-mono rounded-2xl overflow-auto border border-red-100 shadow-inner max-h-60">
                {this.state.error.toString()}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
