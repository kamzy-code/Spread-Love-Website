import { Metadata } from "next";
import Head from "next/head";
import { Suspense } from "react";
import { PageLoader } from "@/components/ui/pageLoader";
import Story from "@/components/about/ourStory";
import SpreadingLove from "@/components/about/spreadingLove";
import Journey from "@/components/about/journey";
import Team from "@/components/about/team";
import Values from "@/components/about/values";
import Mission from "@/components/about/mission";

export const metadata: Metadata = {
  title: "About",
};

export default function About() {
  return (
    <>
      <Head>
        <title>About Us – Spread Love Network</title>
        <meta
          name="description"
          content="Learn about the vision behind Spread Love Network. We’re on a mission to make special moments unforgettable through surprise gifting experiences."
        />
        <meta
          name="keywords"
          content="about Spread Love Network, gifting platform Nigeria, surprise call team, who we are"
        />
        <link rel="canonical" href="https://spreadlovenetwork.com/about" />

        <meta property="og:title" content="About Us – Spread Love Network" />
        <meta
          property="og:description"
          content="Discover the people and passion behind our surprise call gifting platform."
        />
        <meta property="og:url" content="https://spreadlovenetwork.com/about" />
        <meta
          property="og:image"
          content="https://spreadlovenetwork.com/og-preview.png"
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Spread Love Network",
              url: "https://spreadlovenetwork.com",
              logo: "https://spreadlovenetwork.com/logo.png",
              description:
                "A surprise call gifting platform bringing joy to Nigerians through personalized calls.",
              sameAs: [
                "https://web.facebook.com/people/Spread-Love-Network/100095027434511/?_rdc=1&_rdr#",
                "https://www.instagram.com/spread_love_network_?igsh=MWZic3RzYTR3cmpqNg==",
              ],
              founder: {
                "@type": "Person",
                name: "Udochukwu Ezinne Favour",
              },
              foundingDate: "2023",
              address: {
                "@type": "PostalAddress",
                addressCountry: "NG",
              },
            }),
          }}
        />
      </Head>

      {/* <AboutCombined></AboutCombined> */}
      <Suspense fallback={<PageLoader></PageLoader>}>
         <Story></Story>
         <SpreadingLove></SpreadingLove>
         <Journey></Journey>
         <Team></Team>
         <Values></Values>
         <Mission></Mission>
        </Suspense>
    </>
  );
}
