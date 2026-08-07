import { customerTier } from "../models/customerModel";

export const computeTier = (completedBookings: number): customerTier => {
  if (completedBookings >= 21) return "diamond";
  if (completedBookings >= 10) return "vip";
  if (completedBookings >= 4) return "regular";
  return "new";
};
