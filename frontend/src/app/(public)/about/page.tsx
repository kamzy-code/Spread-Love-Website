import { Metadata } from "next";
import Story from "@/components/about/ourStory";
import SpreadingLove from "@/components/about/spreadingLove";
import Journey from "@/components/about/journey";
import Team from "@/components/about/team";
import Values from "@/components/about/values";
import Mission from "@/components/about/mission";

export const metadata: Metadata = {
  title: "About Us – Spread Love Network",
  description:
    "Learn about the vision behind Spread Love Network. We’re on a mission to make special moments unforgettable through surprise call experiences.",
  keywords: [
    "about Spread Love Network",
    "gifting platform Nigeria",
    "surprise call team",
    "who we are",
  ],
  alternates: {
    canonical: "https://spreadlovenetwork.com/about",
  },
  openGraph: {
    title: "About Us – Spread Love Network",
    description:
      "Discover the people and passion behind our surprise call gifting platform.",
    url: "https://spreadlovenetwork.com/about",
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

export default function AboutPage() {
  return (
    <main>
      <Story />
      <SpreadingLove />
      <Journey />
      <Team />
      <Values />
      <Mission />
    </main>
  );
}
