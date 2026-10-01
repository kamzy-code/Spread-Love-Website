import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "../config/dbConfig";
import bookingService from "../services/bookingService";

dotenv.config();

// Manual trigger for the abandoned-booking cleanup cron job - mirrors
// run-recording-cleanup.ts. Useful for verifying behavior on demand rather
// than waiting for 03:00, or an ops re-run if a scheduled run was ever missed.
//
// Usage: npm run cleanup:abandoned [--dry-run]
//   --dry-run  report what would be healed/deleted without mutating anything.

const dryRun = process.argv.includes("--dry-run");

async function run() {
  await connectDB();

  const result = await bookingService.cleanupAbandonedBookings({ dryRun });

  console.log(`Abandoned-booking cleanup summary${dryRun ? " (dry-run)" : ""}:`);
  console.log(`  healed: ${result.healed}`);
  console.log(`  deleted: ${result.deleted}`);
  console.log(`  skipped: ${result.skipped}`);
  console.log(`  failed: ${result.failed}`);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("Abandoned-booking cleanup failed:", err.message);
  process.exit(1);
});