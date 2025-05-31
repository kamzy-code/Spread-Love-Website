import mongoose, { Schema, Document, mongo } from "mongoose";
import { callStatus, callType, callTypes } from "../types/genralTypes";

export interface IBooking extends Document {
  bookingId: string;
  callerName: string;
  callerPhone: string;
  callerEmail?: string;
  ReceiverName: string;
  ReceiverPhone: string;
  ReceiverCountry: string;
  callType: string;
  callDate: Date;
  callTime?: string;
  SpecialMessage?: string;
  relationshipWithReceiver: string;
  extraInfo?: string;
  status?: callStatus;
  assignedRep?: mongoose.Types.ObjectId;
}

const bookingSchema: Schema = new Schema<IBooking>(
  {
    bookingId: { type: String, required: true, unique: true },
    callerName: { type: String, required: true },
    callerPhone: { type: String, required: true },
    callerEmail: { type: String, required: false },
    ReceiverName: { type: String, required: true },
    ReceiverPhone: { type: String, required: true },
    ReceiverCountry: { type: String, required: true },
    callType: { type: String, enum: Object.values(callTypes), required: true },
    callDate: { type: Date, required: true },
    callTime: { type: String, required: false },
    SpecialMessage: { type: String, required: false },
    relationshipWithReceiver: { type: String, required: true },
    extraInfo: { type: String, required: false },
    status: {
      type: String,
      enum: ["pending", "placed", "successful", "rejected", "rescheduled"],
      default: "pending",
    },
    assignedRep: { type: mongoose.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

export const Booking = mongoose.model<IBooking>("Booking", bookingSchema);
