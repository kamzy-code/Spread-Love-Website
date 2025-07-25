import Booking from "@/components/(admin)/bookings/bookings";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Booking",
};

export default function Bookings() {
  return <Booking></Booking>;
}
