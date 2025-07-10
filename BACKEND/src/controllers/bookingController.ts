import { Request, Response, NextFunction } from "express";
import bookingService from "../services/bookingService";
import { getLeastLoadedRep } from "../utils/getLeastLoadedRep";
import { callStatus } from "../types/genralTypes";
import { AuthRequest } from "../middlewares/authMiddleware";
import { Types } from "mongoose";
import { castSortOder } from "../utils/castSortOrder";
import { callType, occassionType } from "../types/genralTypes";
import getDateRange from "../utils/getDateRange";
import adminService from "../services/adminService";
import {
  subDays,
  subMonths,
  subWeeks,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
} from "date-fns";

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
        callDate as Date,
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
        res.status(404).json({ message: "Booking Not found" });
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

      // Loop through each key in the info object to check which fields can be updated
      for (const field of Object.keys(info)) {
        // If the field is not in the disallowedFields array, proceed to update
        if (!disallowedFields.includes(field)) {
          // Define statuses for which bookings cannot be updated
          const disallowedStatus = ["successful"];

          // If the booking status is in the disallowedStatus array, return an error and stop further processing
          if (disallowedStatus.includes(booking.status as string)) {
            res.status(400).json({ message: "Can't update this Booking" });
            return;
          }
          // Dynamically update the booking object with the new value for the allowed field
          // E.g., if field = "callerName", then booking["callerName"] = info["callerName"]
          (booking as any)[field] = info[field];
        } else {
          // If the field is in the disallowedFields array, return an error and stop further processing
          res
            .status(403)
            .json({ message: "You can't update this field", field });
          return;
        }
      }

      // save the updated booking object and return success message
      await booking.save();
      res.status(200).json({ message: "Update Successful" });
      return;
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

  // delete a booking by the MongoDB id
  async DeleteBookingById(req: AuthRequest, res: Response, next: NextFunction) {
    // extract booking Id from URL and get the user object created from the JWT token
    const bookingId = req.params.bookingId;
    const user = req.user!;

    // return ID required if ID wasn't found
    if (!bookingId) {
      res.status(400).json({ message: "Booking ID required" });
      return;
    }

    try {
      // call service class to delete booking from DB
      const booking = await bookingService.deleteBookingById(
        bookingId,
        user.userId,
        user.role
      );

      // return not found if no booking was found
      if ((!booking) || (booking && booking?.deletedCount < 1)) {
        res.status(404).json({ message: "Booking not found" });
        return;
      }

      // return success message with booking object.
      res
        .status(200)
        .json({ message: "Booking Deleted successfully", booking });
      return;
    } catch (error) {
      next(error);
      console.error("Error Deleting booking:", error);
      res.status(500).json({ message: "Error Deleting booking", error });
      return;
    }
  }

  async getAllBooking(req: AuthRequest, res: Response, next: NextFunction) {
    console.log(`fetch all bookings hit + ${new Date()}`);
    // extract all possible filtering parameters from the request query object.
    const {
      status,
      assignedRep,
      callType,
      country,
      occassion,
      sortParam,
      sortOrder,
      page = "1",
      limit = "10",
      startDate,
      endDate,
      search,
      singleDate,
      filterType,
    } = req.query;

    // cast the sort order variable from a string to a valid sort Order type.
    // i.e from sortorder: string = "1" or "-1" to sortorder: SortOrder = 1 or -1
    const sortOrderCast = castSortOder(sortOrder as string);

    const user = req.user!;

    // create an empty query object for the DB search
    const searchQuery: any = {};

    // add query fields to the query object only if they exist.
    if (status) searchQuery.status = status;
    if (occassion) searchQuery.occassion = occassion;
    if (assignedRep) searchQuery.assignedRep = assignedRep;
    if (callType) searchQuery.callType = callType;
    if (country) {
      if (country === "local") {
        searchQuery.country = /nigeria/i; // case-insensitive match for "nigeria"
      } else if (country === "international") {
        searchQuery.country = { $not: /nigeria/i }; // case-insensitive "not nigeria"
      }
    }

    const dateRange = getDateRange(
      filterType as string,
      singleDate as string,
      startDate as string,
      endDate as string
    );

    if (dateRange) {
      searchQuery.callDate = {
        $gte: dateRange.start,
        $lte: dateRange.end,
      };
    }

    if (search) {
      const regex = new RegExp(req.query.search as string, "i");
      searchQuery.$or = [
        { callerName: regex },
        { bookingId: regex },
        { callerPhone: regex },
        { recipientName: regex },
        { recipientPhone: regex },
      ];
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const numericLimit = parseInt(limit as string);

    try {
      // call service clas to fetch the booking and sort it via the sort parameter if it exists

      const bookings = await bookingService.getAllBooking(
        user.userId,
        user.role,
        searchQuery,
        sortOrderCast,
        sortParam as string,
        skip,
        numericLimit
      );

      const total = await bookingService.getTotalBookingsCount(searchQuery);

      // return booking list
      res.status(200).json({
        message: "Bookings fetched successfully",
        data: bookings,
        meta: {
          total,
          page: Number(page),
          limit: numericLimit,
          totalPages: Math.ceil(total / numericLimit),
        },
      });
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
    const matchStage: any = {};
    if (user.role === "callrep")
      matchStage.assignedRep = new Types.ObjectId(user.userId);

    const { filterType, date, startDate, endDate } = req.query;

    // Get current period range
    const dateRange = getDateRange(
      filterType as string,
      date as string,
      startDate as string,
      endDate as string
    );

    // Get previous period range
    let prevDateRange = undefined;
    if (dateRange) {
      if (filterType === "daily") {
        const prev = subDays(dateRange.start, 1);
        prevDateRange = {
          start: startOfDay(prev),
          end: endOfDay(prev),
        };
      } else if (filterType === "monthly") {
        const prev = subMonths(dateRange.start, 1);
        prevDateRange = {
          start: startOfMonth(prev),
          end: endOfMonth(prev),
        };
      } else if (filterType === "weekly") {
        const prev = subWeeks(dateRange.start, 1);
        prevDateRange = {
          start: startOfWeek(prev),
          end: endOfWeek(prev),
        };
      }
      // Add more as needed
    }

    if (dateRange) {
      matchStage.callDate = {
        $gte: dateRange.start,
        $lte: dateRange.end,
      };
    }

    // Build previous period match stage
    const matchStagePrev = { ...matchStage };
    if (prevDateRange) {
      matchStagePrev.callDate = {
        $gte: prevDateRange.start,
        $lte: prevDateRange.end,
      };
    }

    try {
      // Current period
      const analytics = await bookingService.getAnalytics(matchStage);
      const totalBookings = await bookingService.getTotalBookingsCount(
        matchStage
      );

      // Previous period
      const prevTotalBookings = prevDateRange
        ? await bookingService.getTotalBookingsCount(matchStagePrev)
        : 0;

      // Calculate percentage increase
      const percentageIncrease =
        prevTotalBookings === 0 && totalBookings > 0
          ? 100
          : prevTotalBookings === 0 && totalBookings === 0
          ? 0
          : ((totalBookings - prevTotalBookings) / prevTotalBookings) * 100;

      let totalRevenue = undefined;
      let prevTotalRevenue = undefined;
      let revenuePercentageIncrease = undefined;
      let activeRepsCount = undefined;

      if (user.role === "superadmin" || user.role === "salesrep") {
        activeRepsCount = await adminService.countActiveReps(user.role);
      }
      if (user.role === "superadmin") {
        totalRevenue = await bookingService.getTotalRevenue(matchStage);
        prevTotalRevenue = prevDateRange
          ? await bookingService.getTotalRevenue(matchStagePrev)
          : 0;
        revenuePercentageIncrease =
          prevTotalRevenue === 0 && totalRevenue > 0
            ? 100
            : prevTotalRevenue === 0 && totalRevenue === 0
            ? 0
            : ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100;
      }

      res.status(200).json({
        totalBookings,
        breakdown: analytics,
        percentageIncrease,
        ...(user.role === "superadmin" && {
          totalRevenue,
          revenuePercentageIncrease,
        }),
        ...(activeRepsCount !== undefined && { activeRepsCount }),
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
