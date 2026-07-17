import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { MoreVertical, MoreHorizontal } from "lucide-react";
import { Booking } from "@/lib/types";
import { useAdminAuth } from "@/hooks/authContext";

export default function ItemDropDown({
  booking,
  view,
  setSelectedbooking,
  setDeletedBooking,
  setShowDeleteModal,
}: {
  booking: Booking;
  view: string;
  setSelectedbooking: (booking: Booking, action: string) => void;
  setDeletedBooking: (booking: Booking) => void;
  setShowDeleteModal: (val: boolean) => void;
}) {
  const { user } = useAdminAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
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
          onClick={(e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(booking.bookingId);
          }}
        >
          Copy booking ID
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Call-status updates are per-recipient now (a v2 booking can hold
            multiple recipients with independent outcomes) — that action lives
            on the booking detail page, scoped to each recipient, not here. */}

        {user?.role !== "callrep" && (
          <>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setDeletedBooking(booking);
                setShowDeleteModal(true);
              }}
            >
              Delete
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setSelectedbooking(booking, "assign");
              }}
            >
              Assign to Rep
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setSelectedbooking(booking, "verify");
              }}
            >
              Verify Payment
            </DropdownMenuItem>

            {booking.paymentStatus !== 'paid' && <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setSelectedbooking(booking, "complete");
              }}
            >
             Generate Payment Link
            </DropdownMenuItem>}

            {!booking.confirmationMailsent && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedbooking(booking, "resend");
                }}
              >
                Resend confirmation
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
