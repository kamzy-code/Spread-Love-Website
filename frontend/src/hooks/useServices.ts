import { useQuery, useMutation } from "@tanstack/react-query";
import { Service, ServicePricingUpdate } from "@/lib/types";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Public — services page + booking form. Active services only.
export const useFetchServices = () => {
  return useQuery({
    queryKey: ["services"],
    queryFn: async ({ signal }) => {
      const res = await fetch(`${apiUrl}/service`, { signal });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to fetch services");
      }

      const data = await res.json();
      return data.data as Service[];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });
};

// Admin — every service, including deactivated ones.
export const useFetchAdminServices = () => {
  return useQuery({
    queryKey: ["services", "admin"],
    queryFn: async ({ signal }) => {
      const res = await fetch(`${apiUrl}/service/admin`, {
        credentials: "include",
        signal,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to fetch services");
      }

      const data = await res.json();
      return data.data as Service[];
    },
    staleTime: 1000 * 60,
  });
};

export const useUpdateServicePricing = (serviceId: string) => {
  return useMutation({
    mutationFn: async (body: ServicePricingUpdate) => {
      const res = await fetch(`${apiUrl}/service/admin/${serviceId}/pricing`, {
        credentials: "include",
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update service pricing");
      }
      return res.json();
    },
  });
};

export const useDeactivateService = () => {
  return useMutation({
    mutationFn: async (serviceId: string) => {
      const res = await fetch(`${apiUrl}/service/admin/${serviceId}/deactivate`, {
        credentials: "include",
        method: "PUT",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to deactivate service");
      }
      return res.json();
    },
  });
};

export const useReactivateService = () => {
  return useMutation({
    mutationFn: async (serviceId: string) => {
      const res = await fetch(`${apiUrl}/service/admin/${serviceId}/reactivate`, {
        credentials: "include",
        method: "PUT",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to reactivate service");
      }
      return res.json();
    },
  });
};
