import { useRouter } from "next/navigation";
import { XCircle, Ticket } from "lucide-react";
import MiniLoader from "../ui/miniLoader";
import { formatToYMD } from "@/lib/formatDate";
import { useFetchCoupons } from "@/hooks/useCoupons";

export default function CouponList() {
  const router = useRouter();
  const { data: coupons, error, isLoading, refetch } = useFetchCoupons();

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
  );
}
