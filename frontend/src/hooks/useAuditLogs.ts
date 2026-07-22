import { useQuery } from "@tanstack/react-query";
import { AuditEntity, AuditLogEntry } from "@/lib/types";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Backend restricts this route to superadmin — pass `enabled` from the
// caller's role check so non-superadmins never even attempt the request.
export const useFetchAuditLogs = (entity: AuditEntity, entityId: string, enabled: boolean) => {
  return useQuery({
    queryKey: ["auditLogs", entity, entityId],
    queryFn: async ({ signal }) => {
      const res = await fetch(
        `${apiUrl}/audit-log/admin?entity=${entity}&entityId=${entityId}`,
        { credentials: "include", signal }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to fetch audit logs");
      }

      const data = await res.json();
      return data.data as AuditLogEntry[];
    },
    enabled,
    staleTime: 1000 * 60,
  });
};
