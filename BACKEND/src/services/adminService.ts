import { Types } from "mongoose";
import { Admin } from "../models/adminModel";
import bcrypt from "bcrypt";
import { HttpError } from "../utils/httpError";
import { adminLogger } from "../utils/logger";
import { NextFunction } from "express";
import auditLogService from "./auditLogService";

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

  async deleteRepById(repId: string, role: string, changedBy: string) {
    if (role === "callrep" || role === "salesrep") return;

    const result = await Admin.deleteOne({
      _id: new Types.ObjectId(repId),
    });

    if (result.deletedCount > 0) {
      await auditLogService.record({
        entity: "rep",
        entityId: repId,
        field: "status",
        oldValue: "active",
        newValue: "deleted",
        changedBy,
      });
    }

    return result;
  }

  async updateRepInfo(args: UpdateRepOptions, next: NextFunction) {
    const {
      targetRepId,
      updaterId,
      updaterRole,
      info,
      oldPassword,
      newPassword,
      confirmPassword,
    } = args;

    try {
      const rep = await Admin.findById(targetRepId).lean(false);
      if (!rep) {
        adminLogger.warn("Update Rep failed: Rep not found", {
          targetRep: targetRepId,
          updaterId: updaterId,
          updaterRole: updaterRole,
          action: "UPDATE_REP_FAILED",
        });
        next(new HttpError(404, "Rep not found"));
        return;
      }

      if (newPassword) {
        if (!oldPassword) {
          adminLogger.warn("Missing old password for password update", {
            targetRep: targetRepId,
            updaterId: updaterId,
            updaterRole: updaterRole,
            action: "UPDATE_REP_FAILED",
          });
          next(
            new HttpError(400, "Old password is required for password update")
          );
          return;
        }

        if (newPassword !== confirmPassword) {
          adminLogger.warn("Password mismatch", {
            targetRep: targetRepId,
            updaterId: updaterId,
            updaterRole: updaterRole,
            action: "UPDATE_REP_FAILED",
          });
          next(new HttpError(400, "Passwords do not match"));
          return;
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
          adminLogger.warn("Invalid password attempt", {
            targetRep: targetRepId,
            updaterId: updaterId,
            updaterRole: updaterRole,
            action: "UPDATE_REP_FAILED",
          });
          next(new HttpError(401, "Invalid password"));
          return;
        }

        info.password = await bcrypt.hash(newPassword, 10);
      }

      const allowedFields = [
        "firstName",
        "lastName",
        "email",
        "status",
        "role",
        "phone",
        "password",
      ];
      const auditableFields = ["firstName", "lastName", "email", "status", "role", "phone"];
      const before: Record<string, unknown> = {};
      auditableFields.forEach((field) => {
        before[field] = (rep as any)[field];
      });

      allowedFields.forEach((field) => {
        if (info[field] !== undefined) {
          (rep as any)[field] = info[field];
        }
      });

      await rep.save();
      const { password, ...repData } = rep.toObject();

      await auditLogService.recordDiffs(
        "rep",
        targetRepId,
        updaterId,
        auditableFields.map((field) => ({
          field,
          oldValue: before[field],
          newValue: (rep as any)[field],
        }))
      );

      adminLogger.info("Rep updated successfully", {
        targetRep: targetRepId,
        updaterId: updaterId,
        updaterRole: updaterRole,
        action: "UPDATE_REP_SUCCESS",
      });

      return {
        status: 200,
        body: {
          message: "Update successful",
          rep: repData,
        },
      };
    } catch (error: any) {
      adminLogger.error(`Update Rep error: ${error.message}`, {
        targetRep: targetRepId,
        updaterId: updaterId,
        updaterRole: updaterRole,
        action: "UPDATE_REP_FAILED",
        error,
      });
      next(new HttpError(500, "An error occurred while updating rep"));
      return;
    }
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
