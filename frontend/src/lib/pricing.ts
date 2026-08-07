import { Service } from "./types";

type ServiceCallType = "regular" | "special";

export const getPriceForRecipient = (
  services: Service[],
  occassion: string,
  callType: string,
  country: string
): number => {
  const service = services.find((s) => s.title === occassion);
  if (!service) return 0;

  const pricing = service[callType as ServiceCallType];
  if (!pricing) return 0;

  return country === "Nigeria" ? pricing.localPrice : pricing.internationalPrice;
};
