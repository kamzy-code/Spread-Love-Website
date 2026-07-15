import { useMutation } from "@tanstack/react-query";
import { createBooking } from "@/lib/apiClient";
import { CreateBookingPayload } from "@/lib/types";

// One request: server generates the booking ID, creates (or re-uses) the
// booking, and initializes the Paystack transaction — returns a ready-to-use
// paymentURL. Navigation on success is the caller's concern, not the hook's.
export const useBookingCheckout = () => {
  return useMutation({
    mutationFn: (payload: CreateBookingPayload) => createBooking(payload),
  });
};
