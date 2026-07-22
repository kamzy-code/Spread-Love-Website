import { Cake, Heart, Users, GraduationCap, PartyPopper, Gift, Phone, Sun } from "lucide-react";
import { ServiceIconKey } from "./types";

// Service icons are stored as a key string in the DB (not serializable React
// components) — this is the single place that maps a key back to the actual
// icon, shared by the public services page and the admin management screens.
export const SERVICE_ICON_OPTIONS: { value: ServiceIconKey; label: string }[] = [
  { value: "cake", label: "Cake" },
  { value: "heart", label: "Heart" },
  { value: "users", label: "Users" },
  { value: "graduationCap", label: "Graduation Cap" },
  { value: "partyPopper", label: "Party Popper" },
  { value: "gift", label: "Gift" },
  { value: "phone", label: "Phone" },
  { value: "sun", label: "Sun" },
];

export const getServiceIcon = (iconKey: ServiceIconKey, className = "h-8 w-8") => {
  switch (iconKey) {
    case "cake":
      return <Cake className={className} />;
    case "heart":
      return <Heart className={className} />;
    case "users":
      return <Users className={className} />;
    case "graduationCap":
      return <GraduationCap className={className} />;
    case "partyPopper":
      return <PartyPopper className={className} />;
    case "gift":
      return <Gift className={className} />;
    case "phone":
      return <Phone className={className} />;
    case "sun":
      return <Sun className={className} />;
    default:
      return <Gift className={className} />;
  }
};
