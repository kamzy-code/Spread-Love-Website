import mongoose, { Schema, Document } from "mongoose";
import {
  bookingStatusType,
  callStatus,
  callType,
  genderType,
} from "../types/genralTypes";

const callStatusValues: callStatus[] = [
  "pending",
  "assigned",
  "successful",
  "rejected",
  "rescheduled",
  "unsuccessful",
];

export interface ICaller {
  name: string;
  phone: string;
  email: string;
  gender?: genderType;
  relationship?: string;
}

export interface IRecipient {
  _id?: mongoose.Types.ObjectId;
  recipientName: string;
  recipientPhone: string;
  country: string;
  // Validated against the live Service collection, not a static enum — see
  // serviceService.getPriceForOccasion.
  occassion: string;
  callType: callType;
  callDate: Date;
  price: number;
  message?: string;
  specialInstruction?: string;
  callStatus?: callStatus;
  callRecording?: string;
  callRecordingURL?: string;
}

export interface IBooking extends Document {
  bookingId: string;

  // v1 flat fields — legacy shape, retained until scripts/migrate-bookings-v2.ts
  // has run against a document. New bookings (post schema-refactor) do not set these.
  callerName?: string;
  callerPhone?: string;
  callerEmail?: string;
  relationship?: string;
  recipientName?: string;
  recipientPhone?: string;
  country?: string;
  occassion?: string;
  callType?: callType;
  callDate?: Date;
  price?: string;
  message?: string;
  specialInstruction?: string;
  status?: callStatus;
  callRecording?: string;
  callRecordingURL?: string;

  // v2 nested shape
  caller?: ICaller;
  recipients?: IRecipient[];
  bookingStatus?: bookingStatusType;
  totalPrice?: number;
  couponCode?: string;
  discountAmount?: number;
  // duplicate detection and re-use counting for v2 bookings
  reuseCount: number;
  duplicateOfPaid?: boolean;

  // shared / unchanged across v1 and v2
  contactConsent?: string;
  confirmationMailsent: boolean;
  allRecipientsSuccessfulMailSent: boolean;
  assignedRep?: mongoose.Types.ObjectId;
  paymentURL?: string;
  paymentStatus: string;
  paymentReference?: string;

  createdAt: Date;
  updatedAt: Date;
}

const callerSchema = new Schema<ICaller>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    gender: { type: String, enum: ["male", "female", "prefer_not_to_say"], required: false },
    relationship: { type: String, required: false },
  },
  { _id: false },
);

const recipientSchema = new Schema<IRecipient>({
  recipientName: { type: String, required: true },
  recipientPhone: { type: String, required: true },
  country: { type: String, required: true },
  occassion: { type: String, required: true },
  callType: { type: String, required: true },
  callDate: { type: Date, required: true },
  price: { type: Number, required: true },
  message: { type: String, required: false, default: "" },
  specialInstruction: { type: String, required: false, default: "" },
  callStatus: {
    type: String,
    enum: callStatusValues,
    default: "pending",
  },
  callRecording: { type: String, required: false, default: "no" },
  callRecordingURL: { type: String, required: false, default: "" },
});

const bookingSchema: Schema = new Schema<IBooking>(
  {
    bookingId: { type: String, required: true, unique: true },

    // v1 flat fields — kept, no longer required so v2-shaped documents can save
    callerName: { type: String, required: false },
    callerPhone: { type: String, required: false },
    callerEmail: { type: String, required: false, default: "" },
    relationship: { type: String, required: false },
    recipientName: { type: String, required: false },
    recipientPhone: { type: String, required: false },
    country: { type: String, required: false },
    occassion: {
      type: String,
      required: false,
    },
    callType: { type: String, required: false },
    callDate: { type: Date, required: false },
    price: { type: String, required: false },
    message: { type: String, required: false, default: "" },
    specialInstruction: { type: String, required: false, default: "" },
    status: {
      type: String,
      enum: callStatusValues,
      default: "pending",
    },
    callRecording: { type: String, required: false, default: "no" },
    callRecordingURL: { type: String, required: false, default: "" },

    // v2 nested fields
    caller: { type: callerSchema, required: false },
    recipients: {
      type: [recipientSchema],
      required: false,
      default: undefined,
    },
    bookingStatus: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      required: false,
    },
    totalPrice: { type: Number, required: false },
    couponCode: { type: String, required: false },
    discountAmount: { type: Number, required: false },
    reuseCount: { type: Number, required: true, default: 0 },
    duplicateOfPaid: { type: Boolean, required: false, default: false },

    contactConsent: { type: String, required: false, default: "no" },
    confirmationMailsent: { required: true, type: Boolean, default: false },
    allRecipientsSuccessfulMailSent: { required: true, type: Boolean, default: false },
    assignedRep: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
      required: true,
    },
    paymentReference: { type: String, required: false },
    paymentURL: { required: false, type: String, default: "" },
  },
  { timestamps: true },
);

export const Booking = mongoose.model<IBooking>("Booking", bookingSchema);
