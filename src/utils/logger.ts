
import * as Sentry from "@sentry/react";

const SENSITIVE_FIELDS = [
  'password', 
  'token', 
  'access_token', 
  'refresh_token', 
  'email', 
  'ssn', 
  'taxId', 
  'creditCard', 
  'cvv',
  'secret',
  'key',
  'api_key'
];

/**
 * Recursively removes sensitive fields from an object or array.
 * Replaces value with '[REDACTED]'.
 */
const sanitize = (data: any): any => {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => sanitize(item));
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
          sanitized[key] = '[REDACTED]';
        } else if (typeof data[key] === 'object') {
          sanitized[key] = sanitize(data[key]);
        } else {
          sanitized[key] = data[key];
        }
      }
    }
    return sanitized;
  }
  
  return data;
};

const isDev = (import.meta as any).env?.DEV;

export const logger = {
  debug: (message: string, data?: any) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.log(`[DEBUG] ${message}`, data ? sanitize(data) : '');
    }
  },

  info: (message: string, data?: any) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.info(`[INFO] ${message}`, data ? sanitize(data) : '');
    }
  },

  warn: (message: string, data?: any) => {
    const sanitizedData = data ? sanitize(data) : undefined;
    if (isDev) {
      console.warn(`[WARN] ${message}`, sanitizedData || '');
    } else {
      // In prod, send warning to Sentry
      Sentry.withScope(scope => {
        if (sanitizedData) scope.setExtra('data', sanitizedData);
        scope.setLevel('warning');
        Sentry.captureMessage(message);
      });
    }
  },

  error: (message: string, error?: any, context?: any) => {
    const sanitizedContext = context ? sanitize(context) : undefined;
    
    if (isDev) {
      console.error(`[ERROR] ${message}`, error, sanitizedContext || '');
    }
    
    // Always send errors to Sentry
    Sentry.withScope(scope => {
      if (sanitizedContext) scope.setExtras(sanitizedContext);
      if (error instanceof Error) {
        Sentry.captureException(error);
      } else {
        Sentry.captureMessage(`${message}: ${JSON.stringify(error)}`);
      }
    });
  }
};
