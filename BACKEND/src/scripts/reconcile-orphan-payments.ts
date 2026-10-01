import mongoose from "mongoose";
import { connectDB } from "../config/dbConfig";
import { Booking } from "../models/bookingModel";
import paymentService from "../services/paymentService";
import { paymentLogger } from "../utils/logger";
import dotenv from "dotenv";
dotenv.config();

// One-time recovery for bookings orphaned by the old checkout "reuse" bug:
// re-use recycled the booking document and REPLACED its paymentReference, so
// a payment that succeeded on an earlier reference could never be matched.
//
// Paystack references are deterministic per booking: the first attempt uses
// the bookingId, then recycle #N mints `<bookingId>-rN`. Since reuseCount is
// stored, every reference a booking ever used is enumerable; verifying each
// and crediting any that actually succeeded heals those orphaned payments.
//
// Usage: npm run reconcile:payments [--dry-run]
//   --dry-run  report matches without marking anything paid (default is live)
//
// Safety: unlike webhook:test this does NOT fabricate an event — it only
// credits bookings whose own Paystack reference genuinely reports success.
// It still fires the confirmation email + tier hook via markBookingPaid.

const dryRun = process.argv.includes("--dry-run");

async function run() {
  await connectDB();

  const bookings = await Booking.find({
    reuseCount: { $gte: 1 },
    paymentStatus: { $ne: "paid" },
  }).select("bookingId paymentReference reuseCount totalPrice price");

  console.log(`Candidate bookings (recycled, unpaid): ${bookings.length}`);

  let credited = 0;
  let matchedButWarned = 0;

  for (const booking of bookings) {
    const candidates: string[] = [];
    for (let n = 0; n <= (booking.reuseCount ?? 0); n++) {
      candidates.push(n === 0 ? booking.bookingId : `${booking.bookingId}-r${n}`);
    }

    for (const reference of candidates) {
      let result: any;
      try {
        result = await paymentService.verifyTransaction(reference);
      } catch (error: any) {
        paymentLogger.warn("Reconcile: verify failed", {
          bookingId: booking.bookingId,
          reference,
          error: error.message,
          action: "RECONCILE_VERIFY_ERROR",
        });
        continue;
      }

      if (result?.data?.status !== "success") continue;

      if (dryRun) {
        console.log(
          `[dry-run] ${booking.bookingId}: reference ${reference} is SUCCESS — would mark paid`
        );
        matchedButWarned++;
        break;
      }

      await paymentService.markBookingPaid(booking, reference);
      console.log(
        `[credit] ${booking.bookingId}: marked paid on reference ${reference}`
      );
      credited++;
      break; // one success is enough — the booking is paid
    }
  }

  console.log(`Reconcile done: ${credited} credited${dryRun ? ` (dry-run, ${matchedButWarned} would be credited)` : ""}`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Reconcile failed:", err.message);
  process.exit(1);
});