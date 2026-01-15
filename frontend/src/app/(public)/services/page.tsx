import OurServices from "@/components/services/ourServices";
import Services from "@/components/services/serviceList";
import ReadyToSurprise from "@/components/services/ready";
import ChooseType from "@/components/services/chooseType";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Services – Spread Love Network",
  description:
    "Explore the different surprise call services we offer — from birthday greetings to romantic calls and celebrity surprises.",
  keywords: [
    "surprise call services",
    "birthday call Nigeria",
    "romantic gifting",
    "celebrity calls",
    "gift ideas",
  ],
  alternates: {
    canonical: "https://spreadlovenetwork.com/services",
  },
  openGraph: {
    title: "Our Services – Spread Love Network",
    description:
      "Explore personalized call experiences designed to delight your loved ones.",
    url: "https://spreadlovenetwork.com/services",
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

export default function ServicesPage() {
  return (
    <main>
      <OurServices />
      <ChooseType />
      <Services />
      <ReadyToSurprise />
    </main>
  );
}
