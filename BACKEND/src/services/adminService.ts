import { Types } from "mongoose";
import { Admin } from "../models/adminModel";

class AdminService {
  async getRepById(repId: string, role: string) {
    if (role === "callrep") return;

    // If the admin role is a salesrep return the rep if the id matches and the rep is a callrep
    if (role === "salesrep" || role === "callrep") {
      return await Admin.findOne({
        _id: new Types.ObjectId(repId),
        role: "callrep",
      });
    }

    return await Admin.findById(repId);
  }

  async getAllReps(searchQuery: any, skip: number, numericLimit: number) {
    return await Admin.find(searchQuery)
      .sort({ role: -1 })
      .skip(skip)
      .limit(numericLimit)
      .select("-password -__v -createdAt -updatedAt");
  }

  async deleteRepById(repId: string, role: string) {
    if (role === "callrep" || role === "salesrep") return;

    return await Admin.deleteOne({
      _id: new Types.ObjectId(repId),
    });
  }

  async countTotalReps(userRole: string) {
    if (userRole === "callrep") return 0;

    let match: any = {};

    if (userRole === "salesrep") {
      match.role = "callrep";
    }

    return await Admin.countDocuments(match);
  }

  async countActiveReps(userRole: string) {
    if (userRole === "callrep") return 0;

    let match: any = { status: "active" };

    if (userRole === "superadmin") {
      match.role = { $in: ["callrep", "salesrep"] };
    } else if (userRole === "salesrep") {
      match.role = "callrep";
    } else {
      return undefined; // callrep doesn't get this value
    }

    return await Admin.countDocuments(match);
  }
}

const adminService = new AdminService();
export default adminService;
