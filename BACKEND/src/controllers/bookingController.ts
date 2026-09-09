import { Request, Response, NextFunction } from "express";
import bookingService from "../services/bookingService";
import recordingService from "../services/recordingService";
import emailService from "../services/emailService";
import emailQueueService from "../services/emailQueueService";
import { getLeastLoadedRep } from "../utils/getLeastLoadedRep";
import { callStatus } from "../types/genralTypes";
import { isLegacyBooking } from "../utils/bookingShape";
import { AuthRequest } from "../middlewares/authMiddleware";
import { Types } from "mongoose";
import { castSortOder } from "../utils/castSortOrder";
import getDateRange from "../utils/getDateRange";
import adminService from "../services/adminService";
import auditLogService from "../services/auditLogService";
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
import { bookingLogger } from "../utils/logger";

class BookingController {
  // Customer Endpoints
  // Orchestrates ID generation, booking creation (or re-use), and Paystack
  // initialization server-side in one request — see bookingService.checkoutBooking.
  async createBooking(req: Request, res: Response, next: NextFunction) {
    // body has already been validated against createBookingSchema by validateRequest
    const { caller, recipients, contactConsent = "no", couponCode } = req.body;

    bookingLogger.info("Booking checkout initiated", {
      callerName: caller.name,
      action: "CREATE_BOOKING",
    });

    try {
      const { bookingId, paymentURL } = await bookingService.checkoutBooking(
        caller,
        recipients,
        contactConsent,
        couponCode
      );

      res.status(201).json({
        message: "Booking created successfully",
        bookingId,
        paymentURL,
      });
      bookingLogger.info("Booking checkout successful", {
        bookingId,
        callerName: caller.name,
        action: "CREATE_BOOKING_SUCCESS",
      });
      return;
    } catch (error: any) {
      bookingLogger.error(`Booking checkout error: ${error.message}`, {
        callerName: caller.name,
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

      // Merge in any approved recording(s) for this booking's recipients —
      // the only place a recording is exposed on this fully public route.
      // Only touches the response, never persisted.
      const bookingObj: any = booking.toObject();
      const recordingsByRecipient = await recordingService.getApprovedRecordingsByBooking(
        booking._id as any,
      );
      if (recordingsByRecipient.size > 0 && Array.isArray(bookingObj.recipients)) {
        bookingObj.recipients = bookingObj.recipients.map((r: any) => ({
          ...r,
          recording: recordingsByRecipient.get(r._id?.toString()) ?? null,
        }));
      }

      // return the booking with a successful message
      res
        .status(200)
        .json({ message: "Booking fetched successfully", booking: bookingObj });

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

  // caller/recipients are validated by validateRequest (updateBookingByCustomerSchema)
  async updateBookingByCustomer(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { bookingId } = req.params;
    const { caller, recipients } = req.body;

    bookingLogger.info("Update booking by customer initiated", {
      bookingId,
      action: "UPDATE_BOOKING_BY_CUSTOMER",
    });

    try {
      const booking = await bookingService.getBookingByBookingId(bookingId);

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

      await bookingService.updateBookingByCustomer(booking, {
        caller,
        recipients,
      });

      res.status(200).json({ message: "Update Successful" });
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

  // Admin Endpoints

  // caller/recipients are validated by validateRequest (updateBookingByAdminSchema);
  // bookingId (Mongo _id) validated by validateParams (bookingIdParamSchema)
  async updateBookingByAdmin(req: AuthRequest, res: Response, next: NextFunction) {
    const { bookingId } = req.params;
    const { caller, recipients } = req.body;
    const user = req.user!;

    bookingLogger.info("Update booking by admin initiated", {
      userId: user.userId,
      role: user.role,
      bookingId,
      action: "UPDATE_BOOKING_BY_ADMIN",
    });

    try {
      const booking = await bookingService.getBookingById(
        bookingId,
        user.userId,
        user.role
      );

      if (!booking) {
        bookingLogger.warn("Update booking by admin failed: Booking not found", {
          userId: user.userId,
          bookingId,
          action: "UPDATE_BOOKING_BY_ADMIN_FAILED",
        });
        next(new HttpError(404, "Booking not found"));
        return;
      }

      await bookingService.updateBookingByAdmin(booking, { caller, recipients }, user.userId);

      res.status(200).json({ message: "Update Successful" });
      return;
    } catch (error: any) {
      bookingLogger.error(`Update booking by admin error: ${error.message}`, {
        userId: user.userId,
        bookingId,
        action: "UPDATE_BOOKING_BY_ADMIN_FAILED",
        error,
      });
      next(error);
      return;
    }
  }

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
      const booking = await bookingService.getBookingByIdForDisplay(
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
      bookingStatus,
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
      paymentStatus,
      fetchParam,
    } = req.query;

    bookingLogger.info("Get all bookings initiated", {
      userId: req.user?.userId,
      role: req.user?.role,
      action: "GET_ALL_BOOKINGS",
      query: { ...req.query },
    });

    // cast the sort order variable from a string to a valid sort Order type.
    // i.e from sortorder: string = "1" or "-1" to sortorder: SortOrder = 1 or -1
    const sortOrderCast = castSortOder(sortOrder as string);

    const user = req.user!;

    // create an empty query object for the DB search
    const searchQuery: any = {};
    // each entry is an independent $or block; combined at the end via $and
    // so legacy-shape and v2-shape (recipients[]) bookings both match.
    const andConditions: any[] = [];

    if (paymentStatus) searchQuery.paymentStatus = paymentStatus;
    if (bookingStatus) searchQuery.bookingStatus = bookingStatus;

    if (assignedRep)
      searchQuery.assignedRep = new Types.ObjectId(assignedRep as string);
    
    if (confirmationMailsent !== undefined && confirmationMailsent !== null) {
      if (typeof confirmationMailsent === "boolean") {
        searchQuery.confirmationMailsent = confirmationMailsent;
      } else if (typeof confirmationMailsent === "string") {
        searchQuery.confirmationMailsent = confirmationMailsent === "true";
      }
    }

    // status/occassion/callType/country can live on the flat (legacy) fields
    // or on a recipient inside recipients[] (v2) — $elemMatch keeps all of a
    // v2 filter combination scoped to the same recipient.
    const legacyMatch: any = {};
    const recipientMatch: any = {};
    let hasShapeFilter = false;

    if (status) {
      legacyMatch.status = status;
      recipientMatch.callStatus = status;
      hasShapeFilter = true;
    }
    if (occassion) {
      legacyMatch.occassion = occassion;
      recipientMatch.occassion = occassion;
      hasShapeFilter = true;
    }
    if (callType) {
      legacyMatch.callType = callType;
      recipientMatch.callType = callType;
      hasShapeFilter = true;
    }
    if (country === "local" || country === "international") {
      const countryPattern =
        country === "local" ? /nigeria/i : { $not: /nigeria/i };
      legacyMatch.country = countryPattern;
      recipientMatch.country = countryPattern;
      hasShapeFilter = true;
    }

    if (hasShapeFilter) {
      andConditions.push({
        $or: [legacyMatch, { recipients: { $elemMatch: recipientMatch } }],
      });
    }

    const dateRange = getDateRange(
      filterType as string,
      singleDate as string,
      startDate as string,
      endDate as string
    );

    if (dateRange) {
      if (fetchParam === "bookingDate") {
        searchQuery.createdAt = {
          $gte: dateRange.start,
          $lte: dateRange.end,
        };
      } else {
        andConditions.push({
          $or: [
            { callDate: { $gte: dateRange.start, $lte: dateRange.end } },
            // $elemMatch is required here: without it, Mongo treats $gte and
            // $lte as independently satisfiable by different array elements,
            // so a booking with recipients on e.g. Aug 10 and Aug 15 would
            // wrongly match every date in between too.
            {
              recipients: {
                $elemMatch: {
                  callDate: { $gte: dateRange.start, $lte: dateRange.end },
                },
              },
            },
          ],
        });
      }
    }

    if (search) {
      const regex = new RegExp(req.query.search as string, "i");
      andConditions.push({
        $or: [
          { callerName: regex },
          { bookingId: regex },
          { callerPhone: regex },
          { callerEmail: regex },
          { recipientName: regex },
          { recipientPhone: regex },
          { "caller.name": regex },
          { "caller.phone": regex },
          { "caller.email": regex },
          { "recipients.recipientName": regex },
          { "recipients.recipientPhone": regex },
        ],
      });
    }

    if (andConditions.length > 0) {
      searchQuery.$and = andConditions;
    }

    // if the user is a call rep, only fetch bookings assigned to them
    if (user.role === "callrep")
      searchQuery.assignedRep = new Types.ObjectId(user.userId);

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
          query: { ...req.query },
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
        query: { ...req.query },
        action: "GET_ALL_BOOKINGS_SUCCESS",
      });
      return;
    } catch (error: any) {
      bookingLogger.error(`Get all bookings error: ${error.message}`, {
        userId: user.userId,
        role: user.role,
        action: "GET_ALL_BOOKINGS_FAILED",
        error,
        query: { ...req.query },
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
    // extract the booking ID, optional recipient ID (v2 bookings only),
    // new status and user object.
    const { bookingId, recipientId } = req.params;
    const { status } = req.body;
    const user = req.user!;

    bookingLogger.info("Update booking status initiated", {
      userId: user.userId,
      role: user.role,
      id: bookingId,
      recipientId,
      status,
      action: "UPDATE_BOOKING_STATUS",
    });

    try {
      // status is validated by validateRequest (updateBookingStatusSchema)
      const booking = await bookingService.updateCallStatus(
        bookingId,
        user.userId,
        user.role,
        status,
        recipientId
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

      // Best-effort: a failed "all successful" mail must not fail an
      // already-applied status update response.
      try {
        await emailService.sendAllRecipientsSuccessfulEmailIfDue(booking);
      } catch (emailError: any) {
        bookingLogger.error(
          `All-recipients-successful mail failed after status update: ${emailError.message}`,
          {
            id: bookingId,
            action: "UPDATE_BOOKING_STATUS_ALL_SUCCESSFUL_MAIL_FAILED",
          },
        );
        await emailQueueService.enqueue(
          "all_recipients_successful",
          booking._id as any,
          emailError.message,
        );
      }

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

    // repId is validated by validateQuery (assignCallToRepQuerySchema)
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

      // update the assigned rep to the new targetted rep — assignedRep comes
      // populated from getBookingById, so pull the id off the populated doc
      // rather than calling .toString() on the whole document.
      const previousAssignedRep = (booking.assignedRep as any)?._id?.toString();
      booking.assignedRep = new Types.ObjectId(targetRep);

      // create an array of booking that can't be updated based on their status
      const disallowedStatuses = ["successful", "unsuccessful", "rejected"];
      const currentStatus = isLegacyBooking(booking)
        ? (booking.status as string)
        : booking.bookingStatus;

      // check if the booking has a status that's part of the disallowed statuses and return error message without saving the updated booking object.
      const isBlocked = isLegacyBooking(booking)
        ? disallowedStatuses.includes(currentStatus as string)
        : currentStatus === "completed";

      if (isBlocked) {
        bookingLogger.warn(
          `Assign call to rep failed: Can't re-assign booking with status ${currentStatus}`,
          {
            userId: user.userId,
            role: user.role,
            id: bookingId,
            repId: targetRep,
            status: currentStatus,
            action: "ASSIGN_CALL_TO_REP_FAILED",
          }
        );

        next(
          new HttpError(
            400,
            ` Can't re-assign booking with status ${currentStatus}`
          )
        );
        return;
      }

      // legacy bookings reset to pending on reassignment; v2 per-recipient
      // call statuses are untouched by a rep reassignment
      if (isLegacyBooking(booking)) {
        booking.status = "pending" as callStatus;
      }
      await booking.save();

      await auditLogService.recordDiffs("booking", booking.bookingId, user.userId, [
        { field: "assignedRep", oldValue: previousAssignedRep, newValue: String(targetRep) },
      ]);

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
    const { filterType, date, startDate, endDate, fetchParam } = req.query;
    const matchStage: any = {};

    bookingLogger.info("Get booking analytics initiated", {
      userId: user.userId,
      role: user.role,
      ...(repId ? { repId } : {}),
      query: { ...req.query },
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

    
    const callDateMatch = (range: { start: Date; end: Date }) => ({
      $or: [
        { callDate: { $gte: range.start, $lte: range.end } },
        {
          recipients: {
            $elemMatch: { callDate: { $gte: range.start, $lte: range.end } },
          },
        },
      ],
    });

    if (dateRange) {
      if (fetchParam === "bookingDate") {
        matchStage.createdAt = {
          $gte: dateRange.start,
          $lte: dateRange.end,
        };
      } else {
        Object.assign(matchStage, callDateMatch(dateRange));
      }
    }

    // Build previous period match stage
    const matchStagePrev = { ...matchStage };
    if (prevDateRange) {
      if (fetchParam === "bookingDate") {
        matchStagePrev.createdAt = {
          $gte: prevDateRange.start,
          $lte: prevDateRange.end,
        };
      } else {
        Object.assign(matchStagePrev, callDateMatch(prevDateRange));
      }
    }

    try {
      // Current period
      const analytics = await bookingService.getAnalytics(matchStage);
      const bookingBreakdown = await bookingService.getBookingStatusBreakdown(
        matchStage
      );
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
        bookingBreakdown,
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
        query: { ...req.query },
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
        query: { ...req.query },
      });

      next(error);
      return;
    }
  }
}

const bookingController = new BookingController();
export default bookingController;
