import mongoose, { Schema, Document } from "mongoose";

export type discountType = "flat" | "percent";

export interface ICoupon extends Document {
  code: string;
  discountType: discountType;
  value: number;
  usageLimit: number;
  usedCount: number;
  expiresAt: Date;
  active: boolean;
  createdBy: mongoose.Types.ObjectId;
}

const couponSchema: Schema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ["flat", "percent"], required: true },
    value: { type: Number, required: true },
    usageLimit: { type: Number, required: true },
    usedCount: { type: Number, required: true, default: 0 },
    expiresAt: { type: Date, required: true },
    active: { type: Boolean, required: true, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
  },
  { timestamps: true }
);

export const Coupon = mongoose.model<ICoupon>("Coupon", couponSchema);
