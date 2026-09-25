import https from "https";
import crypto from "crypto";
import { paymentLogger } from "../utils/logger";
import { Booking, IBooking } from "../models/bookingModel";
import customerService from "./customerService";
import emailService from "./emailService";
import emailQueueService from "./emailQueueService";
import { getCallerFromBooking } from "../utils/bookingShape";
import { HttpError } from "../utils/httpError";
import { env } from "../config/env";

export class PaymentService {
  // The single write path that transitions a booking to paid, shared by the
  // customer-facing verify endpoint, the Paystack webhook, and any admin
  // re-verify. Atomic: only the first concurrent writer wins, so tier +
  // confirmation email side-effects fire exactly once even under Paystack's
  // retry delivery or a verify/webhook race. Returns a document whose
  // paymentStatus is "paid" (the winner's doc, or a fresh read for the loser).
  async markBookingPaid(
    booking: IBooking,
    reference: string
  ): Promise<IBooking> {
    const flipped = await Booking.findOneAndUpdate(
      { _id: booking._id, paymentStatus: { $ne: "paid" } },
      { $set: { paymentStatus: "paid", paymentReference: reference } },
      { new: true }
    );

    if (!flipped) {
      // Already paid by a concurrent delivery — no-op, but still return a
      // fresh doc so callers never respond with a stale in-memory status.
      paymentLogger.info("Payment already confirmed for booking", {
        bookingId: booking.bookingId,
        reference,
        action: "MARK_BOOKING_PAID_ALREADY_PAID",
      });
      return (await Booking.findById(booking._id)) ?? booking;
    }

    paymentLogger.info("Booking marked paid", {
      bookingId: flipped.bookingId,
      reference,
      reuseCount: flipped.reuseCount,
      action: "MARK_BOOKING_PAID_SUCCESS",
    });

    // Customer tiering is keyed off payment confirmation — only fired on the
    // actual pending/failed -> paid transition, so redeliveries never
    // double-count.
    try {
      await customerService.recordPaidBooking(getCallerFromBooking(flipped));
    } catch (tierError: any) {
      paymentLogger.error(
        `Customer tier recording failed after payment confirmed: ${tierError.message}`,
        {
          bookingId: flipped.bookingId,
          reference,
          action: "MARK_BOOKING_PAID_TIER_HOOK_FAILED",
        }
      );
    }

    // Best-effort: a failed confirmation email must not fail the payment
    // acknowledgement back to Paystack / the verify response. Failure is
    // queued for retry instead.
    try {
      await emailService.sendBookingConfirmationIfDue(flipped);
    } catch (emailError: any) {
      paymentLogger.error(
        `Confirmation mail failed after payment confirmed: ${emailError.message}`,
        {
          bookingId: flipped.bookingId,
          reference,
          action: "MARK_BOOKING_PAID_CONFIRMATION_MAIL_FAILED",
        }
      );
      await emailQueueService.enqueue(
        "booking_confirmation",
        flipped._id as any,
        emailError.message,
      );
    }

    return flipped;
  }

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
    const secret = env.PAYSTACK_SECRET;

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

  // Paystack signs webhooks with the merchant secret (or a dedicated webhook
  // secret) using HMAC SHA-512 over the raw request body, delivered in the
  // x-paystack-signature header. Verify before trusting any event.
  verifyWebhookSignature(rawBody: Buffer, signature: string): boolean {
    if (!rawBody || !signature || !/^[a-f0-9]{128}$/i.test(signature)) {
      return false;
    }

    const secret =
      env.PAYSTACK_WEBHOOK_SECRET || env.PAYSTACK_SECRET;

    const expected = crypto
      .createHmac("sha512", secret)
      .update(rawBody)
      .digest("hex");

    // Buffers are both 128 hex chars here (guarded above), so this never
    // throws on length mismatch.
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature)
    );
  }

  async verifyTransaction(reference: string): Promise<any> {
    const secret = env.PAYSTACK_SECRET;

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
