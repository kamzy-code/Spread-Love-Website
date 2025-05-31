import { Request, Response, NextFunction } from "express";
import bookingService from "../services/bookingService";
import { getLeastLoadedRep } from "../utils/getLeastLoadedRep";
import { callStatus } from "../types/genralTypes";

class BookingController {
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

  async getBookingById(req: Request, res: Response, next: NextFunction) {
    const bookingId = req.params.bookingId;

    if (!bookingId) {
      res.status(400).json({ message: "Booking ID required" });
      return;
    }

    try {
      const booking = await bookingService.getBookingById(bookingId);
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

  async getAllBooking(req: Request, res: Response, next: NextFunction) {
    const filter = req.query.filter as string;

    let booking: any;
    try {
      if (filter) {
        booking = await bookingService.getAllBooking(filter);
      } else {
        booking = await bookingService.getAllBooking();
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

  async assignCallToRep(req: Request, res: Response, next: NextFunction) {
    const bookingId = req.params.bookingId;
    const { repId, autoAssign } = req.body;

    repId as string | undefined;
    autoAssign as boolean;

    if (!bookingId) {
      res.status(400).json({ message: "Booking ID required" });
      return;
    }

    const booking = await bookingService.getBookingById(bookingId);

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
