import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "../utils/logger";

dotenv.config();

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string);
    logger.info(`MongoDB connected: ${conn.connection.host}`, {
      service: "dbService",
      action: "CONNECT_DB_SUCCESS"
    });
  } catch (err: any) {
    logger.error(`Mongo DB connection error: ${err.message}`, {
      stack: err.stack,
      service: "dbService",
      action: "CONNECT_DB_FAILED"
    });
    process.exit(1); // Exit the process with failure
  }
};
