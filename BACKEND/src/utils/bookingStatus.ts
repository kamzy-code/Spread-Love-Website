import { IRecipient } from "../models/bookingModel";
import { callStatus, bookingStatusType } from "../types/genralTypes";

export const TERMINAL_CALL_STATUSES: callStatus[] = [
  "successful",
  "unsuccessful",
  "rejected",
];

// "pending" means nothing has happened yet — every recipient still
// literally "pending". A single rescheduled or assigned recipient means a
// call attempt already occurred, so the booking is "in_progress" even
// though rescheduled/assigned aren't terminal statuses either.
// "abandoned" is never produced here: it's a lifecycle override set only by
// the checkout supersede path (see bookingService.createBooking) and is
// sticky against recomputation.
export const deriveBookingStatus = (recipients: IRecipient[]): bookingStatusType => {
  const allPending = recipients.every((r) => !r.callStatus || r.callStatus === "pending");
  if (allPending) return "pending";

  const allTerminal = recipients.every(
    (r) => r.callStatus && TERMINAL_CALL_STATUSES.includes(r.callStatus)
  );
  return allTerminal ? "completed" : "in_progress";
};