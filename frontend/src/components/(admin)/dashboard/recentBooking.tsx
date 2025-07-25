import { useBookings } from "@/hooks/useBookings";
import MiniLoader from "../ui/miniLoader";
import { Calendar, XCircle } from "lucide-react";
import { formatToYMD } from "@/lib/formatDate";
import { getStatusColor, getStatusIcon } from "@/lib/getStatusColor";
import { useFilter } from "./dashboardFilterContext";
import { useRouter } from "next/navigation";
import { FilterType, Booking, BookingFilters } from "@/lib/types";

export default function RecentBookings() {
  const { appliedFilterType, appliedDate, appliedEndDate, appliedStartDate } =
    useFilter();

  const filters: BookingFilters = {
    filterType: appliedFilterType as FilterType,
    startDate: appliedStartDate,
    endDate: appliedEndDate,
    singleDate: appliedDate,
    sortParam: "createdAt",
    sortOrder: "-1",
    page: 1,
    limit: 5,
  };

  const router = useRouter();

  const { data, error, isLoading, isFetching, refetch } = useBookings(
    filters as BookingFilters,
    "all"
  );

  const { data: bookings, } = data ?? { data: [], meta: undefined };

  if (error)
    return (
      <div className="h-50 w-full flex flex-col items-center justify-center gap-4 card">
        <div className="flex flex-col justify-center items-center">
          <XCircle className="h-8 md:w-8 text-red-500"></XCircle>
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
    <div className="card">
      <div className="min-h-50 p-6 flex flex-col gap-4">
        <div className="w-full flex justify-between">
          <h2 className="md:text-xl font-semibold text-brand-start">
            Recent Bookings
          </h2>

          <button
            className="text-brand-end text-sm hover:text-brand-start"
            onClick={() => router.push("/admin/bookings")}
          >
            {`View More>`}
          </button>
        </div>

        {(isLoading || isFetching) && (
          <div className="flex-1 flex flex-col justify-center items-center">
            <MiniLoader></MiniLoader>
          </div>
        )}

        {!isLoading && bookings?.length === 0 ? (
          <div className="flex-1 flex flex-col justify-center items-center  text-gray-500">
            <Calendar className="h-4 w-4 md:h-6 md:w-6" />
            <p className="text-sm md:text-[1rem]">No Bookings Available</p>
          </div>
        ) : (
          <div>
            {(bookings as Booking[])?.map((booking: Booking) => {
              return (
                <div
                  key={booking.bookingId}
                  onClick={() => router.push(`/admin/bookings/${booking._id}`)}
                  className="flex flex-row justify-between items-center border-b py-2 last:border-0 hover:bg-gray-50"
                >
                  <div>
                    <h3 className="text-brand-start text-sm font-medium">
                      {booking.callerName}
                    </h3>
                    <p className="text-xs text-gray-700 max-w-[70%] sm:max-w-full">{`${
                      booking.occassion
                    } - ${formatToYMD(booking.createdAt)}`}</p>
                  </div>

                  <div
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      booking.status as string,
                      "badge"
                    )}`}
                  >
                    {getStatusIcon(booking.status as string, true)}
                    <span className="ml-1 capitalize">{booking.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
