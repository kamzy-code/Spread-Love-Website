import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { MoreVertical, MoreHorizontal } from "lucide-react";
import { Booking } from "@/lib/types";
import { useAdminAuth } from "@/hooks/authContext";

export default function ItemDropDown({
  booking,
  view,
  setSelectedbooking,
}: {
  booking: Booking;
  view: string;
  setSelectedbooking: (booking: Booking) => void;
}) {
  const { user } = useAdminAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-200">
          <span className="sr-only">Open menu</span>
          {view === "mobile" ? (
            <MoreVertical className="h-4 w-4" />
          ) : (
            <MoreHorizontal className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="p-3">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>

        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(booking.bookingId)}
        >
          Copy booking ID
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Submenu for Update Status */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Update Status</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem
              onClick={() =>
                setSelectedbooking({ ...booking, status: "pending" })
              }
            >
              <label className={`flex items-center px-2 py-1 cursor-pointer`}>
                <input
                  type="radio"
                  name="statusOption"
                  checked={booking.status === "pending"}
                  readOnly
                  className="mr-2"
                />
                Pending
              </label>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                setSelectedbooking({ ...booking, status: "successful" })
              }
            >
              <label className={`flex items-center px-2 py-1 cursor-pointer`}>
                <input
                  type="radio"
                  name="statusOption"
                  checked={booking.status === "successful"}
                  readOnly
                  className="mr-2"
                />
                Successful
              </label>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                setSelectedbooking({ ...booking, status: "rejected" })
              }
            >
              <label className={`flex items-center px-2 py-1 cursor-pointer`}>
                <input
                  type="radio"
                  name="statusOption"
                  checked={booking.status === "rejected"}
                  readOnly
                  className="mr-2"
                />
                Rejected
              </label>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                setSelectedbooking({ ...booking, status: "rescheduled" })
              }
            >
              <label className={`flex items-center px-2 py-1 cursor-pointer`}>
                <input
                  type="radio"
                  name="statusOption"
                  checked={booking.status === "rescheduled"}
                  readOnly
                  className="mr-2"
                />
                Rescheduled
              </label>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                setSelectedbooking({ ...booking, status: "unsuccessful" })
              }
            >
              <label className={`flex items-center px-2 py-1 cursor-pointer`}>
                <input
                  type="radio"
                  name="statusOption"
                  checked={booking.status === "unsuccessful"}
                  readOnly
                  className="mr-2"
                />
                Unsuccessful
              </label>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {user?.role !== "callrep" && (
          <>
            <DropdownMenuItem>Delete</DropdownMenuItem>
            <DropdownMenuItem>Assign to Rep</DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
