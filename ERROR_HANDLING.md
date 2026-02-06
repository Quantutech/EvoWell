
# Error Handling Strategy

EvoWell employs a multi-layered approach to error handling, ensuring robustness, observability, and a user-friendly experience.

## Architecture

1.  **Global Error Boundary (`components/ErrorBoundary.tsx`)**:
    *   Catches unhandled React render errors.
    *   Reports critical UI crashes to Sentry.
    *   Displays a user-friendly "System Glitch" fallback UI.

2.  **Service Layer (`services/error-handler.ts`)**:
    *   Central singleton (`errorHandler`) for logging.
    *   Abstracts Sentry implementation (can swap vendors easily).
    *   Classifies errors by severity (INFO, WARNING, ERROR, CRITICAL).

3.  **API Resilience (`services/api.ts`)**:
    *   **Retry Logic**: Automatically retries idempotent requests on network failure or 503/504 status codes.
    *   **Normalization**: Wraps all API errors in `AppError` with standardized codes.

4.  **User Feedback (`contexts/ToastContext.tsx`)**:
    *   Non-blocking "Toast" notifications for success, error, and info messages.
    *   Auto-dismissal to prevent clutter.

## Error Categories

| Code | Meaning | User Message |
|------|---------|--------------|
| `NETWORK_OFFLINE` | No internet connection | "It looks like you're offline." |
| `AUTH_REQUIRED` | 401 Unauthorized | "Your session has expired." |
| `SERVER_ERROR` | 500 Internal Server Error | "Something went wrong on our end." |
| `VALIDATION_ERROR` | 422 Unprocessable Entity | "Please check your input." |

## Monitoring (Sentry)

Sentry is initialized in `index.tsx` for production environments.

*   **DSN**: Configured via `VITE_SENTRY_DSN` environment variable.
*   **Privacy**: PII masking is enabled for session replays.
*   **Performance**: Sampling set to 20% of transactions.

## How to Handle Errors

### In Components (Sync)
Let the Error Boundary catch rendering issues. For event handlers:

```typescript
try {
  doSomething();
} catch (error) {
  errorHandler.logError(error);
  addToast('error', 'Something failed');
}
```

### In Async Operations
Use the API service wrapper which handles logging automatically. You only need to handle the UI feedback (Toasts).

```typescript
try {
  await api.updateUser(...);
  addToast('success', 'Saved!');
} catch (error) {
  // Error already logged to Sentry by api.ts
  addToast('error', errorHandler.getUserMessage(error));
}
```
