import { Request, Response, NextFunction } from "express";
import { paymentLogger } from "../utils/logger";
import paymentService from "../services/paymentService";
import { HttpError } from "../utils/httpError";
import bookingService from "../services/bookingService";
class PaymentController {
  async initializeTransaction(req: Request, res: Response, next: NextFunction) {
    const { email, amount } = req.query;
    const { bookingId } = req.params;

    paymentLogger.info("Initialize transaction triggered", {
      email,
      amount,
      bookingId,
      action: "INITIALIZE_TRANSACTION",
    });

    if (!email || !amount || !bookingId) {
      paymentLogger.warn("Initialized transaction failed: Missing fields", {
        email,
        amount,
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
            amount,
            bookingId,
            action: "INITIALIZE_TRANSACTION_FAILED",
          }
        );

        next(new HttpError(400, "Booking not found"));
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
            amount: Number(amount) * 100,
            paymentURL: booking.paymentURL,
            bookingId,
            action: "INITIALIZE_TRANSACTION_SUCCESS",
          }
        );

        return;
      }

      const response = await paymentService.initialzeTransaction(
        email as string,
        Number(amount),
        bookingId as string
      );

      booking.paymentURL = response.data.authorization_url;
      await booking.save();

      res.status(200).json({
        message: "Transaction initialized successfully",
        data: response.data,
      });
      return;
    } catch (error: any) {
      paymentLogger.error(`Initialize transaction failed: ${error.message}`, {
        email,
        amount,
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

    const booking = await bookingService.getBookingByBookingId(
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

      if (
        result.status &&
        result.data.status === "success" &&
        result.data.amount >= Number(booking.price) * 100
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
