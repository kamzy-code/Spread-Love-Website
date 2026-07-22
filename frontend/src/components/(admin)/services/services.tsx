"use client";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import PageLoading from "../ui/pageLoading";
import PageError from "../ui/pageError";
import AdminShell from "../ui/AdminShell";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TriangleAlert } from "lucide-react";
import ServiceAdminList from "./serviceAdminList";

export default function AdminServices() {
  const router = useRouter();
  const { user, authStatus, authError, loading } = useAdminAuth();
  const [mounted, setMounted] = useState(false);
  const allowedRoles = ["superadmin", "salesrep"];

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
    router.replace("/admin");
    return null;
  }

  if (!allowedRoles.includes(user?.role as string)) {
    return (
      <AdminShell>
        <div className="flex flex-col justify-center items-center h-full w-full gap-4">
          <TriangleAlert className="h-8 w-8 text-gray-500" />
          <p className="text-gray-700">Unauthorized</p>
          <button
            className="btn-primary rounded-lg"
            onClick={() => router.replace("/admin/dashboard")}
          >
            Go Back
          </button>
        </div>
      </AdminShell>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <AdminShell>
        <motion.div
          className="py-6 md:py-12 space-y-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Services</h1>
          </div>

          <ServiceAdminList isSuperAdmin={user?.role === "superadmin"}></ServiceAdminList>
        </motion.div>
      </AdminShell>
    </AnimatePresence>
  );
}
