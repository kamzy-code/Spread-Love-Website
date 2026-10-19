import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PublicBookingPopup, AdminBookingPopup, BookingPopupPayload } from "@/lib/types";
import { apiCall } from "@/lib/apiClient";

// Public — booking form page load. Returns { enabled: false } unless the
// pop-up is on, so a disabled draft never reaches the browser.
export const useFetchPublicBookingPopup = () => {
  return useQuery({
    queryKey: ["bookingPopup", "public"],
    queryFn: async ({ signal }) => {
      const data = await apiCall("/booking-popup", { signal });
      return data.data as PublicBookingPopup;
    },
    staleTime: 1000 * 60 * 5,
  });
};

// Admin — current saved copy, enabled or not.
export const useFetchAdminBookingPopup = () => {
  return useQuery({
    queryKey: ["bookingPopup", "admin"],
    queryFn: async ({ signal }) => {
      const data = await apiCall("/booking-popup/admin", { signal });
      return data.data as AdminBookingPopup;
    },
    staleTime: 0,
  });
};

export const useUpdateBookingPopup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: BookingPopupPayload) =>
      apiCall("/booking-popup/admin", {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookingPopup"] });
      queryClient.invalidateQueries({ queryKey: ["auditLogs", "popup"] });
    },
  });
};
