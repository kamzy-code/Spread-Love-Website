import { Request, Response } from "express";
import bookingService from "../services/bookingService";
import emailService from "../services/emailService";

class EmailController {
  async sendConfirmationEmail(req: Request, res: Response) {
    // extract BookingID from url
    const bookingId = req.params.bookingId;

    // return ID reuired if ID wasn't submitted
    if (!bookingId) {
      res.status(400).json({ message: "Booking ID required" });
      return;
    }

    try {
      // call the service class to fetch the booking from DB
      const booking = await bookingService.getBookingByBookingId(bookingId);

      // if no booking was found return error message
      if (!booking) {
        res.status(404).json({ message: "Booking Not found" });
        return;
      }

      if (!booking.callerEmail) {
        res.status(400).json({ message: "Booking email not found" });
        return;
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
        // Email failed to send, do not update booking
        console.error("Failed to send booking confirmation email:", emailError);
        res.status(500).json({
          message: "Failed to send booking confirmation email",
          error: emailError,
        });
        return;
      }
    } catch (error) {
      console.error("Error sending booking confirmation:", error);
      if (!res.headersSent) {
        res
          .status(500)
          .json({ message: "Error sending booking confirmation", error });
      }
      return;
    }
  }
}

const emailController = new EmailController();
export default emailController;
