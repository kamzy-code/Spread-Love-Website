import { Customer, customerTier } from "../models/customerModel";
import { ICaller } from "../models/bookingModel";
import { computeTier } from "../utils/customerTier";
import { bookingLogger } from "../utils/logger";

class CustomerService {
  async getTierByEmail(email?: string): Promise<customerTier> {
    if (!email) return "new";
    const customer = await Customer.findOne({ email: email.toLowerCase() }).select("tier");
    return customer?.tier ?? "new";
  }

  async getTiersByEmails(emails: string[]): Promise<Map<string, customerTier>> {
    if (emails.length === 0) return new Map();
    const customers = await Customer.find({ email: { $in: emails } }).select("email tier");
    return new Map(customers.map((c) => [c.email, c.tier]));
  }

  async getAllCustomers(
    searchQuery: any,
    sortParam: string,
    sortOrder: 1 | -1,
    skip: number,
    limit: number
  ) {
    return Customer.find(searchQuery)
      .sort({ [sortParam]: sortOrder })
      .skip(skip)
      .limit(limit);
  }

  async countTotalCustomers(searchQuery: any) {
    return Customer.countDocuments(searchQuery);
  }

  // No pagination — the CSV export is the full filtered set in one file.
  async getAllCustomersForExport(searchQuery: any) {
    return Customer.find(searchQuery).sort({ completedBookings: -1 });
  }

  // Called when a booking's payment is confirmed ("paid") — this is the
  // client's definition of a countable booking for tiering purposes, not
  // booking/call completion. Callers must only invoke this on the
  // pending/failed -> paid transition (not on every re-verification) to
  // avoid double-counting the same booking.
  async recordPaidBooking(caller: ICaller) {
    const email = caller.email?.toLowerCase();
    if (!email) {
      bookingLogger.warn("Skipped tier update: caller has no email", {
        service: "customerService",
        action: "RECORD_PAID_BOOKING_NO_EMAIL",
      });
      return;
    }

    const customer = await Customer.findOneAndUpdate(
      { email },
      {
        $inc: { completedBookings: 1 },
        $set: {
          name: caller.name,
          phone: caller.phone,
          lastBookingAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    const previousTier = customer.tier;
    customer.tier = computeTier(customer.completedBookings);
    await customer.save();

    bookingLogger.info("Customer tier recorded", {
      email,
      completedBookings: customer.completedBookings,
      previousTier,
      tier: customer.tier,
      service: "customerService",
      action: "RECORD_PAID_BOOKING_SUCCESS",
    });
  }
}

const customerService = new CustomerService();
export default customerService;
