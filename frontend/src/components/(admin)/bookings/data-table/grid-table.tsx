import { Booking } from "@/lib/types";
import { getStatusColor, getStatusIcon } from "@/lib/getStatusColor";
import { getTierColor, getTierIcon, getTierLabel } from "@/lib/getTierColor";
import { formatToYMD } from "@/lib/formatDate";
import {
  getDisplayCallerName,
  getDisplayBookingStatus,
  getDisplayTotalPrice,
  getDisplayCustomerTier,
  getExtraRecipientsLabel,
  getPrimaryRecipient,
} from "@/lib/bookingDisplay";
import ItemDropDown from "./itemDropdown";
import { useRouter } from "next/navigation";

export default function GridItem({
  booking,
  role,
  setSelectedBooking,
  setDeletedBooking,
  setShowDeleteModal,
}: {
  booking: Booking;
  role: string;
  setSelectedBooking: (booking: Booking, action: string) => void;
  setDeletedBooking: (booking: Booking) => void;
  setShowDeleteModal: (val: boolean) => void;
}) {
  const router = useRouter();
  const status = getDisplayBookingStatus(booking);
  const tier = getDisplayCustomerTier(booking);
  const recipient = getPrimaryRecipient(booking);
  const extraRecipients = getExtraRecipientsLabel(booking);

  return (
    <div className="">
      <div
        key={booking.bookingId}
        className="card active:bg-gray-50 transition duration-150"
        onClick={() => router.push(`/admin/bookings/${booking._id}`)}
      >
        <div className="py-6 px-4 space-y-2">
          <div className="flex w-full justify-between items-center">
            <div className="flex gap-4 md:gap-8 items-center">
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full shrink-0  ${
                    booking.paymentStatus === "pending"
                      ? `bg-yellow-500`
                      : booking.paymentStatus === "paid"
                      ? `bg-green-500`
                      : `bg-red-500`
                  }`}
                ></div>
                <p className="text-xs font-medium text-brand-start">
                  {booking.bookingId}
                </p>
              </div>
              <p className="text-xs  text-gray-900">
                {" "}
                {formatToYMD(booking.createdAt)}
              </p>
            </div>

            <div
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                status,
                "badge"
              )}`}
            >
              {getStatusIcon(status, true)}
              <span className="ml-1 capitalize">{status.replace("_", " ")}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="w-full flex items-center gap-1.5 justify-between">
                <h3 className="text-sm text-gray-900 flex items-center gap-1.5">
                  {getDisplayCallerName(booking)}
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getTierColor(
                      tier,
                      "badge"
                    )}`}
                  >
                    {getTierIcon(tier, true)}
                    {getTierLabel(tier)}
                  </span>
                </h3>
              </div>

              <div className="w-full flex justify-between">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-xs text-gray-700">
                    To: {recipient.recipientName}
                  </p>
                  {extraRecipients && (
                    <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {extraRecipients}
                    </span>
                  )}
                </div>
              </div>

              <div className="w-full flex justify-between">
                <div className="flex gap-2 md:gap-8 items-center">
                  <p className="text-xs  text-gray-700 capitalize">
                    {`${recipient.occassion} (${recipient.callType}) `}
                  </p>
                </div>
              </div>

              <div className="w-full flex justify-between">
                <div className="flex gap-2 md:gap-8 items-center">
                  <p className="text-xs  text-gray-700 capitalize">
                    <span className="font-medium text-brand-start">
                      {recipient.country}
                    </span>
                    {role !== "callrep" && booking?.assignedRep?.firstName
                      ? ` | Rep: ${booking.assignedRep.firstName}`
                      : ""}
                    {` | N${getDisplayTotalPrice(booking).toLocaleString()}`}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <ItemDropDown
                booking={booking}
                view="mobile"
                setSelectedbooking={setSelectedBooking}
                setDeletedBooking={setDeletedBooking}
                setShowDeleteModal={setShowDeleteModal}
              ></ItemDropDown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
