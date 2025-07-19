import { Request, Response, NextFunction } from "express";
import bookingService from "../services/bookingService";
import emailService from "../services/emailService";
import { HttpError } from "../utils/httpError";
import { error } from "console";

class EmailController {
  async sendConfirmationEmail(req: Request, res: Response, next: NextFunction) {
    // extract BookingID from url
    const bookingId = req.params.bookingId;

    // return ID reuired if ID wasn't submitted
    if (!bookingId) {
      next(new HttpError(400, "Booking ID required"));
      return;
    }

    try {
      // call the service class to fetch the booking from DB
      const booking = await bookingService.getBookingByBookingId(bookingId);

      // if no booking was found return error message
      if (!booking) {
        throw new HttpError(404, "Booking Not found");
      }

      if (!booking.callerEmail) {
        throw new HttpError(
          400,
          "Caller email is required for sending confirmation"
        );
      }

      try {
        // send the email
        await emailService.sendBookingConfirmationEmail(
          booking.callerEmail as string,
          "Booking Confirmation",
          booking
        );

        booking.confirmationMailsent = true;
        await booking.save();

        res
          .status(200)
          .json({ message: "Booking Confirmation sent successfully", booking });
        return;
      } catch (emailError) {
        next(emailError);
        return;
      }
    } catch (error) {
      next(error);
      return;
    }
  }

  async sendContactEmail(req: Request, res: Response, next: NextFunction) {
    // extract BookingID from url
    const { name, email, subject, message } = req.body;

    // return ID reuired if ID wasn't submitted
    if (!name || !email || !subject || !message) {
      next(new HttpError(400, "All fields are required"));
      return;
    }

    try {
      await emailService.sendContactEmail(name, email, subject, message);

      res.status(200).json({ message: "Contact mail sent successfully" });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }
}

const emailController = new EmailController();
export default emailController;
