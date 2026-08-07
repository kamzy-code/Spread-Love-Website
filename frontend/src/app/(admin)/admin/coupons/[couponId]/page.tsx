import CouponDetails from "@/components/(admin)/coupons/couponDetails";

export default async function CouponDetailsPage({
  params,
}: {
  params: Promise<{ couponId: string }>;
}) {
  const { couponId } = await params;
  return (
    <div>
      <CouponDetails id={couponId}></CouponDetails>
    </div>
  );
}
