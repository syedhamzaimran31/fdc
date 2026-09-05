/**
 * Discriminated union so callers have to handle failure before reading data.
 */
export type ApiResponse<TData> =
  | { ok: true; data: TData }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export interface SubmitLeadResult {
  id: string;
}
