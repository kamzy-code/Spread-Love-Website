import { Request, Response, NextFunction } from "express";
import { paymentLogger } from "../utils/logger";
import paymentService from "../services/paymentService";
import { HttpError } from "../utils/httpError";
import bookingService from "../services/bookingService";
import { Booking } from "../models/bookingModel";
class PaymentController {
  // email/bookingId are validated by validateQuery/validateParams middleware
  // (initializeTransactionQuerySchema/initializeTransactionParamsSchema)
  // before this handler runs.
  async initializeTransaction(req: Request, res: Response, next: NextFunction) {
    const { email } = req.query;
    const { bookingId } = req.params;

    paymentLogger.info("Initialize transaction triggered", {
      email,
      bookingId,
      action: "INITIALIZE_TRANSACTION",
    });

    try {
      const booking = await bookingService.getBookingByBookingId(bookingId);

      if (!booking) {
        paymentLogger.warn(
          "Initialized transaction failed: Booking not found",
          {
            email,
            bookingId,
            action: "INITIALIZE_TRANSACTION_FAILED",
          }
        );

        next(new HttpError(400, "Booking not found"));
        return;
      }

      const data = await paymentService.initializePaymentForBooking(
        booking,
        email as string
      );

      paymentLogger.info("Transaction initialized successfully", {
        email,
        bookingId,
        paymentURL: data.authorization_url,
        action: "INITIALIZE_TRANSACTION_SUCCESS",
      });

      res.status(200).json({
        message: "Transaction initialized successfully",
        data,
      });
      return;
    } catch (error: any) {
      paymentLogger.error(`Initialize transaction failed: ${error.message}`, {
        email,
        bookingId,
        error: error.message,
        action: "INITIALIZE_TRANSACTION_FAILED",
      });

      next(error);
      return;
    }
  }

  // reference is validated by validateQuery middleware (verifyPaymentQuerySchema).
  async verifyPaymentController(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { reference } = req.query;
    paymentLogger.info("Verify tansaction initiated", {
      reference,
      action: "VERIFY_TRANSACTION",
    });

    const booking = await bookingService.getBookingByPaymentReference(
      reference as string
    );

    if (!booking) {
      paymentLogger.warn("Verification failed: Booking not found", {
        reference,
        action: "VERIFY_TRANSACTION_FAILED",
      });
      next(new HttpError(404, "Booking not found"));
      return;
    }


    const effectiveReference =
      booking.paymentReference || (reference as string);

    try {
      const result = await paymentService.verifyTransaction(effectiveReference);

      const expectedAmount = booking.totalPrice ?? Number(booking.price);

      if (
        result.status &&
        result.data.status === "success" &&
        result.data.amount >= expectedAmount * 100
      ) {
        // Single atomic write path shared with the webhook (see
        // paymentService.markBookingPaid) — flips paymentStatus to paid
        // exactly once and fires tier + confirmation email only on the
        // pending/failed -> paid transition, so re-verify, webhook
        // redelivery, and admin re-checks never double-count.
        const paidBooking = await paymentService.markBookingPaid(
          booking,
          effectiveReference
        );

        paymentLogger.info("Transaction verification success", {
          reference,
          effectiveReference,
          action: "VERIFY_TRANSACTION_SUCCESS",
        });

        res.status(200).json({
          message: "Payment verified successfully",
          data: result.data,
          booking: paidBooking,
        });
        return;
      } else if (result.status && result.data.status === "failed") {
        paymentLogger.warn("Transaction not successful", {
          reference,
          effectiveReference,
          result,
          action: "VERIFY_TRANSACTION_FAILED",
        });

        // Never let a failed verification of a stale/wrong reference
        // downgrade a booking that is already confirmed paid — the guard is
        // in the update predicate, so a concurrent webhook/verify that just
        // flipped the DB to paid wins over this stale in-memory doc.
        await Booking.updateOne(
          { _id: booking._id, paymentStatus: { $ne: "paid" } },
          { $set: { paymentStatus: "failed", paymentReference: effectiveReference } }
        );

        res.status(200).json({
          message: "Transaction not successful",
          data: result.data,
        });
        return;
      } else {
        paymentLogger.warn(`Transaction not successful`, {
          reference,
          effectiveReference,
          result,
          action: "VERIFY_TRANSACTION_FAILED",
        });

        // Same guard as above — don't regress a paid booking to pending.
        await Booking.updateOne(
          { _id: booking._id, paymentStatus: { $ne: "paid" } },
          { $set: { paymentStatus: "pending" } }
        );

        res.status(400).json({
          message: `Transaction not successful`,
          data: result.data,
        });
        return;
      }
    } catch (error) {
      paymentLogger.error("Verification error", {
        error,
        reference,
        action: "VERIFY_TRANSACTION_FAILED",
      });
      next(error);
      return;
    }
  }

  async handleWebhook(req: Request, res: Response, next: NextFunction) {
    const signature = req.get("x-paystack-signature") || "";
    const rawBody = (req as any).rawBody as Buffer | undefined;

    if (!rawBody) {
      paymentLogger.warn("Webhook rejected: missing raw body", {
        action: "PAYMENT_WEBHOOK_MISSING_RAW_BODY",
      });
      res.status(401).json({ message: "Invalid signature" });
      return;
    }

    let valid = false;
    try {
      valid = paymentService.verifyWebhookSignature(rawBody, signature);
    } catch (signatureError: any) {
      paymentLogger.error("Webhook signature verification crashed", {
        error: signatureError.message,
        action: "PAYMENT_WEBHOOK_SIGNATURE_ERROR",
      });
      res.status(500).json({ message: "Webhook error" });
      return;
    }

    if (!valid) {
      paymentLogger.warn("Webhook rejected: invalid signature", {
        action: "PAYMENT_WEBHOOK_INVALID_SIGNATURE",
      });
      res.status(401).json({ message: "Invalid signature" });
      return;
    }

    const event = req.body as {
      event?: string;
      data?: { reference?: string; amount?: number; status?: string };
    };

    // Only charge.success drives booking state. Everything else is ignored —
    // answer 200 so Paystack's retry loop stops.
    if (event?.event !== "charge.success") {
      paymentLogger.info("Webhook event ignored", {
        event: event?.event,
        action: "PAYMENT_WEBHOOK_EVENT_IGNORED",
      });
      res.status(200).json({ message: "Webhook received" });
      return;
    }

    const reference = event.data?.reference;

    if (!reference) {
      paymentLogger.warn("Webhook charge.success without reference", {
        action: "PAYMENT_WEBHOOK_MISSING_REFERENCE",
      });
      res.status(200).json({ message: "Webhook received" });
      return;
    }

    try {
      const booking = await bookingService.getBookingByPaymentReference(
        reference
      );

      if (!booking) {
        // Deliveries for an unknown/deleted booking are dead-lettered: 200
        // stops retries; the reference stays in the logs for triage.
        paymentLogger.warn("Webhook for unknown booking", {
          reference,
          action: "PAYMENT_WEBHOOK_UNKNOWN_BOOKING",
        });
        res.status(200).json({ message: "Webhook received" });
        return;
      }

      const expectedAmount = booking.totalPrice ?? Number(booking.price);

      if (
        !expectedAmount ||
        Number.isNaN(expectedAmount) ||
        (event.data?.amount ?? 0) < expectedAmount * 100
      ) {
        // Permanent condition — dead-letter (200) so Paystack stops retrying
        // and the mismatch is surfaced loudly for ops triage.
        paymentLogger.error("Webhook amount mismatch, not marking paid", {
          reference,
          bookingId: booking.bookingId,
          receivedAmount: event.data?.amount,
          expectedAmount,
          action: "PAYMENT_WEBHOOK_AMOUNT_MISMATCH",
        });
        res.status(200).json({ message: "Webhook received" });
        return;
      }

      await paymentService.markBookingPaid(booking, reference);

      paymentLogger.info("Webhook processed", {
        reference,
        bookingId: booking.bookingId,
        action: "PAYMENT_WEBHOOK_SUCCESS",
      });

      res.status(200).json({ message: "Webhook received" });
      return;
    } catch (error: any) {
      paymentLogger.error("Webhook handling failed", {
        error: error.message,
        reference,
        action: "PAYMENT_WEBHOOK_ERROR",
      });
      res.status(500).json({ message: "Webhook error" });
      return;
    }
  }
}

const paymentController = new PaymentController();
export default paymentController;
