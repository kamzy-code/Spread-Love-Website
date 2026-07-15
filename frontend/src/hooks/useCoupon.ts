import { useMutation } from "@tanstack/react-query";
import { validateCoupon } from "@/lib/apiClient";

// Preview only — the authoritative discount is always recomputed
// server-side again at booking creation (bookingService.createBooking).
export const useValidateCoupon = () => {
  return useMutation({
    mutationFn: ({ code, totalPrice }: { code: string; totalPrice: number }) =>
      validateCoupon(code, totalPrice),
  });
};
