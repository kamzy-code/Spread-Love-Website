import { format } from "date-fns/format";
import { IBooking } from "../models/bookingModel";
import { isLegacyBooking } from "../utils/bookingShape";
import { emailLogger } from "../utils/logger";
import { HttpError } from "../utils/httpError";
import { Resend } from "resend";
import { env } from "../config/env";

const resend = new Resend(env.RESEND_API_KEY);

// Normalizes a booking's recipient(s) to a flat list regardless of shape, so
// the email template only has one code path to render — legacy bookings
// have exactly one recipient built from the flat fields, v2 bookings carry
// their real recipients[] array.
const getRecipientsForEmail = (booking: any) => {
  if (!isLegacyBooking(booking)) return booking.recipients;

  return [
    {
      recipientName: booking.recipientName,
      recipientPhone: booking.recipientPhone,
      country: booking.country,
      callDate: booking.callDate,
    },
  ];
};

class EmailService {
  async sendBookingConfirmationEmail(
    to: string,
    subject: string,
    booking: any,
  ): Promise<void> {
    const callerName = booking.caller?.name ?? booking.callerName ?? "Customer";
    const recipients = getRecipientsForEmail(booking);

    const recipientLinesText = recipients
      .map(
        (r: any, i: number) =>
          `  Recipient ${i + 1}: ${r.recipientName} (${r.recipientPhone}, ${r.country}) — ${format(r.callDate, "yyyy-MM-dd")}`,
      )
      .join("\n");

    const recipientItemsHtml = recipients
      .map(
        (r: any) => `
        <li style="margin-bottom: 8px;">
          <strong>${r.recipientName}</strong> — ${r.recipientPhone}, ${r.country}<br/>
          Call Date: ${format(r.callDate, "yyyy-MM-dd")}
        </li>`,
      )
      .join("");

    const mailOptions = {
      from: "noreply@spreadlovenetwork.com",
      to: to,
      subject: subject,
      text: `Thank you for your booking! Your booking has been confirmed.
  Booking ID: ${booking.bookingId}
  Caller Name: ${callerName}
${recipientLinesText}
  `,
      html: `
    <div style="font-family: Arial, sans-serif; color: #222;">
      <h2>Booking Confirmation</h2>
      <p>Dear ${callerName},</p>
      <p>Thank you for your surprise call booking! We are glad to let you know that your booking has been <strong>confirmed</strong>.</p>
      <p>
      <strong>Booking ID:</strong>
      <span style="background: #f3f3f3; padding: 4px 8px; border-radius: 4px; font-weight: bold;">
        ${booking.bookingId}
      </span>
      </p>
      <ul>
        ${recipientItemsHtml}
      </ul>
      <p>Use the above booking ID to track and manage your booking via the link below.</p>
      <p>
      <a href="${
        env.MANAGE_BOOKING_URL
      }" style="color: #1a73e8; text-decoration: underline;">
      Manage Your Booking
      </a>
      </p>
      <p>We look forward to serving you. If you have any questions, reply to this email.</p>
      <br/>
      <p>Spread Love Team</p>
    </div>
    `,
    };

    try {
      const { error } = await resend.emails.send(mailOptions);
      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      emailLogger.error("Failed to send Booking Confirmation email", {
        error: error.message,
        action: "SEND_BOOKING_CONFIRMATION_EMAIL_FAILED",
      });
      throw new HttpError(
        502,
        "Failed to send Booking Confirmation email. Please try again or contact support.",
      );
    }
  }

  // Single guarded entry point for sending the confirmation email — used by
  // both the standalone /email/confirm/:bookingId route (admin resend) and
  // the payment-verify flow (automatic send on successful payment), so the
  // "already sent" / "not paid" / "no email" rules only live in one place.
  async sendBookingConfirmationIfDue(
    booking: IBooking,
  ): Promise<{ sent: boolean; reason?: string }> {
    const email = booking.caller?.email || booking.callerEmail;

    if (!email) {
      return {
        sent: false,
        reason: "Caller email is required for sending confirmation",
      };
    }
    if (booking.confirmationMailsent) {
      return {
        sent: false,
        reason: `Booking Confirmation already sent for ${booking.bookingId}`,
      };
    }
    if (booking.paymentStatus !== "paid") {
      return { sent: false, reason: "Can't send email for an unpaid booking" };
    }

    await this.sendBookingConfirmationEmail(
      email,
      "Booking Confirmation",
      booking,
    );

    booking.confirmationMailsent = true;
    await booking.save();

    emailLogger.info("Booking confirmation mail sent", {
      bookingId: booking.bookingId,
      email,
      action: "SEND_BOOKING_CONFIRMATION_MAIL_SUCCESS",
    });

    return { sent: true };
  }

  async sendRecordingReadyEmail(
    to: string,
    booking: any,
    recipientName: string,
    manageLink: string,
  ): Promise<void> {
    const callerName = booking.caller?.name ?? booking.callerName ?? "Customer";

    const mailOptions = {
      from: "noreply@spreadlovenetwork.com",
      to: to,
      subject: "Your Call Recording Is Ready",
      text: `Hi ${callerName},

The recording of your call to ${recipientName} is ready. You can listen to it and download it from your booking page:
${manageLink}

Booking ID: ${booking.bookingId}
`,
      html: `
    <div style="font-family: Arial, sans-serif; color: #222;">
      <h2>Your Call Recording Is Ready</h2>
      <p>Dear ${callerName},</p>
      <p>The recording of your call to <strong>${recipientName}</strong> is ready to listen to and download.</p>
      <p>
      <a href="${manageLink}" style="color: #1a73e8; text-decoration: underline;">
      Listen to Your Recording
      </a>
      </p>
      <p>
      <strong>Booking ID:</strong>
      <span style="background: #f3f3f3; padding: 4px 8px; border-radius: 4px; font-weight: bold;">
        ${booking.bookingId}
      </span>
      </p>
      <p>If you have any questions, reply to this email.</p>
      <br/>
      <p>Spread Love Team</p>
    </div>
    `,
    };

    try {
      const { error } = await resend.emails.send(mailOptions);
      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      emailLogger.error("Failed to send Recording Ready email", {
        error: error.message,
        action: "SEND_RECORDING_READY_EMAIL_FAILED",
      });
      throw new HttpError(
        502,
        "Failed to send Recording Ready email. Please try again or contact support.",
      );
    }
  }

  async sendContactEmail(
    name: string,
    email: string,
    subject: string,
    message: string,
  ) {
    const mailOptions = {
      from: "noreply@spreadlovenetwork.com",
      to: env.EMAIL_USER,
      subject: `${subject} from ${name}`,
      text: `You have received a new contact form submission.
  Name: ${name}
  Email: ${email}

  ${message}
  `,
      html: `
    <div style="font-family: Arial, sans-serif; color: #222;">
      <h2>Contact Submission</h2>
      <p>You have received a new contact form submission from;</p>
      
      <p>
      <strong>Name:</strong> ${name}<br/>
      <strong>Email:</strong> ${email}<br/><br/>
      
      ${message}
      </p>
      
    </div>
    `,
    };

    try {
      const { error } = await resend.emails.send(mailOptions);
      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      emailLogger.error("Failed to send Contactemail", {
        error: error.message,
        action: "SEND_CONTACT_EMAIL_FAILED",
      });
      throw new HttpError(
        502,
        "Failed to send Contact email. Please try again or contact support.",
      );
    }
  }
}

const emailService = new EmailService();
export default emailService;
