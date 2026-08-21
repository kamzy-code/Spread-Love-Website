import cron from "node-cron";
import recordingService from "../services/recordingService";
import { recordingLogger } from "../utils/logger";

// Daily at 03:00 (server TZ — Render defaults to UTC unless configured
// otherwise). Off-peak, arbitrary choice.
const CLEANUP_SCHEDULE = "0 3 * * *";

export function startRecordingCleanupJob(): void {
  cron.schedule(CLEANUP_SCHEDULE, async () => {
    try {
      await recordingService.cleanupExpiredRecordings();
    } catch (error: any) {
      recordingLogger.error("Recording cleanup job run failed", {
        error: error.message,
        action: "RECORDING_CLEANUP_JOB_FAILED",
      });
    }
  });

  recordingLogger.info("Recording cleanup job scheduled", {
    schedule: CLEANUP_SCHEDULE,
    action: "RECORDING_CLEANUP_JOB_SCHEDULED",
  });
}
