import adminService from "../services/adminService";
import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import bcrypt from "bcrypt";
import { HttpError } from "../utils/httpError";
import { adminLogger } from "../utils/logger";
import { query } from "winston";

class AdminController {
  async getAllReps(req: AuthRequest, res: Response, next: NextFunction) {
    const user = req.user!;
    const { status, role, search, page = "1", limit = "10" } = req.query;

    adminLogger.info("Get all reps initiated", {
      userId: user?.userId,
      role: user?.role,
      action: "GET_ALL_REPS",
      query: {...req.query},
    });

    // create an empty query object for the DB search
    const searchQuery: any = {};

    if (status) searchQuery.status = status;
    if (role) searchQuery.role = role;
    if (user.role === "salesrep") searchQuery.role = "callrep";

    if (search) {
      const regex = new RegExp(search as string);
      searchQuery.$or = [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
        { phone: regex },
      ];
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const numericLimit = parseInt(limit as string);

    try {
      const reps = await adminService.getAllReps(
        searchQuery,
        skip,
        numericLimit
      );

      if (!reps) {
        adminLogger.warn("No reps found", {
          userId: user.userId,
          action: "GET_ALL_REPS_NO_RESULTS",
          query: {...req.query},
        });
        next(new HttpError(404, "No reps found"));
        return;
      }

      const totalReps = await adminService.countTotalReps(user.role);

      res.status(200).json({
        message: "Reps fetched successfully",
        data: reps,
        meta: {
          totalReps,
          page: Number(page),
          limit: numericLimit,
          totalPages: Math.ceil(totalReps / numericLimit),
        },
      });

      adminLogger.info("Get all reps successful", {
        userId: user.userId,
        role: user.role,
        totalReps,
        page: Number(page),
        query:{...req.query},
        action: "GET_ALL_REPS_SUCCESS",
      });
      return;
    } catch (error: any) {
      adminLogger.error(`Get all reps error: ${error.message}`, {
        userId: user.userId,
        role: user.role,
        action: "GET_ALL_REPS_FAILED",
        error,
        query: {...req.query},
      });
      next(error);
      return;
    }
  }

  async getRepById(req: AuthRequest, res: Response, next: NextFunction) {
    // extract rep Id from URL and get the user object created from the JWT token
    const repId = req.params.repId;
    const user = req.user!;

    adminLogger.info("Get rep by ID initiated", {
      userId: user.userId,
      role: user.role,
      repId,
      action: "GET_REP_BY_ID",
    });

    // return ID required if ID wasn't found
    if (!repId) {
      adminLogger.warn("Get rep by ID failed: rep ID required", {
        userId: user.userId,
        action: "GET_REP_BY_ID_FAILED",
      });

      next(new HttpError(400, "Rep ID required"));
      return;
    }

    try {
      const rep = await adminService.getRepById(
        user.role === "callrep" ? user.userId : repId,
        user.role
      );

      // return not found if no rep was returned
      if (!rep) {
        adminLogger.warn("Get rep by ID failed: rep not found", {
          userId: user.userId,
          repId,
          action: "GET_REP_BY_ID_FAILED",
        });
        next(new HttpError(404, "Rep not found"));
        return;
      }

      // return success message with rep object.
      res.status(200).json({ message: "Rep fetched successfully", rep });
      adminLogger.info("Get rep by ID successful", {
        userId: user.userId,
        role: user.role,
        repId,
        action: "GET_REP_BY_ID_SUCCESS",
      });
      return;
    } catch (error: any) {
      adminLogger.error(`Get rep by ID error: ${error.message}`, {
        userId: user.userId,
        role: user.role,
        repId,
        action: "GET_REP_BY_ID_FAILED",
        error,
      });
      next(error);
      return;
    }
  }

  async deleteRepById(req: AuthRequest, res: Response, next: NextFunction) {
    // extract rep Id from URL and get the user object created from the JWT token
    const repId = req.params.repId;
    const user = req.user!;
    adminLogger.info("Delete rep by ID initiated", {
      userId: user.userId,
      role: user.role,
      repId,
      action: "DELETE_REP_BY_ID",
    });

    // return ID required if ID wasn't found
    if (!repId) {
      adminLogger.warn("Delete rep by ID failed: rep ID required", {
        userId: user.userId,
        action: "DELETE_REP_BY_ID_FAILED",
      });
      next(new HttpError(400, "Rep ID required"));
      return;
    }

    try {
      const rep = await adminService.deleteRepById(repId, user.role);

      // return not found if no rep was found
      if (!rep || (rep && rep?.deletedCount < 1)) {
        adminLogger.warn("Delete rep by ID failed: rep not found", {
          userId: user.userId,
          repId,
          action: "DELETE_REP_BY_ID_FAILED",
        });
        next(new HttpError(404, "Rep not found"));
        return;
      }

      // return success message with deleted rep object.
      res.status(200).json({ message: "Rep deleted successfully", rep });
      adminLogger.info("Delete rep by ID successful", {
        userId: user.userId,
        role: user.role,
        repId,
        action: "DELETE_REP_BY_ID_SUCCESS",
      });
      return;
    } catch (error: any) {
      adminLogger.error(`Delete rep by ID error: ${error.message}`, {
        userId: user.userId,
        role: user.role,
        repId,
        action: "DELETE_REP_BY_ID_FAILED",
        error,
      });
      next(error);
      return;
    }
  }

  async updateRep(req: AuthRequest, res: Response, next: NextFunction) {
    const user = req.user!;
    const { repId } = req.params;
    const { newPassword, oldPassword, confirmPassword, ...info } = req.body;

    adminLogger.info("Update rep initiated", {
      updaterId: user.userId,
      updaterRole: user.role,
      targetRep: repId,
      action: "UPDATE_REP",
    });

    if (user.role === "callrep" && user.userId !== repId) {
      adminLogger.warn("Update rep failed: unauthorized access", {
        updaterId: user.userId,
        updaterRole: user.role,
        targetRepId: repId,
        action: "UPDATE_REP_FAILED",
      });
      next(new HttpError(403, "Unauthorized access"));
      return;
    }

    try {
      const targetRepId = repId;

      const result = await adminService.updateRepInfo(
        {
          targetRepId,
          updaterId: user.userId,
          updaterRole: user.role,
          info,
          oldPassword,
          newPassword,
          confirmPassword,
        },
        next
      );

      if (!result) return;

      adminLogger.info("Rep update successful", {
        userId: user.userId,
        repId: targetRepId,
      });

      res.status(result.status).json({ ...result.body });
      return;
    } catch (error: any) {
      adminLogger.error(`updateRep error ${error.message}`, {
        updaterId: user.userId,
        targetRepId: repId,
        action: "UPDATE_REP_FAILED",
        error: error,
      });
      next(error);
      return;
    }
  }
}

const adminController = new AdminController();
export default adminController;
