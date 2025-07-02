import { Admin } from "../models/adminModel"; 

class AdminService {
  async countActiveReps(userRole: string) {
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