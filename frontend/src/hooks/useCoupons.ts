import { useQuery, useMutation } from "@tanstack/react-query";
import { Coupon, CouponFormValues } from "@/lib/types";
import { apiCall } from "@/lib/apiClient";

export const useFetchCoupons = () => {
  return useQuery({
    queryKey: ["coupons"],
    queryFn: async ({ signal }) => {
      const data = await apiCall("/coupon/admin", { signal });
      return data.coupons as Coupon[];
    },
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
