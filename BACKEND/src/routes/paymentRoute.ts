import express from "express";
import paymentController from "../controllers/paymentController";

const router = express.Router();

router.post("/initialize/:bookingId", paymentController.initializeTransaction);

router.use((req, res) => {
  res.status(404).json({ message: "Payment route not found" });
});
export default router;