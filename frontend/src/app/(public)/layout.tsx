import type { Metadata } from "next";
import "@/app/globals.css";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import Providers from "./providers";

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
    </Providers>
  );
}
