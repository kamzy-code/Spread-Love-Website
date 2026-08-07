import type { Metadata } from "next";
import "@/app/globals.css";
import Providers from "./providers";
import { AdminAuthInit } from "@/hooks/useAdminAuth";

export const metadata: Metadata = {
  title: {
    absolute: "Spread Love Network Admin",
    template: "%s | Spread Love Network Admin",
  },
  description: "Manage surprise calls",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <main>
        <AdminAuthInit />
        {children}
      </main>
    </Providers>
  );
}
