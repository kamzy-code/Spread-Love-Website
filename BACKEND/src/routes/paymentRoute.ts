import express from "express";
import { authMiddleware, checkRole } from "../middlewares/authMiddleware";
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

// Admin-only: emails the customer their payment link.
router.post(
  "/send-link/:bookingId",
  authMiddleware,
  checkRole("superadmin", "salesrep"),
  validateParams(initializeTransactionParamsSchema),
  paymentController.sendPaymentLinkEmail
);

// Paystack server-to-server callback — no client auth (Paystack's HMAC
// signature header is the auth barrier). Registered before the 404 fallback.
router.post("/webhook", paymentController.handleWebhook);

router.use((req, res) => {
  res.status(404).json({ message: "Payment route not found" });
});
export default router;