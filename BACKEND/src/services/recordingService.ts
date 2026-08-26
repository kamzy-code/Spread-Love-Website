import mongoose from "mongoose";
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Booking } from "../models/bookingModel";
import { Recording, IRecording, IRatingValue } from "../models/recordingModel";
import { IRatingCriterion } from "../models/ratingTemplateModel";
import ratingTemplateService from "./ratingTemplateService";
import emailService from "./emailService";
import { env } from "../config/env";
import { HttpError } from "../utils/httpError";
import { recordingLogger } from "../utils/logger";
import { adminRole } from "../types/genralTypes";
import { computeRatingScore, IRatingScore } from "../utils/ratingScore";

// Internal security parameter for the upload URL itself
const UPLOAD_URL_TTL_SECONDS = 5 * 60;

// Longer than the upload URL's TTL since a QC review session can run long —
// the frontend re-fetches silently on playback failure rather than
// surfacing an "expired link" error to the admin.
const PLAYBACK_URL_TTL_SECONDS = 60 * 60;

const EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/wav": "wav",
  "audio/x-m4a": "m4a",
};

const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials:
    env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
});

class RecordingService {
  async requestUploadUrl(
    userId: string,
    params: {
      bookingId: string;
      recipientId: string;
      mimeType: string;
      fileSize: number;
      recordingId?: string;
    },
  ): Promise<{ recordingId: string; s3Key: string; uploadUrl: string }> {
    const { bookingId, recipientId, mimeType, fileSize, recordingId } = params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new HttpError(404, "Booking not found");
    }

    const recipient = booking.recipients?.find(
      (r) => r._id?.toString() === recipientId,
    );
    if (!recipient) {
      throw new HttpError(404, "Recipient not found on this booking");
    }

    // Consent and call-status gates — both checked before any S3
    // interaction or DB write, so a blocked upload never leaves a stray
    // pending_upload session behind.
    if (recipient.callRecording !== "yes") {
      recordingLogger.warn("Upload blocked: recipient has not consented to recording", {
        bookingId,
        recipientId,
        action: "REQUEST_UPLOAD_URL_CONSENT_BLOCKED",
      });
      throw new HttpError(
        403,
        "Recording upload is blocked: this recipient has not consented to call recording.",
      );
    }

    // A recording only makes sense for a call that actually happened —
    // blocks uploads against pending/assigned/rejected/rescheduled/
    // unsuccessful recipients, not just missing consent.
    if (recipient.callStatus !== "successful") {
      recordingLogger.warn("Upload blocked: call has not been completed", {
        bookingId,
        recipientId,
        callStatus: recipient.callStatus,
        action: "REQUEST_UPLOAD_URL_CALL_STATUS_BLOCKED",
      });
      throw new HttpError(
        403,
        `Recording upload is blocked: this call hasn't been completed yet (status: ${recipient.callStatus ?? "pending"}).`,
      );
    }

    let recording: IRecording;
    let partNumber: number;

    if (recordingId) {
      const existing = await Recording.findById(recordingId);
      if (
        !existing ||
        existing.booking.toString() !== bookingId ||
        existing.recipientId?.toString() !== recipientId
      ) {
        throw new HttpError(404, "Recording session not found for this booking/recipient");
      }
      if (existing.uploadedBy.toString() !== userId) {
        throw new HttpError(
          403,
          "Only the rep who started this recording can add another part to it",
        );
      }
      if (existing.locked) {
        throw new HttpError(
          409,
          "This recording has already been approved and can no longer accept new parts",
        );
      }
      recording = existing;
      partNumber = recording.files.length + 1;
    } else {
      recording = await Recording.create({
        booking: new mongoose.Types.ObjectId(bookingId),
        recipientId: new mongoose.Types.ObjectId(recipientId),
        uploadedBy: new mongoose.Types.ObjectId(userId),
        files: [],
        status: "pending_upload",
        // Placeholder until the first file is actually confirmed — a
        // pending_upload session with no files isn't "live" yet, but the
        // field is required on the schema, so seed it and overwrite for
        // real at confirm-time.
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      partNumber = 1;
    }

    const extension = EXTENSION_BY_MIME_TYPE[mimeType] ?? "bin";
    const s3Key = `recordings/${bookingId}/${recipientId}/${recording._id}/${partNumber}.${extension}`;

    let uploadUrl: string;
    try {
      uploadUrl = await getSignedUrl(
        s3Client,
        new PutObjectCommand({
          Bucket: env.AWS_S3_BUCKET,
          Key: s3Key,
          ContentType: mimeType,
          ContentLength: fileSize,
        }),
        { expiresIn: UPLOAD_URL_TTL_SECONDS },
      );
    } catch (error: any) {
      // Only the brand-new-session branch leaves anything to clean up — an
      // existing session (recordingId was provided) predates this call and
      // must not be deleted just because signing failed for this one part.
      if (!recordingId) {
        await Recording.deleteOne({ _id: recording._id });
      }
      recordingLogger.error("Failed to generate upload URL", {
        bookingId,
        recipientId,
        recordingId: recording._id,
        error: error.message,
        action: "REQUEST_UPLOAD_URL_SIGNING_FAILED",
      });
      throw new HttpError(502, "Could not prepare the upload right now. Please try again shortly.");
    }

    recordingLogger.info("Upload URL issued", {
      bookingId,
      recipientId,
      recordingId: recording._id,
      partNumber,
      action: "REQUEST_UPLOAD_URL_SUCCESS",
    });

    return { recordingId: recording._id!.toString(), s3Key, uploadUrl };
  }

  async confirmUpload(userId: string, recordingId: string, s3Key: string): Promise<IRecording> {
    const recording = await Recording.findById(recordingId);
    if (!recording) {
      throw new HttpError(404, "Recording session not found");
    }
    if (recording.uploadedBy.toString() !== userId) {
      throw new HttpError(403, "Only the rep who started this recording can confirm its upload");
    }
    if (!s3Key.startsWith(`recordings/${recording.booking.toString()}/`)) {
      throw new HttpError(400, "s3Key does not belong to this recording");
    }
    if (recording.files.some((f) => f.s3Key === s3Key)) {
      throw new HttpError(409, "This part has already been confirmed");
    }

    // Verify the upload actually landed in S3 — rather than trust the
    // client's mimeType/fileSize a second time, read them back from the
    // object itself. This also means a confirm call without a real prior
    // upload fails here instead of creating a phantom "uploaded" part.
    let head;
    try {
      head = await s3Client.send(
        new HeadObjectCommand({ Bucket: env.AWS_S3_BUCKET, Key: s3Key }),
      );
    } catch (error: any) {
      // Distinguish "the object genuinely isn't there yet" (S3 answers with
      // a real 404/NotFound — a client-side timing issue, safe to surface
      // as a friendly retry) from anything else (S3 client misconfigured,
      // network error, etc. — a server-side problem, don't imply the rep
      // did something wrong).
      const isGenuineNotFound =
        error.name === "NotFound" || error?.$metadata?.httpStatusCode === 404;

      recordingLogger.warn("Confirm upload: HeadObject failed", {
        recordingId,
        s3Key,
        error: error.message,
        isGenuineNotFound,
        action: "CONFIRM_UPLOAD_HEAD_FAILED",
      });

      if (isGenuineNotFound) {
        throw new HttpError(
          400,
          "Upload not found — the file may not have finished uploading. Please try again.",
        );
      }
      throw new HttpError(502, "Could not verify the upload right now. Please try again shortly.");
    }

    const isFirstFile = recording.files.length === 0;
    const partNumber = recording.files.length + 1;

    recording.files.push({
      s3Key,
      s3Bucket: env.AWS_S3_BUCKET as string,
      mimeType: head.ContentType || "application/octet-stream",
      fileSize: head.ContentLength || 0,
      partNumber,
      uploadedAt: new Date(),
    });

    if (isFirstFile) {
      recording.status = "uploaded";
      recording.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    const saved = await recording.save();

    recordingLogger.info("Recording part confirmed", {
      recordingId,
      partNumber,
      isFirstFile,
      action: "CONFIRM_UPLOAD_SUCCESS",
    });

    return saved;
  }

  // Serves both the booking-details panel (filtered by bookingId+recipientId)
  // and, later, the QC route (unfiltered/status-filtered) off the same
  // query — tiered visibility is applied here, not left to the caller, so
  // it can't be bypassed by a client simply omitting a filter.
  async listRecordings(
    userId: string,
    role: adminRole,
    filters: { bookingId?: string; recipientId?: string },
  ) {
    const query: Record<string, unknown> = {};
    if (filters.bookingId) query.booking = filters.bookingId;
    if (filters.recipientId) query.recipientId = filters.recipientId;
    if (role === "callrep") query.uploadedBy = userId;

    const recordings = await Recording.find(query).sort({ createdAt: -1 });
    return recordings.map((r) => this.withScore(r, role));
  }

  // Scoring reads the recording's own frozen ratingCriteriaSnapshot, so
  // this never needs an extra template lookup/query, however many
  // recordings are in the list. Call reps can see that their own recording
  // was reviewed/approved (status fields), but not the QC judgment itself —
  // score, submitted values, criteria snapshot, or who reviewed/approved it.
  // Only rate/approve/unapprove (superadmin/salesrep-only routes) return the
  // unredacted shape, and a call rep can never reach those.
  private withScore(recording: IRecording, role: adminRole) {
    const withComputedScore = {
      ...recording.toObject(),
      score: computeRatingScore(recording.ratingCriteriaSnapshot, recording.ratingValues),
    };

    if (role !== "callrep") return withComputedScore;

    const { score, ratingValues, ratingCriteriaSnapshot, reviewedBy, approvedBy, ...redacted } =
      withComputedScore;
    return redacted;
  }

  async getPlaybackUrl(
    userId: string,
    role: adminRole,
    recordingId: string,
    fileId: string,
  ): Promise<{ url: string; expiresIn: number }> {
    const recording = await Recording.findById(recordingId);
    // 404 (not 403) for a call rep hitting another rep's recording — doesn't
    // confirm the recording's existence to someone unauthorized to see it.
    if (!recording || (role === "callrep" && recording.uploadedBy.toString() !== userId)) {
      throw new HttpError(404, "Recording not found");
    }

    const file = recording.files.find((f) => f._id?.toString() === fileId);
    if (!file) {
      throw new HttpError(404, "File not found on this recording");
    }

    try {
      const url = await getSignedUrl(
        s3Client,
        new GetObjectCommand({ Bucket: file.s3Bucket, Key: file.s3Key }),
        { expiresIn: PLAYBACK_URL_TTL_SECONDS },
      );
      return { url, expiresIn: PLAYBACK_URL_TTL_SECONDS };
    } catch (error: any) {
      recordingLogger.error("Failed to generate playback URL", {
        recordingId,
        fileId,
        error: error.message,
        action: "GET_PLAYBACK_URL_FAILED",
      });
      throw new HttpError(502, "Could not load this recording right now. Please try again shortly.");
    }
  }

  // Feeds the public GET /booking/:bookingId response (bookingController) —
  // the only place an approved recording is exposed to the customer, keyed
  // by recipientId since a booking can have multiple recipients each with
  // their own recording. Deliberately narrow: approved + uploaded only,
  // never an unreviewed or since-deleted/expired recording. Returns an
  // empty map (no S3 calls at all) when the booking has no approved
  // recordings yet — the common case for most public lookups.
  async getApprovedRecordingsByBooking(
    bookingId: mongoose.Types.ObjectId | string,
  ): Promise<Map<string, { files: { url: string; partNumber: number }[] }>> {
    const recordings = await Recording.find({
      booking: bookingId,
      approved: true,
      status: "uploaded",
    });

    const result = new Map<string, { files: { url: string; partNumber: number }[] }>();
    if (recordings.length === 0) return result;

    for (const recording of recordings) {
      if (!recording.recipientId) continue;

      const files = await Promise.all(
        recording.files
          .slice()
          .sort((a, b) => a.partNumber - b.partNumber)
          .map(async (file) => ({
            url: await getSignedUrl(
              s3Client,
              new GetObjectCommand({ Bucket: file.s3Bucket, Key: file.s3Key }),
              { expiresIn: PLAYBACK_URL_TTL_SECONDS },
            ),
            partNumber: file.partNumber,
          })),
      );

      result.set(recording.recipientId.toString(), { files });
    }

    return result;
  }

  // Validates each submitted value against the recording's pinned criteria
  // snapshot (existence, options/multiple shape, valid option values) and
  // returns the validated, de-duplicated list. Throws HttpError(400) on the
  // first problem found.
  private validateRatingValues(
    criteria: IRatingCriterion[],
    ratingValues: { criterionKey: string; value: string | string[] }[],
  ): IRatingValue[] {
    const seenKeys = new Set<string>();
    return ratingValues.map(({ criterionKey, value }) => {
      if (seenKeys.has(criterionKey)) {
        throw new HttpError(400, `Duplicate rating value for criterion "${criterionKey}"`);
      }
      seenKeys.add(criterionKey);

      const criterion = criteria.find((c) => c.key === criterionKey);
      if (!criterion) {
        throw new HttpError(400, `Unknown rating criterion "${criterionKey}"`);
      }

      if (criterion.type === "text") {
        if (typeof value !== "string") {
          throw new HttpError(400, `"${criterion.label}" expects a text value`);
        }
        return { criterionKey, value };
      }

      const optionValues = new Set((criterion.options ?? []).map((o) => o.value));

      if (criterion.multiple) {
        if (!Array.isArray(value) || value.some((v) => !optionValues.has(v))) {
          throw new HttpError(400, `"${criterion.label}" expects one or more valid options`);
        }
      } else {
        if (typeof value !== "string" || !optionValues.has(value)) {
          throw new HttpError(400, `"${criterion.label}" expects a single valid option`);
        }
      }

      return { criterionKey, value };
    });
  }

  async submitRating(
    userId: string,
    recordingId: string,
    ratingValues: { criterionKey: string; value: string | string[] }[],
  ): Promise<{ recording: IRecording; score: IRatingScore }> {
    const recording = await Recording.findById(recordingId);
    if (!recording) {
      throw new HttpError(404, "Recording not found");
    }
    if (recording.status !== "uploaded") {
      throw new HttpError(400, "This recording has no confirmed audio to rate yet");
    }
    if (recording.approved) {
      throw new HttpError(409, "This recording is already approved — unapprove it before changing the rating");
    }

    // First rating pins the template and freezes its criteria; a later
    // re-rating (before approval) stays against that same snapshot even if
    // a different template has since been activated.
    if (!recording.ratingTemplate) {
      const template = await ratingTemplateService.getActiveTemplate();
      if (!template) {
        throw new HttpError(400, "No active rating template is configured");
      }
      recording.ratingTemplate = template._id as mongoose.Types.ObjectId;
      recording.ratingCriteriaSnapshot = template.criteria;
    }

    recording.ratingValues = this.validateRatingValues(
      recording.ratingCriteriaSnapshot,
      ratingValues,
    );
    recording.reviewed = true;
    recording.reviewedAt = new Date();
    recording.reviewedBy = new mongoose.Types.ObjectId(userId);

    const saved = await recording.save();

    recordingLogger.info("Recording rated", {
      recordingId,
      criteriaRated: recording.ratingValues.length,
      action: "SUBMIT_RATING_SUCCESS",
    });

    return { recording: saved, score: computeRatingScore(saved.ratingCriteriaSnapshot, saved.ratingValues) };
  }

  async approveRecording(
    userId: string,
    recordingId: string,
  ): Promise<{ recording: IRecording; score: IRatingScore }> {
    const recording = await Recording.findById(recordingId);
    if (!recording) {
      throw new HttpError(404, "Recording not found");
    }
    if (!recording.reviewed) {
      throw new HttpError(400, "Rate this recording before approving it");
    }

    const ratedKeys = new Set(recording.ratingValues.map((rv) => rv.criterionKey));
    const missing = recording.ratingCriteriaSnapshot
      .filter((c) => c.type === "options" && !ratedKeys.has(c.key))
      .map((c) => c.label);
    if (missing.length > 0) {
      throw new HttpError(400, `Complete the rating for all criteria before approving: ${missing.join(", ")}`);
    }

    recording.approved = true;
    recording.approvedAt = new Date();
    recording.approvedBy = new mongoose.Types.ObjectId(userId);
    recording.locked = true;

    const saved = await recording.save();

    recordingLogger.info("Recording approved", {
      recordingId,
      action: "APPROVE_RECORDING_SUCCESS",
    });

    return { recording: saved, score: computeRatingScore(saved.ratingCriteriaSnapshot, saved.ratingValues) };
  }

  async unapproveRecording(
    userId: string,
    recordingId: string,
  ): Promise<{ recording: IRecording; score: IRatingScore }> {
    const recording = await Recording.findById(recordingId);
    if (!recording) {
      throw new HttpError(404, "Recording not found");
    }
    if (!recording.approved) {
      throw new HttpError(400, "This recording is not currently approved");
    }

    recording.approved = false;
    recording.approvedAt = undefined;
    recording.approvedBy = undefined;
    recording.locked = false;

    const saved = await recording.save();

    recordingLogger.info("Recording unapproved", {
      recordingId,
      unapprovedBy: userId,
      action: "UNAPPROVE_RECORDING_SUCCESS",
    });

    return { recording: saved, score: computeRatingScore(saved.ratingCriteriaSnapshot, saved.ratingValues) };
  }

  // Shared by expireRecording and deleteRecording — deletes every S3 object
  // belonging to a recording. Per-file failures are logged and skipped
  // rather than thrown, so one bad object doesn't block removing the rest.
  private async removeFilesFromS3(recording: IRecording, failureAction: string): Promise<void> {
    for (const file of recording.files) {
      try {
        await s3Client.send(
          new DeleteObjectCommand({ Bucket: file.s3Bucket, Key: file.s3Key }),
        );
      } catch (error: any) {
        recordingLogger.error("Failed to delete recording file from S3", {
          recordingId: recording._id,
          s3Key: file.s3Key,
          error: error.message,
          action: failureAction,
        });
      }
    }
  }

  // Deletes every file belonging to one expired session from S3, then flips
  // the DB record to "expired" with a deletedAt timestamp — never a hard
  // delete, so there's still an audit trail of what existed.
  private async expireRecording(recording: IRecording): Promise<void> {
    await this.removeFilesFromS3(recording, "EXPIRE_RECORDING_S3_DELETE_FAILED");
    recording.status = "expired";
    recording.deletedAt = new Date();
    await recording.save();
  }

  // Manual counterpart to expireRecording — same soft-delete shape (S3
  // objects removed, DB row kept with deletedAt/deletedBy for audit), but
  // person-initiated and permission-gated rather than age-triggered:
  // - superadmin can delete any recording, any time.
  // - the uploader can delete their own, but only before it's approved —
  //   once approved, the rating is a signed-off record, not theirs alone
  //   to remove.
  async deleteRecording(userId: string, role: adminRole, recordingId: string): Promise<IRecording> {
    const recording = await Recording.findById(recordingId);
    if (!recording) {
      throw new HttpError(404, "Recording not found");
    }
    if (recording.status === "deleted" || recording.status === "expired") {
      throw new HttpError(409, "This recording has already been removed");
    }

    if (role !== "superadmin") {
      if (recording.uploadedBy.toString() !== userId) {
        throw new HttpError(403, "You can only delete recordings you uploaded");
      }
      if (recording.approved) {
        throw new HttpError(
          403,
          "This recording has been approved — only a superadmin can delete it now.",
        );
      }
    }

    await this.removeFilesFromS3(recording, "DELETE_RECORDING_S3_DELETE_FAILED");

    recording.status = "deleted";
    recording.deletedAt = new Date();
    recording.deletedBy = new mongoose.Types.ObjectId(userId);

    const saved = await recording.save();

    recordingLogger.info("Recording deleted", {
      recordingId,
      deletedBy: userId,
      role,
      action: "DELETE_RECORDING_SUCCESS",
    });

    return saved;
  }

  // Emails the customer a link to the public /manage page, where their
  // approved recording is now visible (see bookingController's
  // getApprovedRecordingsByBooking merge). No "already sent" guard, unlike
  // booking confirmation — a rep may legitimately need to resend.
  async sendRecordingEmail(userId: string, recordingId: string): Promise<IRecording> {
    const recording = await Recording.findById(recordingId);
    if (!recording) {
      throw new HttpError(404, "Recording not found");
    }
    if (!recording.approved) {
      throw new HttpError(400, "Only approved recordings can be sent to the customer");
    }

    const booking = await Booking.findById(recording.booking);
    if (!booking) {
      throw new HttpError(404, "Booking not found for this recording");
    }

    const to = booking.caller?.email || booking.callerEmail;
    if (!to) {
      throw new HttpError(400, "This booking has no caller email on file");
    }

    const recipient = booking.recipients?.find(
      (r) => r._id?.toString() === recording.recipientId?.toString(),
    );
    const recipientName = recipient?.recipientName ?? "your recipient";
    const manageLink = `${env.MANAGE_BOOKING_URL}?id=${booking.bookingId}`;

    try {
      await emailService.sendRecordingReadyEmail(to, booking, recipientName, manageLink);
      recording.emailDelivery = { status: "sent", sentAt: new Date() };
    } catch (error: any) {
      recording.emailDelivery = { status: "failed", error: error.message };
      await recording.save();
      throw error;
    }

    const saved = await recording.save();

    recordingLogger.info("Recording-ready email sent", {
      recordingId,
      bookingId: booking.bookingId,
      sentBy: userId,
      action: "SEND_RECORDING_EMAIL_SUCCESS",
    });

    return saved;
  }

  // Entry point for the scheduled cleanup job (BACKEND/src/jobs/
  // recordingCleanupJob.ts) — Iterates via a cursor rather than loading 
  // every expired session into memory at once.
  async cleanupExpiredRecordings(): Promise<{ expired: number; failed: number }> {
    const cursor = Recording.find({
      status: "uploaded",
      expiresAt: { $lte: new Date() },
    }).cursor();

    let expired = 0;
    let failed = 0;

    for await (const recording of cursor) {
      try {
        await this.expireRecording(recording);
        expired += 1;
      } catch (error: any) {
        failed += 1;
        recordingLogger.error("Failed to expire recording", {
          recordingId: recording._id,
          error: error.message,
          action: "CLEANUP_EXPIRED_RECORDINGS_FAILED",
        });
      }
    }

    recordingLogger.info("Recording cleanup run complete", {
      expired,
      failed,
      action: "CLEANUP_EXPIRED_RECORDINGS_SUCCESS",
    });

    return { expired, failed };
  }
}

const recordingService = new RecordingService();
export default recordingService;
