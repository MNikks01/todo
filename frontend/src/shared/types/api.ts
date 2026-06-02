/** Shared API error envelope (matches backend Problem — docs/api/openapi.yaml). */
export interface ApiProblem {
  error: string;
  message: string;
  correlationId: string;
  details?: unknown;
}
