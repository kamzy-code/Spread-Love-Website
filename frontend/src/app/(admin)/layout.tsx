import type { Metadata } from "next";
import "@/app/globals.css";
import Providers from "./providers";
import { AdminAuthProvider } from "@/hooks/authContext";

export const metadata: Metadata = {
  title: "Admin - Spread Love Network",
  description: "Make someone's day with a surprise call",
  icons: {
    icon: "./logo.png",
  },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <Providers>
          <main>
          <AdminAuthProvider>
            {children}
          </AdminAuthProvider>
          </main>
        </Providers>
      </body>
    </html>
  );
}
