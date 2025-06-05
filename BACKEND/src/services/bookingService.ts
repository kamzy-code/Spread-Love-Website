import { SortOrder, Types } from "mongoose";
import { Booking } from "../models/bookingModel";
import { getLeastLoadedRep } from "../utils/getLeastLoadedRep";

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
    const newBooking = await Booking.create({
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

    if (newBooking) {
      const assignedRep = await getLeastLoadedRep();
      if (!assignedRep) {
        return newBooking;
      }
      newBooking.assignedRep = new Types.ObjectId(assignedRep.toString());
      newBooking.status = "assigned";
      return await newBooking.save();
    }

    return null;
  }

  async getBookingByBookingId(bookingId: string) {
    return await Booking.findOne({ bookingId });
  }

  async getBookingById(bookingId: string, userId: string, role: string) {
    if (role === "callrep") {
      return await Booking.findOne({
        _id: new Types.ObjectId(bookingId),
        assignedRep: userId,
      });
    }
    return await Booking.findById(bookingId);
  }

    async getAllBooking(userId: string, role: string, query:any, sortOrder?: SortOrder, sortParam?: string, ) {

    if (!sortOrder) sortOrder = -1;

    if (role === "callrep") {
      if (sortParam) {
        return await Booking.find({...query,
          assignedRep: new Types.ObjectId(userId)}
        ).sort({ [sortParam]: sortOrder });
      }
      return await Booking.find({...query,
          assignedRep: new Types.ObjectId(userId)}
        ).sort({ createdAt: sortOrder });
    }

    if (sortParam) {
      return await Booking.find(query).sort({ [sortParam]: sortOrder });
    }
    return await Booking.find(query).sort({ createdAt: sortOrder});
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
