import { useMutation } from "@tanstack/react-query";
import { apiCall } from "@/lib/apiClient";
import { CouponValidationResponse } from "@/lib/types";

// Preview only — the authoritative discount is always recomputed
// server-side again at booking creation (bookingService.createBooking).
export const useValidateCoupon = () => {
  return useMutation({
    mutationFn: ({
      code,
      totalPrice,
    }: {
      code: string;
      totalPrice: number;
    }): Promise<CouponValidationResponse> =>
      apiCall("/coupon/validate", {
        method: "POST",
        body: JSON.stringify({ code, totalPrice }),
      }),
  });
};
