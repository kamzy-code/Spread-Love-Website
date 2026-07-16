import { useQuery, keepPreviousData, useMutation } from "@tanstack/react-query";
import {
  BookingFilters,
  CreateBookingPayload,
  CreateBookingResponse,
  CustomerBookingUpdatePayload,
} from "@/lib/types";
import { buildQueryParams } from "@/lib/buildQueryParams";
import { apiCall } from "@/lib/apiClient";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// One request: server generates the booking ID, creates (or re-uses) the
// booking, and initializes the Paystack transaction — returns a ready-to-use
// paymentURL. Navigation on success is the caller's concern, not the hook's.
export const useBookingCheckout = () => {
  return useMutation({
    mutationFn: (payload: CreateBookingPayload): Promise<CreateBookingResponse> =>
      apiCall("/booking/create", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });
};

// Customer self-service edit (PUT /booking/:bookingId/update) — bookingId and
// payload are passed at call time via mutate(), not baked into the hook, so
// the call site can't accidentally submit against a stale bookingId closure.
export const useUpdateBookingByCustomer = () => {
  return useMutation({
    mutationFn: ({
      bookingId,
      payload,
    }: {
      bookingId: string;
      payload: CustomerBookingUpdatePayload;
    }) =>
      apiCall(`/booking/${bookingId}/update`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
  });
};

export const useBookings = (filters: BookingFilters, searchValue: string) => {
  return useQuery({
    queryKey: ["bookings", filters, searchValue.toLowerCase()],
    queryFn: async ({ signal }) => {
      const queryString = buildQueryParams(filters as Record<string, unknown>);

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
      const res = await fetch(
        `${apiUrl}/booking/admin/assign/${bookingId}?repId=${repId}`,
        {
          credentials: "include",
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

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

export const useSendBookingConfirmation = (bookingId: string) => {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`${apiUrl}/email/confirm/${bookingId}`, {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to send booking confirmation");
      }
    },

    retry: 3,

    onError: (error) => {
      throw new Error(error.message || "Failed to send booking confirmation");
    },
  });
};
