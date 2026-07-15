import { useMutation } from "@tanstack/react-query";
import { buildQueryParams } from "@/lib/buildQueryParams";
import { apiCall } from "@/lib/apiClient";

// Used by admin's "Complete Payment" action to (re)generate a payment link
// for an existing booking. The customer checkout flow no longer calls this —
// createBooking now returns a ready-to-use paymentURL in one request.
export const useInitializeTransaction = (info: { email: string }) => {
  return useMutation({
    mutationFn: async (bookingId: string) => {
      const query = buildQueryParams({ email: info.email });
      const result = await apiCall(
        `/payment/initialize/${bookingId}?${query}`,
        { method: "POST" }
      );
      return result.data;
    },

    retry: 3,

    onError: (error) => {
      console.error(error.message || "Failed to initialize transaction");
    },
  });
};

export const useVerifyTransaction = (reference: string) => {
  return useMutation({
    mutationFn: async () => {
      return apiCall(`/payment/verify-payment?reference=${reference}`, {
        method: "GET",
      });
    },

    retry: 3,

    onSuccess: (data) => {
      if (data.data.status === "failed") {
        throw new Error(
          `Booking failed - Transaction ${data.data.gateway_response}`
        );
      }
    },
    onError: (error) => {
      console.error(error.message || "Failed to verify transaction");
    },
  });
};
