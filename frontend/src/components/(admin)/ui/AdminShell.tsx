"use client";
import React from "react";
import TopNav from "@/components/(admin)/ui/topNav";
import SideNav from "@/components/(admin)/ui/sideNav";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {


  return (
    <div className="min-h-screen ">
      <TopNav />
      <SideNav />
      <main className="pt-16 md:ml-64 px-4 sm:px-6 md:px-8 h-screen">{children}</main>
    </div>
  );
}
