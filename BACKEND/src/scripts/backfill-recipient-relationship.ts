import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "../config/dbConfig";
import { Booking } from "../models/bookingModel";

dotenv.config();

// One-time backfill for the relationship move (caller -> per-recipient,
// 2026-09-18). Before this, a booking only ever captured ONE relationship
// value for the whole booking — there's no way to reconstruct a genuinely
// different value per historical recipient, so copying that one value onto
// every recipient is the only honest default. New bookings going forward
// get real per-recipient values from the booking form directly.
//
// v1 (legacy, un-migrated) bookings are skipped — they have no recipients[]
// to write into, and their existing flat `relationship` field already
// serves them with no change needed. Run migrate-bookings-v2 first if any
// unmigrated bookings remain.
async function backfill() {
  await connectDB();

  const cursor = Booking.find({
    recipients: { $exists: true, $not: { $size: 0 } },
  }).cursor();

  let scanned = 0;
  let updated = 0;
  let skippedNoSourceValue = 0;

  for await (const doc of cursor) {
    scanned++;

    const sourceRelationship = doc.caller?.relationship;
    if (!sourceRelationship) {
      skippedNoSourceValue++;
      continue;
    }

    const recipientsNeedingBackfill = (doc.recipients ?? []).filter((r) => !r.relationship);
    if (recipientsNeedingBackfill.length === 0) continue;

    for (const recipient of recipientsNeedingBackfill) {
      recipient.relationship = sourceRelationship;
    }
    await doc.save();
    updated++;
  }

  console.log("Backfill summary:");
  console.log(`  scanned (v2-shaped bookings): ${scanned}`);
  console.log(`  updated: ${updated}`);
  console.log(`  skipped (no caller.relationship to copy from): ${skippedNoSourceValue}`);

  await mongoose.disconnect();
  process.exit(0);
}

backfill();
