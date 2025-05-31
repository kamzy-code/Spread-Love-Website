import { Types } from "mongoose";
import { Booking } from "../models/bookingModel";

class BookingService {
  async createBooking(
    callerName: string,
    callerPhone: string,
    callerEmail: string,
    ReceiverName: string,
    ReceiverPhone: string,
    ReceiverCountry: string,
    callType: string,
    callDate: Date,
    callTime: string,
    SpecialMessage: string,
    relationshipWithReceiver: string,
    extraInfo: string,
    bookingId: string
  ) {
    return await Booking.create({
      bookingId,
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
    });
  }

  async getBookingByBookingId(bookingId: string) {
    return await Booking.findOne({  bookingId });
  }

    async getBookingById(bookingId: string) {
    return await Booking.findById(bookingId);
  }

  async getAllBooking(filter?: string) {
    if (filter) {
      return await Booking.find().sort({ [filter]: -1 });
    }
    return await Booking.find().sort({ createdAt: -1 });
  }

  async generateBookingId(): Promise<string> {
    let bookingId: string;
    let exists;

    do {
      const timestamp = Date.now().toString().slice(-5); // last 5 digits of timestamp
      const random = Math.floor(1000 + Math.random() * 9000); // 4 digit random number
      bookingId = `SLN-${timestamp}${random}`; // e.g., SLN-351201234

      exists = await Booking.exists({ bookingId }); // Check if bookingId already exists in the database
    } while (exists); // Check if bookingId already exists in the database
    return bookingId;
  }
}

const bookingService = new BookingService();
export default bookingService;
