import BookHero from "@/components/book/bookHero";
import BookingForm from "@/components/book/bookForm";
import { Metadata } from "next";
import Head from "next/head";
import { Suspense } from "react";
import { PageLoader } from "@/components/ui/pageLoader";

export const metadata: Metadata = {
  title: "Book",
};

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{
    occassion?: string;
    call_type?: string;
    reference?: string;
  }>;
}) {
  const { occassion, call_type, reference } = await searchParams;
  return (
    <div>
      <Head>
        <title>Book a Surprise Call – Spread Love Network</title>
        <meta
          name="description"
          content="Ready to spread love? Book a surprise call for someone special today. Choose your call type, timing, and leave the rest to us!"
        />
        <meta
          name="keywords"
          content="book surprise call, gifting, spread love booking, birthday surprise Nigeria, online gifting Nigeria"
        />
        <link rel="canonical" href="https://spreadlovenetwork.com/book" />

        <meta
          property="og:title"
          content="Book a Surprise Call – Spread Love Network"
        />
        <meta
          property="og:description"
          content="Book personalized calls to celebrate birthdays, achievements, and special moments."
        />
        <meta property="og:url" content="https://spreadlovenetwork.com/book" />
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
              name: "Book a Surprise Call",
              url: "https://spreadlovenetwork.com/book",
              description:
                "Book a personalized surprise call for someone special with Spread Love Network.",
            }),
          }}
        />
      </Head>
      <BookHero></BookHero>
      <Suspense fallback={<PageLoader></PageLoader>}>
        <section className="gradient-background-soft">
          <BookingForm
            occassion={occassion}
            call_type={call_type}
            reference={reference}
          ></BookingForm>
        </section>
      </Suspense>
    </div>
  );
}
