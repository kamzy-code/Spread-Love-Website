import mongoose, { Schema, Document, mongo } from "mongoose";
import {
  callStatus,
  callType,
  occassion,
  occassionType,
} from "../types/genralTypes";

export interface IBooking extends Document {
  bookingId: string;
  callerName: string;
  callerPhone: string;
  callerEmail: string;
  recipientName: string;
  recipientPhone: string;
  country: string;
  occassion: occassionType;
  callType: callType;
  callDate: Date;
  price: string;
  message?: string;
  specialInstruction?: string;
  status?: callStatus;
  callRecording?: string;
  callRecordingURL?: string;
  contactConsent?: string;
  confirmationMailsent?: boolean;
  assignedRep?: mongoose.Types.ObjectId;
  paymentStatus: string;
  paymentReference?: string;
}

const bookingSchema: Schema = new Schema<IBooking>(
  {
    bookingId: { type: String, required: true, unique: true },
    callerName: { type: String, required: true },
    callerPhone: { type: String, required: true },
    callerEmail: { type: String, required: true, default: "" },
    recipientName: { type: String, required: true },
    recipientPhone: { type: String, required: true },
    country: { type: String, required: true },
    occassion: { type: String, enum: Object.values(occassion), required: true },
    callType: { type: String, required: true },
    callDate: { type: Date, required: true },
    price: { type: String, required: true },
    message: { type: String, required: true, default: "" },
    specialInstruction: { type: String, required: false, default: "" },
    status: {
      type: String,
      enum: [
        "pending",
        "successful",
        "rejected",
        "rescheduled",
        "unsuccessful",
      ],
      default: "pending",
    },
    callRecording: { type: String, required: false, default: "no" },
    callRecordingURL: { type: String, required: false, default: "" },
    contactConsent: { type: String, required: false, default: "no" },
    confirmationMailsent: { type: Boolean, default: false },
    assignedRep: { type: mongoose.Types.ObjectId, ref: "Admin" },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
      required: true,
    },
    paymentReference: { type: String, required: false },
  },
  { timestamps: true }
);

export const Booking = mongoose.model<IBooking>("Booking", bookingSchema);
