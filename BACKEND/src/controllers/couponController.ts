import { Request, Response, NextFunction } from "express";
import couponService from "../services/couponService";
import { HttpError } from "../utils/httpError";

class CouponController {
  async createCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const coupon = await couponService.createCoupon(req.body);
      res.status(201).json({ message: "Coupon created", coupon });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  async getAllCoupons(req: Request, res: Response, next: NextFunction) {
    try {
      const coupons = await couponService.listCoupons();
      res.status(200).json({ coupons });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  async getCouponById(req: Request, res: Response, next: NextFunction) {
    try {
      const coupon = await couponService.getCouponById(req.params.id);
      if (!coupon) {
        next(new HttpError(404, "Coupon not found"));
        return;
      }
      res.status(200).json({ coupon });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  async updateCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const coupon = await couponService.updateCoupon(req.params.id, req.body);
      if (!coupon) {
        next(new HttpError(404, "Coupon not found"));
        return;
      }
      res.status(200).json({ message: "Coupon updated", coupon });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  async deactivateCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const coupon = await couponService.deactivateCoupon(req.params.id);
      if (!coupon) {
        next(new HttpError(404, "Coupon not found"));
        return;
      }
      res.status(200).json({ message: "Coupon deactivated", coupon });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  // public: used at checkout to preview a discount before booking creation
  async validateCoupon(req: Request, res: Response, next: NextFunction) {
    const { code, totalPrice } = req.body;

    if (!code || totalPrice === undefined) {
      next(new HttpError(400, "code and totalPrice are required"));
      return;
    }

    try {
      const result = await couponService.validateCoupon(code);

      if (!result.valid || !result.coupon) {
        res.status(200).json({ valid: false, message: result.reason });
        return;
      }

      const discountAmount = couponService.computeDiscount(
        result.coupon,
        Number(totalPrice)
      );

      res.status(200).json({
        valid: true,
        discountAmount,
        newTotal: Number(totalPrice) - discountAmount,
      });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }
}

const couponController = new CouponController();
export default couponController;
