import type { Metadata } from "next";
import "@/app/globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: {
    default: "Spread Love Network",
    template: "%s | Spread Love Network",
    absolute: "",
  },
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
        <SpeedInsights />
        <main>{children}</main>
      </body>
    </html>
  );
}
