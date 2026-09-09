import { Request, Response, NextFunction } from "express";
import { paymentLogger } from "../utils/logger";
import paymentService from "../services/paymentService";
import emailService from "../services/emailService";
import emailQueueService from "../services/emailQueueService";
import customerService from "../services/customerService";
import { getCallerFromBooking } from "../utils/bookingShape";
import { HttpError } from "../utils/httpError";
import bookingService from "../services/bookingService";
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

    try {
      const result = await paymentService.verifyTransaction(
        reference as string
      );

      const expectedAmount = booking.totalPrice ?? Number(booking.price);

      if (
        result.status &&
        result.data.status === "success" &&
        result.data.amount >= expectedAmount * 100
      ) {
        const wasPaid = booking.paymentStatus === "paid";

        booking.paymentStatus = "paid";
        booking.paymentReference = reference as string;

        await booking.save();

        paymentLogger.info("Transaction verification success", {
          reference,
          action: "VERIFY_TRANSACTION_SUCCESS",
        });

        // Customer tiering is keyed off payment confirmation, not booking
        // completion — only fire on the actual pending/failed -> paid
        // transition so re-verifying an already-paid reference (customer
        // refresh, admin re-check) never double-counts a booking.
        if (!wasPaid) {
          try {
            await customerService.recordPaidBooking(getCallerFromBooking(booking));
          } catch (tierError: any) {
            paymentLogger.error(
              `Customer tier recording failed after payment verification: ${tierError.message}`,
              {
                reference,
                bookingId: booking.bookingId,
                action: "VERIFY_TRANSACTION_TIER_HOOK_FAILED",
              }
            );
          }
        }

        // Best-effort: a failed confirmation email must not fail an
        // already-verified payment response back to the customer.
        try {
          await emailService.sendBookingConfirmationIfDue(booking);
        } catch (emailError: any) {
          paymentLogger.error(
            `Confirmation mail failed after payment verification: ${emailError.message}`,
            {
              reference,
              bookingId: booking.bookingId,
              action: "VERIFY_TRANSACTION_CONFIRMATION_MAIL_FAILED",
            }
          );
          await emailQueueService.enqueue(
            "booking_confirmation",
            booking._id as any,
            emailError.message,
          );
        }

        res.status(200).json({
          message: "Payment verified successfully",
          data: result.data,
          booking,
        });
        return;
      } else if (result.status && result.data.status === "failed") {
        paymentLogger.warn("Transaction not successful", {
          reference,
          result,
          action: "VERIFY_TRANSACTION_FAILED",
        });

        booking.paymentStatus = "failed";
        booking.paymentReference = reference as string;

        await booking.save();

        res.status(200).json({
          message: "Transaction not successful",
          data: result.data,
        });
        return;
      } else {
        paymentLogger.warn(`Transaction not successful`, {
          reference,
          result,
          action: "VERIFY_TRANSACTION_FAILED",
        });

        booking.paymentStatus = "pending";

        await booking.save();

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
}

const paymentController = new PaymentController();
export default paymentController;
