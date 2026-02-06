import * as Sentry from "@sentry/react";
import { ErrorMessages } from '@/utils/error-messages';

export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export class AppError extends Error {
  public readonly code: string;
  public readonly severity: ErrorSeverity;
  public readonly context?: Record<string, any>;

  constructor(message: string, code: string = 'UNKNOWN', severity: ErrorSeverity = ErrorSeverity.ERROR, context?: Record<string, any>) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.severity = severity;
    this.context = context;
  }
}

class ErrorHandler {
  public init() {
    // Sentry init moved to main.tsx to ensure earliest execution
  }

  public logError(error: Error | unknown, context?: Record<string, any>) {
    const env = (import.meta as any).env || {};

    // 1. Console Log (Dev)
    if (env.DEV) {
      console.error('[ErrorHandler]', error, context);
    }

    // 2. Sentry Report
    Sentry.withScope((scope) => {
      if (context) {
        scope.setExtras(context);
      }
      
      if (error instanceof AppError) {
        scope.setTag('error_code', error.code);
        scope.setLevel(error.severity as Sentry.SeverityLevel);
      }

      Sentry.captureException(error);
    });
  }

  public getUserMessage(error: Error | unknown): string {
    if (error instanceof AppError) {
      // Map known codes to friendly messages or return the safe message
      return error.message; 
    }
    if (error instanceof Error && error.message.includes('Network')) {
        return ErrorMessages.NETWORK_OFFLINE;
    }
    return ErrorMessages.UNKNOWN;
  }
}

export const errorHandler = new ErrorHandler();