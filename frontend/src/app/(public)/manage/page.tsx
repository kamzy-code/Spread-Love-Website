import ManageHero from "@/components/manage/manageHero";
import SearchForm from "@/components/manage/searchForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Your Booking – Spread Love Network",
  description:
    "Track and update your booking using your booking ID. Easily manage your surprise call details.",
  keywords: [
    "manage booking",
    "track surprise call",
    "update booking",
    "booking ID",
    "gifting platform Nigeria",
  ],
  alternates: {
    canonical: "https://spreadlovenetwork.com/manage",
  },
  openGraph: {
    title: "Manage Your Booking – Spread Love Network",
    description:
      "Use your booking ID to view or update your surprise call booking.",
    url: "https://spreadlovenetwork.com/manage",
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

export default async function ManageBookingPage({
  searchParams,
}: {
  searchParams: Promise<{ id: string }>;
}) {
  const { id } = await searchParams;
  return (
    <main>
      <ManageHero />
      <SearchForm id={id} />
    </main>
  );
}
