import { Star, Award, Gem, Circle } from "lucide-react";

export const getTierIcon = (tier: string, resize?: boolean) => {
  const size = resize ? "h-3 w-3" : "h-5 w-5";
  switch (tier) {
    case "regular":
      return <Star className={`${size} text-blue-500`} />;
    case "vip":
      return <Award className={`${size} text-purple-500`} />;
    case "diamond":
      return <Gem className={`${size} text-pink-500`} />;
    default:
      return <Circle className={`${size} text-gray-500`} />;
  }
};

export const getTierColor = (tier: string, useCase?: string) => {
  switch (tier) {
    case "regular":
      return `${useCase === "badge" ? "bg-blue-100" : ""} text-blue-800`;
    case "vip":
      return `${useCase === "badge" ? "bg-purple-100" : ""} text-purple-800`;
    case "diamond":
      return `${useCase === "badge" ? "bg-pink-100" : ""} text-pink-800`;
    default:
      return `${useCase === "badge" ? "bg-gray-100" : ""} text-gray-800`;
  }
};

export const getTierLabel = (tier: string): string => {
  switch (tier) {
    case "vip":
      return "VIP";
    default:
      return tier.charAt(0).toUpperCase() + tier.slice(1);
  }
};
