import https from "https";
import { paymentLogger } from "../utils/logger";

export class PaymentService {
  async initialzeTransaction(
    email: string,
    amount: number,
    bookingId: string
  ): Promise<any> {
    const baseAmount = amount * 100;
    const secret = process.env.PAYSTACK_SECRET;

    const params = JSON.stringify({
      email,
      amount: baseAmount,
      reference: bookingId,
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
                bookingId,
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
                new Error(parsed.message || "Failed to initialize transaction")
              );
            }
          } catch (err: any) {
            paymentLogger.error("Failed to parse Paystack response", {
              email,
              amount: baseAmount,
              bookingId,
              error: err.message,
              action: "INITIALIZE_TRANSACTION_PARSE_ERROR",
            });
            reject(err);
          }
        });
      });

      req.on("error", (error) => {
        paymentLogger.error("Paystack request error", {
          email,
          amount: baseAmount,
          bookingId,
          error: error.message,
          action: "INITIALIZE_TRANSACTION_REQUEST_ERROR",
        });
        reject(error);
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
            reject(err);
          }
        });
      });

      req.on("error", (error) => {
        paymentLogger.error("Request error during transaction verification", {
          reference,
          error,
          action: "VERIFY_TRANSACTION_FAILED",
        });
        reject(error);
      });

      req.end();
    });
  }
}

const paymentService = new PaymentService();
export default paymentService;
