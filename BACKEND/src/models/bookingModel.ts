import mongoose, { Schema, Document, mongo } from "mongoose";
import { callStatus, callType, occassion, occassionType } from "../types/genralTypes";

export interface IBooking extends Document {
  bookingId: string;
  callerName: string;
  callerPhone: string;
  callerEmail?: string;
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
  assignedRep?: mongoose.Types.ObjectId;
}

const bookingSchema: Schema = new Schema<IBooking>(
  {
    bookingId: { type: String, required: true, unique: true },
    callerName: { type: String, required: true },
    callerPhone: { type: String, required: true },
    callerEmail: { type: String, required: false, default: "" },
    recipientName: { type: String, required: true },
    recipientPhone: { type: String, required: true },
    country: { type: String, required: true },
    occassion: { type: String, enum: Object.values(occassion), required: true },
    callType: {type: String, required: true},
    callDate: { type: Date, required: true },
    price: {type: String, required: true},
    message: { type: String, required: true, default: ""},
    specialInstruction: { type: String, required: false, default: "" },
    status: {
      type: String,
      enum: ["pending", "successful", "rejected", "rescheduled", "unsuccessful"],
      default: "pending",
    },
    assignedRep: { type: mongoose.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

export const Booking = mongoose.model<IBooking>("Booking", bookingSchema);
