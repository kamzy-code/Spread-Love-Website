import mongoose, { Schema, Document } from "mongoose";

export type recordingStatus = "pending_upload" | "uploaded" | "expired";
export type deliveryStatus = "not_sent" | "sent" | "failed";

export interface IRecordingFile {
  _id?: mongoose.Types.ObjectId;
  s3Key: string;
  s3Bucket: string;
  mimeType: string;
  fileSize: number;
  partNumber: number;
  uploadedAt: Date;
}

export interface IRatingValue {
  criterionKey: string;
  value: unknown;
}

export interface IDeliveryStatus {
  status: deliveryStatus;
  sentAt?: Date;
  error?: string;
  providerMessageId?: string;
}

// A recording is a call SESSION that owns one or more FILES — calls can get
// split across multiple audio files by the recorder itself, and rate/QC/
// approve/send apply to the whole session, not to an individual fragment.
// A genuinely separate call attempt (e.g. a retry after reassignment) is a
// new session, not a new file on this one — see recordingRoute.ts's
// upload-url handler, which creates a new session whenever it's called
// without an existing recordingId.
export interface IRecording extends Document {
  booking: mongoose.Types.ObjectId;
  // Subdocument _id within booking.recipients — omitted only for the
  // legacy (v1 flat-shape) booking gap, which the upload UI never triggers.
  recipientId?: mongoose.Types.ObjectId;
  // The rep who started this session (uploaded part 1). Server-derived from
  // req.user, never client-supplied. Deliberately NOT booking.assignedRep —
  // assignedRep is booking-level and singular, and gets overwritten on
  // reassignment; uploadedBy is stamped once per recording and must survive
  // a later reassignment for a different recipient on the same booking.
  uploadedBy: mongoose.Types.ObjectId;
  files: IRecordingFile[];
  status: recordingStatus;
  // Set true on approval — blocks adding further parts to an already
  // QC-approved session (a late part shouldn't silently change something
  // already signed off on; the rep starts a new session instead).
  locked: boolean;
  // Set once, at the FIRST confirmed file — not pushed out by later parts.
  expiresAt: Date;
  // Set by the cleanup job when the S3 object(s) are actually deleted —
  // the audit trail distinguishing "expired, cleanup hasn't run yet" from
  // "actually deleted".
  deletedAt?: Date;
  reviewed: boolean;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  // Pinned template version — templates are editable, a historical rating
  // shouldn't silently reinterpret against today's criteria.
  ratingTemplate?: mongoose.Types.ObjectId;
  ratingValues: IRatingValue[];
  approved: boolean;
  approvedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId;
  // Opaque, generated on first send — backs the customer-facing download
  // link, which can't be a raw S3 presigned URL (AWS caps those at 7 days,
  // and the client wants links valid for the full 30-day storage window).
  downloadToken?: string;
  emailDelivery: IDeliveryStatus;
  whatsappDelivery: IDeliveryStatus;
  createdAt: Date;
  updatedAt: Date;
}

const recordingFileSchema = new Schema<IRecordingFile>({
  s3Key: { type: String, required: true },
  s3Bucket: { type: String, required: true },
  mimeType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  partNumber: { type: Number, required: true },
  uploadedAt: { type: Date, required: true },
});

const ratingValueSchema = new Schema<IRatingValue>(
  {
    criterionKey: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true },
  },
  { _id: false },
);

const deliveryStatusSchema = new Schema<IDeliveryStatus>(
  {
    status: { type: String, enum: ["not_sent", "sent", "failed"], default: "not_sent" },
    sentAt: { type: Date, required: false },
    error: { type: String, required: false },
    providerMessageId: { type: String, required: false },
  },
  { _id: false },
);

const recordingSchema: Schema = new Schema<IRecording>(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    recipientId: { type: mongoose.Schema.Types.ObjectId, required: false },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    files: { type: [recordingFileSchema], required: true, default: [] },
    status: {
      type: String,
      enum: ["pending_upload", "uploaded", "expired"],
      default: "pending_upload",
    },
    locked: { type: Boolean, required: true, default: false },
    expiresAt: { type: Date, required: true },
    deletedAt: { type: Date, required: false },
    reviewed: { type: Boolean, required: true, default: false },
    reviewedAt: { type: Date, required: false },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: false },
    ratingTemplate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RatingTemplate",
      required: false,
    },
    ratingValues: { type: [ratingValueSchema], required: true, default: [] },
    approved: { type: Boolean, required: true, default: false },
    approvedAt: { type: Date, required: false },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: false },
    downloadToken: { type: String, required: false },
    emailDelivery: { type: deliveryStatusSchema, required: true, default: () => ({}) },
    whatsappDelivery: { type: deliveryStatusSchema, required: true, default: () => ({}) },
  },
  { timestamps: true },
);

// Booking-details panel / QC list lookup (GET /api/recordings?bookingId=&recipientId=)
recordingSchema.index({ booking: 1, recipientId: 1 });
// Tiered visibility — call reps scoped to their own uploads
recordingSchema.index({ uploadedBy: 1 });
// 30-day cleanup job
recordingSchema.index({ status: 1, expiresAt: 1 });
// Send worklist
recordingSchema.index({ approved: 1 });

export const Recording = mongoose.model<IRecording>("Recording", recordingSchema);
