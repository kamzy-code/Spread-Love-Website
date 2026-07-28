import { useState } from "react";
import { XCircle, Ticket, Pencil, Ban, CheckCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import MiniLoader from "../ui/miniLoader";
import { Coupon } from "@/lib/types";
import { formatToYMD } from "@/lib/formatDate";
import { useFetchCoupons, useDeactivateCoupon, useReactivateCoupon } from "@/hooks/useCoupons";
import CouponFormModal from "./CouponFormModal";
import ToggleCouponStatusModal from "./ToggleCouponStatusModal";

export default function CouponList({
  adminId,
  isSuperAdmin,
}: {
  adminId: string;
  isSuperAdmin: boolean;
}) {
  const queryClient = useQueryClient();
  const { data: coupons, error, isLoading, refetch } = useFetchCoupons();
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [togglingCoupon, setTogglingCoupon] = useState<Coupon | null>(null);
  const deactivateMutation = useDeactivateCoupon();
  const reactivateMutation = useReactivateCoupon();

  const handleConfirmToggle = async () => {
    if (!togglingCoupon) return;
    if (togglingCoupon.active) {
      await deactivateMutation.mutateAsync(togglingCoupon._id);
    } else {
      await reactivateMutation.mutateAsync(togglingCoupon._id);
    }
    queryClient.invalidateQueries({ queryKey: ["coupons"] });
    setTogglingCoupon(null);
  };

  if (error)
    return (
      <div className="flex flex-col justify-center items-center text-gray-500 gap-4 py-12">
        <XCircle className="h-8 w-8 text-red-500" />
        <p className="text-gray-500">Error Fetching Coupons</p>
        <button
          className="btn-primary h-10 rounded-lg flex justify-center items-center px-6"
          onClick={() => refetch()}
        >
          Try again
        </button>
      </div>
    );

  if (isLoading)
    return (
      <div className="py-12 flex justify-center">
        <MiniLoader></MiniLoader>
      </div>
    );

  if (!coupons || coupons.length === 0)
    return (
      <div className="flex flex-col justify-center items-center text-gray-500 py-12">
        <Ticket className="h-6 w-6" />
        <p className="text-sm">No Coupons Yet</p>
      </div>
    );

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {coupons.map((coupon) => {
          const isExpired = new Date(coupon.expiresAt) < new Date();
          const isExhausted = coupon.usedCount >= coupon.usageLimit;
          const status = !coupon.active
            ? { label: "Inactive", color: "text-gray-500" }
            : isExpired
            ? { label: "Expired", color: "text-red-500" }
            : isExhausted
            ? { label: "Exhausted", color: "text-red-500" }
            : { label: "Active", color: "text-green-500" };

          return (
            <div key={coupon._id} className="card p-6 space-y-3">
              <div className="flex justify-between items-start">
                <h2 className="font-medium text-brand-start">{coupon.code}</h2>
                <p className={status.color}>{status.label}</p>
              </div>

              <div className="text-gray-700 text-sm space-y-2">
                <div className="flex justify-between items-center">
                  <p>Discount:</p>
                  <p className="text-brand-start">
                    {coupon.discountType === "percent"
                      ? `${coupon.value}%`
                      : `₦${coupon.value.toLocaleString()}`}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p>Usage:</p>
                  <p className="text-brand-start">
                    {coupon.usedCount} / {coupon.usageLimit}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p>Expires:</p>
                  <p className="text-brand-start">{formatToYMD(coupon.expiresAt)}</p>
                </div>
              </div>

              {isSuperAdmin && (
                <div className="flex gap-4 pt-2">
                  <button
                    className="flex items-center gap-1.5 text-xs text-brand-start hover:underline"
                    onClick={() => setEditingCoupon(coupon)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    className={`flex items-center gap-1.5 text-xs hover:underline ${
                      coupon.active ? "text-red-500" : "text-green-600"
                    }`}
                    onClick={() => setTogglingCoupon(coupon)}
                  >
                    {coupon.active ? (
                      <>
                        <Ban className="h-3.5 w-3.5" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-3.5 w-3.5" />
                        Reactivate
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editingCoupon && (
        <CouponFormModal
          coupon={editingCoupon}
          adminId={adminId}
          onClose={() => setEditingCoupon(null)}
        />
      )}

      {togglingCoupon && (
        <ToggleCouponStatusModal
          couponCode={togglingCoupon.code}
          action={togglingCoupon.active ? "deactivate" : "reactivate"}
          onCancel={() => setTogglingCoupon(null)}
          onConfirm={handleConfirmToggle}
          isPending={deactivateMutation.isPending || reactivateMutation.isPending}
        />
      )}
    </div>
  );
}
