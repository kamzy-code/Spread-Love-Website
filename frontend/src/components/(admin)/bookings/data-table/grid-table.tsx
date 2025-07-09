import { Booking } from "@/lib/types";
import { getStatusColor, getStatusIcon } from "@/lib/getStatusColor";
import { formatToYMD } from "@/lib/formatDate";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import ItemDropDown from "./itemDropdown";

export default function GridItem({
  booking,
  role,
  setSelectedBooking,
}: {
  booking: Booking;
  role: string;
  setSelectedBooking: (booking: Booking) => void;
}) {
  return (
    <div className="">
      <div key={booking.bookingId} className="card py-6 px-4 space-y-2">
        <div className="flex w-full justify-between items-center">
          <div className="flex gap-4 md:gap-8 items-center">
            <p className="text-xs font-medium text-brand-start">
              {booking.bookingId}
            </p>
            <p className="text-xs  text-gray-900">
              {" "}
              {formatToYMD(booking.createdAt)}
            </p>
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

        <div className="flex items-center justify-between">
          <div>
            <div className="w-full flex items-center justify-between">
              <h3 className="text-sm  text-gray-900">{booking.callerName}</h3>
            </div>

            <div className="w-full flex justify-between">
              <div className="flex gap-2 md:gap-8 items-center">
                <p className="text-xs  text-gray-700 capitalize">
                  {`${booking.occassion} (${booking.callType}) `}
                </p>
              </div>
            </div>

            <div className="w-full flex justify-between">
              <div className="flex gap-2 md:gap-8 items-center">
                <p className="text-xs  text-gray-700 capitalize">
                  <span className="font-medium text-brand-start">
                    {booking.country}
                  </span>
                  {` ${
                    role === "callrep"
                      ? ""
                      : `| Rep: ${booking.assignedRep.firstName}`
                  }`}
                </p>
              </div>
            </div>
          </div>

          <div>
            <ItemDropDown
              booking={booking}
              view="mobile"
              setSelectedbooking={setSelectedBooking}
            ></ItemDropDown>
          </div>
        </div>
      </div>
    </div>
  );
}
