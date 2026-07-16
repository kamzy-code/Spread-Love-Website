import express from "express";
import paymentController from "../controllers/paymentController";
import { validateQuery, validateParams } from "../middlewares/validateRequest";
import {
  initializeTransactionParamsSchema,
  initializeTransactionQuerySchema,
  verifyPaymentQuerySchema,
} from "../validation/paymentSchemas";

const router = express.Router();

router.get(
  "/verify-payment",
  validateQuery(verifyPaymentQuerySchema),
  paymentController.verifyPaymentController
);
router.post(
  "/initialize/:bookingId",
  validateParams(initializeTransactionParamsSchema),
  validateQuery(initializeTransactionQuerySchema),
  paymentController.initializeTransaction
);

router.use((req, res) => {
  res.status(404).json({ message: "Payment route not found" });
});
export default router;