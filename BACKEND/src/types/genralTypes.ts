export type adminRole = "superadmin" | "callrep" | "salesrep";

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