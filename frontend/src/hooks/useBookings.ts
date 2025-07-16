import { useQuery, keepPreviousData, useMutation } from "@tanstack/react-query";
import { BookingFilters, Booking } from "@/lib/types";
import { buildQueryParams } from "@/lib/buildQueryParams";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export const useBookings = (filters: BookingFilters, searchValue: string) => {
  return useQuery({
    queryKey: ["bookings", filters, (searchValue.toLowerCase())],
    queryFn: async ({ signal }) => {
      const queryString = buildQueryParams(filters as Record<string, any>);

      const res = await fetch(`${apiUrl}/booking/admin?${queryString}`, {
        credentials: "include",
        signal,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to fetch bookings");
      }

      const data = await res.json();
      return { data: data.data, meta: data.meta };
    },
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
  });
};

export const useUpdateStatus = (body: { id: string; status: string }) => {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`${apiUrl}/booking/admin/${body.id}/status`, {
        credentials: "include",
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: body.status }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update status");
      }
    },

    onError: (error) => {
      throw new Error(error.message || "Failed to update status");
    },
  });
};


export const useAssignBooking = (bookingId: string, repId: string) => {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`${apiUrl}/booking/admin/assign/${bookingId}?repId=${repId}`, {
        credentials: "include",
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to assign booking");
      }
    },

    onError: (error) => {
      throw new Error(error.message || "Failed to assign booking");
    },
  });
};


export const useDeleteBooking = (id: string) => {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`${apiUrl}/booking/admin/${id}`, {
        credentials: "include",
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete booking");
      }
    },

    onError: (error) => {
      throw new Error(error.message || "Failed to delete booking");
    },
  });
};


