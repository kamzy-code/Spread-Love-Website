import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authMiddlewrare, checkRole } from "./middlewares/authMiddleware";
import authRouter from "./routes/authRoute";
import bookingRouter from "./routes/bookingRoute";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running!");
});

app.use("/api/auth", authRouter);
app.use("/api/booking", bookingRouter);

export default app;
