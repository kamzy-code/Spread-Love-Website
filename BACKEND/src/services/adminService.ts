import { Types } from "mongoose";
import { Admin } from "../models/adminModel";
import bcrypt from "bcrypt";

interface UpdateRepOptions {
  targetRepId: string;
  updaterId: string;
  updaterRole: string;
  info: any;
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

class AdminService {
  async getRepById(repId: string, role: string, withPassword?: boolean) {
    if (role === "callrep") return;

    // If the admin role is a salesrep return the rep if the id matches and the rep is a callrep
    if (role === "salesrep") {
      return await Admin.findOne({
        _id: new Types.ObjectId(repId),
        role: "callrep",
      }).select("-password -__v -createdAt -updatedAt");
    }

    return await Admin.findById(repId).select(
      `${withPassword ? "" : "-password"} -__v -createdAt -updatedAt`
    );
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

  async updateRepInfo({
    targetRepId,
    updaterId,
    updaterRole,
    info,
    oldPassword,
    newPassword,
    confirmPassword,
  }: UpdateRepOptions) {
    const rep = await Admin.findById(targetRepId).lean(false);
    if (!rep) {
      return { status: 404, body: { message: "Rep not found" } };
    }

    if (newPassword) {
      if (!oldPassword) {
        return { status: 400, body: { message: "Old password is required" } };
      }

      if (newPassword !== confirmPassword) {
        return { status: 400, body: { message: "Passwords do not match" } };
      }

      const isRepPasswordValid = await bcrypt.compare(
        oldPassword,
        rep.password
      );
      let isAdminPasswordValid = false;

      if (!isRepPasswordValid && updaterRole === "superadmin") {
        const superadmin = await Admin.findById(updaterId);
        if (superadmin?.password) {
          isAdminPasswordValid = await bcrypt.compare(
            oldPassword,
            superadmin.password
          );
        }
      }

      if (!isRepPasswordValid && !isAdminPasswordValid) {
        return { status: 401, body: { message: "Invalid password" } };
      }

      info.password = await bcrypt.hash(newPassword, 10);
    }

    const allowedFields = ["firstName", "lastName", "email", "status", "role", "phone", "password"];
    allowedFields.forEach((field) => {
      if (info[field] !== undefined) {
        (rep as any)[field] = info[field];
      }
    });

    await rep.save();
    const { password, ...repData } = rep.toObject();

    return {
      status: 200,
      body: {
        message: "Update successful",
        rep: repData,
      },
    };
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
