import OurServices from "@/components/services/ourServices";
import Services from "@/components/services/serviceList";
import ReadyToSurprise from "@/components/services/ready";
import ChooseType from "@/components/services/chooseType";
import { Metadata } from "next";
import Head from "next/head";

export const metadata: Metadata = {
  title: "Services",
};

export default function services() {
  return (
    <div>
      <Head>
        <title>Our Services – Spread Love Network</title>
        <meta
          name="description"
          content="Explore the different surprise call services we offer — from birthday greetings to romantic calls and celebrity surprises."
        />
        <meta
          name="keywords"
          content="surprise call services, birthday call Nigeria, romantic gifting, celebrity calls, gift ideas"
        />
        <link rel="canonical" href="https://spreadlovenetwork.com/services" />

        <meta
          property="og:title"
          content="Our Services – Spread Love Network"
        />
        <meta
          property="og:description"
          content="Explore personalized call experiences designed to delight your loved ones."
        />
        <meta
          property="og:url"
          content="https://spreadlovenetwork.com/services"
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
              "@type": "Service",
              provider: {
                "@type": "Organization",
                name: "Spread Love Network",
              },
              serviceType: "Surprise Call Services",
              areaServed: {
                "@type": "Continent",
                name: "Africa, Europe, North America, and South America",
              },
              
              description:
                "We offer personalized surprise call services for birthdays, anniversarie, romantic and other celebrations across Nigeria and Internationally.",
            }),
          }}
        />
      </Head>

      <OurServices></OurServices>
      <ChooseType></ChooseType>
      <Services></Services>
      <ReadyToSurprise></ReadyToSurprise>
    </div>
  );
}
