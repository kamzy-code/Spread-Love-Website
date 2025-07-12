import {useQuery, useMutation, keepPreviousData} from "@tanstack/react-query";
import { buildQueryParams } from "@/lib/buildQueryParams";
import { RepFilter } from "@/lib/types";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export const useFetchReps = (filter: RepFilter, searchValue: string) => {
  return useQuery({
    queryKey: ["reps", filter, (searchValue.toLowerCase())],
    queryFn: async ({ signal }) => {
      const queryString = buildQueryParams(filter as Record<string, any>);

      const res = await fetch(`${apiUrl}/rep/admin?${queryString}`, {
        credentials: "include",
        signal,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to fetch reps");
      }

      const data = await res.json();
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
      const res = await fetch(`${apiUrl}/rep/admin/${repId}`, {
        credentials: "include",
        signal,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to fetch reps");
      }

      const data = await res.json();
      return { data: data.rep};
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });
};


export const useCreateRep = (body: any) => {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`${apiUrl}/auth/register`, {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update status");
      }
    },

    retry: 3,

    onError: (error) => {
      throw new Error(error.message || "Failed to update status");
    },
  });
};


export const useUpdateRep = (body: any) => {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`${apiUrl}/rep/admin/${body._id}`, {
        credentials: "include",
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update status");
      }
    },

    retry: 3,

    onError: (error) => {
      throw new Error(error.message || "Failed to update status");
    },
  });
};