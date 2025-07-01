"use client";

import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/authContext";
import { useEffect, useState } from "react";
import AdminShell from "@/components/(admin)/ui/AdminShell";

export default function AdminDashboard() {
  const { user, isAuthenticated, loading, logout } = useAdminAuth();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && !isAuthenticated) {
      router.replace("/admin");
    }
  }, [isAuthenticated, loading, mounted]);

  if (!mounted || loading) {
    return (
      <AdminShell>
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-end"></div>
        </div>
      </AdminShell>
    );
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
