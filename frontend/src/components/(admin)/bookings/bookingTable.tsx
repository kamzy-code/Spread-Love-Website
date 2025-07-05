import { useBookingFilter } from "./bookingFilterContext";
import { useBookings } from "@/hooks/useBookings";
import MiniLoader from "../ui/miniLoader";
import { BookingFilters } from "@/hooks/useBookings";
import { XCircle, Calendar } from "lucide-react";
import { formatToYMD } from "@/lib/formatDate";
import { Booking } from "@/hooks/useBookings";
import { getStatusColor, getStatusIcon } from "@/lib/getStatusColor";
import { BookingFilterContex } from "./bookingFilterContext";
import Pagination from "../ui/pagination";

export default function BookingTable() {
  const fullFilter: BookingFilterContex = useBookingFilter();

  const { setPage, ...filter } = fullFilter;
  const { search: searchTerm } = filter;

  const { data, error, isLoading, isFetching, refetch } = useBookings(
    filter as BookingFilters,
    searchTerm as string
  );

  const { data: bookings, meta } = data ?? { data: [], meta: undefined };
  console.log("Meta: ", meta)

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
      {
        <div>
          {(isLoading || isFetching) && (
            <div className="flex-1 flex flex-col justify-center items-center">
              <MiniLoader />
            </div>
          )}

          {!isLoading && !isFetching && bookings?.length === 0 && (
            <div className="absolute top-[70%] left-[50%] translate-x-[-50%] translate-y-[-50%]  flex-1 flex flex-col justify-center items-center text-gray-500">
              <Calendar className="h-4 w-4 md:h-6 md:w-6" />
              <p className="text-sm md:text-[1rem]">No Bookings Available</p>
            </div>
          )}

          {
            <div>
              {(bookings as Booking[])?.map((booking) => (
                <div
                  key={booking.bookingId}
                  className="flex flex-row justify-between items-center border-b py-2 last:border-0"
                >
                  <div>
                    <h2 className="text-brand-start font-medium">
                      {booking.callerName}
                    </h2>
                    <p className="text-sm text-gray-700 max-w-[70%] sm:max-w-full">{`${
                      booking.occassion
                    } - ${formatToYMD(booking.createdAt)}`}</p>
                  </div>

                  <div
                    className={`${getStatusColor(
                      booking.status as string,
                      "badge"
                    )} flex flex-row rounded-full px-3 py-1 items-center gap-2`}
                  >
                    <div className="flex">
                      {getStatusIcon(booking.status as string)}
                    </div>
                    <p className="text-sm">{booking.status}</p>
                  </div>
                </div>
              ))}

             {meta && <Pagination meta={meta} />}
            </div>
          }
        </div>
      }
    </div>
  );
}
