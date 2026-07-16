/**
 * Centralized API client — generic fetch transport used by every hook's
 * query/mutation function. Endpoint-specific request shaping lives in the
 * hook that owns that endpoint, not here.
 */

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

interface ApiOptions extends RequestInit {
  headers?: Record<string, string>;
}

export const apiCall = async (endpoint: string, options?: ApiOptions) => {
  const response = await fetch(`${apiUrl}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || response.statusText || "Unknown error");
  }

  return data;
};
