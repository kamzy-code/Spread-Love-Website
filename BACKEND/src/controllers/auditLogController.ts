import { Response, NextFunction } from "express";
import auditLogService from "../services/auditLogService";
import { AuthRequest } from "../middlewares/authMiddleware";
import { HttpError } from "../utils/httpError";
import { bookingLogger } from "../utils/logger";
import { auditEntity } from "../models/auditLogModel";

const VALID_ENTITIES: auditEntity[] = ["booking", "service"];

class AuditLogController {
  async getLogsForEntity(req: AuthRequest, res: Response, next: NextFunction) {
    const user = req.user!;
    const { entity, entityId } = req.query;

    if (!entity || !entityId || !VALID_ENTITIES.includes(entity as auditEntity)) {
      next(new HttpError(400, "Valid entity and entityId are required"));
      return;
    }

    bookingLogger.info("Get audit logs initiated", {
      userId: user.userId,
      entity,
      entityId,
      action: "GET_AUDIT_LOGS",
    });

    try {
      const logs = await auditLogService.getLogsForEntity(
        entity as auditEntity,
        entityId as string
      );

      res.status(200).json({ message: "Audit logs fetched successfully", data: logs });
      return;
    } catch (error: any) {
      bookingLogger.error(`Get audit logs error: ${error.message}`, {
        userId: user.userId,
        action: "GET_AUDIT_LOGS_FAILED",
        error,
      });
      next(error);
      return;
    }
  }
}

const auditLogController = new AuditLogController();
export default auditLogController;
