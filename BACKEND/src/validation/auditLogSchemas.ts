import { z } from "zod";

export const getAuditLogsQuerySchema = z.object({
  entity: z.enum(["booking", "service"]),
  entityId: z.string().min(1, "entityId is required"),
});
