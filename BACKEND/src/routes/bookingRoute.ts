import express from "express";
import bookingController from "../controllers/bookingController";
import messageSuggestionController from "../controllers/messageSuggestionController";
import { suggestMessageLimiter } from "../middlewares/aiRateLimit";
import { authMiddleware, checkRole } from "../middlewares/authMiddleware";
import { validateRequest, validateQuery, validateParams } from "../middlewares/validateRequest";
import {
  assignCallToRepQuerySchema,
  bookingIdParamSchema,
  createBookingSchema,
  suggestMessageParamsSchema,
  updateBookingByAdminSchema,
  updateBookingByCustomerSchema,
  updateBookingStatusSchema,
} from "../validation/bookingSchemas";

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
  validateParams(bookingIdParamSchema),
  validateQuery(assignCallToRepQuerySchema),
  bookingController.assignCallToRep
);
router.put(
  "/admin/:bookingId/status",
  authMiddleware,
  checkRole("superadmin", "salesrep", "callrep"),
  validateRequest(updateBookingStatusSchema),
  bookingController.updateBookingStatus
);
router.put(
  "/admin/:bookingId/recipients/:recipientId/status",
  authMiddleware,
  checkRole("superadmin", "salesrep", "callrep"),
  validateRequest(updateBookingStatusSchema),
  bookingController.updateBookingStatus
);

// AI-drafted message for a recipient whose customer left the message blank.
// Draft only — nothing is saved to the booking.
router.post(
  "/admin/:bookingId/recipients/:recipientId/suggest-message",
  authMiddleware,
  checkRole("superadmin", "salesrep", "callrep"),
  validateParams(suggestMessageParamsSchema),
  suggestMessageLimiter,
  messageSuggestionController.suggestMessage
);

router.put(
  "/admin/:bookingId",
  authMiddleware,
  checkRole("superadmin", "salesrep"),
  validateParams(bookingIdParamSchema),
  validateRequest(updateBookingByAdminSchema),
  bookingController.updateBookingByAdmin
);

router.delete(
  "/admin/:bookingId",
  authMiddleware,
  checkRole("superadmin", "salesrep", "callrep"),
  bookingController.DeleteBookingById
);

// customer endpoints
router.post(
  "/create",
  validateRequest(createBookingSchema),
  bookingController.createBooking
);
router.get("/:bookingId", bookingController.getBookingByBookingId);
router.put(
  "/:bookingId/update",
  validateRequest(updateBookingByCustomerSchema),
  bookingController.updateBookingByCustomer
);

router.use((req, res) => {
  res.status(404).json({ message: "Booking route not found" });
});

export default router;
