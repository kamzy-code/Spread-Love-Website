"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, TriangleAlert } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import PageLoading from "../../ui/pageLoading";
import PageError from "../../ui/pageError";
import AdminShell from "../../ui/AdminShell";
import RatingTemplateList from "./RatingTemplateList";
import RatingTemplateFormModal from "./RatingTemplateFormModal";

// Superadmin-only — sales reps rate against whatever template is active but
// don't manage templates themselves (plan/pending/sprint_2.md decision #13).
export default function RatingTemplates() {
  const router = useRouter();
  const { user, authStatus, authError, loading } = useAdminAuth();
  const [mounted, setMounted] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const allowedRoles = ["superadmin"];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.replace("/admin");
    }
  }, [authStatus, router]);

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
            <div>
              <h1 className="text-3xl font-bold">Call Rating Templates</h1>
              <p className="text-gray-600 text-sm mt-1">
                Define the QC checklist calls are reviewed against. Only one template is active
                at a time.
              </p>
            </div>
            <button
              className="flex rounded-md h-8 justify-center text-sm items-center gap-2 px-4 py-2 btn-primary hover:scale-105 transition"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus className="h-5 w-5" />
              <p className="hidden md:flex">Add</p>
            </button>
          </div>

          <RatingTemplateList></RatingTemplateList>
        </motion.div>

        {showCreateForm && <RatingTemplateFormModal onClose={() => setShowCreateForm(false)} />}
      </AdminShell>
    </AnimatePresence>
  );
}
