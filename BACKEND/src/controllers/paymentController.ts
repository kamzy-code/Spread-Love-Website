import { Request, Response, NextFunction } from "express";
import { paymentLogger } from "../utils/logger";
import paymentService from "../services/paymentService";
import { HttpError } from "../utils/httpError";
import bookingService from "../services/bookingService";
class PaymentController {
  async initializeTransaction(req: Request, res: Response, next: NextFunction) {
    const { email } = req.query;
    const { bookingId } = req.params;

    paymentLogger.info("Initialize transaction triggered", {
      email,
      bookingId,
      action: "INITIALIZE_TRANSACTION",
    });

    if (!email || !bookingId) {
      paymentLogger.warn("Initialized transaction failed: Missing fields", {
        email,
        bookingId,
        action: "INITIALIZE_TRANSACTION_FAILED",
      });

      next(new HttpError(400, "All fields are required"));
      return;
    }

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

      // amount is always computed server-side from the booking record —
      // never trust a client-supplied amount for a payment total.
      const amount = booking.totalPrice ?? Number(booking.price);

      if (!amount || Number.isNaN(amount)) {
        paymentLogger.warn(
          "Initialized transaction failed: Booking has no valid price",
          {
            email,
            bookingId,
            action: "INITIALIZE_TRANSACTION_FAILED",
          }
        );
        next(new HttpError(400, "Booking has no valid price"));
        return;
      }

      if (booking.paymentURL) {
        res.status(200).json({
          message: "Transaction initialized successfully",
          data: { authorization_url: booking.paymentURL },
        });

        paymentLogger.info(
          "Paystack initialize transaction URL retrieved from booking data",
          {
            email,
            amount: amount * 100,
            paymentURL: booking.paymentURL,
            bookingId,
            action: "INITIALIZE_TRANSACTION_SUCCESS",
          }
        );

        return;
      }

      // first-time initialize uses bookingId as the reference. Paystack
      // references are single-use, so once a booking has been re-used
      // (contents replaced, reuseCount > 0) every subsequent initialize
      // mints a fresh `${bookingId}-r${reuseCount}` reference instead of
      // reusing a reference that may already be spent.
      const reference =
        booking.reuseCount > 0
          ? `${booking.bookingId}-r${booking.reuseCount}`
          : booking.paymentReference || bookingId;

      const response = await paymentService.initialzeTransaction(
        email as string,
        amount,
        reference
      );

      booking.paymentURL = response.data.authorization_url;
      booking.paymentReference = reference;
      await booking.save();

      res.status(200).json({
        message: "Transaction initialized successfully",
        data: response.data,
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

    if (!reference) {
      paymentLogger.warn("Verification failed: No reference provided", {
        action: "VERIFY_TRANSACTION_FAILED",
      });
      next(new HttpError(400, "Transaction reference is required"));
      return;
    }

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
        booking.paymentStatus = "paid";
        booking.paymentReference = reference as string;

        await booking.save();

        paymentLogger.info("Transaction verification success", {
          reference,
          action: "VERIFY_TRANSACTION_SUCCESS",
        });

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
