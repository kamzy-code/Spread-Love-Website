import { services } from "@/components/services/serviceList";

type ServiceCallType = "regular" | "special";

export const getPriceForRecipient = (
  occassion: string,
  callType: string,
  country: string
): number => {
  const service = services.find((s) => s.title === occassion);
  if (!service) return 0;

  const type = service.type[callType as ServiceCallType];
  if (!type) return 0;

  const priceString =
    country === "Nigeria" ? type.localPrice : type.internationalPrice;

  return Number(priceString) || 0;
};
