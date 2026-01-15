import BookHero from "@/components/book/bookHero";
import BookingForm from "@/components/book/bookForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book a Surprise Call – Spread Love Network",
  description:
    "Ready to spread love? Book a surprise call for someone special today. Choose your call type, timing, and leave the rest to us!",
  keywords: [
    "book surprise call",
    "online gifting Nigeria",
    "birthday surprise Nigeria",
    "Spread Love Network booking",
  ],
  alternates: {
    canonical: "https://spreadlovenetwork.com/book",
  },
  openGraph: {
    title: "Book a Surprise Call – Spread Love Network",
    description:
      "Book personalized calls to celebrate birthdays, achievements, and special moments.",
    url: "https://spreadlovenetwork.com/book",
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

export default function BookingPage() {
  return (
    <main>
      <BookHero />

      <section className="gradient-background-soft">
        <BookingForm />
      </section>
    </main>
  );
}
