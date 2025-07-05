import { useQuery, keepPreviousData } from "@tanstack/react-query";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export interface Booking {
  bookingId: string;
  callerName: string;
  callerPhone: string;
  callerEmail?: string;
  recipientName: string;
  recipientPhone: string;
  country: string;
  occassion: string;
  callType: string;
  callDate: Date;
  price: string;
  message?: string;
  specialInstruction?: string;
  status?: string;
  assignedRep?: any; // populated rep data
  createdAt: string;
  // add more fields as needed
}

export interface BookingFilters {
  status?: string;
  callType?: string;
  occassion?: string;
  country?: string;
  assignedRep?: string;
  singleDate?: string;
  filterType?: "daily" | "weekly" | "monthly" | "yearly" | "custom";
  startDate?: string;
  endDate?: string;
  sortParam?: string;
  sortOrder?: "1" | "-1";
  search?: string; 
  page?: number;
  limit?: number;
}

const buildQueryParams = (filters: Record<string, any>) => {
  const searchParams = new URLSearchParams();
  for (const key in filters) {
    if (
      filters[key] !== undefined &&
      filters[key] !== null &&
      filters[key] !== ""
    ) {
      searchParams.append(key, filters[key]);
    }
  }
  console.log(searchParams.toString());
  return searchParams.toString();
};

export const useBookings = (filters: BookingFilters, searchValue: string) => {
  return useQuery({
    queryKey: ["bookings", filters, searchValue],
    queryFn: async ({signal}) => {
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
      return {data: data.data,
        meta: data.meta
      };
    },
    staleTime: 1000 * 60 * 2, 
    gcTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
  });
};
