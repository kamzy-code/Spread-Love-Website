import { useMutation } from "@tanstack/react-query";
import { apiCall } from "@/lib/apiClient";

// Draft-only: the endpoint generates text for a recipient whose customer left
// the message blank and saves nothing, so there's no cache to invalidate.
export const useSuggestMessage = (bookingId: string, recipientId: string) => {
  return useMutation({
    mutationFn: async (): Promise<string> => {
      const data = await apiCall(
        `/booking/admin/${bookingId}/recipients/${recipientId}/suggest-message`,
        { method: "POST" },
      );
      return data.data.message as string;
    },
  });
};
