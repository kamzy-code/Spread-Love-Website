import { useQuery } from "@tanstack/react-query";
import { AuditEntity, AuditLogEntry } from "@/lib/types";
import { apiCall } from "@/lib/apiClient";

// Backend restricts this route to superadmin — pass `enabled` from the
// caller's role check so non-superadmins never even attempt the request.
export const useFetchAuditLogs = (entity: AuditEntity, entityId: string, enabled: boolean) => {
  return useQuery({
    queryKey: ["auditLogs", entity, entityId],
    queryFn: async ({ signal }) => {
      const data = await apiCall(
        `/audit-log/admin?entity=${entity}&entityId=${entityId}`,
        { signal }
      );
      return data.data as AuditLogEntry[];
    },
    enabled,
    staleTime: 1000 * 60,
  });
};
