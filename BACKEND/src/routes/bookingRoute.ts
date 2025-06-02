import express from "express";
import bookingController from "../controllers/bookingController";
import { authMiddlewrare, checkRole } from "../middlewares/authMiddleware";
import { adminRole } from "../types/genralTypes";

const router = express.Router();
// customer endpoints
router.post("/create", bookingController.createBooking);
router.get("/:bookingId", bookingController.getBookingByBookingId);
router.put("/:bookingId/update", bookingController.updateBookingByCustomer);

// admin endpoint
router.get(
  "/admin/:bookingId",
  authMiddlewrare,
  checkRole("superadmin", "salesrep", "callrep"),
  bookingController.getBookingById
);
router.get(
  "/admin/",
  authMiddlewrare,
  checkRole("superadmin", "salesrep", "callrep"),
  bookingController.getAllBooking
);
router.put(
  "/admin/assign/:bookingId ",
  authMiddlewrare,
  checkRole("superadmin", "salesrep"),
  bookingController.assignCallToRep
);
router.put(
  "/admin/:bookingId/status ",
  authMiddlewrare,
  checkRole("superadmin", "salesrep", "callrep"),
  bookingController.assignCallToRep
);

export default router;

// add authMiddleware before using checkRole
// format get methods
