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

  // Logs one entry per field that actually changed — skips fields where
  // oldValue === newValue so no-op updates don't produce noisy log entries.
  async recordDiffs(
    entity: auditEntity,
    entityId: string,
    changedBy: string,
    diffs: { field: string; oldValue: unknown; newValue: unknown }[]
  ) {
    for (const { field, oldValue, newValue } of diffs) {
      if (oldValue === newValue) continue;
      await this.record({
        entity,
        entityId,
        field,
        oldValue: oldValue === undefined || oldValue === null ? "" : String(oldValue),
        newValue: newValue === undefined || newValue === null ? "" : String(newValue),
        changedBy,
      });
    }
  }

  async getLogsForEntity(entity: auditEntity, entityId: string) {
    return AuditLog.find({ entity, entityId })
      .sort({ createdAt: -1 })
      .populate({ path: "changedBy", select: "firstName lastName email" });
  }
}

const auditLogService = new AuditLogService();
export default auditLogService;
