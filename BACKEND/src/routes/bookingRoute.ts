import express from 'express';
import bookingController from '../controllers/bookingController';
import { authMiddlewrare, checkRole } from '../middlewares/authMiddleware';
import { adminRole } from '../types/genralTypes';

const router = express.Router();
// customer endpoints
router.post("/create", bookingController.createBooking);
router.get("/:bookingId", bookingController.getBookingByBookingId);

// superadmin endpoint   
router.get("/admin/:bookingId", authMiddlewrare, checkRole("superadmin"), bookingController.getBookingById);
router.get("/", bookingController.getAllBooking);
 router.put("/admin/assign/:bookingId ", checkRole("superadmin"), bookingController.assignCallToRep); 

export default router;                              

// add authMiddleware before using checkRole
// format get methods