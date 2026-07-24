import { useQuery, useMutation } from "@tanstack/react-query";
import { Service, ServicePricingUpdate } from "@/lib/types";
import { apiCall } from "@/lib/apiClient";

// Public — services page + booking form. Active services only.
export const useFetchServices = () => {
  return useQuery({
    queryKey: ["services"],
    queryFn: async ({ signal }) => {
      const data = await apiCall("/service", { signal });
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
      const data = await apiCall("/service/admin", { signal });
      return data.data as Service[];
    },
    staleTime: 1000 * 60,
  });
};

export const useUpdateServicePricing = (serviceId: string) => {
  return useMutation({
    mutationFn: (body: ServicePricingUpdate) =>
      apiCall(`/service/admin/${serviceId}/pricing`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
  });
};

export const useDeactivateService = () => {
  return useMutation({
    mutationFn: (serviceId: string) =>
      apiCall(`/service/admin/${serviceId}/deactivate`, { method: "PUT" }),
  });
};

export const useReactivateService = () => {
  return useMutation({
    mutationFn: (serviceId: string) =>
      apiCall(`/service/admin/${serviceId}/reactivate`, { method: "PUT" }),
  });
};
