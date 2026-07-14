import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "../config/dbConfig";
import { Booking } from "../models/bookingModel";
import { Customer } from "../models/customerModel";
import { computeTier } from "../utils/customerTier";

dotenv.config();

interface CustomerAggregate {
  _id: string;
  name: string;
  phone: string;
  completedBookings: number;
  lastBookingAt: Date;
}

async function seed() {
  await connectDB();

  const results: CustomerAggregate[] = await Booking.aggregate([
    { $match: { "caller.email": { $exists: true, $ne: "" } } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$caller.email",
        name: { $first: "$caller.name" },
        phone: { $first: "$caller.phone" },
        completedBookings: {
          $sum: { $cond: [{ $eq: ["$bookingStatus", "completed"] }, 1, 0] },
        },
        lastBookingAt: { $max: "$createdAt" },
      },
    },
  ]);

  if (results.length === 0) {
    console.log("No bookings with caller.email found — run migrate-bookings-v2 first.");
    await mongoose.disconnect();
    process.exit(0);
  }

  const bulkOps = results.map((r) => ({
    updateOne: {
      filter: { email: r._id.toLowerCase() },
      update: {
        $set: {
          email: r._id.toLowerCase(),
          name: r.name,
          phone: r.phone,
          completedBookings: r.completedBookings,
          tier: computeTier(r.completedBookings),
          lastBookingAt: r.lastBookingAt,
        },
      },
      upsert: true,
    },
  }));

  const result = await Customer.bulkWrite(bulkOps);

  console.log("Customer seed summary:");
  console.log(`  customers grouped: ${results.length}`);
  console.log(`  upserted: ${result.upsertedCount}`);
  console.log(`  updated: ${result.modifiedCount}`);

  await mongoose.disconnect();
  process.exit(0);
}

seed();
