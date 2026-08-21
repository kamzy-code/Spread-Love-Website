import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "../config/dbConfig";
import recordingService from "../services/recordingService";

dotenv.config();

// Manual trigger for the cleanup cron job - useful for verifying
// behavior on demand rather than waiting for 03:00, or for an ops re-run if
// a scheduled run was ever missed.
async function run() {
  await connectDB();

  const result = await recordingService.cleanupExpiredRecordings();

  console.log("Recording cleanup summary:");
  console.log(`  expired: ${result.expired}`);
  console.log(`  failed: ${result.failed}`);

  await mongoose.disconnect();
  process.exit(0);
}

run();
