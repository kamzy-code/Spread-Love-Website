import cron from "node-cron";
import emailQueueService from "../services/emailQueueService";
import { emailLogger } from "../utils/logger";

// Every minute — job volume here is a handful of transactional emails a day,
// so the tight interval costs nothing and keeps retry latency low.
const RETRY_SCHEDULE = "* * * * *";

export function startEmailQueueJob(): void {
  cron.schedule(RETRY_SCHEDULE, async () => {
    try {
      await emailQueueService.processDueJobs();
    } catch (error: any) {
      emailLogger.error("Email queue job run failed", {
        error: error.message,
        action: "EMAIL_QUEUE_JOB_FAILED",
      });
    }
  });

  emailLogger.info("Email queue retry job scheduled", {
    schedule: RETRY_SCHEDULE,
    action: "EMAIL_QUEUE_JOB_SCHEDULED",
  });
}
