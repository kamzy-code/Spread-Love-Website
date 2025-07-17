"use client";
import { useAdminAuth } from "@/hooks/authContext";
import AdminShell from "../ui/AdminShell";
import { useState, useEffect } from "react";
import PageLoading from "../ui/pageLoading";
import PageError from "../ui/pageError";
import { motion, AnimatePresence } from "framer-motion";
import { AdminUser, Rep } from "@/lib/types";
import Details from "./details";

export default function Profile() {
  const { user, authStatus, isAuthenticated, authError, loading, logout, reload } =
    useAdminAuth();

  const [mounted, setMounted] = useState(false);

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
            <h1 className="text-3xl font-bold">Profile</h1>
          </div>

          <Details user={user as AdminUser} reload={reload} />
        </motion.div>
      </AdminShell>
    </AnimatePresence>
  );
}
