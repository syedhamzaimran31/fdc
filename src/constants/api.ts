export const API_ROUTES = {
  LEAD: "/api/lead",
} as const;

export const RATE_LIMIT = {
  /** Submissions allowed per IP per window. A real buyer needs one. */
  MAX_REQUESTS: 5,
  WINDOW_MS: 60_000,
} as const;

export const REQUEST_TIMEOUT_MS = 10_000;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  BAD_REQUEST: 400,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;
