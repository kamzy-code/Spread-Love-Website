import mongoose, { Schema, Document } from "mongoose";

export type ratingTier = "poor" | "fair" | "good" | "excellent";
export type criterionType = "options" | "text";

export const TIER_WEIGHTS: Record<ratingTier, number> = {
  poor: 1,
  fair: 2,
  good: 3,
  excellent: 4,
};

export interface IRatingOption {
  // Stable key referenced by Recording.ratingValues[].value (or one entry
  // of it, for a `multiple` criterion) — same permanence rule as
  // IRatingCriterion.key: add/deprecate, never rename or reuse.
  value: string;
  label: string;
  tier: ratingTier;
  weight: number;
}

export interface IRatingCriterion {
  key: string;
  label: string;
  type: criterionType;
  // options-only: select-many (checklist) vs select-one. A `type: "text"`
  // criterion ignores this.
  multiple?: boolean;
  // Required when type === "options";
  options?: IRatingOption[];
}

export interface IRatingTemplate extends Document {
  name: string;
  // Exactly one template should be active at a time — enforced in the
  // service layer (unset others on activate), not a DB constraint.
  active: boolean;
  criteria: IRatingCriterion[];
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const ratingOptionSchema = new Schema<IRatingOption>(
  {
    value: { type: String, required: true },
    label: { type: String, required: true },
    tier: { type: String, enum: ["poor", "fair", "good", "excellent"], required: true },
    weight: { type: Number, required: true },
  },
  { _id: false },
);

export const ratingCriterionSchema = new Schema<IRatingCriterion>(
  {
    // Stable machine key used by Recording.ratingValues[].criterionKey — once
    // a criterion is in use, only add/deprecate, never rename in place, or
    // historical ratings orphan.
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, enum: ["options", "text"], required: true },
    multiple: { type: Boolean, required: false, default: false },
    options: { type: [ratingOptionSchema], required: false },
  },
  { _id: false },
);

const ratingTemplateSchema: Schema = new Schema<IRatingTemplate>(
  {
    name: { type: String, required: true },
    active: { type: Boolean, required: true, default: false },
    criteria: { type: [ratingCriterionSchema], required: true, default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: false },
  },
  { timestamps: true },
);

export const RatingTemplate = mongoose.model<IRatingTemplate>(
  "RatingTemplate",
  ratingTemplateSchema,
);
