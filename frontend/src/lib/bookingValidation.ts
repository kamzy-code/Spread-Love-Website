import { z } from "zod";
import { wordCount } from "./wordCount";
import { MESSAGE_WORD_LIMIT, SPECIAL_INSTRUCTION_WORD_LIMIT } from "./bookingOptions";

// gender is validated as a plain non-empty string (not a strict zod enum) so
// its inferred TS type stays a widenable `string` — an unselected dropdown
// starts as "" as a legal (if invalid) form value; the backend's zod schema
// is the authoritative enum check.
export const callerFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "WhatsApp number is required"),
  email: z.email("Enter a valid email"),
  gender: z.string().min(1, "Select a gender"),
  relationship: z.string().min(1, "Relationship is required"),
});

export const recipientFormSchema = z.object({
  recipientName: z.string().min(1, "Recipient name is required"),
  recipientPhone: z.string().min(1, "Recipient phone is required"),
  country: z.string().min(1, "Country is required"),
  occassion: z.string().min(1, "Select an occasion"),
  callType: z.enum(["regular", "special"]),
  callDate: z.string().min(1, "Select a date"),
  message: z
    .string()
    .min(1, "Message is required")
    .refine((val) => wordCount(val) <= MESSAGE_WORD_LIMIT, {
      message: `Message must be ${MESSAGE_WORD_LIMIT} words or fewer`,
    }),
  specialInstruction: z
    .string()
    .refine((val) => !val || wordCount(val) <= SPECIAL_INSTRUCTION_WORD_LIMIT, {
      message: `Special instruction must be ${SPECIAL_INSTRUCTION_WORD_LIMIT} words or fewer`,
    }),
  callRecording: z.enum(["yes", "no"]),
});

export const bookingDetailsSchema = z.object({
  caller: callerFormSchema,
  recipients: z.array(recipientFormSchema).min(1, "Add at least one recipient"),
  contactConsent: z.enum(["yes", "no"]),
});

export type BookingFormValues = z.infer<typeof bookingDetailsSchema>;
