import express from 'express';
import bookingController from '../controllers/bookingController';

const router = express.Router();

router.post("/create", bookingController.createBooking);
router.get("/:bookingId", bookingController.getBooking);
router.get("/", bookingController.getAllBooking);

export default router;