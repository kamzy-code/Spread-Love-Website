import { Coupon, ICoupon } from "../models/couponModel";

interface CouponValidationResult {
  valid: boolean;
  coupon?: ICoupon;
  reason?: string;
}

class CouponService {
  async createCoupon(data: Partial<ICoupon>) {
    return await Coupon.create(data);
  }

  async listCoupons() {
    return await Coupon.find().sort({ createdAt: -1 });
  }

  async getCouponById(id: string) {
    return await Coupon.findById(id);
  }

  async updateCoupon(id: string, updates: Partial<ICoupon>) {
    return await Coupon.findByIdAndUpdate(id, updates, { new: true });
  }

  async deactivateCoupon(id: string) {
    return await Coupon.findByIdAndUpdate(id, { active: false }, { new: true });
  }

  // never trust client-side discount math — always re-validate server-side
  async validateCoupon(code: string): Promise<CouponValidationResult> {
    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });

    if (!coupon) return { valid: false, reason: "Coupon not found" };
    if (!coupon.active) return { valid: false, reason: "Coupon is inactive" };
    if (coupon.expiresAt < new Date())
      return { valid: false, reason: "Coupon has expired" };
    if (coupon.usedCount >= coupon.usageLimit)
      return { valid: false, reason: "Coupon usage limit reached" };

    return { valid: true, coupon };
  }

  computeDiscount(coupon: ICoupon, totalPrice: number): number {
    if (coupon.discountType === "flat") {
      return Math.min(coupon.value, totalPrice);
    }
    // percent
    return Math.min((coupon.value / 100) * totalPrice, totalPrice);
  }

  // only call on successful booking creation, not on validate-only checks
  async incrementUsage(code: string) {
    await Coupon.updateOne(
      { code: code.toUpperCase().trim() },
      { $inc: { usedCount: 1 } },
    );
  }
}

const couponService = new CouponService();
export default couponService;
