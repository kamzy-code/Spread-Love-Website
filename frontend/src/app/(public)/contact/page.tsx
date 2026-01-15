import { Metadata } from "next";
import GetInTouch from "@/components/contact/getInTouch";
import ContactInfo from "@/components/contact/contactInfo";
import DetailedContact from "@/components/contact/detailedContact";
import FAQ from "@/components/contact/faq";

export const metadata: Metadata = {
  title: "Contact Us – Spread Love Network",
  description:
    "Have questions or feedback? Reach out to Spread Love Network. We’re here to help make your surprise call perfect.",
  keywords: [
    "contact Spread Love Network",
    "customer support",
    "surprise call support",
    "gifting platform Nigeria",
  ],
  alternates: {
    canonical: "https://spreadlovenetwork.com/contact",
  },
  openGraph: {
    title: "Contact Us – Spread Love Network",
    description:
      "Need help with your booking or want to partner with us? Get in touch today.",
    url: "https://spreadlovenetwork.com/contact",
    images: [
      {
        url: "https://spreadlovenetwork.com/og-preview.png",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <main>
      <GetInTouch />
      <ContactInfo />
      <DetailedContact />
      <FAQ />
    </main>
  );
}
