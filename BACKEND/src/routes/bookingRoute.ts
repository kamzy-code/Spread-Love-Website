import express from "express";
import bookingController from "../controllers/bookingController";
import { authMiddleware, checkRole } from "../middlewares/authMiddleware";
import { adminRole } from "../types/genralTypes";

const router = express.Router();

// admin endpoint
router.get(
  "/admin",
  authMiddleware,
  checkRole("superadmin", "salesrep", "callrep"), bookingController.getAllBooking
);

router.get(
  "/admin/analytics",
  authMiddleware,
  checkRole("superadmin", "salesrep", "callrep"),
  bookingController.getBookingAnalytics
);

router.get(
  "/admin/analytics/:repId",
  authMiddleware,
  checkRole("superadmin", "salesrep"),
  bookingController.getBookingAnalytics
);

router.get(
  "/admin/:bookingId",
  authMiddleware,
  checkRole("superadmin", "salesrep", "callrep"),
  bookingController.getBookingById
);

router.put(
  "/admin/assign/:bookingId",
  authMiddleware,
  checkRole("superadmin", "salesrep"),
  bookingController.assignCallToRep
);
router.put(
  "/admin/:bookingId/status",
  authMiddleware,
  checkRole("superadmin", "salesrep", "callrep"),
  bookingController.updateBookingStatus
);

router.delete(
  "/admin/:bookingId",
  authMiddleware,
  checkRole("superadmin", "salesrep", "callrep"),
  bookingController.DeleteBookingById
);

// customer endpoints
router.post("/create", bookingController.createBooking);
router.get("/id/generate", bookingController.generateBookingID);
router.get("/:bookingId", bookingController.getBookingByBookingId);
router.put("/:bookingId/update", bookingController.updateBookingByCustomer);

export default router;
