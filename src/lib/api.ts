/**
 * API Fetch Wrapper with Retry Logic
 *
 * Provides a standardized interface for making HTTP requests with:
 * - Automatic retry on failure
 * - Configurable timeout
 * - Error handling
 * - Type-safe responses
 */

export interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000; // 1 second

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch wrapper with timeout support
 */
async function fetchWithTimeout(url: string, options: FetchOptions = {}): Promise<Response> {
  const { timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Main API fetch function with retry logic
 *
 * @param url - The URL to fetch
 * @param options - Fetch options including retry configuration
 * @returns Promise resolving to the parsed JSON response
 * @throws ApiError on failure after all retries
 */
export async function apiFetch<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const { retries = DEFAULT_RETRIES, retryDelay = DEFAULT_RETRY_DELAY, ...fetchOptions } = options;

  let lastError: ApiError | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, fetchOptions);

      if (!response.ok) {
        throw {
          message: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          code: 'HTTP_ERROR',
        } as ApiError;
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        lastError = {
          message: 'Request timeout',
          code: 'TIMEOUT',
        };
      } else if ((error as ApiError).code) {
        lastError = error as ApiError;
      } else {
        lastError = {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'NETWORK_ERROR',
        };
      }

      // Don't retry on 4xx errors (client errors)
      if (lastError.status && lastError.status >= 400 && lastError.status < 500) {
        throw lastError;
      }

      // Wait before retrying (except on last attempt)
      if (attempt < retries) {
        await sleep(retryDelay * (attempt + 1)); // Exponential backoff
      }
    }
  }

  throw lastError;
}

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
  get: <T>(url: string, options?: FetchOptions) => apiFetch<T>(url, { ...options, method: 'GET' }),

  post: <T>(url: string, body: unknown, options?: FetchOptions) =>
    apiFetch<T>(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: JSON.stringify(body),
    }),

  put: <T>(url: string, body: unknown, options?: FetchOptions) =>
    apiFetch<T>(url, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: JSON.stringify(body),
    }),

  patch: <T>(url: string, body: unknown, options?: FetchOptions) =>
    apiFetch<T>(url, {
      ...options,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: JSON.stringify(body),
    }),

  delete: <T>(url: string, options?: FetchOptions) =>
    apiFetch<T>(url, { ...options, method: 'DELETE' }),
};

export default api;
