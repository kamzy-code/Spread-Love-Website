import { startOfDay, endOfDay } from "date-fns";
import { Admin } from "../models/adminModel";
import { Booking } from "../models/bookingModel";

export const getLeastLoadedRep = async (
): Promise<string | null> => {
  const callReps = await Admin.find({ role: "callrep", status: "active" });

  if (callReps.length === 0) {
    console.error("No call representatives available");
    return null;
  }

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  const repBookings = await Promise.all(
    callReps.map(async (rep) => {
      const count = await Booking.countDocuments({
        assignedRep: rep._id,
        createdAt: { $gte: todayStart, $lte: todayEnd },
      });
      return { repId: rep._id as string, count };
    })
  );

  const minRep = repBookings.sort((a, b) => a.count - b.count)[0];
  return minRep.repId.toString();
};
