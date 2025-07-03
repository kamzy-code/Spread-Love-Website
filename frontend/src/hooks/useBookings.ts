import { useQuery } from "@tanstack/react-query";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export interface Booking {
  _id: string;
  customerName: string;
  phone: string;
  email: string;
  callType: string;
  country: string;
  callDate: string;
  status: string;
  assignedRep?: any; // populated rep data
  createdAt: string;
  // add more fields as needed
}

export interface BookingFilters {
  status?: string;
  callType?: string;
  country?: string;
  filterType?: "daily" | "weekly" | "monthly" | "yearly" | "custom";
  startDate?: string;
  endDate?: string;
  sortParam?: string;
  sortOrder?: "1" | "-1";
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
  return searchParams.toString();
};

export const useBookings = (filters: BookingFilters) => {
  return useQuery({
    queryKey: ["bookings", filters],
    queryFn: async () => {
      const queryString = buildQueryParams(filters as Record<string, any>);
      const res = await fetch(`${apiUrl}/booking/admin?${queryString}`, {
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to fetch bookings");
      }
      const data = await res.json();
      return data.booking;
    },
    staleTime: 1000 * 30, // 30 seconds
  });
};
