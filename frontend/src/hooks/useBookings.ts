import { useQuery, keepPreviousData, useMutation } from "@tanstack/react-query";
import {
  AdminBookingUpdatePayload,
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

// Legacy-booking equivalent of useUpdateRecipientStatus below (single
// implicit recipient, no recipientId). id/status passed at call time via
// mutate(), not baked into the hook.
export const useUpdateStatus = () => {
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiCall(`/booking/admin/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      }),
  });
};

// v2 bookings: a call's outcome is recorded per recipient, not on the whole
// booking (a booking can hold multiple recipients with independent
// outcomes) — this is what the detail page's per-recipient action menu calls,
// scoped to that recipient's _id. useUpdateStatus above remains the
// legacy-booking equivalent (single recipient, no recipientId).
export const useUpdateRecipientStatus = () => {
  return useMutation({
    mutationFn: ({
      bookingId,
      recipientId,
      status,
    }: {
      bookingId: string;
      recipientId: string;
      status: string;
    }) =>
      apiCall(`/booking/admin/${bookingId}/recipients/${recipientId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      }),
  });
};

// Admin correction (broader field set than the customer self-service update
// — see AdminBookingUpdatePayload). bookingId here is the Mongo _id, matching
// every other /booking/admin/* route.
export const useUpdateBookingByAdmin = () => {
  return useMutation({
    mutationFn: ({
      bookingId,
      payload,
    }: {
      bookingId: string;
      payload: AdminBookingUpdatePayload;
    }) =>
      apiCall(`/booking/admin/${bookingId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
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
