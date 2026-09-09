import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "../config/dbConfig";
import { Booking } from "../models/bookingModel";
import { isLegacyBooking } from "../utils/bookingShape";

dotenv.config();

// One-time backfill for the allRecipientsSuccessfulMailSent flag introduced
// alongside the "all recipients successful" email. Without this, every
// existing booking that already has every recipient at callStatus
// "successful" reads the field as its schema default (false) — so the next
// time anyone touches that booking's status (e.g. an admin correcting an old
// record), sendAllRecipientsSuccessfulEmailIfDue would treat it as newly due
// and email a customer about a call that finished long ago.
//
// Run this AFTER migrate-bookings-v2 — it relies on the v2 recipients[]
// shape being populated for every booking.
const isAllSuccessful = (booking: any): boolean => {
  if (isLegacyBooking(booking)) {
    return booking.status === "successful";
  }
  const recipients = booking.recipients ?? [];
  return recipients.length > 0 && recipients.every((r: any) => r.callStatus === "successful");
};

async function backfill() {
  await connectDB();

  const cursor = Booking.find({ allRecipientsSuccessfulMailSent: { $ne: true } }).cursor();

  let scanned = 0;
  let flagged = 0;

  for await (const doc of cursor) {
    scanned++;
    if (isAllSuccessful(doc)) {
      doc.allRecipientsSuccessfulMailSent = true;
      await doc.save();
      flagged++;
    }
  }

  console.log("Backfill summary:");
  console.log(`  scanned: ${scanned}`);
  console.log(`  flagged as already-sent: ${flagged}`);

  await mongoose.disconnect();
  process.exit(0);
}

backfill();
