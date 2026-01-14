import { Metadata } from "next";
import Head from "next/head";
import GetInTouch from "@/components/contact/getInTouch";
import ContactInfo from "@/components/contact/contactInfo";
import DetailedContact from "@/components/contact/detailedContact";
import FAQ from "@/components/contact/faq";
import { Suspense } from "react";
import { PageLoader } from "@/components/ui/pageLoader";

export const metadata: Metadata = {
  title: "Contact",
};

export default function Contact() {
  return (
    <>
      <Head>
        <title>Contact Us – Spread Love Network</title>
        <meta
          name="description"
          content="Have questions or feedback? Reach out to Spread Love Network. We’re here to help make your surprise call perfect."
        />
        <meta
          name="keywords"
          content="contact Spread Love Network, support, customer service, call gifting support"
        />
        <link rel="canonical" href="https://spreadlovenetwork.com/contact" />

        <meta property="og:title" content="Contact Us – Spread Love Network" />
        <meta
          property="og:description"
          content="Need help with your booking or want to partner with us? Get in touch today."
        />
        <meta
          property="og:url"
          content="https://spreadlovenetwork.com/contact"
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
              "@type": "ContactPage",
              name: "Contact Us",
              url: "https://spreadlovenetwork.com/contact",
              description:
                "Need help or have questions? Contact Spread Love Network for support or inquiries.",
              mainEntity: {
                "@type": "Organization",
                name: "Spread Love Network",
                contactPoint: {
                  "@type": "ContactPoint",
                  contactType: "Customer Support",
                  email: "spreadlovenetwork@gmail.com",
                  areaServed: "NG",
                  availableLanguage: "English",
                },
              },
            }),
          }}
        />
      </Head>
      <Suspense fallback={<PageLoader></PageLoader>}>
        <GetInTouch></GetInTouch>
        <ContactInfo></ContactInfo>
        <DetailedContact></DetailedContact>
        <FAQ></FAQ>
      </Suspense>
    </>
  );
}
