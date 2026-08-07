import mongoose, { Schema, Document } from "mongoose";

export type serviceIconKey =
  | "cake"
  | "heart"
  | "users"
  | "graduationCap"
  | "partyPopper"
  | "gift"
  | "phone"
  | "sun";

export interface IServicePricing {
  features: string[];
  localPrice: number;
  internationalPrice: number;
}

export interface IService extends Document {
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  iconKey: serviceIconKey;
  regular: IServicePricing;
  special: IServicePricing;
  active: boolean;
}

const servicePricingSchema = new Schema<IServicePricing>(
  {
    features: { type: [String], required: true, default: [] },
    localPrice: { type: Number, required: true },
    internationalPrice: { type: Number, required: true },
  },
  { _id: false }
);

const serviceSchema: Schema = new Schema<IService>(
  {
    title: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    thumbnail: { type: String, required: true },
    iconKey: {
      type: String,
      enum: ["cake", "heart", "users", "graduationCap", "partyPopper", "gift", "phone", "sun"],
      required: true,
    },
    regular: { type: servicePricingSchema, required: true },
    special: { type: servicePricingSchema, required: true },
    active: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

export const Service = mongoose.model<IService>("Service", serviceSchema);
