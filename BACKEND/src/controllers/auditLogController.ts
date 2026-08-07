import { Response, NextFunction } from "express";
import auditLogService from "../services/auditLogService";
import { AuthRequest } from "../middlewares/authMiddleware";
import { bookingLogger } from "../utils/logger";
import { auditEntity } from "../models/auditLogModel";

class AuditLogController {
  async getLogsForEntity(req: AuthRequest, res: Response, next: NextFunction) {
    const user = req.user!;
    const { entity, entityId } = req.query as { entity: auditEntity; entityId: string };

    bookingLogger.info("Get audit logs initiated", {
      userId: user.userId,
      entity,
      entityId,
      action: "GET_AUDIT_LOGS",
    });

    try {
      const logs = await auditLogService.getLogsForEntity(entity, entityId);

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
