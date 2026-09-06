import axios, { AxiosError, type AxiosInstance } from "axios";

import { REQUEST_TIMEOUT_MS } from "@/constants/api";
import type { ApiResponse } from "@/types/api";

/** The only error type services throw, so callers never see an AxiosError. */
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

// Every failure — HTTP, timeout, offline, malformed body — becomes one ApiError.
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

export async function postJson<TData, TBody>(url: string, body: TBody): Promise<TData> {
  const { data } = await apiClient.post<ApiResponse<TData>>(url, body);

  if (!data.ok) {
    throw new ApiError(data.error, 200, data.fieldErrors);
  }

  return data.data;
}
