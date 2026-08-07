// // run against DEV only — e.g. scramble-dev.js
import { connectDB } from "../config/dbConfig";
import dotenv from "dotenv";
import { Booking } from "../models/bookingModel";
dotenv.config();

async function main() {
  try {
    await connectDB();
    console.log("Connected to the database");

    const bookings = await Booking.find();
    bookings.forEach((b, i) => {
      Booking.updateOne(
        { _id: b._id },
        {
          $set: {
            email: `customer${b._id}@test.local`,
            phone: `+23480000${String(i).padStart(5, "0")}`,
          },
        },
      );
    });
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
}

main();
