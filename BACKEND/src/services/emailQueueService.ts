import mongoose from "mongoose";
import { EmailJob, EmailJobType, IEmailJob } from "../models/emailJobModel";
import { Booking } from "../models/bookingModel";
import emailService from "./emailService";
import { emailLogger } from "../utils/logger";

// A job stuck in "processing" past this long means the process that claimed
// it died mid-send — treat it as failed and let another tick reclaim it.
const STALE_PROCESSING_MS = 5 * 60 * 1000;

// Index = attempts already made before this retry (0-based). Exhausted after
// the last entry — attempts >= maxAttempts marks the job dead.
const BACKOFF_MINUTES = [1, 5, 30, 120];

class EmailQueueService {
  // Called from a best-effort send site's catch block. One pending/processing
  // job per (type, booking) at a time — a second failure before the first
  // retry runs shouldn't pile up duplicate jobs.
  async enqueue(
    type: EmailJobType,
    bookingId: mongoose.Types.ObjectId,
    error: string,
  ): Promise<void> {
    const existing = await EmailJob.findOne({
      type,
      bookingId,
      status: { $in: ["pending", "processing"] },
    });
    if (existing) return;

    await EmailJob.create({ type, bookingId, lastError: error });

    emailLogger.info("Email job enqueued for retry", {
      type,
      bookingId: bookingId.toString(),
      action: "EMAIL_JOB_ENQUEUED",
    });
  }

  // Claims every due job in one atomic batch (updateMany, tagged with a
  // per-run id) then fetches exactly what this run claimed — avoids both an
  // N+1 per-job claim query and a double-claim race with another instance or
  // an overlapping tick.
  async processDueJobs(): Promise<void> {
    const now = new Date();
    const staleThreshold = new Date(now.getTime() - STALE_PROCESSING_MS);
    const runId = new mongoose.Types.ObjectId();

    const { modifiedCount } = await EmailJob.updateMany(
      {
        $or: [
          { status: "pending", nextAttemptAt: { $lte: now } },
          { status: "processing", processingStartedAt: { $lte: staleThreshold } },
        ],
      },
      { $set: { status: "processing", processingStartedAt: now, claimedBy: runId } },
    );

    if (modifiedCount === 0) return;

    const jobs = await EmailJob.find({ status: "processing", claimedBy: runId });

    for (const job of jobs) {
      await this.processJob(job);
    }
  }

  private async processJob(job: IEmailJob): Promise<void> {
    try {
      const booking = await Booking.findById(job.bookingId);
      if (!booking) {
        job.status = "dead";
        job.lastError = "Booking no longer exists";
        await job.save();
        return;
      }

      // Reuse the same guarded "IfDue" entry point the original send site
      // called — its own already-sent flag makes this naturally idempotent,
      // so if someone else (an admin resend, a concurrent trigger) already
      // delivered it, this is a no-op rather than a duplicate send.
      const result =
        job.type === "booking_confirmation"
          ? await emailService.sendBookingConfirmationIfDue(booking)
          : await emailService.sendAllRecipientsSuccessfulEmailIfDue(booking);

      job.status = "sent";
      job.lastError = result.sent ? undefined : `Skipped: ${result.reason}`;
      await job.save();

      emailLogger.info("Email job processed", {
        type: job.type,
        bookingId: job.bookingId.toString(),
        sent: result.sent,
        action: "EMAIL_JOB_SENT",
      });
    } catch (error: any) {
      job.attempts += 1;
      job.processingStartedAt = undefined;
      job.claimedBy = undefined;
      job.lastError = error.message;

      if (job.attempts >= job.maxAttempts) {
        job.status = "dead";
        emailLogger.error("Email job exhausted retries, marking dead", {
          type: job.type,
          bookingId: job.bookingId.toString(),
          attempts: job.attempts,
          action: "EMAIL_JOB_DEAD",
        });
      } else {
        const delayMinutes = BACKOFF_MINUTES[job.attempts - 1] ?? BACKOFF_MINUTES[BACKOFF_MINUTES.length - 1];
        job.status = "pending";
        job.nextAttemptAt = new Date(Date.now() + delayMinutes * 60 * 1000);
        emailLogger.warn("Email job failed, scheduled for retry", {
          type: job.type,
          bookingId: job.bookingId.toString(),
          attempts: job.attempts,
          nextAttemptAt: job.nextAttemptAt,
          action: "EMAIL_JOB_RETRY_SCHEDULED",
        });
      }

      await job.save();
    }
  }
}

const emailQueueService = new EmailQueueService();
export default emailQueueService;
