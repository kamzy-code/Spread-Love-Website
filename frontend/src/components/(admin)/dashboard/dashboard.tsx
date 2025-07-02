"use client";

import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/authContext";
import { useEffect, useState } from "react";
import AdminShell from "../ui/AdminShell";
import PageError from "../ui/pageError";
import PageLoading from "../ui/pageLoading";

export default function Dashboard() {
  const { user, authStatus, isAuthenticated, authError, loading, logout } = useAdminAuth();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();


  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading || (authStatus === "checking")) {
    return <PageLoading></PageLoading>;
  }

  if ((authStatus === 'error') && authError) {
    return <PageError></PageError>;
  }

  if (authStatus !== "authenticated") {
  return null;
}

  return (
    <AdminShell>
      <div className="py-6 md:py-8 ">
        <h1 className="text-xl font-semibold">
          Welcome back, {user?.firstName} 👋
        </h1>
        <p className="text-gray-600 mt-2">Email: {user?.email}</p>

        <button className="btn-primary mt-6" onClick={() => logout()}>
          Logout
        </button>
      </div>
    </AdminShell>
  );
}
