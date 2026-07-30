import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { XCircle, Ticket } from "lucide-react";
import MiniLoader from "../ui/miniLoader";
import { formatToYMD } from "@/lib/formatDate";
import { useFetchCoupons } from "@/hooks/useCoupons";
import { useCouponFilterStore } from "@/store/couponFilterStore";
import Pagination from "../ui/pagination";

const getCouponStatus = (coupon: { active: boolean; expiresAt: string; usedCount: number; usageLimit: number }) => {
  const isExpired = new Date(coupon.expiresAt) < new Date();
  const isExhausted = coupon.usedCount >= coupon.usageLimit;
  if (!coupon.active) return "inactive";
  if (isExpired) return "expired";
  if (isExhausted) return "exhausted";
  return "active";
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  inactive: { label: "Inactive", color: "text-gray-500" },
  expired: { label: "Expired", color: "text-red-500" },
  exhausted: { label: "Exhausted", color: "text-red-500" },
  active: { label: "Active", color: "text-green-500" },
};

export default function CouponList() {
  const router = useRouter();

  const appliedFormData = useCouponFilterStore((s) => s.appliedFormData);
  const searchTerm = useCouponFilterStore((s) => s.debouncedValue);
  const setPage = useCouponFilterStore((s) => s.setPage);
  const filter = { ...appliedFormData, search: searchTerm };

  const { data, error, isLoading, isFetching, refetch } = useFetchCoupons(filter, searchTerm);
  const { data: coupons, meta } = data ?? { data: [], meta: undefined };

  useEffect(() => {
    document.body.style.overflow = isLoading || isFetching ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLoading, isFetching]);

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

  return (
    <div>
      {(isLoading || isFetching) && (
        <div className="py-12 flex justify-center">
          <MiniLoader></MiniLoader>
        </div>
      )}

      {!isLoading && !isFetching && coupons.length === 0 && (
        <div className="flex flex-col justify-center items-center text-gray-500 py-12">
          <Ticket className="h-6 w-6" />
          <p className="text-sm">No Coupons Found</p>
        </div>
      )}

      {!isLoading && !isFetching && coupons.length > 0 && (
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {coupons.map((coupon) => {
              const status = STATUS_LABELS[getCouponStatus(coupon)];

              return (
                <div
                  key={coupon._id}
                  className="card p-6 space-y-3 cursor-pointer hover:shadow-md transition"
                  onClick={() => router.push(`/admin/coupons/${coupon._id}`)}
                >
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
                </div>
              );
            })}
          </div>

          {meta && <Pagination meta={meta} setPage={setPage}></Pagination>}
        </div>
      )}
    </div>
  );
}
