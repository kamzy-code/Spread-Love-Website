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

export default function GridItem({
  booking,
  role,
}: {
  booking: Booking;
  role: string;
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
              <h3 className="text-sm  text-gray-900">
                {booking.callerName}
              </h3>
            </div>

            <div className="w-full flex justify-between">
              <div className="flex gap-2 md:gap-8 items-center">
                <p className="text-xs  text-gray-700 capitalize">
                  {`${booking.occassion} (${booking.callType}) `}
                </p>
              </div>
            </div>
          </div>

          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-gray-200"
                >
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="p-3">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() =>
                    navigator.clipboard.writeText(booking.bookingId)
                  }
                >
                  Copy booking ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Update Status</DropdownMenuItem>
                {role !== "callrep" && (
                  <div>
                    <DropdownMenuItem>Delete</DropdownMenuItem>
                    <DropdownMenuItem>Assign to Rep</DropdownMenuItem>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
