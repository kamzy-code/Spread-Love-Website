import mongoose, { Schema, Document } from "mongoose";

// There is only ever one booking-form pop-up, so this is a singleton held
// under a fixed key and written with an upsert — no "exactly one active"
// enforcement needed the way ratingTemplate has.
export const BOOKING_POPUP_KEY = "booking-popup";

export interface IBookingPopup extends Document {
  key: string;
  enabled: boolean;
  title: string;
  body: string;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const bookingPopupSchema = new Schema<IBookingPopup>(
  {
    key: { type: String, required: true, unique: true },
    enabled: { type: Boolean, required: true, default: false },
    title: { type: String, default: "" },
    body: { type: String, default: "" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true },
);

export const BookingPopup = mongoose.model<IBookingPopup>("BookingPopup", bookingPopupSchema);
