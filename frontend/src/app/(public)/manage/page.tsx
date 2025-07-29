import ManageHero from "@/components/manage/manageHero";
import SearchForm from "@/components/manage/searchForm";
import { Metadata } from "next";
import Head from "next/head";

export const metadata: Metadata = {
  title: "Manage Booking",
};

export default async function ManageBookingPage({
  searchParams,
}: {
  searchParams: Promise<{ id: string }>;
}) {
  const { id } = await searchParams;
  return (
    <div>
      <Head>
        <title>Manage Your Booking – Spread Love Network</title>
        <meta
          name="description"
          content="Track and update your booking with your booking ID. Easily modify call details and manage your surprise experience."
        />
        <meta
          name="keywords"
          content="manage booking, track surprise call, update call details, booking ID, gifting platform Nigeria"
        />
        <link rel="canonical" href="https://spreadlovenetwork.com/manage" />

        <meta
          property="og:title"
          content="Manage Your Booking – Spread Love Network"
        />
        <meta
          property="og:description"
          content="Use your booking ID to manage or update your surprise call."
        />
        <meta
          property="og:url"
          content="https://spreadlovenetwork.com/manage"
        />
        <meta
          property="og:image"
          content="https://spreadlovenetwork.com/og-preview.png"
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              name: "Manage Booking",
              url: "https://spreadlovenetwork.com/manage",
              description:
                "Track and manage your surprise call booking using your booking ID.",
            }),
          }}
        />
      </Head>

      <ManageHero></ManageHero>

      <SearchForm id={id}></SearchForm>
    </div>
  );
}
