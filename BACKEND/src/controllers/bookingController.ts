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
import { HttpError } from "../utils/httpError";
import { bookingLogger } from "../logger/devLogger";
import { url } from "inspector";
import { query } from "winston";

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
      contactConsent = "no",
      callRecording = "no",
    } = req.body;

    bookingLogger.info("Booking creation initiated", {
      bookingId,
      callerName,
      action: "CREATE_BOOKING",
    });

    // return error if booking ID wasn't submitted
    if (!bookingId) {
      bookingLogger.warn("Booking creation failed: Booking ID required", {
        action: "CREATE_BOOKING_FAILED",
      });
      next(new HttpError(400, "Booking ID required"));
      return;
    }

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
        specialInstruction,
        contactConsent,
        callRecording
      );

      // return failed if booking creation was unsuccessful
      if (!newBooking) {
        bookingLogger.warn("Booking creation failed: Booking not created", {
          bookingId,
          callerName,
          action: "CREATE_BOOKING_FAILED",
        });
        next(new HttpError(500, "Failed to create booking"));
        return;
      }

      // retrun successful with Booking ID if successful
      res.status(201).json({
        message: "Booking created successfully",
        bookingId: newBooking.bookingId,
      });
      bookingLogger.info("Booking creation successful", {
        id: newBooking._id,
        bookingId: newBooking.bookingId,
        callerName,
        action: "CREATE_BOOKING_SUCCESS",
      });
      return;
    } catch (error: any) {
      bookingLogger.error(`Booking creation error: ${error.message}`, {
        bookingId,
        callerName,
        action: "CREATE_BOOKING_FAILED",
        error,
      });
      next(error);
      return;
    }
  }

  async getBookingByBookingId(req: Request, res: Response, next: NextFunction) {
    // extract BookingID from url
    const bookingId = req.params.bookingId;

    bookingLogger.info("Get booking by BookingId initiated", {
      bookingId,
      action: "GET_BOOKING_BY_BOOKING_ID",
    });

    // return ID reuired if ID wasn't submitted
    if (!bookingId) {
      bookingLogger.warn(
        "Get booking by BookingId failed: Booking ID required",
        {
          action: "GET_BOOKING_BY_BOOKING_ID_FAILED",
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
        bookingLogger.warn(
          "Get booking by BookingId failed: Booking not found",
          {
            bookingId,
            action: "GET_BOOKING_BY_BOOKING_ID_FAILED",
          }
        );
        next(new HttpError(404, "Booking not found"));
        return;
      }

      // return the booking with a successful message
      res
        .status(200)
        .json({ message: "Booking fetched successfully", booking });

      bookingLogger.info("Get booking by BookingId successful", {
        id: booking._id,
        bookingId,
        action: "GET_BOOKING_BY_BOOKING_ID_SUCCESS",
      });
      return;
    } catch (error: any) {
      bookingLogger.error(`Get booking by BookingId error: ${error.message}`, {
        bookingId,
        action: "GET_BOOKING_BY_BOOKING_ID_FAILED",
        error,
      });

      next(error);
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

    bookingLogger.info("Update booking by customer initiated", {
      bookingId,
      action: "UPDATE_BOOKING_BY_CUSTOMER",
    });

    if (!bookingId) {
      bookingLogger.warn(
        "Update booking by customer failed: Booking ID required",
        {
          action: "UPDATE_BOOKING_BY_CUSTOMER_FAILED",
        }
      );
      next(new HttpError(400, "Booking ID required"));
      return;
    }

    try {
      // call service class to fetch the booking to be updated
      const booking = await bookingService.getBookingByBookingId(bookingId);

      // if no booking was found return error message
      if (!booking) {
        bookingLogger.warn(
          "Update booking by customer failed: Booking not found",
          {
            bookingId,
            action: "UPDATE_BOOKING_BY_CUSTOMER_FAILED",
          }
        );
        next(new HttpError(404, "Booking not found"));
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
            bookingLogger.warn(
              `Update booking by customer failed: Can't update booking with status ${booking.status}`,
              {
                bookingId,
                bookingStatus: booking.status,
                action: "UPDATE_BOOKING_BY_CUSTOMER_FAILED",
              }
            );
            next(new HttpError(400, "Can't update this Booking"));
            return;
          }

          // Dynamically update the booking object with the new value for the allowed field
          // E.g., if field = "callerName", then booking["callerName"] = info["callerName"]
          (booking as any)[field] = info[field];
        } else {
          // If the field is in the disallowedFields array, return an error and stop further processing
          bookingLogger.warn(
            `Update booking by customer failed: Field '${field}' cannot be updated by the customer`,
            {
              bookingId,
              field,
              action: "UPDATE_BOOKING_BY_CUSTOMER_FAILED",
            }
          );
          next(
            new HttpError(
              403,
              `Field '${field}' cannot be updated by the customer`
            )
          );
          return;
        }
      }

      // save the updated booking object and return success message
      await booking.save();
      res.status(200).json({ message: "Update Successful" });
      bookingLogger.info("Update booking by customer successful", {
        id: booking._id,
        bookingId,
        action: "UPDATE_BOOKING_BY_CUSTOMER_SUCCESS",
      });
      return;
    } catch (error: any) {
      bookingLogger.error(
        `Update booking by customer error: ${error.message}`,
        {
          bookingId,
          action: "UPDATE_BOOKING_BY_CUSTOMER_FAILED",
          error,
        }
      );
      next(error);
      return;
    }
  }

  async generateBookingID(req: Request, res: Response, next: NextFunction) {
    bookingLogger.info("Generate Booking ID initiated", {
      action: "GENERATE_BOOKING_ID",
    });
    try {
      // call service method to generate ID
      const ID = await bookingService.generateBookingId();

      if (!ID) {
        bookingLogger.warn("Generate Booking ID failed: ID not generated", {
          action: "GENERATE_BOOKING_ID_FAILED",
        });
        next(new HttpError(500, "Failed to generate Booking ID"));
        return;
      }

      // return the booking ID
      res.status(200).json({
        ID,
      });
      bookingLogger.info("Generate Booking ID successful", {
        id: ID,
        action: "GENERATE_BOOKING_ID_SUCCESS",
      });
      return;
    } catch (error: any) {
      bookingLogger.error(`Generate Booking ID error: ${error.message}`, {
        action: "GENERATE_BOOKING_ID_FAILED",
        error,
      });
      next(error);
      return;
    }
  }

  // Admin Endpoints

  // get a booking by the MongoDB id and not the generated booking ID
  async getBookingById(req: AuthRequest, res: Response, next: NextFunction) {
    // extract booking Id from URL and get the user object created from the JWT token
    const bookingId = req.params.bookingId;
    const user = req.user!;

    bookingLogger.info("Get booking by ID initiated", {
      userId: user.userId,
      role: user.role,
      id: bookingId,
      action: "GET_BOOKING_BY_ID",
    });

    // return ID required if ID wasn't found
    if (!bookingId) {
      bookingLogger.warn("Get booking by ID failed: Booking ID required", {
        userId: user.userId,
        action: "GET_BOOKING_BY_ID_FAILED",
      });
      next(new HttpError(400, "Booking ID required"));
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
        bookingLogger.warn("Get booking by ID failed: Booking not found", {
          userId: user.userId,
          id: bookingId,
          action: "GET_BOOKING_BY_ID_FAILED",
        });
        next(new HttpError(404, "Booking not found"));
        return;
      }

      // return success message with booking object.
      res
        .status(200)
        .json({ message: "Booking fetched successfully", booking });

      bookingLogger.info("Get booking by ID successful", {
        userId: user.userId,
        role: user.role,
        id: bookingId,
        action: "GET_BOOKING_BY_ID_SUCCESS",
      });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  // delete a booking by the MongoDB id
  async DeleteBookingById(req: AuthRequest, res: Response, next: NextFunction) {
    // extract booking Id from URL and get the user object created from the JWT token
    const bookingId = req.params.bookingId;
    const user = req.user!;

    bookingLogger.info("Delete booking by ID initiated", {
      userId: user.userId,
      role: user.role,
      id: bookingId,
      action: "DELETE_BOOKING_BY_ID",
    });

    // return ID required if ID wasn't found
    if (!bookingId) {
      bookingLogger.warn("Delete booking by ID failed: Booking ID required", {
        userId: user.userId,
        action: "DELETE_BOOKING_BY_ID_FAILED",
      });
      next(new HttpError(400, "Booking ID required"));
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
      if (!booking || (booking && booking?.deletedCount < 1)) {
        bookingLogger.warn("Delete booking by ID failed: Booking not found", {
          userId: user.userId,
          id: bookingId,
          action: "DELETE_BOOKING_BY_ID_FAILED",
        });

        next(new HttpError(404, "Booking not found"));
        return;
      }

      // return success message with booking object.
      res
        .status(200)
        .json({ message: "Booking Deleted successfully", booking });

      bookingLogger.info("Delete booking by ID successful", {
        userId: user.userId,
        role: user.role,
        id: bookingId,
        action: "DELETE_BOOKING_BY_ID_SUCCESS",
      });
      return;
    } catch (error: any) {
      bookingLogger.error(`Delete booking by ID error: ${error.message}`, {
        userId: user.userId,
        role: user.role,
        id: bookingId,
        action: "DELETE_BOOKING_BY_ID_FAILED",
        error,
      });

      next(error);
      return;
    }
  }

  async getAllBooking(req: AuthRequest, res: Response, next: NextFunction) {
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
      confirmationMailsent,
    } = req.query;

    bookingLogger.info("Get all bookings initiated", {
      userId: req.user?.userId,
      role: req.user?.role,
      action: "GET_ALL_BOOKINGS",
      query: {...req.query},
    });

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
    if (confirmationMailsent !== undefined && confirmationMailsent !== null) {
      if (typeof confirmationMailsent === "boolean") {
        searchQuery.confirmationMailsent = confirmationMailsent;
      } else if (typeof confirmationMailsent === "string") {
        searchQuery.confirmationMailsent = confirmationMailsent === "true";
      }
    }

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

      if (!bookings) {
        bookingLogger.warn("No bookings found", {
          userId: user.userId,
          role: user.role,
          query: {...req.query},
          action: "GET_ALL_BOOKINGS_NO_RESULTS",
        });
        next(new HttpError(404, "No bookings found"));
        return;
      }

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

      bookingLogger.info("Get all bookings successful", {
        userId: user.userId,
        role: user.role,
        totalBookings: total,
        page: Number(page),
        query: {...req.query},
        action: "GET_ALL_BOOKINGS_SUCCESS",
      });
      return;
    } catch (error: any) {
      bookingLogger.error(`Get all bookings error: ${error.message}`, {
        userId: user.userId,
        role: user.role,
        action: "GET_ALL_BOOKINGS_FAILED",
        error,
        query: {...req.query},
      });

      next(error);
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

    bookingLogger.info("Update booking status initiated", {
      userId: user.userId,
      role: user.role,
      id: bookingId,
      status,
      action: "UPDATE_BOOKING_STATUS",
    });

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
        bookingLogger.warn("Update booking status failed: Invalid status", {
          userId: user.userId,
          role: user.role,
          id: bookingId,
          status,
          action: "UPDATE_BOOKING_STATUS_FAILED",
        });
        next(new HttpError(400, "Invalid status"));
        return;
      }

      const booking = await bookingService.getBookingById(
        bookingId,
        user.userId,
        user.role
      );

      if (!booking) {
        bookingLogger.warn("Update booking status failed: Booking not found", {
          userId: user.userId,
          role: user.role,
          id: bookingId,
          action: "UPDATE_BOOKING_STATUS_FAILED",
        });
        next(new HttpError(404, "Booking not found"));
        return;
      }

      booking.status = status;
      await booking.save();

      res.status(201).json({ message: "Status updated" });
      bookingLogger.info("Update booking status successful", {
        userId: user.userId,
        role: user.role,
        id: bookingId,
        status,
        action: "UPDATE_BOOKING_STATUS_SUCCESS",
      });
      return;
    } catch (error: any) {
      bookingLogger.error(`Update booking status error: ${error.message}`, {
        userId: user.userId,
        role: user.role,
        id: bookingId,
        status,
        action: "UPDATE_BOOKING_STATUS_FAILED",
        error,
      });
      next(error);
      return;
    }
  }

  // manually assign or reassign a call to a rep
  async assignCallToRep(req: AuthRequest, res: Response, next: NextFunction) {
    // extract booking ID and query parameters
    const bookingId = req.params.bookingId;
    const { repId } = req.query;
    const user = req.user!;

    bookingLogger.info("Assign call to rep initiated", {
      userId: user.userId,
      role: user.role,
      id: bookingId,
      repId,
      action: "ASSIGN_CALL_TO_REP",
    });

    if (!bookingId) {
      bookingLogger.warn("Assign call to rep failed: Booking ID required", {
        userId: user.userId,
        role: user.role,
        action: "ASSIGN_CALL_TO_REP_FAILED",
      });
      next(new HttpError(400, "Booking ID required"));
      return;
    }

    if (!repId) {
      bookingLogger.warn("Assign call to rep failed: Rep ID required", {
        userId: user.userId,
        role: user.role,
        action: "ASSIGN_CALL_TO_REP_FAILED",
      });
      next(new HttpError(400, "Rep ID required"));
      return;
    }

    // check the auto assign status
    const isAutoAssign = (repId as string) === "auto";

    try {
      const booking = await bookingService.getBookingById(
        bookingId,
        user.userId,
        user.role
      );

      // return error message if no booking was found
      if (!booking) {
        bookingLogger.warn("Assign call to rep failed: Booking not found", {
          userId: user.userId,
          role: user.role,
          id: bookingId,
          action: "ASSIGN_CALL_TO_REP_FAILED",
        });
        next(new HttpError(404, "Booking not found"));
        return;
      }

      // get the targeted rep by auto assigning or using the submited rep ID
      let targetRep = isAutoAssign
        ? await getLeastLoadedRep()
        : await adminService.getRepById(repId as string, user.role);

      // return error message if rep wasn't found
      if (!targetRep) {
        bookingLogger.warn("Assign call to rep failed: No available reps", {
          userId: user.userId,
          role: user.role,
          id: bookingId,
          action: "ASSIGN_CALL_TO_REP_FAILED",
        });
        next(new HttpError(500, "No available representatives"));
        return;
      }

      if (targetRep && typeof targetRep !== "string") {
        if (targetRep.status !== "active") {
          bookingLogger.warn(
            "Assign call to rep failed: Selected rep is not active",
            {
              userId: user.userId,
              role: user.role,
              id: bookingId,
              repId: targetRep._id,
              action: "ASSIGN_CALL_TO_REP_FAILED",
            }
          );
          next(new HttpError(400, "Selected rep is not active"));
          return;
        }
        targetRep = targetRep._id as string;
      }

      // update the assigned rep to the new targetted rep
      booking.assignedRep = new Types.ObjectId(targetRep);

      // create an array of booking that can't be updated based on their status
      const disallowedStatuses = ["successful", "unsuccessful", "rejected"];

      // check if the booking has a status that's part of the disallowed statuses and return error message without saving the updated booking object.
      if (disallowedStatuses.includes(booking.status as string)) {
        bookingLogger.warn(
          `Assign call to rep failed: Can't re-assign booking with status ${booking.status}`,
          {
            userId: user.userId,
            role: user.role,
            id: bookingId,
            repId: targetRep,
            status: booking.status,
            action: "ASSIGN_CALL_TO_REP_FAILED",
          }
        );

        next(
          new HttpError(
            400,
            ` Can't re-assign booking with status ${booking.status}`
          )
        );
        return;
      }

      // else update the booking status to pending if the booking status is not part of the disallowed statuses, save and return success message with the new rep ID
      booking.status = "pending" as callStatus;
      await booking.save();

      res.status(200).json({ message: "Booking assigned", repId: targetRep });
      bookingLogger.info("Assign call to rep successful", {
        userId: user.userId,
        role: user.role,
        id: bookingId,
        repId: targetRep,
        action: "ASSIGN_CALL_TO_REP_SUCCESS",
      });
      return;
    } catch (error: any) {
      bookingLogger.error(`Assign call to rep error: ${error.message}`, {
        userId: user.userId,
        role: user.role,
        id: bookingId,
        repId,
        action: "ASSIGN_CALL_TO_REP_FAILED",
        error,
      });

      next(error);
      return;
    }
  }

  async getBookingAnalytics(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    const user = req.user!;
    const { repId } = req.params;
    const { filterType, date, startDate, endDate } = req.query;
    const matchStage: any = {};

    bookingLogger.info("Get booking analytics initiated", {
      userId: user.userId,
      role: user.role,
      ...(repId ? { repId } : {}),
      query: {...req.query},
      action: "GET_BOOKING_ANALYTICS",
    });

    if (user.role === "callrep")
      matchStage.assignedRep = new Types.ObjectId(user.userId);

    if (repId) matchStage.assignedRep = new Types.ObjectId(repId);

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

      bookingLogger.info("Get booking analytics successful", {
        userId: user.userId,
        role: user.role,
        ...(repId ? { repId } : {}),
        totalBookings,
        breakdown: analytics,
        query: {...req.query},
        action: "GET_BOOKING_ANALYTICS_SUCCESS",
      });
      return;
    } catch (error: any) {
      bookingLogger.error(`Get booking analytics error: ${error.message}`, {
        userId: user.userId,
        role: user.role,
        ...(repId ? { repId } : {}),
        action: "GET_BOOKING_ANALYTICS_FAILED",
        error,
        query: {...req.query},
      });

      next(error);
      return;
    }
  }
}

const bookingController = new BookingController();
export default bookingController;
