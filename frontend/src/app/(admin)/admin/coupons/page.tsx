import Coupons from "@/components/(admin)/coupons/coupons";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coupons",
};

export default function CouponsPage() {
  return <Coupons></Coupons>;
}
