import { errorHandler } from './error-handler';

/**
 * Enhanced retry mechanism with error categorization
 */
export async function retryOperation<T>(
  operation: () => Promise<T>, 
  maxRetries: number = 3, 
  backoffMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (err: any) {
      lastError = err;
      // Don't retry on validation/auth errors
      if (err.code === 'PGRST116' || err.status === 401 || err.status === 403) {
        throw err;
      }
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, backoffMs * Math.pow(2, attempt)));
      }
    }
  }
  throw lastError;
}

// Standard request wrapper
export async function handleRequest<T>(fn: () => Promise<T>, context: string): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    errorHandler.logError(error, { context });
    throw error;
  }
}
