import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "../config/dbConfig";
import { Booking, IRecipient } from "../models/bookingModel";
import { callStatus } from "../types/genralTypes";

dotenv.config();

const TERMINAL_STATUSES: callStatus[] = ["successful", "unsuccessful", "rejected"];

const deriveBookingStatus = (status?: callStatus): "pending" | "completed" => {
  return status && TERMINAL_STATUSES.includes(status) ? "completed" : "pending";
};

async function migrate() {
  await connectDB();

  const cursor = Booking.find({
    $or: [{ recipients: { $exists: false } }, { recipients: { $size: 0 } }],
  }).cursor();

  let scanned = 0;
  let migrated = 0;
  let errored = 0;

  for await (const doc of cursor) {
    scanned++;

    try {
      const recipient: IRecipient = {
        recipientName: doc.recipientName ?? "",
        recipientPhone: doc.recipientPhone ?? "",
        country: doc.country ?? "",
        occassion: doc.occassion as IRecipient["occassion"],
        callType: doc.callType as IRecipient["callType"],
        callDate: doc.callDate as Date,
        price: Number(doc.price) || 0,
        message: doc.message,
        specialInstruction: doc.specialInstruction,
        callStatus: doc.status,
        callRecording: doc.callRecording,
        callRecordingURL: doc.callRecordingURL,
      };

      doc.caller = {
        name: doc.callerName ?? "",
        phone: doc.callerPhone ?? "",
        email: doc.callerEmail ?? "",
        relationship: doc.relationship,
      };
      doc.recipients = [recipient];
      doc.bookingStatus = deriveBookingStatus(doc.status);
      doc.totalPrice = Number(doc.price) || 0;
      doc.reuseCount = doc.reuseCount ?? 0;

      await doc.save();
      migrated++;
    } catch (err: any) {
      errored++;
      console.error(`Failed to migrate booking ${doc.bookingId}: ${err.message}`);
    }
  }

  console.log("Migration summary:");
  console.log(`  scanned: ${scanned}`);
  console.log(`  migrated: ${migrated}`);
  console.log(`  errored: ${errored}`);

  await mongoose.disconnect();
  process.exit(errored > 0 ? 1 : 0);
}

migrate();
