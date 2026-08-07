import Customers from "@/components/(admin)/customers/customers";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customers",
};

export default function CustomersPage() {
  return <Customers></Customers>;
}
