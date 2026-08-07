import { Response, NextFunction } from "express";
import customerService from "../services/customerService";
import bookingService from "../services/bookingService";
import { AuthRequest } from "../middlewares/authMiddleware";
import { bookingLogger } from "../utils/logger";
import { toCsv } from "../utils/toCsv";
import getDateRange from "../utils/getDateRange";

// "Booked within a period" has to match against actual bookings, not the
// Customer record's lastBookingAt — that field only ever holds the single
// most-recent booking, so a customer whose OTHER booking(s) fall in the
// requested range would otherwise be silently missed.
const buildSearchQuery = async (
  tier: unknown,
  search: unknown,
  filterType: unknown,
  singleDate: unknown,
  startDate: unknown,
  endDate: unknown,
  fetchParam: unknown
): Promise<any> => {
  const searchQuery: any = {};
  if (tier) searchQuery.tier = tier;
  if (search) {
    const regex = new RegExp(search as string, "i");
    searchQuery.$or = [{ name: regex }, { email: regex }, { phone: regex }];
  }

  const dateRange = getDateRange(
    filterType as string,
    singleDate as string,
    startDate as string,
    endDate as string
  );
  if (dateRange) {
    const emails = await bookingService.getDistinctCallerEmailsInDateRange(
      dateRange,
      (fetchParam as string) || "bookingDate"
    );
    searchQuery.email = { $in: emails };
  }

  return searchQuery;
};

class CustomerController {
  async getAllCustomers(req: AuthRequest, res: Response, next: NextFunction) {
    const user = req.user!;
    const {
      tier,
      search,
      filterType,
      singleDate,
      startDate,
      endDate,
      fetchParam,
      page = "1",
      limit = "10",
      sortParam = "lastBookingAt",
      sortOrder = "-1",
    } = req.query;

    bookingLogger.info("Get all customers initiated", {
      userId: user.userId,
      role: user.role,
      action: "GET_ALL_CUSTOMERS",
      query: { ...req.query },
    });

    try {
      const searchQuery = await buildSearchQuery(
        tier,
        search,
        filterType,
        singleDate,
        startDate,
        endDate,
        fetchParam
      );
      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      const numericLimit = parseInt(limit as string);
      const sortOrderCast: 1 | -1 = sortOrder === "1" ? 1 : -1;

      const customers = await customerService.getAllCustomers(
        searchQuery,
        sortParam as string,
        sortOrderCast,
        skip,
        numericLimit
      );
      const total = await customerService.countTotalCustomers(searchQuery);

      res.status(200).json({
        message: "Customers fetched successfully",
        data: customers,
        meta: {
          total,
          page: Number(page),
          limit: numericLimit,
          totalPages: Math.ceil(total / numericLimit),
        },
      });

      bookingLogger.info("Get all customers successful", {
        userId: user.userId,
        total,
        action: "GET_ALL_CUSTOMERS_SUCCESS",
      });
      return;
    } catch (error: any) {
      bookingLogger.error(`Get all customers error: ${error.message}`, {
        userId: user.userId,
        action: "GET_ALL_CUSTOMERS_FAILED",
        error,
      });
      next(error);
      return;
    }
  }

  async exportCustomersCsv(req: AuthRequest, res: Response, next: NextFunction) {
    const user = req.user!;
    const { tier, search, filterType, singleDate, startDate, endDate, fetchParam } = req.query;

    bookingLogger.info("Export customers CSV initiated", {
      userId: user.userId,
      role: user.role,
      action: "EXPORT_CUSTOMERS_CSV",
      query: { ...req.query },
    });

    try {
      const searchQuery = await buildSearchQuery(
        tier,
        search,
        filterType,
        singleDate,
        startDate,
        endDate,
        fetchParam
      );
      const customers = await customerService.getAllCustomersForExport(searchQuery);

      const csv = toCsv(
        customers.map((c) => c.toObject()),
        [
          { key: "name", header: "Name" },
          { key: "email", header: "Email" },
          { key: "phone", header: "Phone" },
          { key: "tier", header: "Tier" },
          { key: "completedBookings", header: "Completed Bookings" },
          { key: "lastBookingAt", header: "Last Booking At" },
          { key: "createdAt", header: "Customer Since" },
        ]
      );

      const filename = `customers-${new Date().toISOString().slice(0, 10)}.csv`;
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.status(200).send(csv);

      bookingLogger.info("Export customers CSV successful", {
        userId: user.userId,
        count: customers.length,
        action: "EXPORT_CUSTOMERS_CSV_SUCCESS",
      });
      return;
    } catch (error: any) {
      bookingLogger.error(`Export customers CSV error: ${error.message}`, {
        userId: user.userId,
        action: "EXPORT_CUSTOMERS_CSV_FAILED",
        error,
      });
      next(error);
      return;
    }
  }
}

const customerController = new CustomerController();
export default customerController;
