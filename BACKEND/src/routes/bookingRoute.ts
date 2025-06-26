import express from "express";
import bookingController from "../controllers/bookingController";
import { authMiddlewrare, checkRole } from "../middlewares/authMiddleware";
import { adminRole } from "../types/genralTypes";

const router = express.Router();

// admin endpoint
router.get(
  "/admin",
  authMiddlewrare,
  checkRole("superadmin", "salesrep", "callrep"), bookingController.getAllBooking
);

router.get(
  "/admin/analytics",
  authMiddlewrare,
  checkRole("superadmin", "salesrep", "callrep"),
  bookingController.getBookingAnalytics
);

router.get(
  "/admin/:bookingId",
  authMiddlewrare,
  checkRole("superadmin", "salesrep", "callrep"),
  bookingController.getBookingById
);

router.put(
  "/admin/assign/:bookingId",
  authMiddlewrare,
  checkRole("superadmin", "salesrep"),
  bookingController.assignCallToRep
);
router.put(
  "/admin/:bookingId/status",
  authMiddlewrare,
  checkRole("superadmin", "salesrep", "callrep"),
  bookingController.updateBookingStatus
);

// customer endpoints
router.post("/create", bookingController.createBooking);
router.get("/id/generate", bookingController.generateBookingID);
router.get("/:bookingId", bookingController.getBookingByBookingId);
router.put("/:bookingId/update", bookingController.updateBookingByCustomer);

export default router;
