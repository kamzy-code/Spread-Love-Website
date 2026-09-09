import mongoose, { Schema, Document } from "mongoose";

// Types with no queued job here (e.g. recordingReady, contact) are sent
// synchronously with immediate feedback to the person who triggered them —
// only the silent, best-effort auto-sends (nobody watching for the failure)
// go through the retry queue.
export type EmailJobType = "booking_confirmation" | "all_recipients_successful";

export type EmailJobStatus = "pending" | "processing" | "sent" | "dead";

export interface IEmailJob extends Document {
  type: EmailJobType;
  bookingId: mongoose.Types.ObjectId;
  attempts: number;
  maxAttempts: number;
  nextAttemptAt: Date;
  status: EmailJobStatus;
  processingStartedAt?: Date;
  claimedBy?: mongoose.Types.ObjectId;
  lastError?: string;
  createdAt: Date;
  updatedAt: Date;
}

const emailJobSchema = new Schema<IEmailJob>(
  {
    type: {
      type: String,
      enum: ["booking_confirmation", "all_recipients_successful"],
      required: true,
    },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    attempts: { type: Number, required: true, default: 0 },
    maxAttempts: { type: Number, required: true, default: 5 },
    nextAttemptAt: { type: Date, required: true, default: Date.now },
    status: {
      type: String,
      enum: ["pending", "processing", "sent", "dead"],
      required: true,
      default: "pending",
    },
    processingStartedAt: { type: Date, required: false },
    claimedBy: { type: mongoose.Schema.Types.ObjectId, required: false },
    lastError: { type: String, required: false },
  },
  { timestamps: true },
);

// Matches exactly the fields the queue's claim query filters on.
emailJobSchema.index({ status: 1, nextAttemptAt: 1 });

export const EmailJob = mongoose.model<IEmailJob>("EmailJob", emailJobSchema);
