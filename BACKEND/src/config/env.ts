import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(5001),

  MONGO_URI: z.string().min(1, "MONGO_URI is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),

  EMAIL_USER: z.string().min(1, "EMAIL_USER is required"),
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
  MANAGE_BOOKING_URL: z.string().min(1, "MANAGE_BOOKING_URL is required"),

  PAYSTACK_SECRET: z.string().min(1, "PAYSTACK_SECRET is required"),

  BETTER_STACK_SOURCE: z.string().optional(),
  BETTER_STACK_ENDPOINT: z.string().optional(),

  // Sprint 2 — Twilio
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_API_KEY_SID: z.string().optional(),
  TWILIO_API_KEY_SECRET: z.string().optional(),
  TWILIO_TWIML_APP_SID: z.string().optional(),
  TWILIO_CALLER_ID: z.string().optional(),

  // Sprint 2 — S3 recording storage
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Invalid environment configuration:",
    z.flattenError(parsed.error).fieldErrors,
  );
  process.exit(1);
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === "production";
