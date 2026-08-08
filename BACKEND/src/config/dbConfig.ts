import mongoose from "mongoose";
import logger from "../utils/logger";
import { env } from "./env";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI);
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
