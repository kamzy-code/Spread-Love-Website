import { z } from "zod";

export const initializeTransactionQuerySchema = z.object({
  email: z.email("A valid email is required"),
});

export const initializeTransactionParamsSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
});

export const verifyPaymentQuerySchema = z.object({
  reference: z.string().min(1, "Transaction reference is required"),
});
