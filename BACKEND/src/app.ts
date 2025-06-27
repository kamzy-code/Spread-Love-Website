import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authMiddlewrare, checkRole } from "./middlewares/authMiddleware";
import authRouter from "./routes/authRoute";
import bookingRouter from "./routes/bookingRoute";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

app.use(limiter);

app.get("/", (req, res) => {
  res.send("API is running!");
});

app.use("/api/auth", authRouter);
app.use("/api/booking", bookingRouter);

export default app;
