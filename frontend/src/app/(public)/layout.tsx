import type { Metadata } from "next";
import "@/app/globals.css";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import Providers from "./providers";
import Script from "next/script";

export const metadata: Metadata = {
  title: {
    default: "Spread Love Network",
    template: "%s | Spread Love Network",
    absolute: "",
  },
  description: "Make someone's day with a surprise call",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <Navbar />
      <main>{children}</main>
      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Spread Love Network",
            url: "https://spreadlovenetwork.com",
          }),
        }}
      />

      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-XMGKXZXTKD"
        strategy="afterInteractive"
      ></Script>
      <Script id="Google tag (gtag.js)">{` window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-XMGKXZXTKD');`}</Script>
    </Providers>
  );
}
