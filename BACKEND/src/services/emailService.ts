import { format } from "date-fns/format";
import { IBooking } from "../models/bookingModel";
import { isLegacyBooking } from "../utils/bookingShape";
import { emailLogger } from "../utils/logger";
import { HttpError } from "../utils/httpError";
import { Resend } from "resend";
import { env } from "../config/env";
import {
  renderEmailLayout,
  renderEmailButton,
  renderInfoBox,
  renderNoticeBox,
  renderRecipientCard,
  emailTextStyles as styles,
} from "../utils/emailTemplate";

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

// Strictly "every recipient's call succeeded" — deliberately not the same
// thing as bookingStatus === "completed" (bookingService.deriveBookingStatus
// treats successful/unsuccessful/rejected as equally "terminal", so a
// booking can be "completed" with a failed call in it). This check only
// ever returns true when nothing went wrong for anyone.
const areAllRecipientsSuccessful = (booking: any): boolean => {
  if (isLegacyBooking(booking)) {
    return booking.status === "successful";
  }
  const recipients = booking.recipients ?? [];
  return recipients.length > 0 && recipients.every((r: any) => r.callStatus === "successful");
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

    const recipientCardsHtml = recipients
      .map((r: any) =>
        renderRecipientCard({
          name: r.recipientName,
          phone: r.recipientPhone,
          country: r.country,
          callDate: format(r.callDate, "yyyy-MM-dd"),
        }),
      )
      .join("");

    const bodyHtml = `
      <h1 style="${styles.heading}">Booking Confirmed 🎉</h1>
      <p style="${styles.body}">Dear ${callerName},</p>
      <p style="${styles.body}">
        Thank you for your surprise call booking! We're glad to let you know your booking has been
        <strong>confirmed</strong>.
      </p>
      ${renderInfoBox([{ label: "Booking ID", value: booking.bookingId }])}
      <h2 style="${styles.sectionHeading}">Recipient${recipients.length > 1 ? "s" : ""}</h2>
      ${recipientCardsHtml}
      <p style="${styles.body}">
        Use your booking ID any time to track status or make changes.
      </p>
      ${renderEmailButton("Manage Your Booking", env.MANAGE_BOOKING_URL)}
      <p style="${styles.body}">
        We look forward to serving you. If you have any questions, just reply to this email.
      </p>
    `;

    const mailOptions = {
      from: "noreply@spreadlovenetwork.com",
      to: to,
      subject: subject,
      text: `Thank you for your booking! Your booking has been confirmed.
  Booking ID: ${booking.bookingId}
  Caller Name: ${callerName}
${recipientLinesText}

  Manage your booking: ${env.MANAGE_BOOKING_URL}
  `,
      html: renderEmailLayout({
        title: "Booking Confirmed",
        preheader: `Your booking ${booking.bookingId} is confirmed — here's everything you need to know.`,
        bodyHtml,
      }),
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

  async sendAllRecipientsSuccessfulEmail(to: string, booking: any): Promise<void> {
    const callerName = booking.caller?.name ?? booking.callerName ?? "Customer";
    const recipients = getRecipientsForEmail(booking);

    const recipientLinesText = recipients
      .map((r: any, i: number) => `  Recipient ${i + 1}: ${r.recipientName} — call completed successfully`)
      .join("\n");

    const recipientCardsHtml = recipients
      .map((r: any) =>
        renderRecipientCard({
          name: r.recipientName,
          phone: r.recipientPhone,
          country: r.country,
          callDate: format(r.callDate, "yyyy-MM-dd"),
        }),
      )
      .join("");

    const bodyHtml = `
      <h1 style="${styles.heading}">All Your Calls Are Complete! 🎉</h1>
      <p style="${styles.body}">Dear ${callerName},</p>
      <p style="${styles.body}">
        Great news — every call in your booking has been <strong>successfully placed</strong>!
      </p>
      ${renderInfoBox([{ label: "Booking ID", value: booking.bookingId }])}
      <h2 style="${styles.sectionHeading}">Recipient${recipients.length > 1 ? "s" : ""}</h2>
      ${recipientCardsHtml}
      <p style="${styles.body}">
        If any call was recorded, we'll email you separately once that recording is ready.
      </p>
      ${renderEmailButton("Manage Your Booking", env.MANAGE_BOOKING_URL)}
      <p style="${styles.body}">
        Thank you for spreading love with us! If you have any questions, just reply to this email.
      </p>
    `;

    const mailOptions = {
      from: "noreply@spreadlovenetwork.com",
      to: to,
      subject: "All Your Calls Are Complete!",
      text: `Hi ${callerName},

Great news — every call in your booking has been successfully placed!

Booking ID: ${booking.bookingId}
${recipientLinesText}

Manage your booking: ${env.MANAGE_BOOKING_URL}
`,
      html: renderEmailLayout({
        title: "All Your Calls Are Complete",
        preheader: `Every call in booking ${booking.bookingId} has been successfully placed.`,
        bodyHtml,
      }),
    };

    try {
      const { error } = await resend.emails.send(mailOptions);
      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      emailLogger.error("Failed to send All Recipients Successful email", {
        error: error.message,
        action: "SEND_ALL_RECIPIENTS_SUCCESSFUL_EMAIL_FAILED",
      });
      throw new HttpError(
        502,
        "Failed to send All Recipients Successful email. Please try again or contact support.",
      );
    }
  }

  // Single guarded entry point, same shape as sendBookingConfirmationIfDue —
  // called (best-effort) from bookingController.updateBookingStatus after
  // every call-status write, since that's the only place callStatus ever
  // changes. Cheap to call on every status update: the "not everyone's
  // successful yet" / "already sent" checks make it a no-op the vast
  // majority of the time.
  async sendAllRecipientsSuccessfulEmailIfDue(
    booking: IBooking,
  ): Promise<{ sent: boolean; reason?: string }> {
    const email = booking.caller?.email || booking.callerEmail;

    if (!email) {
      return {
        sent: false,
        reason: "Caller email is required for sending the all-successful mail",
      };
    }
    if (booking.allRecipientsSuccessfulMailSent) {
      return {
        sent: false,
        reason: `All-recipients-successful mail already sent for ${booking.bookingId}`,
      };
    }
    if (!areAllRecipientsSuccessful(booking)) {
      return { sent: false, reason: "Not every recipient has a successful call yet" };
    }

    await this.sendAllRecipientsSuccessfulEmail(email, booking);

    booking.allRecipientsSuccessfulMailSent = true;
    await booking.save();

    emailLogger.info("All-recipients-successful mail sent", {
      bookingId: booking.bookingId,
      email,
      action: "SEND_ALL_RECIPIENTS_SUCCESSFUL_MAIL_SUCCESS",
    });

    return { sent: true };
  }

  async sendRecordingReadyEmail(
    to: string,
    booking: any,
    recipientName: string,
    manageLink: string,
    expiresAt: Date,
  ): Promise<void> {
    const callerName = booking.caller?.name ?? booking.callerName ?? "Customer";
    const expiresLabel = format(expiresAt, "MMMM d, yyyy");

    const bodyHtml = `
      <h1 style="${styles.heading}">Your Call Recording Is Ready 🎧</h1>
      <p style="${styles.body}">Dear ${callerName},</p>
      <p style="${styles.body}">
        The recording of your call to <strong>${recipientName}</strong> is ready to listen to and download.
      </p>
      ${renderInfoBox([{ label: "Booking ID", value: booking.bookingId }])}
      ${renderEmailButton("Listen to Your Recording", manageLink)}
      ${renderNoticeBox(
        `<strong>This recording is only available until ${expiresLabel}</strong> (30 days from upload) — after that it's permanently deleted from our storage. Please download a copy from the link above if you'd like to keep it.`,
      )}
      <p style="${styles.body}">
        If you have any questions, just reply to this email.
      </p>
    `;

    const mailOptions = {
      from: "noreply@spreadlovenetwork.com",
      to: to,
      subject: "Your Call Recording Is Ready",
      text: `Hi ${callerName},

The recording of your call to ${recipientName} is ready. You can listen to it and download it from your booking page:
${manageLink}

Booking ID: ${booking.bookingId}

This recording is only available until ${expiresLabel} (30 days from upload) — after that it's permanently deleted from our storage. Please download a copy if you'd like to keep it.
`,
      html: renderEmailLayout({
        title: "Your Call Recording Is Ready",
        preheader: `The recording of your call to ${recipientName} is ready — available until ${expiresLabel}.`,
        bodyHtml,
      }),
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
    const bodyHtml = `
      <h1 style="${styles.heading}">New Contact Submission</h1>
      <p style="${styles.body}">You've received a new message from the contact form.</p>
      ${renderInfoBox([
        { label: "Name", value: name },
        { label: "Email", value: email },
      ])}
      <h2 style="${styles.sectionHeading}">Message</h2>
      <p style="${styles.body}">${message}</p>
    `;

    const mailOptions = {
      from: "noreply@spreadlovenetwork.com",
      to: env.EMAIL_USER,
      subject: `${subject} from ${name}`,
      text: `You have received a new contact form submission.
  Name: ${name}
  Email: ${email}

  ${message}
  `,
      html: renderEmailLayout({
        title: "New Contact Submission",
        preheader: `New message from ${name} via the contact form.`,
        bodyHtml,
      }),
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
