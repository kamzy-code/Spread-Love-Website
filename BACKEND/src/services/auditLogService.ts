import { AuditLog, auditEntity } from "../models/auditLogModel";

class AuditLogService {
  async record(entry: {
    entity: auditEntity;
    entityId: string;
    field: string;
    oldValue: string;
    newValue: string;
    changedBy: string;
  }) {
    return AuditLog.create(entry);
  }

  async getLogsForEntity(entity: auditEntity, entityId: string) {
    return AuditLog.find({ entity, entityId })
      .sort({ createdAt: -1 })
      .populate({ path: "changedBy", select: "firstName lastName email" });
  }
}

const auditLogService = new AuditLogService();
export default auditLogService;
