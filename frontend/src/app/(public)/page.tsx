import ExperienceMagic from "@/components/home/experienceMagic";
import Hero from "@/components/home/hero";
import HowItWorks from "@/components/home/howItWorks";
import Ready from "@/components/home/ready";
import Stories from "@/components/home/stories";
import WhyChoose from "@/components/home/whyChoose";
import { PageLoader } from "@/components/ui/pageLoader";
import { Metadata } from "next";
import Head from "next/head";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Home",
};

export default function Home() {
  return (
    <>
      <Head>
        <title>Spread Love Network – Surprise Call Gifting Platform</title>
        <meta
          name="description"
          content="Book heartfelt surprise calls for your loved ones. Fast, secure, and memorable."
        />
        <meta
          name="keywords"
          content="surprise call, gifting, birthday calls, love call Nigeria, Spread Love Network, surprise ideas, surprise vendors"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="author" content="Spread Love Network" />
        <link rel="canonical" href="https://spreadlovenetwork.com/" />
        {/* Open Graph */}
        <meta
          property="og:title"
          content="Spread Love Network – Surprise Call Gifting Platform"
        />
        <meta
          property="og:description"
          content="Send surprise calls to celebrate loved ones. Book now!"
        />
        <meta
          property="og:image"
          content="https://spreadlovenetwork.com/og-preview.png"
        />
        <meta property="og:url" content="https://spreadlovenetwork.com/" />
        <meta property="og:type" content="website" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Spread Love Network",
              url: "https://spreadlovenetwork.com",
              logo: "https://spreadlovenetwork.com/logo.png",
              sameAs: [
                "https://web.facebook.com/people/Spread-Love-Network/100095027434511/?_rdc=1&_rdr#",
                "https://www.instagram.com/spread_love_network_?igsh=MWZic3RzYTR3cmpqNg==",
              ],
            }),
          }}
        />
      </Head>
      <main>
        <Suspense fallback={<PageLoader></PageLoader>}>
          <Hero></Hero>
          <HowItWorks></HowItWorks>
          <ExperienceMagic></ExperienceMagic>
          <WhyChoose></WhyChoose>
          <Stories></Stories>
          <Ready></Ready>
        </Suspense>
      </main>
    </>
  );
}
