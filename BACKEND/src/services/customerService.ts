import { Customer } from "../models/customerModel";
import { ICaller } from "../models/bookingModel";
import { computeTier } from "../utils/customerTier";

class CustomerService {
  // called when a booking transitions to bookingStatus "completed"
  async recordCompletedBooking(caller: ICaller) {
    const email = caller.email?.toLowerCase();
    if (!email) return;

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

    customer.tier = computeTier(customer.completedBookings);
    await customer.save();
  }
}

const customerService = new CustomerService();
export default customerService;
