import AdminServices from "@/components/(admin)/services/services";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services",
};

export default function ServicesPage() {
  return <AdminServices></AdminServices>;
}
