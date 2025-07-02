"use client";

import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/authContext";
import { useEffect, useState } from "react";
import AdminShell from "../ui/AdminShell";
import PageError from "../ui/pageError";
import PageLoading from "../ui/pageLoading";
import Analytics from "./analytics";

export default function Dashboard() {
  const { user, authStatus, isAuthenticated, authError, loading, logout } =
    useAdminAuth();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  if (loading || authStatus === "checking") {
    return <PageLoading></PageLoading>;
  }

  if (authStatus === "error" && authError) {
    return <PageError></PageError>;
  }

  if (authStatus !== "authenticated") {
    return null;
  }

  return (
    <AdminShell>
      <div className="py-6 md:py-8 space-y-8">
        <h1 className="text-3xl font-bold"> 
          Dashboard
        </h1>

        <Analytics></Analytics>
        

      </div>
    </AdminShell>
  );
}
