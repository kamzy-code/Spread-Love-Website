import {useQuery, useMutation, keepPreviousData} from "@tanstack/react-query";
import { buildQueryParams } from "@/lib/buildQueryParams";
import { RepFilter } from "@/lib/types";
import { apiCall } from "@/lib/apiClient";

export const useFetchReps = (filter: RepFilter, searchValue: string) => {
  return useQuery({
    queryKey: ["reps", filter, (searchValue.toLowerCase())],
    queryFn: async ({ signal }) => {
      const queryString = buildQueryParams(filter as Record<string, unknown>);
      const data = await apiCall(`/rep/admin?${queryString}`, { signal });
      return { data: data.data, meta: data.meta };
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
  });
};


export const useFetchRep = (repId: string) => {
  return useQuery({
    queryKey: ["rep", repId],
    queryFn: async ({ signal }) => {
      const data = await apiCall(`/rep/admin/${repId}`, { signal });
      return { data: data.rep };
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });
};


export const useCreateRep = (body: unknown) => {
  return useMutation({
    mutationFn: () =>
      apiCall("/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    retry: 3,
  });
};


export const useUpdateRep = (body: any) => {
  return useMutation({
    mutationFn: () =>
      apiCall(`/rep/admin/${body._id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    retry: 3,
  });
};
