"use client";

import { useAdminAuth } from "@/hooks/authContext";
import { useEffect, useState } from "react";
import AdminShell from "../ui/AdminShell";
import PageError from "../ui/pageError";
import PageLoading from "../ui/pageLoading";
import DashboardContextProvider from "./dashboardFilterContext";
import Analytics from "./analytics";
import RecentBookings from "./recentBooking";
import { Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const { authStatus, authError, loading } = useAdminAuth();
  const [mounted, setMounted] = useState(false);
  const [showFilter, setShowFilter] = useState(true);

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
          <div className="flex justify-between">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <button
              className="flex items-center px-4 py-2 border border-brand-end rounded-lg hover:bg-brand-end hover:scale-105 hover:text-white transition text-brand-end"
              onClick={() => setShowFilter(!showFilter)}
            >
              <Filter className="h-5 w-5 mr-2 " />
              Filter
            </button>
          </div>

          <DashboardContextProvider showFilter={showFilter}>
            <div>
              <Analytics></Analytics>
            </div>
            <div>
              <RecentBookings></RecentBookings>
            </div>
          </DashboardContextProvider>
        </motion.div>
      </AdminShell>
    </AnimatePresence>
  );
}
