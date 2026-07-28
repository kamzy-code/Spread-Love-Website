import express from "express";
import couponController from "../controllers/couponController";
import { authMiddleware, checkRole } from "../middlewares/authMiddleware";
import { validateRequest } from "../middlewares/validateRequest";
import {
  createCoupounSchema,
  updateCouponSchema,
  validateCouponSchema,
} from "../validation/couponSchema";

const router = express.Router();

// public — used at checkout to preview a discount before booking creation
router.post(
  "/validate",
  validateRequest(validateCouponSchema),
  couponController.validateCoupon,
);

// admin — mutations are superadmin-only; salesrep gets read access only
router.post(
  "/admin",
  authMiddleware,
  checkRole("superadmin"),
  validateRequest(createCoupounSchema),
  couponController.createCoupon,
);
router.get(
  "/admin",
  authMiddleware,
  checkRole("superadmin", "salesrep"),
  couponController.getAllCoupons,
);

router.get(
  "/admin/:id",
  authMiddleware,
  checkRole("superadmin", "salesrep"),
  couponController.getCouponById,
);

router.put(
  "/admin/:id",
  authMiddleware,
  checkRole("superadmin"),
  validateRequest(updateCouponSchema),
  couponController.updateCoupon,
);

router.put(
  "/admin/:id/deactivate",
  authMiddleware,
  checkRole("superadmin"),
  couponController.deactivateCoupon,
);

router.put(
  "/admin/:id/reactivate",
  authMiddleware,
  checkRole("superadmin"),
  couponController.reactivateCoupon,
);

router.use((req, res) => {
  res.status(404).json({ message: "Coupon route not found" });
});

export default router;
