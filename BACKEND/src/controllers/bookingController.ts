import { Request, Response, NextFunction } from "express";
import bookingService from "../services/bookingService";
import { getLeastLoadedRep } from "../utils/getLeastLoadedRep";
import { callStatus } from "../types/genralTypes";
import { AuthRequest } from "../middlewares/authMiddleware";

class BookingController {
  // Customer Endpoints
  async createBooking(req: Request, res: Response, next: NextFunction) {
    const {
      callerName,
      callerPhone,
      callerEmail,
      ReceiverName,
      ReceiverPhone,
      ReceiverCountry,
      callType,
      callDate,
      callTime,
      SpecialMessage,
      relationshipWithReceiver,
      extraInfo,
    } = req.body;

    const bookingId = await bookingService.generateBookingId();

    try {
      const newBooking = await bookingService.createBooking(
        callerName,
        callerPhone,
        callerEmail,
        ReceiverName,
        ReceiverPhone,
        ReceiverCountry,
        callType,
        callDate,
        callTime,
        SpecialMessage,
        relationshipWithReceiver,
        extraInfo,
        bookingId
      );

      if (!newBooking) {
        res.status(500).json({ message: "Failed to create booking" });
        return;
      }
      res.status(201).json({
        message: "Booking created successfully",
        bookingID: newBooking.bookingId,
      });
    } catch (error) {
      next(error);
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Error creating booking", error });
      return;
    }
  }

  async getBookingByBookingId(req: Request, res: Response, next: NextFunction) {
    const bookingId = req.params.bookingId;

    if (!bookingId) {
      res.status(400).json({ message: "Booking ID required" });
      return;
    }

    try {
      const booking = await bookingService.getBookingByBookingId(bookingId);
      if (!booking) {
        res.status(404).json({ message: "Booking not found" });
        return;
      }
      res
        .status(200)
        .json({ message: "Booking fetched successfully", booking });
      return;
    } catch (error) {
      next(error);
      console.error("Error fetching booking:", error);
      res.status(500).json({ message: "Error fetching booking", error });
      return;
    }
  }

  async updateBookingByCustomer(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { bookingId } = req.params;
    const info = req.body;

    try {
      const booking = await bookingService.getBookingByBookingId(bookingId);

      if (!booking) {
        res.status(404).json({ message: "Booking not found" });
        return;
      }

      const disallowedFields = ["bookingId", "status", "assingedRep"];

      Object.keys(info).forEach((field) => {
        if (!disallowedFields.includes(field)) {
          (booking as any)[field] = info[field];
        }
      });

      await booking.save();
      res.status(200).json({ message: "Uppdate " });
    } catch (error) {
      next(error);
      console.error(`Booking update failed: ${error}`);
      res.status(500).json({ message: "Booking update failed", error });
      return;
    }
  }

  // Admin Endpoints

  async getBookingById(req: AuthRequest, res: Response, next: NextFunction) {
    const bookingId = req.params.bookingId;
    const user = req.user!;

    if (!bookingId) {
      res.status(400).json({ message: "Booking ID required" });
      return;
    }

    try {
      const booking = await bookingService.getBookingById(
        bookingId,
        user.userId,
        user.role
      );
      if (!booking) {
        res.status(404).json({ message: "Booking not found" });
        return;
      }
      res
        .status(200)
        .json({ message: "Booking fetched successfully", booking });
      return;
    } catch (error) {
      next(error);
      console.error("Error fetching booking:", error);
      res.status(500).json({ message: "Error fetching booking", error });
      return;
    }
  }

  async getAllBooking(req: AuthRequest, res: Response, next: NextFunction) {
    const filter = req.query.filter as string;
    const user = req.user!;

    let booking: any;
    try {
      if (filter) {
        booking = await bookingService.getAllBooking(
          user.userId,
          user.role,
          filter
        );
      } else {
        booking = await bookingService.getAllBooking(user.role, user.userId);
      }
      res
        .status(200)
        .json({ message: "Booking fetched successfully", booking });
      return;
    } catch (error) {
      next(error);
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Error fetching bookings", error });
      return;
    }
  }

  async updateBookingStatus(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    const { bookingId } = req.params;
    const status = req.body;
    const user = req.user!;

    try {
      const allowedStatus = [
        "placed",
        "successful",
        "rejected",
        "rescheduled",
        "refunded",
      ];

      if (!allowedStatus.includes(status)) {
        res.status(400).json({ message: "Invalid status" });
        return;
      }

      const booking = await bookingService.getBookingById(
        bookingId,
        user.userId,
        user.role
      );

      if (!booking) {
        res.status(404).json({ message: "Booking not found" });
        return;
      }

      booking.status = status;
      await booking.save();

      res.status(201).json({ message: "Status updated" });
      return;
    } catch (error) {
      next(error);
      console.error(`Error Updating Booking Status: ${error}`);
      res.status(500).json({ message: "Error Updating Booking status", error });
    }
  }

  async assignCallToRep(req: AuthRequest, res: Response, next: NextFunction) {
    const bookingId = req.params.bookingId;
    const { repId, autoAssign } = req.body;
    const user = req.user!;

    repId as string | undefined;
    autoAssign as boolean;

    if (!bookingId) {
      res.status(400).json({ message: "Booking ID required" });
      return;
    }

    const booking = await bookingService.getBookingById(
      bookingId,
      user.userId,
      user.role
    );

    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    try {
      const targetRep = autoAssign ? await getLeastLoadedRep() : repId;

      if (!targetRep) {
        res.status(500).json({ message: "No available representatives" });
        return;
      }

      booking.assignedRep = targetRep;
      booking.status = "assigned" as callStatus;
      await booking.save();

      res.status(200).json({ message: "Booking assigned", repId: targetRep });
      return;
    } catch (error) {
      next(error);
      console.error("Error assigning Call to Rep:", error);
      res.status(500).json({ message: "Error assigning Call to Rep", error });
      return;
    }
  }
}

const bookingController = new BookingController();
export default bookingController;
