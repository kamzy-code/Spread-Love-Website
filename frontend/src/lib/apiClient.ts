/**
 * Centralized API client for all fetch requests
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

export const generateBookingID = () => apiCall("/booking/id/generate", { method: "GET" });

export const createBooking = (body: unknown) =>
  apiCall("/booking/create", {
    method: "POST",
    body: JSON.stringify(body),
  });
