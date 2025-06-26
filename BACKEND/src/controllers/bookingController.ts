import { Request, Response, NextFunction } from "express";
import bookingService from "../services/bookingService";
import { getLeastLoadedRep } from "../utils/getLeastLoadedRep";
import { callStatus } from "../types/genralTypes";
import { AuthRequest } from "../middlewares/authMiddleware";
import { Types } from "mongoose";
import { castSortOder } from "../utils/castSortOrder";
import { callType, occassionType } from "../types/genralTypes";

class BookingController {
  // Customer Endpoints
  async createBooking(req: Request, res: Response, next: NextFunction) {
    const {
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
    } = req.body;

    console.log(`ID: ${bookingId}, ${callerName}`)
    try {
      // call the service class to create a new booking and save in the DB
      const newBooking = await bookingService.createBooking(
        bookingId,
        callerName,
        callerPhone,
        callerEmail,
        recipientName,
        recipientPhone,
        country,
        occassion as occassionType,
        callType as callType,
        callDate,
        price,
        message,
        specialInstruction
      );

      // return failed if booking creation was unsuccessful
      if (!newBooking) {
        res.status(500).json({ message: "Failed to create booking" });
        return;
      }

      // retrun successful with Booking ID if successful
      res.status(201).json({
        message: "Booking created successfully",
        bookingId: newBooking.bookingId,
      });
    } catch (error) {
      next(error);
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Error creating booking", error });
      return;
    }
  }

  async getBookingByBookingId(req: Request, res: Response, next: NextFunction) {
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
        res.status(404).json({ message: "Booking not found" });
        return;
      }

      // return the booking with a successful message
      res
        .status(200)
        .json({ message: "Booking fetched successfully", booking });
      return;
    } catch (error) {
      next(error);
      console.error("Error fetching booking:", error);
      res.status(500).json({ message: "Error fetching booking", error });
      return;
    }
  }

  async updateBookingByCustomer(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    // extract the booking ID from URL and the update info from the request body
    const { bookingId } = req.params;
    const info = req.body;

    try {
      // call service class to fetch the booking to be updated
      const booking = await bookingService.getBookingByBookingId(bookingId);

      // if no booking was found return error message
      if (!booking) {
        res.status(404).json({ message: "Booking not found" });
        return;
      }

      // create an array of fields that shouldn't be updated by the customer
      const disallowedFields = [
        "bookingId",
        "status",
        "assingedRep",
        "callType",
      ];

      // Object.Keys() extract the keys in the info object and store in an array
      Object.keys(info).forEach((field) => {
        // map through the array and check if any of the fields are in the disallowed fields array and only proceed if that field is not
        if (!disallowedFields.includes(field)) {
          // create an array of booking that can't be updated based on their status
          const disallowedStatus = ["successful"];

          // check if the booking has a status that's part of the disallowed statuses and return error message without saving the updated booking object.
          if (disallowedStatus.includes(booking.status as string)) {
            res.status(400).json({ message: "Can't update this Booking" });
            return;
          }
          // use the bracket notation syntax to dynamically access the keys in the Booking object via the field variable and update it.

          //E.g if field = id then the output will be Booking[id] = info[id] updating the id key of the booking object to that of the info object.
          (booking as any)[field] = info[field];
        } else {
          // return error message if the field is in the disallowed array
          res
            .status(403)
            .json({ message: "You can't update this field", field });
          return;
        }
      });

      // save the updated booking object and return success message
      await booking.save();
      res.status(200).json({ message: "Update Successfull" });
    } catch (error) {
      next(error);
      console.error(`Booking update failed: ${error}`);
      res.status(500).json({ message: "Booking update failed", error });
      return;
    }
  }

   async generateBookingID(req: Request, res: Response, next: NextFunction) {
    try {
      // call service method to generate ID
      const ID = await bookingService.generateBookingId();

      if (!ID) {
        res.status(400).json({ message: "error generating Booking ID" });
        return;
      }

      // return the booking ID
      res.status(200).json({
        ID,
      });
    } catch (error) {
      next(error);
      console.error(`Error generating Booking ID: ${error}`);
      res.status(500).json({ message: "Error generating Booking ID", error });
      return;
    }
  }

  // Admin Endpoints

  // get a booking by the MongoDB id and not the generated booking ID
  async getBookingById(req: AuthRequest, res: Response, next: NextFunction) {
    // extract booking Id from URL and get the user object created from the JWT token
    const bookingId = req.params.bookingId;
    const user = req.user!;

    // return ID required if ID wasn't found
    if (!bookingId) {
      res.status(400).json({ message: "Booking ID required" });
      return;
    }

    try {
      // call service class to fetch booking from DB
      const booking = await bookingService.getBookingById(
        bookingId,
        user.userId,
        user.role
      );

      // return not found if no booking was returned
      if (!booking) {
        res.status(404).json({ message: "Booking not found" });
        return;
      }

      // return success message with booking object.
      res
        .status(200)
        .json({ message: "Booking fetched successfully", booking });
      return;
    } catch (error) {
      next(error);
      console.error("Error fetching booking:", error);
      res.status(500).json({ message: "Error fetching booking", error });
      return;
    }
  }

  async getAllBooking(req: AuthRequest, res: Response, next: NextFunction) {
    // extract all possible filtering parameters from the request query object.
    const {
      status,
      assignedRep,
      startDate,
      endDate,
      callType,
      country,
      sortParam,
      sortOrder,
    } = req.query;

    // cast the sort order variable from a string to a valid sort Order type.
    // i.e from sortorder: string = "1" or "-1" to sortorder: SortOrder = 1 or -1
    const sortOrderCast = castSortOder(sortOrder as string);

    //  get user object from request object.
    const user = req.user!;

    // create an empty query object for the DB search
    const searchQuery: any = {};

    // add query fields to the query object only if they exist.
    if (status) searchQuery.status = status;
    if (assignedRep) searchQuery.assignedRep = assignedRep;
    if (callType) searchQuery.callType = callType;
    if (country) searchQuery.country = country;

    if (startDate || endDate) {
      // if the date filter exists add them as greater than and less than parameters to the callDate key. the query will basically fetch bookings where the date is either greater than or less thanor equeal to the sumitte dates.
      searchQuery.callDate = {};
      if (startDate) searchQuery.callDate.$gte = new Date(startDate as string);
      if (endDate) searchQuery.callDate.$lte = new Date(endDate as string);
    }

    let booking: any;
    try {
      // call service clas to fetch the booking and sort it via the sort parameter if it exists
      if (sortParam) {
        booking = await bookingService.getAllBooking(
          user.userId,
          user.role,
          searchQuery,
          sortOrderCast,
          sortParam as string
        );
      } else {
        // call service clas to fetch the booking and with the default sort settings
        booking = await bookingService.getAllBooking(
          user.userId,
          user.role,
          searchQuery,
          sortOrderCast
        );
      }

      // return booking list
      res
        .status(200)
        .json({ message: "Booking fetched successfully", booking });
      return;
    } catch (error) {
      next(error);
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Error fetching bookings", error });
      return;
    }
  }

  async updateBookingStatus(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    // extract the booking ID, new status and user object.
    const { bookingId } = req.params;
    const { status } = req.body;
    const user = req.user!;

    try {
      // create an array of allowed status value
      const allowedStatus = [
        "pending",
        "successful",
        "rejected",
        "rescheduled",
        "unsuccessful",
      ];

      // return error message if new status is not in the allowed status array
      if (!allowedStatus.includes(status)) {
        res.status(400).json({ message: "Invalid status" });
        return;
      }

      const booking = await bookingService.getBookingById(
        bookingId,
        user.userId,
        user.role
      );

      if (!booking) {
        res.status(404).json({ message: "Booking not found" });
        return;
      }

      booking.status = status;
      await booking.save();

      res.status(201).json({ message: "Status updated" });
      return;
    } catch (error) {
      next(error);
      console.error(`Error Updating Booking Status: ${error}`);
      res.status(500).json({ message: "Error Updating Booking status", error });
    }
  }

  // manually assign or reassign a call to a rep
  async assignCallToRep(req: AuthRequest, res: Response, next: NextFunction) {
    // extract booking ID and query parameters
    const bookingId = req.params.bookingId;
    const { repId, autoAssign } = req.body;
    const user = req.user!;

    // check the auto assign status
    const isAutoAssign = autoAssign === true || autoAssign === "true";

    // return error message if no bookng ID was found
    if (!bookingId) {
      res.status(400).json({ message: "Booking ID required" });
      return;
    }

    // call service class to fetch booking from DB
    const booking = await bookingService.getBookingById(
      bookingId,
      user.userId,
      user.role
    );

    // return error message if no booking was found
    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    try {
      // get the targeted rep by auto assigning or using the submited rep ID
      const targetRep = isAutoAssign ? await getLeastLoadedRep() : repId;

      // return error message if rep wasn't found
      if (!targetRep) {
        res.status(500).json({ message: "No available representatives" });
        return;
      }

      // update the assigned rep to the new targetted rep
      booking.assignedRep = targetRep;

      // create an array of booking that can't be updated based on their status
      const disallowedFields = ["successful"];

      // check if the booking has a status that's part of the disallowed statuses and return error message without saving the updated booking object.
      if (disallowedFields.includes(booking.status as string)) {
        res.status(400).json({ message: "Can't re-assign this Booking" });
        return;
      }

      // else update the booking status to assigned if the booking status is not part of the disallowed statuses, save and return success message with the new rep ID
      booking.status = "pending" as callStatus;
      await booking.save();

      res.status(200).json({ message: "Booking assigned", repId: targetRep });
      return;
    } catch (error) {
      next(error);
      console.error("Error assigning Call to Rep:", error);
      res.status(500).json({ message: "Error assigning Call to Rep", error });
      return;
    }
  }

  async getBookingAnalytics(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    const user = req.user!;

    // create an empty matchStage/Filter object for filtering the aggregation query.
    const matchStage: any = {};

    // check if the user is a callrep and add the assigned rep key to the matchstage object so it peforms aggregation based on only bookings assinged to the rep
    if (user.role === "callrep")
      matchStage.assignedRep = new Types.ObjectId(user.userId);

    try {
      // call service classto get the analytics and total booking count
      const analytics = await bookingService.getAnalytics(matchStage);
      const totalBookings = await bookingService.getTotalBooking(matchStage);

      // return the analytics
      res.status(200).json({
        totalBookings,
        breakdown: analytics,
      });
    } catch (error) {
      next(error);
      console.error(`Error fetching analytics: ${error}`);
      res.status(500).json({ message: "Error fetching analytics", error });
      return;
    }
  }

 
}

const bookingController = new BookingController();
export default bookingController;
