/**
 * Centralized API client for all fetch requests
 */
import type {
  CreateBookingPayload,
  CreateBookingResponse,
  CouponValidationResponse,
} from "./types";

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

// Single request: server generates the booking ID, creates (or re-uses) the
// booking, and initializes the Paystack transaction — returns a ready-to-use
// paymentURL, replacing the old generate-ID -> create -> initialize sequence.
export const createBooking = (
  body: CreateBookingPayload
): Promise<CreateBookingResponse> =>
  apiCall("/booking/create", {
    method: "POST",
    body: JSON.stringify(body),
  });

// Preview-only: never mutates coupon usage, safe to call on every keystroke/blur.
export const validateCoupon = (
  code: string,
  totalPrice: number
): Promise<CouponValidationResponse> =>
  apiCall("/coupon/validate", {
    method: "POST",
    body: JSON.stringify({ code, totalPrice }),
  });
