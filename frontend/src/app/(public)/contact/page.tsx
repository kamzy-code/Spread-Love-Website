import { Metadata } from "next";
import ContactCombined from "./contact";

export const metadata: Metadata = {
  title: "Contact",
};

export default function Contact() {
  return <ContactCombined></ContactCombined>;
}
