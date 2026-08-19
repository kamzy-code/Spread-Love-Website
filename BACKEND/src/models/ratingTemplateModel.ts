import mongoose, { Schema, Document } from "mongoose";

export type ratingScaleType = "numeric" | "pass_fail";

export interface IRatingCriterion {
  key: string;
  label: string;
  scaleType: ratingScaleType;
  min?: number;
  max?: number;
}

export interface IRatingTemplate extends Document {
  name: string;
  // Exactly one template should be active at a time — enforced in the
  // service layer (unset others on activate), not a DB constraint.
  active: boolean;
  criteria: IRatingCriterion[];
  passFailThreshold?: number;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ratingCriterionSchema = new Schema<IRatingCriterion>(
  {
    // Stable machine key used by Recording.ratingValues[].criterionKey — once
    // a criterion is in use, only add/deprecate, never rename in place, or
    // historical ratings orphan.
    key: { type: String, required: true },
    label: { type: String, required: true },
    scaleType: { type: String, enum: ["numeric", "pass_fail"], required: true },
    min: { type: Number, required: false },
    max: { type: Number, required: false },
  },
  { _id: false },
);

const ratingTemplateSchema: Schema = new Schema<IRatingTemplate>(
  {
    name: { type: String, required: true },
    active: { type: Boolean, required: true, default: true },
    criteria: { type: [ratingCriterionSchema], required: true, default: [] },
    passFailThreshold: { type: Number, required: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: false },
  },
  { timestamps: true },
);

export const RatingTemplate = mongoose.model<IRatingTemplate>(
  "RatingTemplate",
  ratingTemplateSchema,
);
