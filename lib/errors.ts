/**
 * Custom error classes for better error handling
 */

export class ValidationError extends Error {
  statusCode = 400;
  code = "VALIDATION_ERROR";

  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends Error {
  statusCode = 404;
  code = "NOT_FOUND";

  constructor(message: string = "Resource not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends Error {
  statusCode = 401;
  code = "UNAUTHORIZED";

  constructor(message: string = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class RateLimitError extends Error {
  statusCode = 429;
  code = "RATE_LIMIT_EXCEEDED";

  constructor(message: string = "Rate limit exceeded") {
    super(message);
    this.name = "RateLimitError";
  }
}

export class AIServiceError extends Error {
  statusCode = 502;
  code = "AI_SERVICE_ERROR";

  constructor(message: string = "AI service error") {
    super(message);
    this.name = "AIServiceError";
  }
}

/**
 * Format error for API response
 */
export function formatError(error: unknown): {
  error: string;
  message: string;
  code?: string;
} {
  if (error instanceof ValidationError || 
      error instanceof NotFoundError || 
      error instanceof UnauthorizedError ||
      error instanceof RateLimitError ||
      error instanceof AIServiceError) {
    return {
      error: error.name,
      message: error.message,
      code: error.code,
    };
  }

  if (error instanceof Error) {
    return {
      error: "InternalServerError",
      message: error.message,
    };
  }

  return {
    error: "InternalServerError",
    message: "An unexpected error occurred",
  };
}

/**
 * Get HTTP status code from error
 */
export function getStatusCode(error: unknown): number {
  if (
    error instanceof ValidationError ||
    error instanceof NotFoundError ||
    error instanceof UnauthorizedError ||
    error instanceof RateLimitError ||
    error instanceof AIServiceError
  ) {
    return error.statusCode;
  }

  return 500;
}

