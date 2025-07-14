"use client";
import { useFetchRep } from "@/hooks/useReps";
import { useState, useEffect } from "react";
import { XCircle, Users, TriangleAlert } from "lucide-react";
import MiniLoader from "../../ui/miniLoader";
import { useAdminAuth } from "@/hooks/authContext";
import PageLoading from "../../ui/pageLoading";
import PageError from "../../ui/pageError";
import { motion } from "framer-motion";
import { Rep } from "@/lib/types";
import { Details } from "./details";
import AdminShell from "../../ui/AdminShell";
import { useRouter } from "next/router";

export default function RepDetails({ repId }: { repId: string }) {
  const { user, authStatus, isAuthenticated, authError, loading } =
    useAdminAuth();
  const router = useRouter();
  const allowedRoles = ["superadmin", "salesrep"];
  const [mounted, setMounted] = useState(false);
  const { data, error, isLoading, isFetching, refetch } = useFetchRep(repId);
  const repData: Rep = data?.data as any;

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

  if (error)
    return (
      <AdminShell>
        <div className="absolute top-[70%] left-[50%] translate-x-[-50%] translate-y-[-50%]  flex-1 flex flex-col justify-center items-center text-gray-500 gap-4">
          <div className="flex flex-col justify-center items-center text-center z-10">
            <XCircle className="h-8 md:w-8 text-red-500" />
            <p className="text-gray-500">
              {error.message ? error.message : "Error Fetching Rep"}
            </p>
          </div>
          <button
            className="btn-primary h-10 rounded-lg flex justify-center items-center"
            onClick={() => refetch()}
          >
            Try again
          </button>
        </div>
      </AdminShell>
    );

  return (
    <AdminShell>
      <motion.div
        className=""
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {(isLoading || isFetching) && (
          <div>
            <div className="fixed z-50 bg-black/5 top-0 left-0 right-0 bottom-0"></div>
            <div className="fixed z-50 top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
              <div className="">
                <div className="p-4 card">
                  <MiniLoader></MiniLoader>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !isFetching && !data && (
          <div className="absolute top-[70%] left-[50%] translate-x-[-50%] translate-y-[-50%]  flex-1 flex flex-col justify-center items-center text-gray-500">
            <Users className="h-4 w-4 md:h-6 md:w-6" />
            <p className="text-sm md:text-[1rem]">No Rep Found</p>
          </div>
        )}

        {!isLoading && !isFetching && repData && (
          <Details repData={repData}></Details>
        )}
      </motion.div>
    </AdminShell>
  );
}
