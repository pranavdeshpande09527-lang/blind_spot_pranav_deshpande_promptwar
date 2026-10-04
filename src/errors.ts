export class AppError extends Error {
  constructor(public status: number, public code: string, message: string, public analysisId?: string) { super(message); }
}
export function dbError(error: { message: string; code?: string }): never {
  const codes: Record<string, [number, string]> = {
    NOT_FOUND: [404, 'Record not found.'], REVISION_CONFLICT: [409, 'This decision changed. Reload it before saving.'],
    IDEMPOTENCY_CONFLICT: [409, 'This request key belongs to another input revision.'],
    ACTIVE_RUN: [409, 'An analysis is already running for this decision.'], RATE_LIMITED: [429, 'Analysis limit reached. Please try again later.'],
    INVALID_QUESTION: [400, 'This question does not belong to this analysis.'],
    SERVER_CREDENTIAL: [503, 'The analysis service has not been configured in the database.'],
    RUN_EXPIRED: [504, 'The analysis deadline was exceeded.'], INVALID_INPUT: [400, 'Invalid input.'],
  };
  const entry = codes[error.message];
  if (entry) throw new AppError(entry[0], error.message, entry[1]);
  throw new AppError(503, 'DATABASE_UNAVAILABLE', 'Database request failed. Check database setup or try again later.');
}
