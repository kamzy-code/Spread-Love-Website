// Must stay in sync with BACKEND/src/types/genralTypes.ts (RELATIONSHIP_OPTIONS,
// genderType) — no shared package between frontend/backend, so this is a
// deliberate mirror, not a coincidence. Provisional list until the client
// sends their real relationship options; "Other" keeps submissions unblocked.
export const RELATIONSHIP_OPTIONS = [
  "Partner",
  "Parent",
  "Sibling",
  "Friend",
  "Colleague",
  "Other",
] as const;

export const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
] as const;

export const MESSAGE_WORD_LIMIT = 200;
export const SPECIAL_INSTRUCTION_WORD_LIMIT = 70;
