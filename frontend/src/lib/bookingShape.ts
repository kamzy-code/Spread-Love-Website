import { Booking } from "./types";

export const isLegacyBooking = (booking: Pick<Booking, "recipients">): boolean => {
  return !booking.recipients || booking.recipients.length === 0;
};
