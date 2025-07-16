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
    specialInstruction: string,
    contactConsent: string,
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
      contactConsent,
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
    return await Booking.findOne({ bookingId }).select("-__v -updatedAt");
  }

  // fetch booking by MongoDB ID
  async getBookingById(bookingId: string, userId: string, role: string) {
    // check users role
    if (role === "callrep") {
      // if the admin is a call rep, return the booking if the iD is found and the booking was assigned to the call rep
      return await Booking.findOne({
        _id: new Types.ObjectId(bookingId),
        assignedRep: userId,
      }).populate({
        path: "assignedRep",
        select: "-__v -createdAt -updatedAt", // Optional: exclude sensitive fields
      });
    }

    // return the booking if the Id matches regardless of the role
    return await Booking.findById(bookingId).populate({
      path: "assignedRep",
      select: "-__v -createdAt -updatedAt", // Optional: exclude sensitive fields
    });
  }

  // Delete booking by MongoDB ID
  async deleteBookingById(bookingId: string, userId: string, role: string) {
    // check users role
    if (role === "callrep") {
      // if the admin is a call rep, delete the booking if the iD is found and the booking was assigned to the call rep
      return await Booking.deleteOne({
        _id: new Types.ObjectId(bookingId),
        assignedRep: userId,
      });
    }

    // else delete the booking if the Id matches regardless of the role
    return await Booking.deleteOne({
      _id: new Types.ObjectId(bookingId),
    });
  }

  async getAllBooking(
    userId: string,
    role: string,
    query: any,
    sortOrder: SortOrder = -1,
    sortParam: string = "callDate",
    skip: number = 0,
    limit: number = 10
  ) {
    // Build baseQuery
    const baseQuery =
      role === "callrep"
        ? { ...query, assignedRep: new Types.ObjectId(userId) }
        : query;

    return await Booking.find(baseQuery)
      .sort({ [sortParam]: sortOrder })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "assignedRep",
        select: "-password -__v -createdAt -updatedAt", // Optional: exclude sensitive fields
      });
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

  async getTotalBookingsCount(matchStage: any) {
    return await Booking.countDocuments(matchStage);
  }

  async getTotalRevenue(matchStage: any) {
    const result = await Booking.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $toDouble: "$price" } },
        },
      },
    ]);

    return result[0]?.totalRevenue || 0;
  }
}

const bookingService = new BookingService();
export default bookingService;
