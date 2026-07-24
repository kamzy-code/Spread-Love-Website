import mongoose, { Schema, Document } from "mongoose";

// Generic admin-edit audit trail — reused across admin-editable-field
// features (customer email, service prices, coupons, reps) rather than a
// bespoke log per feature. Read access is superadmin-only — enforced in
// the route, not here.
export type auditEntity = "booking" | "service" | "coupon" | "rep";

export interface IAuditLog extends Document {
  entity: auditEntity;
  entityId: string;
  field: string;
  oldValue: string;
  newValue: string;
  changedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const auditLogSchema: Schema = new Schema<IAuditLog>(
  {
    entity: { type: String, enum: ["booking", "service", "coupon", "rep"], required: true },
    entityId: { type: String, required: true },
    field: { type: String, required: true },
    oldValue: { type: String, default: "" },
    newValue: { type: String, default: "" },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.index({ entity: 1, entityId: 1, createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>("AuditLog", auditLogSchema);
