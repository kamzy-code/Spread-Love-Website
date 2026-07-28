"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Ban, CheckCircle, XCircle, TriangleAlert } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  useFetchCoupon,
  useDeactivateCoupon,
  useReactivateCoupon,
} from "@/hooks/useCoupons";
import { formatToYMD } from "@/lib/formatDate";
import PageLoading from "../ui/pageLoading";
import PageError from "../ui/pageError";
import AdminShell from "../ui/AdminShell";
import AuditLogSidebar from "../ui/AuditLogSidebar";
import MiniLoader from "../ui/miniLoader";
import CouponFormModal from "./CouponFormModal";
import ToggleCouponStatusModal from "./ToggleCouponStatusModal";

export default function CouponDetails({ id }: { id: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, authStatus, authError, loading } = useAdminAuth();
  const [mounted, setMounted] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(false);
  const [toggling, setToggling] = useState(false);

  const { data: coupon, isLoading, isFetching, error, refetch } = useFetchCoupon(id);
  const deactivateMutation = useDeactivateCoupon();
  const reactivateMutation = useReactivateCoupon();
  const isSuperAdmin = user?.role === "superadmin";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (loading || authStatus === "checking") return <PageLoading></PageLoading>;
  if (authStatus === "error" && authError) return <PageError></PageError>;
  if (authStatus !== "authenticated") return null;

  if (!["superadmin", "salesrep"].includes(user?.role as string)) {
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

  if (error)
    return (
      <AdminShell>
        <div className="absolute top-[70%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex-1 flex flex-col justify-center items-center text-gray-500 gap-4">
          <div className="flex flex-col justify-center items-center text-center z-10">
            <XCircle className="h-8 md:w-8 text-red-500" />
            <p className="text-gray-500">{error.message}</p>
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

  const handleConfirmToggle = async () => {
    if (!coupon) return;
    if (coupon.active) {
      await deactivateMutation.mutateAsync(coupon._id);
    } else {
      await reactivateMutation.mutateAsync(coupon._id);
    }
    queryClient.invalidateQueries({ queryKey: ["coupon", id] });
    queryClient.invalidateQueries({ queryKey: ["coupons"] });
    queryClient.invalidateQueries({ queryKey: ["auditLogs", "coupon", id] });
    setToggling(false);
  };

  const isExpired = coupon ? new Date(coupon.expiresAt) < new Date() : false;
  const isExhausted = coupon ? coupon.usedCount >= coupon.usageLimit : false;
  const status = !coupon?.active
    ? { label: "Inactive", color: "text-gray-500 bg-gray-100" }
    : isExpired
      ? { label: "Expired", color: "text-red-500 bg-red-50" }
      : isExhausted
        ? { label: "Exhausted", color: "text-red-500 bg-red-50" }
        : { label: "Active", color: "text-green-500 bg-green-50" };

  return (
    <AdminShell>
      <section className="w-full flex justify-center py-3 md:py-8">
        {(isLoading || isFetching) && (
          <div>
            <div className="fixed z-50 bg-black/5 top-0 left-0 right-0 bottom-0"></div>
            <div className="fixed z-50 top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
              <div className="p-4 card">
                <MiniLoader></MiniLoader>
              </div>
            </div>
          </div>
        )}

        {!!coupon && !isLoading && (
          <div className="w-full space-y-4">
            <button
              className="btn-secondary rounded-md py-1 md:py-2 border font-normal active:bg-brand-start active:text-white transition duration-150"
              onClick={() => router.back()}
            >
              Back
            </button>

            <section className="flex flex-col lg:flex-row w-full gap-6">
              <div className="py-6 md:py-8 flex-1 min-w-0 space-y-6 text-brand-start">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <h2 className="gradient-text font-bold text-xl md:text-2xl">
                      {coupon.code}
                    </h2>
                    <p className="text-gray-700 text-md">Coupon Details</p>
                  </div>
                  <p className={`px-4 py-2 rounded-full w-fit ${status.color}`}>{status.label}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-2">
                    <label className="text-gray-700 font-medium">Discount:</label>
                    <p className="py-1 w-full">
                      {coupon.discountType === "percent"
                        ? `${coupon.value}%`
                        : `₦${coupon.value.toLocaleString()}`}
                    </p>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-gray-700 font-medium">Usage:</label>
                    <p className="py-1 w-full">
                      {coupon.usedCount} / {coupon.usageLimit}
                    </p>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-gray-700 font-medium">Expires:</label>
                    <p className="py-1 w-full">{formatToYMD(coupon.expiresAt)}</p>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-gray-700 font-medium">Created:</label>
                    <p className="py-1 w-full">{formatToYMD(coupon.createdAt)}</p>
                  </div>
                </div>

                {isSuperAdmin && (
                  <div className="flex gap-4 pt-2">
                    <button
                      className="flex items-center gap-1.5 text-sm text-brand-start hover:underline"
                      onClick={() => setEditingCoupon(true)}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      className={`flex items-center gap-1.5 text-sm hover:underline ${
                        coupon.active ? "text-red-500" : "text-green-600"
                      }`}
                      onClick={() => setToggling(true)}
                    >
                      {coupon.active ? (
                        <>
                          <Ban className="h-4 w-4" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Reactivate
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              <AuditLogSidebar entity="coupon" entityId={coupon._id} isSuperAdmin={isSuperAdmin} />
            </section>
          </div>
        )}
      </section>

      {editingCoupon && coupon && (
        <CouponFormModal
          coupon={coupon}
          adminId={user!._id}
          onClose={() => {
            queryClient.invalidateQueries({ queryKey: ["coupon", id] });
            queryClient.invalidateQueries({ queryKey: ["auditLogs", "coupon", id] });
            setEditingCoupon(false);
          }}
        />
      )}

      {toggling && coupon && (
        <ToggleCouponStatusModal
          couponCode={coupon.code}
          action={coupon.active ? "deactivate" : "reactivate"}
          onCancel={() => setToggling(false)}
          onConfirm={handleConfirmToggle}
          isPending={deactivateMutation.isPending || reactivateMutation.isPending}
        />
      )}
    </AdminShell>
  );
}
