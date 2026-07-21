import { Booking, BookingRecipientData } from "./types";
import { isLegacyBooking } from "./bookingShape";

// Single source of truth for "what does this booking look like in a table
// row" — every admin list/grid/widget reads through these instead of
// re-deriving the v1/v2 branch locally.

export const getDisplayCallerName = (booking: Booking): string =>
  booking.caller?.name ?? booking.callerName ?? "";

export const getDisplayCallerEmail = (booking: Booking): string =>
  booking.caller?.email ?? booking.callerEmail ?? "";

// A v1 booking's flat fields are treated as a single implicit recipient, so
// callers can render one shape regardless of which version the doc is.
export const getPrimaryRecipient = (booking: Booking): BookingRecipientData => {
  if (!isLegacyBooking(booking)) {
    return booking.recipients![0];
  }

  return {
    _id: booking._id,
    recipientName: booking.recipientName ?? "",
    recipientPhone: booking.recipientPhone ?? "",
    country: booking.country ?? "",
    occassion: booking.occassion ?? "",
    callType: booking.callType ?? "",
    callDate: booking.callDate ?? "",
    price: Number(booking.price) || 0,
    message: booking.message,
    specialInstruction: booking.specialInstruction,
    callStatus: booking.status,
    callRecording: booking.callRecording,
    callRecordingURL: booking.callRecordingURL,
  };
};

// "+N more" badge text for a multi-recipient booking, null when there's
// nothing extra to show (legacy or single-recipient v2).
export const getExtraRecipientsLabel = (booking: Booking): string | null => {
  const count = booking.recipients?.length ?? 0;
  return count > 1 ? `+${count - 1} more` : null;
};

export const getDisplayBookingStatus = (booking: Booking): string =>
  booking.bookingStatus ?? booking.status ?? "pending";

export const getDisplayTotalPrice = (booking: Booking): number =>
  booking.totalPrice ?? (Number(booking.price) || 0);

export const getDisplayCustomerTier = (booking: Booking): NonNullable<Booking["customerTier"]> =>
  booking.customerTier ?? "new";
