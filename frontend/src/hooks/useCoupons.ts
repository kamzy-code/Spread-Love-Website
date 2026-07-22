import { useQuery, useMutation } from "@tanstack/react-query";
import { Coupon, CouponFormValues } from "@/lib/types";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export const useFetchCoupons = () => {
  return useQuery({
    queryKey: ["coupons"],
    queryFn: async ({ signal }) => {
      const res = await fetch(`${apiUrl}/coupon/admin`, {
        credentials: "include",
        signal,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to fetch coupons");
      }

      const data = await res.json();
      return data.coupons as Coupon[];
    },
    staleTime: 1000 * 60,
  });
};

export const useCreateCoupon = (createdBy: string) => {
  return useMutation({
    mutationFn: async (body: CouponFormValues) => {
      const res = await fetch(`${apiUrl}/coupon/admin`, {
        credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, createdBy }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create coupon");
      }
      return res.json();
    },
  });
};

export const useUpdateCoupon = (couponId: string) => {
  return useMutation({
    mutationFn: async (body: Partial<CouponFormValues>) => {
      const res = await fetch(`${apiUrl}/coupon/admin/${couponId}`, {
        credentials: "include",
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update coupon");
      }
      return res.json();
    },
  });
};

export const useDeactivateCoupon = () => {
  return useMutation({
    mutationFn: async (couponId: string) => {
      const res = await fetch(`${apiUrl}/coupon/admin/${couponId}/deactivate`, {
        credentials: "include",
        method: "PUT",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to deactivate coupon");
      }
      return res.json();
    },
  });
};
