import cron from "node-cron";
import bookingService from "../services/bookingService";
import { bookingLogger } from "../utils/logger";

// Daily at 03:00 (server TZ — Render defaults to UTC unless configured
// otherwise). Off-peak, well past the 60-min reuse window and the multi-day
// webhook delivery grace left by the 7-day age threshold in the service.
const CLEANUP_SCHEDULE = "0 3 * * *";

export function startAbandonedBookingCleanupJob(): void {
  cron.schedule(CLEANUP_SCHEDULE, async () => {
    try {
      await bookingService.cleanupAbandonedBookings();
    } catch (error: any) {
      bookingLogger.error("Abandoned-booking cleanup job run failed", {
        error: error.message,
        action: "ABANDONED_CLEANUP_JOB_FAILED",
      });
    }
  });

  bookingLogger.info("Abandoned-booking cleanup job scheduled", {
    schedule: CLEANUP_SCHEDULE,
    action: "ABANDONED_CLEANUP_JOB_SCHEDULED",
  });
}