import { useEffect } from "react";
import { XCircle, Users } from "lucide-react";
import MiniLoader from "../ui/miniLoader";
import Pagination from "../ui/pagination";
import { Customer } from "@/lib/types";
import { formatToYMD } from "@/lib/formatDate";
import { getTierColor, getTierIcon, getTierLabel } from "@/lib/getTierColor";
import { useCustomerFilterStore } from "@/store/customerFilterStore";
import { useFetchCustomers } from "@/hooks/useCustomers";

export default function CustomerList() {
  const appliedFormData = useCustomerFilterStore((s) => s.appliedFormData);
  const debouncedValue = useCustomerFilterStore((s) => s.debouncedValue);
  const setPage = useCustomerFilterStore((s) => s.setPage);
  const filter = { ...appliedFormData, search: debouncedValue };

  const { data, error, isLoading, isFetching, refetch } = useFetchCustomers(filter);
  const { data: customers, meta } = data ?? { data: [], meta: undefined };

  useEffect(() => {
    document.body.style.overflow = isLoading || isFetching ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLoading, isFetching]);

  if (error)
    return (
      <div className="absolute top-[70%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex-1 flex flex-col justify-center items-center text-gray-500 gap-4">
        <div className="flex flex-col justify-center items-center text-center z-10">
          <XCircle className="h-8 md:w-8 text-red-500" />
          <p className="text-gray-500">Error Fetching Customers</p>
        </div>
        <button
          className="btn-primary h-10 rounded-lg flex justify-center items-center"
          onClick={() => refetch()}
        >
          Try again
        </button>
      </div>
    );

  return (
    <div>
      {(isLoading || isFetching) && (
        <div className="fixed z-50 inset-0 flex items-center justify-center bg-black/5">
          <div className="p-4 card">
            <MiniLoader></MiniLoader>
          </div>
        </div>
      )}

      {!isLoading && !isFetching && customers?.length === 0 && (
        <div className="absolute top-[70%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex-1 flex flex-col justify-center items-center text-gray-500">
          <Users className="h-4 w-4 md:h-6 md:w-6" />
          <p className="text-sm md:text-[1rem]">No Customers Available</p>
        </div>
      )}

      {customers && customers.length > 0 && (
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {customers.map((customer: Customer) => (
              <div key={customer._id} className="card p-6 space-y-3">
                <div className="flex justify-between items-start">
                  <h2 className="font-medium text-brand-start">{customer.name}</h2>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getTierColor(
                      customer.tier,
                      "badge"
                    )}`}
                  >
                    {getTierIcon(customer.tier, true)}
                    {getTierLabel(customer.tier)}
                  </span>
                </div>

                <div className="text-gray-700 text-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <p>Email:</p>
                    <p className="text-brand-start">{customer.email}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p>Phone:</p>
                    <p className="text-brand-start">{customer.phone}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p>Completed Bookings:</p>
                    <p className="text-brand-start">{customer.completedBookings}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p>Last Booking:</p>
                    <p className="text-brand-start">
                      {customer.lastBookingAt ? formatToYMD(customer.lastBookingAt) : "—"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {meta && (
            <div>
              <Pagination meta={meta} setPage={setPage}></Pagination>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
