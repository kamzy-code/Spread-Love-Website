import express from 'express';
import bookingController from '../controllers/bookingController';

const router = express.Router();

router.post("/create", bookingController.createBooking);
router.get("/:bookingId", bookingController.getBookingByBookingId);
router.get("/admin/:bookingId", bookingController.getBookingById);
router.get("/", bookingController.getAllBooking);

export default router;