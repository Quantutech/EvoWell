
export const ErrorMessages = {
  NETWORK_OFFLINE: "It looks like you're offline. Please check your internet connection.",
  API_TIMEOUT: "The server is taking too long to respond. Please try again later.",
  AUTH_REQUIRED: "Your session has expired. Please log in again.",
  PERMISSION_DENIED: "You don't have permission to access this resource.",
  NOT_FOUND: "The requested resource could not be found.",
  VALIDATION_ERROR: "Please check your input and try again.",
  SERVER_ERROR: "Something went wrong on our end. Our team has been notified.",
  PAYMENT_FAILED: "Payment processing failed. Please check your card details.",
  UNKNOWN: "An unexpected error occurred. Please try again."
};

export const getFriendlyErrorMessage = (code: string): string => {
  switch (code) {
    case '401': return ErrorMessages.AUTH_REQUIRED;
    case '403': return ErrorMessages.PERMISSION_DENIED;
    case '404': return ErrorMessages.NOT_FOUND;
    case '422': return ErrorMessages.VALIDATION_ERROR;
    case '500': return ErrorMessages.SERVER_ERROR;
    case 'TIMEOUT': return ErrorMessages.API_TIMEOUT;
    case 'OFFLINE': return ErrorMessages.NETWORK_OFFLINE;
    default: return ErrorMessages.UNKNOWN;
  }
};
