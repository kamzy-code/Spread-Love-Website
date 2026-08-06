/**
 * Centralized API client — generic fetch transport used by every hook's
 * query/mutation function. Endpoint-specific request shaping lives in the
 * hook that owns that endpoint, not here.
 */

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const DEFAULT_TIMEOUT_MS = 15000;


export const NETWORK_ERROR_MESSAGE =
  "We couldn't connect to the server. Please check your connection and try again.";

interface ApiOptions extends RequestInit {
  headers?: Record<string, string>;
}

// Shared transport: fetch + timeout + network-failure normalization. A raw
// fetch() rejection is a browser-specific TypeError ("Failed to fetch" in
// Chrome/Edge, different text elsewhere) — never let that reach a caller.
async function doFetch(endpoint: string, options?: ApiOptions): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    return await fetch(`${apiUrl}${endpoint}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      // Prefer a caller-supplied signal (e.g. React Query's cancellation
      // signal) over our own timeout controller, so query cancellation
      // still works as expected.

      signal: options?.signal ?? controller.signal,
      ...options,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error(
        "The request took too long. Please check your connection and try again."
      );
    }
    throw new Error(NETWORK_ERROR_MESSAGE);
  } finally {
    clearTimeout(timeoutId);
  }
}

export const apiCall = async (endpoint: string, options?: ApiOptions) => {
  const response = await doFetch(endpoint, options);

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    if (!response.ok) {
      throw new Error("Something went wrong. Please try again.");
    }
    return null;
  }

  if (!response.ok) {
    throw new Error(data?.message || "Something went wrong. Please try again.");
  }

  return data;
};

// For endpoints that return a file (CSV export, etc.) instead of JSON —
// shares doFetch's timeout/network-failure handling so this path doesn't
// regress back to raw, unguarded fetch().
export const apiCallBlob = async (
  endpoint: string,
  options?: ApiOptions
): Promise<{ blob: Blob; filename: string | null }> => {
  const response = await doFetch(endpoint, options);

  if (!response.ok) {
    let message = "Something went wrong. Please try again.";
    try {
      const data = await response.json();
      message = data?.message || message;
    } catch {
      // non-JSON error body — keep the generic message
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  const disposition = response.headers.get("Content-Disposition");
  const filenameMatch = disposition?.match(/filename="?([^"]+)"?/);

  return { blob, filename: filenameMatch?.[1] ?? null };
};
