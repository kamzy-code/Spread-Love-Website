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
import { Recording, IRecording } from "../models/recordingModel";
import { env } from "../config/env";
import { HttpError } from "../utils/httpError";
import { recordingLogger } from "../utils/logger";
import { adminRole } from "../types/genralTypes";

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

    // Consent gate — the one point where an upload can be blocked before any
    // bytes move. Checked first, before any S3 interaction or DB write.
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
  ): Promise<IRecording[]> {
    const query: Record<string, unknown> = {};
    if (filters.bookingId) query.booking = filters.bookingId;
    if (filters.recipientId) query.recipientId = filters.recipientId;
    if (role === "callrep") query.uploadedBy = userId;

    return Recording.find(query).sort({ createdAt: -1 });
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

  // Deletes every file belonging to one expired session from S3, then flips
  // the DB record to "expired" with a deletedAt timestamp — never a hard
  // delete, so there's still an audit trail of what existed. Per-file
  // deletion failures are logged and skipped rather than aborting the whole
  // session, so one bad object doesn't block the rest of the cleanup run.
  private async expireRecording(recording: IRecording): Promise<void> {
    for (const file of recording.files) {
      try {
        await s3Client.send(
          new DeleteObjectCommand({ Bucket: file.s3Bucket, Key: file.s3Key }),
        );
      } catch (error: any) {
        recordingLogger.error("Failed to delete expired recording file from S3", {
          recordingId: recording._id,
          s3Key: file.s3Key,
          error: error.message,
          action: "EXPIRE_RECORDING_S3_DELETE_FAILED",
        });
      }
    }

    recording.status = "expired";
    recording.deletedAt = new Date();
    await recording.save();
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
