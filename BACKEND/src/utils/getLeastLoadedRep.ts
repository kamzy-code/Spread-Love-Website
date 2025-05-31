import { Admin } from "../models/adminModel";
import { Booking } from "../models/bookingModel";

export const getLeastLoadedRep = async (
): Promise<string | null> => {
  const callReps = await Admin.find({ role: "callrep" });

  if (callReps.length === 0) {
    console.error("No call representatives available");
    return null;
  }

  // Simple load balancing: assign to rep with fewest bookings today
  const repBookings = await Promise.all(
    callReps.map(async (rep) => {
      const count = await Booking.countDocuments({
        assignedRep: rep._id,
        status: { $in: ["pending", "assigned"] },
      });
      return { repId: rep._id as string, count };
    })
  );

  const minRep = repBookings.sort((a, b) => a.count - b.count)[0];
  return minRep.repId;
};
