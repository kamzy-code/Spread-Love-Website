import { IBooking } from "../models/bookingModel";

export const isLegacyBooking = (
  booking: Pick<IBooking, "recipients">
): boolean => {
  return !booking.recipients || booking.recipients.length === 0;
};
