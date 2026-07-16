export type adminRole = "superadmin" | "callrep" | "salesrep";

export type occassionType =
  | "Birthday Surprise Calls"
  | "Anniversary Wishes"
  | "Friendship Reconnection"
  | "Graduation Congratulations"
  | "Congratulatory Calls"
  | "Holiday Greetings"
  | "Romantic Calls"
  | "Apology Calls"
  | "Encouragement/Cheer Up Calls"
  | "Appreciation Call"
  | "Father's Day Call"
  | "Mother's Day Call"
  | "Valentine's Day Call"
  | "Conference Surprise Call";

export const occassion: occassionType[] = [
  "Birthday Surprise Calls",
  "Anniversary Wishes",
  "Friendship Reconnection",
  "Graduation Congratulations",
  "Congratulatory Calls",
  "Holiday Greetings",
  "Romantic Calls",
  "Apology Calls",
  "Encouragement/Cheer Up Calls",
  "Appreciation Call",
  "Father's Day Call",
  "Mother's Day Call",
  "Valentine's Day Call",
  "Conference Surprise Call",
];

export type callStatus =
  | "pending"
  | "assigned"
  | "successful"
  | "rejected"
  | "rescheduled"
  | "unsuccessful";

  export type callType =
  | "regular"
  | "special"


export const RELATIONSHIP_OPTIONS = [
  "Mother",
  "Father",
  "Daughter",
  "Son",
  "Brother",
  "Sister",
  "Cousin",
  "Nephew",
  "Niece",
  "Wife",
  "Husband",
  "Girlfriend",
  "Boyfriend",
  "Fiancé",
  "Fiancée",
  "Colleague",
  "Friend",
  "Boss",
  "Employee",
  "Baby Mama",
  "Baby Daddy",
  "Ex",
  "Best Friend",
  "Other",
] as const;

export type bookingStatusType = "pending" | "in_progress" | "completed";
export type genderType = "male" | "female" | "prefer_not_to_say";
export type RelationshipOption = (typeof RELATIONSHIP_OPTIONS)[number];