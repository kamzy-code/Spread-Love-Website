import { IBooking, ICaller } from "../models/bookingModel";

export const isLegacyBooking = (
  booking: Pick<IBooking, "recipients">
): boolean => {
  return !booking.recipients || booking.recipients.length === 0;
};

// Legacy bookings never populate `caller` — derive the same shape from the
// flat v1 fields so callers (customerService tier tracking, etc.) don't need
// to branch on booking shape themselves.
export const getCallerFromBooking = (
  booking: Pick<IBooking, "caller" | "callerName" | "callerEmail" | "callerPhone">
): ICaller => ({
  name: booking.caller?.name ?? booking.callerName ?? "",
  email: booking.caller?.email ?? booking.callerEmail ?? "",
  phone: booking.caller?.phone ?? booking.callerPhone ?? "",
  gender: booking.caller?.gender,
  relationship: booking.caller?.relationship,
});
