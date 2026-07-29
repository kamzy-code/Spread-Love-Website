import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Service,
  ServicePricingUpdate,
  ServiceDetailsUpdate,
  ServiceCreatePayload,
} from "@/lib/types";
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

export const useFetchService = (id: string) => {
  return useQuery({
    queryKey: ["service", id],
    queryFn: async ({ signal }) => {
      const data = await apiCall(`/service/admin/${id}`, { signal });
      return data.data as Service;
    },
    enabled: !!id,
    staleTime: 1000 * 60,
  });
};

export const useCreateService = () => {
  return useMutation({
    mutationFn: (body: ServiceCreatePayload) =>
      apiCall("/service/admin", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  });
};

export const useUpdateServiceDetails = (serviceId: string) => {
  return useMutation({
    mutationFn: (body: ServiceDetailsUpdate) =>
      apiCall(`/service/admin/${serviceId}/details`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
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
