import axios, { AxiosError, type AxiosInstance } from "axios";

import { REQUEST_TIMEOUT_MS } from "@/constants/api";
import type { ApiResponse } from "@/types/api";

/**
 * Normalised error shape. Every service throws this and nothing else, so hooks
 * and components have exactly one failure type to handle instead of branching
 * on Axios internals.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const FALLBACK_MESSAGE = "Something went wrong. Please try again.";

const NETWORK_MESSAGES: Record<string, string> = {
  ECONNABORTED: "The request took too long. Please try again.",
  ERR_NETWORK: "We could not reach the server. Check your connection and try again.",
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
  timeout: REQUEST_TIMEOUT_MS,
  headers: { "Content-Type": "application/json" },
});

/**
 * Response interceptor: unwrap the envelope on success, and convert every
 * failure — HTTP error, timeout, offline, malformed body — into one ApiError.
 * Nothing downstream should ever see an AxiosError.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(new ApiError(FALLBACK_MESSAGE, 0));
    }

    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    const payload = axiosError.response?.data;

    if (!axiosError.response) {
      const message =
        (axiosError.code && NETWORK_MESSAGES[axiosError.code]) ??
        NETWORK_MESSAGES.ERR_NETWORK!;
      return Promise.reject(new ApiError(message, 0));
    }

    const message = payload && !payload.ok ? payload.error : FALLBACK_MESSAGE;
    const fieldErrors = payload && !payload.ok ? payload.fieldErrors : undefined;

    return Promise.reject(new ApiError(message, axiosError.response.status, fieldErrors));
  },
);

/**
 * POSTs and unwraps the `{ ok, data }` envelope, so callers get the payload
 * directly and never narrow the union by hand.
 */
export async function postJson<TData, TBody>(url: string, body: TBody): Promise<TData> {
  const { data } = await apiClient.post<ApiResponse<TData>>(url, body);

  if (!data.ok) {
    throw new ApiError(data.error, 200, data.fieldErrors);
  }

  return data.data;
}
