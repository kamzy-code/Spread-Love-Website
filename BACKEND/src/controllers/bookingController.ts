import { Request, Response, NextFunction } from "express";
import bookingService from "../services/bookingService";

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


}

const bookingController = new BookingController();
export default bookingController;
