// The booking form tells customers to type "None" if they have no message,
// so "no message" arrives as a handful of spellings, not just an empty
// string. Keep in sync with BACKEND/src/utils/blankMessage.ts.
const BLANK_MESSAGE_VALUES = new Set(["", "none", "n/a", "na", "nil", "no", "no message"]);

export const isBlankMessage = (message?: string | null): boolean =>
  BLANK_MESSAGE_VALUES.has((message ?? "").trim().toLowerCase().replace(/[.!]+$/, ""));
