export type adminRole = "superadmin" | "callrep" | "salesrep";

export type callType = "Birthday Call" | "Appreciation Call" | "Anniversary Call" | "Congratultory Call" | "Apology Call" | "Romantic Call"  | "Encouragement Call" | "Customer Appreciation Call" | "Other";

export const callTypes: callType[] = [
  "Birthday Call" , "Appreciation Call" , "Anniversary Call" , "Congratultory Call" , "Apology Call" , "Romantic Call"  , "Encouragement Call" , "Customer Appreciation Call"]

export type callStatus = "pending" | "placed" | "successful" | "rejected" | "rescheduled" | "refunded";
