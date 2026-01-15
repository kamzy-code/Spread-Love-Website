import ExperienceMagic from "@/components/home/experienceMagic";
import Hero from "@/components/home/hero";
import HowItWorks from "@/components/home/howItWorks";
import Ready from "@/components/home/ready";
import Stories from "@/components/home/stories";
import WhyChoose from "@/components/home/whyChoose";
import { Metadata } from "next";


export const metadata: Metadata = {
  title: "Spread Love Network – Surprise Call Gifting Platform",
  description:
    "Book heartfelt surprise calls for your loved ones. Fast, secure, and memorable.",
  keywords: [
    "surprise call",
    "gifting",
    "birthday calls",
    "Spread Love Network",
  ],
  alternates: {
    canonical: "https://spreadlovenetwork.com/",
  },
  openGraph: {
    title: "Spread Love Network – Surprise Call Gifting Platform",
    description: "Send surprise calls to celebrate loved ones.",
    url: "https://spreadlovenetwork.com/",
    siteName: "Spread Love Network",
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

export default function Home() {
  return (
    <main>
      <Hero></Hero>
      <HowItWorks></HowItWorks>
      <ExperienceMagic></ExperienceMagic>
      <WhyChoose></WhyChoose>
      <Stories></Stories>
      <Ready></Ready>
    </main>
  );
}
