import adminService from "../services/adminService";
import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import bcrypt from "bcrypt";
import { HttpError } from "../utils/httpError";

class AdminController {
  async getAllReps(req: AuthRequest, res: Response, next: NextFunction) {
    console.log(`fetch all reps hit + ${new Date()}`);
    const user = req.user!;
    const { status, role, search, page = "1", limit = "10" } = req.query;

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
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  async getRepById(req: AuthRequest, res: Response, next: NextFunction) {
    // extract rep Id from URL and get the user object created from the JWT token
    const repId = req.params.repId;
    const user = req.user!;

    // return ID required if ID wasn't found
    if (!repId) {
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
       throw new HttpError(404, "Rep not found");
      }

      // return success message with rep object.
      res.status(200).json({ message: "Rep fetched successfully", rep });
      return;
    } catch (error) {
     next(error);
      return;
    }
  }

  async deleteRepById(req: AuthRequest, res: Response, next:NextFunction) {
    // extract rep Id from URL and get the user object created from the JWT token
    const repId = req.params.repId;
    const user = req.user!;

    // return ID required if ID wasn't found
    if (!repId) {
      next(new HttpError(400, "Rep ID required"));
      return;
    }

    try {
      const rep = await adminService.deleteRepById(repId, user.role);

      // return not found if no rep was found
      if (!rep || (rep && rep?.deletedCount < 1)) {
       throw new HttpError(404, "Rep not found");
      }

      // return success message with deleted rep object.
      res.status(200).json({ message: "Rep deleted successfully", rep });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  async updateRep(req: AuthRequest, res: Response, next:NextFunction) {
    const user = req.user!;
    const { repId } = req.params;
    const { newPassword, oldPassword, confirmPassword, ...info } = req.body;

    try {
      const targetRepId = user.role === "callrep" ? user.userId : repId;

      const result = await adminService.updateRepInfo({
        targetRepId,
        updaterId: user.userId,
        updaterRole: user.role,
        info,
        oldPassword,
        newPassword,
        confirmPassword,
      });

      res.status(result.status).json({ ...result.body });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }
}

const adminController = new AdminController();
export default adminController;
