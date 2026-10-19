import { useMutation } from "@tanstack/react-query";
import { apiCall } from "@/lib/apiClient";
import type { SuggestedMessage } from "@/lib/types";

// Generates a draft and the backend saves it on the recipient
export const useSuggestMessage = (bookingId: string, recipientId: string) => {
  return useMutation({
    mutationFn: async (): Promise<SuggestedMessage> => {
      const data = await apiCall(
        `/booking/admin/${bookingId}/recipients/${recipientId}/suggest-message`,
        { method: "POST" },
      );
      return {
        text: data.data.message as string,
        generatedAt: data.data.generatedAt as string,
      };
    },
  });
};
