
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { errorHandler, ErrorSeverity, AppError } from '../services/error-handler';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };
  public static getDerivedStateFromError(error: Error): State { return { hasError: true, error }; }
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    errorHandler.logError(new AppError(error.message, 'REACT_BOUNDARY_ERROR', ErrorSeverity.ERROR, { componentStack: errorInfo.componentStack }));
  }
  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center bg-slate-50 rounded-3xl border border-slate-100 m-4 shadow-sm">
          <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">System Glitch</h2>
          <p className="text-slate-500 font-medium mb-10 max-w-md">We encountered an unexpected clinical error.</p>
          <button onClick={() => window.location.reload()} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest">Reload System</button>
        </div>
      );
    }
    return this.props.children;
  }
}
export default ErrorBoundary;
