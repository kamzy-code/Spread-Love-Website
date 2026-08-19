import { z } from "zod";

// Common phone-recorder output formats. Reps are recording calls on their
// own devices, not through the app.
export const ALLOWED_RECORDING_MIME_TYPES = [
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
  "audio/x-m4a",
] as const;

// Generous for a phone-call-length recording — revisit if real reps upload
// something larger.
export const MAX_RECORDING_FILE_SIZE_BYTES = 100 * 1024 * 1024;

export const createUploadUrlSchema = z.object({
  bookingId: z.string().min(1, "bookingId is required"),
  recipientId: z.string().min(1, "recipientId is required"),
  mimeType: z.enum(ALLOWED_RECORDING_MIME_TYPES),
  fileSize: z
    .number()
    .positive("fileSize must be positive")
    .max(
      MAX_RECORDING_FILE_SIZE_BYTES,
      `fileSize must not exceed ${MAX_RECORDING_FILE_SIZE_BYTES} bytes`,
    ),
  // Omit to start a new recording session; provide to add another part to
  // an existing, unlocked session started by the same rep.
  recordingId: z.string().min(1).optional(),
});

export const confirmUploadSchema = z.object({
  s3Key: z.string().min(1, "s3Key is required"),
});

export const listRecordingsQuerySchema = z.object({
  bookingId: z.string().optional(),
  recipientId: z.string().optional(),
});
