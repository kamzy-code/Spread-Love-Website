import mongoose from "mongoose";
import crypto from "crypto";
import { connectDB } from "../config/dbConfig";
import { Booking } from "../models/bookingModel";
import dotenv from "dotenv";
dotenv.config();

// Manual webhook test: builds a signed charge.success payload for a real
// booking (using the booking's actual paymentReference and totalPrice) and
// POSTs it to the webhook endpoint. Useful for exercising the full handler
// against localhost without a public tunnel, and for testing redelivery
// idempotency with --repeat.
//
// Usage: npm run webhook:test -- <bookingId> [targetUrl] [--repeat N]
//   bookingId  the booking to fabricate the event for (SLN-xxx)
//   targetUrl  optional webhook base URL (defaults to localhost:PORT)
//   --repeat N send the exact same payload N times (default 1)

const DEFAULT_TARGET = `http://localhost:${process.env.PORT || 5001}/api/payment/webhook`;

async function deliver(body: string, target: string, bookingId: string) {
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_SECRET!;
  const signature = crypto
    .createHmac("sha512", secret)
    .update(body)
    .digest("hex");

  const res = await fetch(target, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-paystack-signature": signature,
    },
    body,
  });

  const text = await res.text();
  console.log(`[${bookingId}] POST ${target} -> ${res.status} ${text}`);
  return res;
}

async function run() {
  const rawArgs = process.argv.slice(2);
  const positional: string[] = [];
  let repeats = 1;

  for (let i = 0; i < rawArgs.length; i++) {
    if (rawArgs[i] === "--repeat") {
      repeats = Number(rawArgs[i + 1]) || 1;
      i++;
    } else {
      positional.push(rawArgs[i]);
    }
  }

  const [bookingId, targetArg] = positional;

  if (!bookingId) {
    console.error("Usage: npm run webhook:test -- <bookingId> [targetUrl] [--repeat N]");
    process.exit(1);
  }

  const target = targetArg || process.env.WEBHOOK_TARGET || DEFAULT_TARGET;

  await connectDB();

  const booking = await Booking.findOne({ bookingId });
  if (!booking) {
    console.error(`No booking found with bookingId: ${bookingId}`);
    process.exit(1);
  }

  // Mirrors paymentService.initializePaymentForBooking: the canonical
  // reference is the stored paymentReference (may carry -rN for re-used
  // bookings); first-payment/legacy bookings fall back to the bookingId.
  const reference = booking.paymentReference || booking.bookingId;
  const price = booking.totalPrice ?? Number(booking.price);

  if (!price || Number.isNaN(price)) {
    console.error(`Booking ${bookingId} has no valid price`);
    process.exit(1);
  }

  const amount = Math.round(price * 100); // kobo

  const body = JSON.stringify({
    event: "charge.success",
    data: {
      reference,
      amount,
      status: "success",
    },
  });

  console.log(`Booking:   ${bookingId}`);
  console.log(`Reference: ${reference}`);
  console.log(`Amount:    ${amount} kobo (₦${price})`);
  console.log(`Payload:   ${body}`);
  console.log("");

  for (let i = 0; i < repeats; i++) {
    const label = repeats > 1 ? `delivery ${i + 1}/${repeats}` : "delivery";
    console.log(`${label}:`);
    await deliver(body, target, bookingId);
  }

  const after = await Booking.findOne({ bookingId }).select("paymentStatus paymentReference");
  console.log("");
  console.log(`Booking now: paymentStatus=${after?.paymentStatus}, paymentReference=${after?.paymentReference}`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Webhook test failed:", err.message);
  process.exit(1);
});