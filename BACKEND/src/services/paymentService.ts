import https from "https";
import { paymentLogger } from "../utils/logger";
import { IBooking } from "../models/bookingModel";
import { HttpError } from "../utils/httpError";

export class PaymentService {
  // Single entry point for resolving a booking's payment link — used by both
  // the customer checkout flow and the admin "complete payment" action, so
  // amount/reference logic only lives in one place.
  async initializePaymentForBooking(
    booking: IBooking,
    email: string
  ): Promise<{ authorization_url: string; access_code?: string; reference?: string }> {
    const amount = booking.totalPrice ?? Number(booking.price);

    if (!amount || Number.isNaN(amount)) {
      paymentLogger.warn("Cannot initialize payment: booking has no valid price", {
        bookingId: booking.bookingId,
        action: "INITIALIZE_PAYMENT_FOR_BOOKING_INVALID_PRICE",
      });
      throw new HttpError(400, "Booking has no valid price");
    }

    if (booking.paymentURL) {
      paymentLogger.info("Returning cached payment URL", {
        bookingId: booking.bookingId,
        action: "INITIALIZE_PAYMENT_FOR_BOOKING_CACHED",
      });
      return { authorization_url: booking.paymentURL };
    }

    // Paystack references are single-use. First-time initialize uses the
    // bookingId; once a booking has been re-used (contents replaced,
    // reuseCount > 0), mint a fresh reference instead of reusing one that
    // may already be spent.
    const reference =
      booking.reuseCount > 0
        ? `${booking.bookingId}-r${booking.reuseCount}`
        : booking.paymentReference || booking.bookingId;

    const response = await this.initialzeTransaction(email, amount, reference);

    booking.paymentURL = response.data.authorization_url;
    booking.paymentReference = reference;
    await booking.save();

    paymentLogger.info("Payment initialized for booking", {
      bookingId: booking.bookingId,
      reference,
      reuseCount: booking.reuseCount,
      action: "INITIALIZE_PAYMENT_FOR_BOOKING_SUCCESS",
    });

    return response.data;
  }

  async initialzeTransaction(
    email: string,
    amount: number,
    reference: string
  ): Promise<any> {
    const baseAmount = amount * 100;
    const secret = process.env.PAYSTACK_SECRET;

    const params = JSON.stringify({
      email,
      amount: baseAmount,
      reference,
    });

    const options = {
      hostname: "api.paystack.co",
      port: 443,
      path: "/transaction/initialize",
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
    };

    return new Promise((resolve, reject) => {
      // Paystack has no reachability guarantee — without a timeout a hung
      // connection stalls the request indefinitely instead of surfacing
      // an error the caller (and eventually the customer) can act on.
      const req = https.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);

            paymentLogger.info(
              "Paystack initialize transaction response received",
              {
                email,
                amount: baseAmount,
                reference,
                statusCode: res.statusCode,
                response: parsed,
                action: "INITIALIZE_TRANSACTION_SUCCESS",
              }
            );

            if (
              res.statusCode &&
              res.statusCode >= 200 &&
              res.statusCode < 300
            ) {
              resolve(parsed);
            } else {
              reject(
                new HttpError(
                  502,
                  "Payment provider is currently unavailable. Please try again shortly."
                )
              );
            }
          } catch (err: any) {
            paymentLogger.error("Failed to parse Paystack response", {
              email,
              amount: baseAmount,
              reference,
              error: err.message,
              action: "INITIALIZE_TRANSACTION_PARSE_ERROR",
            });
            reject(
              new HttpError(
                502,
                "Payment provider is currently unavailable. Please try again shortly."
              )
            );
          }
        });
      });

      req.setTimeout(15000, () => {
        req.destroy(new Error("Paystack request timed out"));
      });

      req.on("error", (error) => {
        paymentLogger.error("Paystack request error", {
          email,
          amount: baseAmount,
          reference,
          error: error.message,
          action: "INITIALIZE_TRANSACTION_REQUEST_ERROR",
        });
        reject(
          new HttpError(
            502,
            "Payment provider is currently unavailable. Please try again shortly."
          )
        );
      });

      req.write(params);
      req.end();
    });
  }

  async verifyTransaction(reference: string): Promise<any> {
    const secret = process.env.PAYSTACK_SECRET;

    const options = {
      hostname: "api.paystack.co",
      port: 443,
      path: `/transaction/verify/${reference}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${secret}`,
      },
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            paymentLogger.info("Transaction verified", {
              reference,
              status: parsed?.data?.status,
              amount: parsed?.data?.amount,
              action: "VERIFY_TRANSACTION",
            });

            resolve(parsed);
          } catch (err) {
            paymentLogger.error("Failed to parse verification response", {
              reference,
              error: err,
              action: "VERIFY_TRANSACTION_FAILED",
            });
            reject(
              new HttpError(
                502,
                "Payment provider is currently unavailable. Please try again shortly."
              )
            );
          }
        });
      });

      req.setTimeout(15000, () => {
        req.destroy(new Error("Paystack request timed out"));
      });

      req.on("error", (error) => {
        paymentLogger.error("Request error during transaction verification", {
          reference,
          error,
          action: "VERIFY_TRANSACTION_FAILED",
        });
        reject(
          new HttpError(
            502,
            "Payment provider is currently unavailable. Please try again shortly."
          )
        );
      });

      req.end();
    });
  }
}

const paymentService = new PaymentService();
export default paymentService;
