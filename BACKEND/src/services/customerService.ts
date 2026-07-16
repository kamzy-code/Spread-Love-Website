import { Customer } from "../models/customerModel";
import { ICaller } from "../models/bookingModel";
import { computeTier } from "../utils/customerTier";
import { bookingLogger } from "../utils/logger";

class CustomerService {
  // called when a booking transitions to bookingStatus "completed"
  async recordCompletedBooking(caller: ICaller) {
    const email = caller.email?.toLowerCase();
    if (!email) {
      bookingLogger.warn("Skipped tier update: caller has no email", {
        service: "customerService",
        action: "RECORD_COMPLETED_BOOKING_NO_EMAIL",
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
      action: "RECORD_COMPLETED_BOOKING_SUCCESS",
    });
  }
}

const customerService = new CustomerService();
export default customerService;
