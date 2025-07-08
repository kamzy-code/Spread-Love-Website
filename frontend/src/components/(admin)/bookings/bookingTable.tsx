import { useBookingFilter } from "./bookingFilterContext";
import { useBookings } from "@/hooks/useBookings";
import MiniLoader from "../ui/miniLoader";
import { XCircle, Calendar, MoreHorizontal, MoreVertical } from "lucide-react";
import Pagination from "../ui/pagination";
import { BookingFilterContex, BookingFilters, Booking } from "@/lib/types";
import { useState } from "react";
import { getColumnsByRole } from "./data-table/columns";
import { DataTable } from "./data-table/data-table";
import { useAdminAuth } from "@/hooks/authContext";
import GridItem from "./data-table/grid-table";

export default function BookingTable() {
  const { user } = useAdminAuth();
  const fullFilter: BookingFilterContex = useBookingFilter();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const { setPage, ...filter } = fullFilter;
  const { search: searchTerm } = filter;

  const { data, error, isLoading, isFetching, refetch } = useBookings(
    filter as BookingFilters,
    searchTerm as string
  );

  const { data: bookings, meta } = data ?? { data: [], meta: undefined };

  const tableColumns = getColumnsByRole(
    user?.role as "superadmin" | "salesrep" | "callrep"
  );

  if (error)
    return (
      <div className="absolute top-[70%] left-[50%] translate-x-[-50%] translate-y-[-50%]  flex-1 flex flex-col justify-center items-center text-gray-500 gap-4">
        <div className="flex flex-col justify-center items-center text-center z-10">
          <XCircle className="h-8 md:w-8 text-red-500" />
          <p className="text-gray-500">Error Fetching Bookings</p>
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
      <div>
        {(isLoading || isFetching) && (
          <div className="flex-1 flex flex-col justify-center items-center mt-8">
            <MiniLoader />
          </div>
        )}

        {!isLoading && !isFetching && bookings?.length === 0 && (
          <div className="absolute top-[70%] left-[50%] translate-x-[-50%] translate-y-[-50%]  flex-1 flex flex-col justify-center items-center text-gray-500">
            <Calendar className="h-4 w-4 md:h-6 md:w-6" />
            <p className="text-sm md:text-[1rem]">No Bookings Available</p>
          </div>
        )}

        {bookings && bookings.length > 0 && (
          <div className="">
            {/* data-table */}
            <div className="hidden lg:block">
              <DataTable columns={tableColumns} data={bookings} />
            </div>

            {/* Grid View */}
            <div className="container mx-auto lg:hidden grid grid-cols-1 gap-4 py-4">
              {bookings.map((booking: Booking) => {
                return (
                  <GridItem
                    key={booking._id}
                    booking={booking}
                    role={user?.role as string}
                  ></GridItem>
                );
              })}
            </div>

            {/* pagination */}
            <div>
              {meta && meta.totalPages > 0 && <Pagination meta={meta} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
