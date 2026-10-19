import express from "express";
import bookingPopupController from "../controllers/bookingPopupController";
import { authMiddleware, checkRole } from "../middlewares/authMiddleware";
import { validateRequest } from "../middlewares/validateRequest";
import { updateBookingPopupSchema } from "../validation/bookingPopupSchemas";

const router = express.Router();

// public — booking form page load; returns nothing but { enabled: false }
// unless the pop-up is on
router.get("/", bookingPopupController.getPublicPopup);

// admin — superadmin-only, same as service mutations
router.get(
  "/admin",
  authMiddleware,
  checkRole("superadmin"),
  bookingPopupController.getAdminPopup,
);

router.put(
  "/admin",
  authMiddleware,
  checkRole("superadmin"),
  validateRequest(updateBookingPopupSchema),
  bookingPopupController.updatePopup,
);

router.use((req, res) => {
  res.status(404).json({ message: "Booking pop-up route not found" });
});

export default router;
