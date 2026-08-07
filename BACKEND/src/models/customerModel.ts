import mongoose, { Schema, Document } from "mongoose";

export type customerTier = "new" | "regular" | "vip" | "diamond";

export interface ICustomer extends Document {
  email: string;
  name: string;
  phone: string;
  completedBookings: number;
  tier: customerTier;
  lastBookingAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema: Schema = new Schema<ICustomer>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    completedBookings: { type: Number, required: true, default: 0 },
    tier: {
      type: String,
      enum: ["new", "regular", "vip", "diamond"],
      required: true,
      default: "new",
    },
    lastBookingAt: { type: Date, required: false },
  },
  { timestamps: true }
);

export const Customer = mongoose.model<ICustomer>("Customer", customerSchema);
