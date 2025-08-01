import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routes/authRoute";
import bookingRouter from "./routes/bookingRoute";
import adminRouter from "./routes/adminRoute";
import emailRouter from "./routes/emailRoute";
import logRouter from "./routes/logRouter";
import paymentRouter from "./routes/paymentRoute";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorHandler";
import logger from "./utils/logger";
import { logtail } from "./utils/logger";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      "https://spread-love-website.vercel.app",
      "http://localhost:3000",
      "https://spreadlovenetwork.com",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api", limiter);

app.use((req, res, next) => {
  if (req.originalUrl === "/") {
    next();
    return;
  }

  logger.info(`[${req.method}] ${req.originalUrl}`, {
    service: "requestLogger",
    action: "LOG_REQUEST",
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });

  next();
});

app.get("/", (req, res) => {
  res.send("API is running!");
});

app.use("/api/auth", authRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/rep", adminRouter);
app.use("/api/email", emailRouter);
app.use("/api/logs", logRouter);
app.use("/api/payment", paymentRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

process.on("SIGTERM", async () => {
  await logtail.flush();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await logtail.flush();
  process.exit(0);
});

export default app;
