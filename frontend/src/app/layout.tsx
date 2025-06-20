import type { Metadata } from "next";
import "@/app/globals.css";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";

export const metadata: Metadata = {
  title: "Spread Love Network",
  description: "Make someone's day with a surprise call",
  icons: {
    icon: "./logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        
        <Navbar/>
        <main>{children}</main>
        <Footer/>
      </body>
    </html>
  );
}
