import { useQuery, keepPreviousData, useMutation } from "@tanstack/react-query";
import { Coupon, CouponFilter, CouponFormValues, CouponValidationResponse } from "@/lib/types";
import { apiCall } from "@/lib/apiClient";
import { buildQueryParams } from "@/lib/buildQueryParams";

// Public — checkout preview only. The authoritative discount is always
// recomputed server-side again at booking creation (bookingService.createBooking).
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

export const useFetchCoupons = (filter: CouponFilter, searchValue: string) => {
  return useQuery({
    queryKey: ["coupons", filter, searchValue.toLowerCase()],
    queryFn: async ({ signal }) => {
      const queryString = buildQueryParams(filter as Record<string, unknown>);
      const data = await apiCall(`/coupon/admin?${queryString}`, { signal });
      return { data: data.coupons as Coupon[], meta: data.meta };
    },
    staleTime: 1000 * 60,
    placeholderData: keepPreviousData,
  });
};

export const useFetchCoupon = (id: string) => {
  return useQuery({
    queryKey: ["coupon", id],
    queryFn: async ({ signal }) => {
      const data = await apiCall(`/coupon/admin/${id}`, { signal });
      return data.coupon as Coupon;
    },
    enabled: !!id,
    staleTime: 1000 * 60,
  });
};

export const useCreateCoupon = (createdBy: string) => {
  return useMutation({
    mutationFn: (body: CouponFormValues) =>
      apiCall("/coupon/admin", {
        method: "POST",
        body: JSON.stringify({ ...body, createdBy }),
      }),
  });
};

export const useUpdateCoupon = (couponId: string) => {
  return useMutation({
    mutationFn: (body: Partial<CouponFormValues>) =>
      apiCall(`/coupon/admin/${couponId}`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
  });
};

export const useDeactivateCoupon = () => {
  return useMutation({
    mutationFn: (couponId: string) =>
      apiCall(`/coupon/admin/${couponId}/deactivate`, { method: "PUT" }),
  });
};

export const useReactivateCoupon = () => {
  return useMutation({
    mutationFn: (couponId: string) =>
      apiCall(`/coupon/admin/${couponId}/reactivate`, { method: "PUT" }),
  });
};
