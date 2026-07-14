import { z } from "zod";
import { occassion } from "../types/genralTypes";
import { RELATIONSHIP_OPTIONS } from "../types/genralTypes";
import { wordCount } from "../utils/wordCount";

export const MESSAGE_WORD_LIMIT = 200;
export const SPECIAL_INSTRUCTION_WORD_LIMIT = 70;

// Assert that `occassion` is a non-empty array/tuple of strings.
// The type `[string, ...string[]]` means "at least one string, followed by zero or more strings".
// This narrows the type so `z.enum(occassionValues)` can accept it.
const occassionValues = occassion as [string, ...string[]];

export const callerSchema = z.object({
  name: z.string().min(1, "Caller name is required"),
  phone: z.string().min(1, "Caller phone is required"),
  email: z
    .email("Caller email must be valid")
    .min(1, "Caller email is required"),
  gender: z.enum(["male", "female", "prefer_not_to_say"]),
  relationship: z.enum(RELATIONSHIP_OPTIONS),
});

export const recipientSchema = z.object({
  recipientName: z.string().min(1, "Recipient name is required"),
  recipientPhone: z.string().min(1, "Recipient phone is required"),
  country: z.string().min(1, "Country is required"),
  occassion: z.enum(occassionValues),
  callType: z.enum(["regular", "special"]),
  callDate: z.coerce.date(),
  price: z.coerce.number().nonnegative("Price must be non-negative"),
  message: z
    .string()
    .optional()
    .refine((val) => !val || wordCount(val) <= MESSAGE_WORD_LIMIT, {
      message: `Message must be ${MESSAGE_WORD_LIMIT} words or fewer`,
    }),
  specialInstruction: z
    .string()
    .optional()
    .refine((val) => !val || wordCount(val) <= SPECIAL_INSTRUCTION_WORD_LIMIT, {
      message: `Special instruction must be ${SPECIAL_INSTRUCTION_WORD_LIMIT} words or fewer`,
    }),
  callRecording: z.enum(["yes", "no"]).optional(),
});

export const createBookingSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  caller: callerSchema,
  recipients: z
    .array(recipientSchema)
    .min(1, "At least one recipient is required"),
  contactConsent: z.enum(["yes", "no"]).optional(),
  couponCode: z.string().optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
