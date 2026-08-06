import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { buildQueryParams } from "@/lib/buildQueryParams";
import { CustomerFilter } from "@/lib/types";
import { apiCall, apiCallBlob } from "@/lib/apiClient";

export const useFetchCustomers = (filter: CustomerFilter) => {
  return useQuery({
    queryKey: ["customers", filter],
    queryFn: async ({ signal }) => {
      const queryString = buildQueryParams(filter as Record<string, unknown>);
      const data = await apiCall(`/customer/admin?${queryString}`, { signal });
      return { data: data.data, meta: data.meta };
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
  });
};

// Not a query — triggered on click. Fetches with credentials (the export
// route is behind auth) and downloads the response as a file, since a plain
// <a href> can't attach the auth cookie reliably cross-origin.
export const exportCustomersCsv = async (
  filter: Pick<
    CustomerFilter,
    "tier" | "search" | "filterType" | "singleDate" | "startDate" | "endDate" | "fetchParam"
  >
) => {
  const queryString = buildQueryParams(filter as Record<string, unknown>);

  const { blob, filename } = await apiCallBlob(`/customer/admin/export?${queryString}`);

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename ?? "customers.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
