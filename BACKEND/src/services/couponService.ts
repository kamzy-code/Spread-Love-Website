import { Coupon, ICoupon } from "../models/couponModel";
import { bookingLogger } from "../utils/logger";

interface CouponValidationResult {
  valid: boolean;
  coupon?: ICoupon;
  reason?: string;
}

class CouponService {
  async createCoupon(data: Partial<ICoupon>) {
    const coupon = await Coupon.create(data);
    bookingLogger.info("Coupon created", {
      code: coupon.code,
      service: "couponService",
      action: "CREATE_COUPON_SUCCESS",
    });
    return coupon;
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

    const reject = (reason: string): CouponValidationResult => {
      bookingLogger.warn(`Coupon validation failed: ${reason}`, {
        code,
        service: "couponService",
        action: "VALIDATE_COUPON_FAILED",
      });
      return { valid: false, reason };
    };

    if (!coupon) return reject("Coupon not found");
    if (!coupon.active) return reject("Coupon is inactive");
    if (coupon.expiresAt < new Date()) return reject("Coupon has expired");
    if (coupon.usedCount >= coupon.usageLimit)
      return reject("Coupon usage limit reached");

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
    bookingLogger.info("Coupon usage incremented", {
      code,
      service: "couponService",
      action: "INCREMENT_COUPON_USAGE",
    });
  }
}

const couponService = new CouponService();
export default couponService;
