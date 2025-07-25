import { useQuery, useMutation, keepPreviousData } from "@tanstack/react-query";
import { buildQueryParams } from "@/lib/buildQueryParams";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export const useInitializeTransaction = (info: {
  email: string;
  price: string;
}) => {
  return useMutation({
    mutationFn: async (bookingId) => {
      const query = buildQueryParams({ email: info.email, amount: info.price });
      const res = await fetch(
        `${apiUrl}/payment/initialize/${bookingId}?${query}`,
        {
          credentials: "include",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to initialize transaction");
      }

      const data = await res.json();
      return data.data;
    },

    retry: 3,

    onSuccess: (data) => {
      console.log(data);
    },
    onError: (error) => {
      console.error(error.message || "Failed to initialize transaction");
    },
  });
};

export const useVerifyTransaction = (reference: string) => {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `${apiUrl}/payment/verify-payment?reference=${reference}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (!response.ok) {
        // Attach status and statusText for more context if needed
        throw new Error(
          data.message || response.statusText || "Failed to verify transaction"
        );
      }
      return data;
    },

    retry: 3,

    onSuccess: (data) => {
      if (data.data.status === 'failed'){
         throw new Error(
          `Booking failed - Transaction ${data.data.gateway_response}`
        );
      }
      console.log(data);
    },
    onError: (error) => {
      console.error(error.message || "Failed to verify transaction");
    },
  });
};
