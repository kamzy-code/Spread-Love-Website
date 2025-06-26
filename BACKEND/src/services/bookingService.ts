import { SortOrder, Types } from "mongoose";
import { Booking } from "../models/bookingModel";
import { callType, occassionType } from "../types/genralTypes";
import { getLeastLoadedRep } from "../utils/getLeastLoadedRep";

class BookingService {
  async createBooking(
    bookingId: string,
    callerName: string,
    callerPhone: string,
    callerEmail: string,
    recipientName: string,
    recipientPhone: string,
    country: string,
    occassion: occassionType,
    callType: callType,
    callDate: Date,
    price: string,
    message: string,
    specialInstruction: string
  ) {
    // create a new booking and save in the DB
    const newBooking = await Booking.create({
      bookingId,
      callerName,
      callerPhone,
      callerEmail,
      recipientName,
      recipientPhone,
      country,
      occassion,
      callType,
      callDate,
      price,
      message,
      specialInstruction,
    });

    // assign booking to a rep if Booking was created successfully
    if (newBooking) {
      // get the rep with the lest amount of bookings
      const assignedRep = await getLeastLoadedRep();

      // return the booking without an assigned rep if there's no rep found.
      if (!assignedRep) {
        return newBooking;
      }

      // assign the rep to the booking and change the booking status to assigned
      newBooking.assignedRep = new Types.ObjectId(assignedRep.toString());
      return await newBooking.save();
    }
    // return null if booking couldn't be created
    return null;
  }

  // fetch bookng by generated ID
  async getBookingByBookingId(bookingId: string) {
    // fetch the booking from DB and return
    return await Booking.findOne({ bookingId });
  }

  // fetch booking by MongoDB ID
  async getBookingById(bookingId: string, userId: string, role: string) {
    // check users role
    if (role === "callrep") {
      // if the admin is a call rep, return the booking if the iD is found and the booking was assigned to the call rep
      return await Booking.findOne({
        _id: new Types.ObjectId(bookingId),
        assignedRep: userId,
      });
    }

    // return the booking if the Id matches regardless of the role
    return await Booking.findById(bookingId);
  }

  async getAllBooking(
    userId: string,
    role: string,
    query: any,
    sortOrder?: SortOrder,
    sortParam?: string
  ) {
    // if there's no sort order default the sortOrder to -1 i.e descending
    if (!sortOrder) sortOrder = -1;

    // check user role and fetch bookings via the role
    if (role === "callrep") {
      if (sortParam) {
        // if the sort parameter was submitted fetch the bookings via the query object and sort it via the the sort parameter and the sort order
        return await Booking.find({
          // destructure the query object and the assigned rep field to make sure the bookings fetched are assigned to the rep requesting it.
          ...query,
          assignedRep: new Types.ObjectId(userId),
        }).sort({ [sortParam]: sortOrder });
      }

      // else fetch the booking via the query object and sort it via the the default sort parameter (createdAt) and the sort order
      return await Booking.find({
        ...query,
        assignedRep: new Types.ObjectId(userId),
      }).sort({ createdAt: sortOrder });
    }

    // if the user is not a cal rep fetch the bookings via the query, sortParam and order regardless of the role
    if (sortParam) {
      return await Booking.find(query).sort({ [sortParam]: sortOrder });
    }
    return await Booking.find(query).sort({ createdAt: sortOrder });
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

  async getAnalytics(matchStage: any) {
    // call the Mongo DB aggregate function to get the aggregate values
    return await Booking.aggregate([
      // pass the matchStage object to filter the documents based on the keys in the matchstage objet
      { $match: matchStage },

      // this groups the returned documents that matches with the matchsatge based on their status i.e assigned, succesfful, pending, etc. and retuns the sum count for each group.
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
  }

  async getTotalBooking(matchStage: any) {
    return await Booking.countDocuments(matchStage);
  }
}

const bookingService = new BookingService();
export default bookingService;
