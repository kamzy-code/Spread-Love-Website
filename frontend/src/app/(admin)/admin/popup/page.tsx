import PopupSettings from "@/components/(admin)/popup/PopupSettings";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Booking Pop-up",
};

export default function PopupPage() {
  return <PopupSettings></PopupSettings>;
}
