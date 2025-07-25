"use client";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/authContext";
import PageLoading from "../ui/pageLoading";
import PageError from "../ui/pageError";
import AdminShell from "../ui/AdminShell";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Plus, TriangleAlert } from "lucide-react";
import RepsContextProvider from "./repsContext";
import RepList from "./repList";
import CreateRepForm from "./createRep";

export default function Reprsentatives() {
  const router = useRouter();
  const { user, authStatus, authError, loading } = useAdminAuth();
  const [mounted, setMounted] = useState(false);
  const [showFilter, setShowFilter] = useState(true);
  const allowedRoles = ["superadmin", "salesrep"];
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (showCreateForm) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showCreateForm]);

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
          className="py-6 md:py-12 space-y-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Reps</h1>
            <div className="flex gap-4">
              <button
                className="flex rounded-md h-8 justify-center text-sm items-center gap-2 px-4 py-2 border border-brand-end hover:bg-brand-end hover:scale-105 hover:text-white transition text-brand-end active:bg-brand-end active:text-white"
                onClick={() => setShowFilter(!showFilter)}
              >
                <Filter className="h-5 w-5" />
                <p className="hidden md:flex">Filter</p>
              </button>

              {user?.role === "superadmin" && (
                <button
                  className="flex rounded-md h-8 justify-center text-sm items-center gap-2 px-4 py-2 btn-primary hover:scale-105 transition"
                  onClick={() => setShowCreateForm(true)}
                >
                  <Plus className="h-5 w-5 " />
                  <p className="hidden md:flex">Add</p>
                </button>
              )}
            </div>
          </div>

          <RepsContextProvider showFilter={showFilter}>
            {showCreateForm && (
              <div>
                <CreateRepForm
                  setShowCreateForm={(val: boolean) => setShowCreateForm(val)}
                ></CreateRepForm>
              </div>
            )}

            <div>
              <RepList></RepList>
            </div>
          </RepsContextProvider>
        </motion.div>
      </AdminShell>
    </AnimatePresence>
  );
}
