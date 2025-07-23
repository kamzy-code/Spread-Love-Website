import { Request, Response, NextFunction } from "express";
import { paymentLogger } from "../utils/logger";
import paymentService from "../services/paymentService";
import { HttpError } from "../utils/httpError";
class PaymentController {
  async initializeTransaction(req: Request, res: Response, next: NextFunction) {
    const { email, amount, } = req.query;
    const {bookingId} = req.params;

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
      const response = await paymentService.initialzeTransaction(
        email as string,
        Number(amount),
        bookingId as string
      );

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
}

const paymentController = new PaymentController();
export default paymentController;
