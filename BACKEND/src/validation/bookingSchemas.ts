import { z } from "zod";
import { occassion } from "../types/genralTypes";
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
  // RELATIONSHIP_OPTIONS drives the frontend dropdown, but "Other" lets the
  // caller type a free-text relationship — so this stays a plain string
  // rather than a strict enum.
  relationship: z.string().min(1, "Relationship is required"),
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
  caller: callerSchema,
  recipients: z
    .array(recipientSchema)
    .min(1, "At least one recipient is required"),
  contactConsent: z.enum(["yes", "no"]).optional(),
  couponCode: z.string().optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const updateBookingStatusSchema = z.object({
  status: z.enum([
    "pending",
    "assigned",
    "successful",
    "rejected",
    "rescheduled",
    "unsuccessful",
  ]),
});

export const assignCallToRepQuerySchema = z.object({
  repId: z.string().min(1, "Rep ID is required"),
});

// Admin routes address bookings by their Mongo _id (not the SLN-xxxx
// bookingId field) — catches malformed ids before they reach
// `new Types.ObjectId(...)`/`findById`, which otherwise throw a raw
// CastError that surfaces as an unhelpful 500.
export const bookingIdParamSchema = z.object({
  bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid booking ID"),
});

// Customer self-service update — deliberately a smaller field set than
// createBookingSchema. Never includes callStatus/price/callRecordingURL —
// those are rep/system-owned, not customer-editable.
export const updateCallerByCustomerSchema = z
  .object({
    name: z.string().min(1),
    phone: z.string().min(1),
    email: z.email().min(1),
    gender: z.enum(["male", "female", "prefer_not_to_say"]),
    relationship: z.string().min(1),
  })
  .partial();

// occassion is deliberately NOT editable here — it determines price, and a
// customer could otherwise pay for a cheaper occasion/call type then swap to
// a pricier one after payment without paying the difference.
export const updateRecipientByCustomerSchema = z
  .object({
    _id: z.string().min(1, "Recipient _id is required to target an update"),
    recipientName: z.string().min(1),
    recipientPhone: z.string().min(1),
    country: z.string().min(1),
    callDate: z.coerce.date(),
    message: z
      .string()
      .refine((val) => wordCount(val) <= MESSAGE_WORD_LIMIT, {
        message: `Message must be ${MESSAGE_WORD_LIMIT} words or fewer`,
      }),
    specialInstruction: z
      .string()
      .refine((val) => !val || wordCount(val) <= SPECIAL_INSTRUCTION_WORD_LIMIT, {
        message: `Special instruction must be ${SPECIAL_INSTRUCTION_WORD_LIMIT} words or fewer`,
      }),
  })
  .partial({
    recipientName: true,
    recipientPhone: true,
    country: true,
    callDate: true,
    message: true,
    specialInstruction: true,
  });

export const updateBookingByCustomerSchema = z
  .object({
    caller: updateCallerByCustomerSchema,
    recipients: z.array(updateRecipientByCustomerSchema),
  })
  .partial()
  .refine((data) => data.caller || data.recipients, {
    message: "At least one of caller or recipients is required",
  });

// Admin update — broader than the customer-safe schema above by design.
// Admins are trusted staff correcting genuine data-entry mistakes (wrong
// occasion, wrong price, wrong country), not the price-manipulation surface
// the customer-facing schema guards against. Still never includes
// callStatus/paymentStatus/paymentReference/assignedRep — those go through
// their own dedicated routes (recipient status, assign, payment).
export const updateCallerByAdminSchema = z
  .object({
    name: z.string().min(1),
    phone: z.string().min(1),
    email: z.email().min(1),
    gender: z.enum(["male", "female", "prefer_not_to_say"]),
    relationship: z.string().min(1),
  })
  .partial();

export const updateRecipientByAdminSchema = z
  .object({
    _id: z.string().min(1, "Recipient _id is required to target an update"),
    recipientName: z.string().min(1),
    recipientPhone: z.string().min(1),
    country: z.string().min(1),
    occassion: z.enum(occassionValues),
    callType: z.enum(["regular", "special"]),
    callDate: z.coerce.date(),
    price: z.coerce.number().nonnegative("Price must be non-negative"),
    message: z
      .string()
      .refine((val) => wordCount(val) <= MESSAGE_WORD_LIMIT, {
        message: `Message must be ${MESSAGE_WORD_LIMIT} words or fewer`,
      }),
    specialInstruction: z
      .string()
      .refine((val) => !val || wordCount(val) <= SPECIAL_INSTRUCTION_WORD_LIMIT, {
        message: `Special instruction must be ${SPECIAL_INSTRUCTION_WORD_LIMIT} words or fewer`,
      }),
    callRecordingURL: z.string(),
  })
  .partial({
    recipientName: true,
    recipientPhone: true,
    country: true,
    occassion: true,
    callType: true,
    callDate: true,
    price: true,
    message: true,
    specialInstruction: true,
    callRecordingURL: true,
  });

export const updateBookingByAdminSchema = z
  .object({
    caller: updateCallerByAdminSchema,
    recipients: z.array(updateRecipientByAdminSchema),
  })
  .partial()
  .refine((data) => data.caller || data.recipients, {
    message: "At least one of caller or recipients is required",
  });
