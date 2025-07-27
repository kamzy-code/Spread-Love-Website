"use client";
import { useAdminAuth } from "@/hooks/authContext";
import { useState, useEffect } from "react";
import PageLoading from "../ui/pageLoading";
import PageError from "../ui/pageError";
import { motion, AnimatePresence } from "framer-motion";
import AdminShell from "../ui/AdminShell";
import { TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";

import LogData from "./logData";

export default function Logs() {
  const { user, authStatus, authError, loading } = useAdminAuth();
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
    router.replace("/admin");
    return null;
  }
  if (user?.role !== "superadmin") {
    return (
      <AdminShell>
        <div className="flex flex-col justify-center items-center h-full w-full gap-4">
          <TriangleAlert className="h-8 w-8 text-gray-500" />
          <p className="text-gray-700">Unauthorized</p>
          <button
            className="btn-primary rounded-lg"
            onClick={() => router.replace("/admin/dashboard")}
          >
            {" "}
            Go Back{" "}
          </button>
        </div>
      </AdminShell>
    );
  }
  return (
    <AnimatePresence mode="wait">
      <AdminShell>
        <motion.div
          className="py-6 md:py-12 space-y-8 h-full flex flex-col relative"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div>
            <div className="flex justify-between">
              <h1 className="text-3xl font-bold">Log Viewer</h1>
              <button className="btn-primary rounded-lg h-10 flex justify-center items-center">
                Download
              </button>
            </div>
          </div>

          <div className="w-full">
            <LogData></LogData>
          </div>
        </motion.div>
      </AdminShell>
    </AnimatePresence>
  );
}
