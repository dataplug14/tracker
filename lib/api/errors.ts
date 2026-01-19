export class ApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const;

export function normalizeError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiError(error.message, ErrorCodes.INTERNAL_ERROR);
  }

  // Handle Supabase-like errors
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return new ApiError((error as any).message, ErrorCodes.INTERNAL_ERROR);
  }

  return new ApiError('An unexpected error occurred', ErrorCodes.INTERNAL_ERROR);
}
