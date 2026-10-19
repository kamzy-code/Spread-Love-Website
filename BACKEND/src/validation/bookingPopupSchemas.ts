import { z } from "zod";
import { wordCount } from "../utils/wordCount";

export const POPUP_TITLE_MAX_CHARS = 80;
export const POPUP_BODY_WORD_LIMIT = 120;

// Full replace, not a partial patch — the admin form always submits all
// three fields. Plain text only: the public page renders it as text, never
// as HTML, so there's nothing to sanitize and no stored-XSS surface.
export const updateBookingPopupSchema = z
  .object({
    enabled: z.boolean(),
    title: z
      .string()
      .trim()
      .max(POPUP_TITLE_MAX_CHARS, `Title must be ${POPUP_TITLE_MAX_CHARS} characters or fewer`),
    body: z
      .string()
      .trim()
      .refine((val) => wordCount(val) <= POPUP_BODY_WORD_LIMIT, {
        message: `Message must be ${POPUP_BODY_WORD_LIMIT} words or fewer`,
      }),
  })
  .refine((data) => !data.enabled || (data.title.length > 0 && data.body.length > 0), {
    message: "Add a title and a message before turning the pop-up on",
    path: ["enabled"],
  });
