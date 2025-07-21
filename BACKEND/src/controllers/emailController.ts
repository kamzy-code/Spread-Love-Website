import { Request, Response, NextFunction } from "express";
import bookingService from "../services/bookingService";
import emailService from "../services/emailService";
import { HttpError } from "../utils/httpError";
import { emailLogger } from "../logger/devLogger";
import { error } from "console";

class EmailController {
  async sendConfirmationEmail(req: Request, res: Response, next: NextFunction) {
    // extract BookingID from url
    const bookingId = req.params.bookingId;

    emailLogger.info("Send Booking confirmation mail initiated", {
      bookingId,
      action: "SEND_BOOKING_CONFIRMAION_MAIL",
    });

    // return ID reuired if ID wasn't submitted
    if (!bookingId) {
      emailLogger.warn(
        "Send Booking confirmation mail failed: BookingId required",
        {
          action: "SEND_BOOKING_CONFIRMAION_MAIL_FAILED",
        }
      );

      next(new HttpError(400, "Booking ID required"));
      return;
    }

    try {
      // call the service class to fetch the booking from DB
      const booking = await bookingService.getBookingByBookingId(bookingId);

      // if no booking was found return error message
      if (!booking) {
        emailLogger.warn(
          "Send Booking confirmation mail failed: Booking not found",
          {
            bookingId,
            action: "SEND_BOOKING_CONFIRMAION_MAIL_FAILED",
          }
        );

        next(new HttpError(404, "Booking Not found"));
        return;
      }

      if (!booking.callerEmail) {
        emailLogger.warn(
          "Send Booking confirmation mail failed: Caller email is required",
          {
            bookingId,
            action: "SEND_BOOKING_CONFIRMAION_MAIL_FAILED",
          }
        );

        next(
          new HttpError(
            400,
            "Caller email is required for sending confirmation"
          )
        );
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

        emailLogger.info("Send Booking confirmation mail successful", {
          bookingId,
          callerEmail: booking.callerEmail,
          confirmationMailSent: booking.confirmationMailsent,
          action: "SEND_BOOKING_CONFIRMAION_MAIL_SUCCESS",
        });
        return;
      } catch (emailError: any) {
        emailLogger.error(
          `Send Booking confirmation mail error: ${emailError.message}`,
          {
            bookingId,
            action: "SEND_BOOKING_CONFIRMAION_MAIL_FAILED",
            confirmationMailSent: booking.confirmationMailsent,
            emailError,
          }
        );

        next(emailError);
        return;
      }
    } catch (error: any) {
      emailLogger.error(
        `Send Booking confirmation mail error: ${error.message}`,
        {
          bookingId,
          action: "SEND_BOOKING_CONFIRMAION_MAIL_FAILED",
          error,
        }
      );

      next(error);
      return;
    }
  }

  async sendContactEmail(req: Request, res: Response, next: NextFunction) {
    // extract BookingID from url
    const { name, email, subject, message } = req.body;

    emailLogger.info("Send contact mail initiated", {
      sender: name,
      email,
      subject,
      action: "SEND_CONTACT_MAIL",
    });

    // return ID reuired if ID wasn't submitted
    if (!name || !email || !subject || !message) {
      emailLogger.warn("Send contact mail failed: Missing fields required", {
        sender: name,
        email,
        subject,
        action: "SEND_CONTACT_MAIL_FAILED",
      });
      next(new HttpError(400, "All fields are required"));
      return;
    }

    try {
      await emailService.sendContactEmail(name, email, subject, message);

      res.status(200).json({ message: "Contact mail sent successfully" });

      emailLogger.info("Send contact mail successful", {
        sender: name,
        email,
        subject,
        action: "SEND_CONTACT_MAIL_SUCCESS",
      });
      return;
    } catch (error: any) {
      emailLogger.error(`Send contact mail failed: ${error.message}`, {
        sender: name,
        email,
        subject,
        action: "SEND_CONTACT_MAIL_FAILED",
        error,
      });
      next(error);
      return;
    }
  }
}

const emailController = new EmailController();
export default emailController;
