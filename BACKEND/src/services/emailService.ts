import nodemailer from "nodemailer";
import {format} from "date-fns/format";

class EmailService {
  public async sendBookingConfirmationEmail(
    to: string,
    subject: string,
    booking: any
  ): Promise<void> {
    // Implementation for sending email

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false, // This is important for self-signed certificates
      },
    });

    console.log(transporter);
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      text: `Thank you for your booking! Your booking has been confirmed.
  Booking ID: ${booking.bookingId}
  Caller Name: ${booking.callerName}
  Recipient Name: ${booking.recipientName}
  Recipient Phone: ${booking.recipientPhone}
  Recipient Country: ${booking.country}
  Call Date: ${format(booking.callDate, "yyyy-MM-dd")}
  `,
      html: `
    <div style="font-family: Arial, sans-serif; color: #222;">
      <h2>Booking Confirmation</h2>
      <p>Dear Customer,</p>
      <p>Thank you for your surprise call booking! We are glad to let you know that your booking has been <strong>confirmed</strong>.</p>
      <p>
      <strong>Booking ID:</strong>
      <span style="background: #f3f3f3; padding: 4px 8px; border-radius: 4px; font-weight: bold;">
        ${booking.bookingId}
      </span>
      </p>
      <p>
      <strong>Caller Name:</strong> ${booking.callerName}<br/>
      <strong>Recipient Name:</strong> ${booking.recipientName}<br/>
      <strong>Recipient Phone:</strong> ${booking.recipientPhone}<br/>
      <strong>Recipient Country:</strong> ${booking.country}
      <br/>
      <strong>Call Date:</strong> ${format(booking.callDate, "yyyy-MM-dd")}
      </p>
      <p>Use the above booking ID to track and manage your booking via the link below.</p>
      <p>
      <a href="${process.env.MANAGE_BOOKING_URL}" style="color: #1a73e8; text-decoration: underline;">
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
      const mailStatus = await transporter.sendMail(mailOptions);
    } catch (error: any) {
      throw new Error(error.message || "Error sending confirmation mail");
    }
  }
}

const emailService = new EmailService();
export default emailService;
