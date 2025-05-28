import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Mongo DB connection error: ${err}`);
    process.exit(1); // Exit the process with failure
  }
};
