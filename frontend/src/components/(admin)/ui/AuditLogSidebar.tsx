"use client";
import { History } from "lucide-react";
import { useFetchAuditLogs } from "@/hooks/useAuditLogs";
import { AuditEntity } from "@/lib/types";
import { formatAuditField } from "@/lib/auditFieldLabel";
import MiniLoader from "./miniLoader";

// Persistent sidebar (not a toggle) showing every logged admin action for
// one entity — lives on that entity's details page only. Superadmin-only,
// enforced both here (the fetch is disabled otherwise) and on the route.
export default function AuditLogSidebar({
  entity,
  entityId,
  isSuperAdmin,
}: {
  entity: AuditEntity;
  entityId: string;
  isSuperAdmin: boolean;
}) {
  const { data: logs, isLoading } = useFetchAuditLogs(entity, entityId, isSuperAdmin);

  if (!isSuperAdmin) return null;

  return (
    <aside className="w-full lg:w-80 shrink-0">
      <div className="card p-4 lg:sticky lg:top-20">
        <h3 className="flex items-center gap-2 font-semibold text-brand-start mb-3">
          <History className="h-4 w-4" />
          Activity Log
        </h3>

        {isLoading && (
          <div className="py-4 flex justify-center">
            <MiniLoader></MiniLoader>
          </div>
        )}

        {!isLoading && logs?.length === 0 && (
          <p className="text-xs text-gray-400">No admin actions recorded yet.</p>
        )}

        {!isLoading && logs && logs.length > 0 && (
          <div className="space-y-2 max-h-[32rem] overflow-y-auto">
            {logs.map((entry) => {
              const actor =
                entry.changedBy && typeof entry.changedBy === "object"
                  ? `${entry.changedBy.firstName} ${entry.changedBy.lastName}`
                  : "Unknown admin";

              return (
                <div key={entry._id} className="text-xs bg-gray-50 rounded-md p-2 space-y-1">
                  <p className="text-gray-500 font-medium">{formatAuditField(entry.field)}</p>
                  <p className="text-gray-700">
                    <span className="line-through text-gray-400">{entry.oldValue || "—"}</span>
                    {" → "}
                    <span className="text-brand-start font-medium">{entry.newValue || "—"}</span>
                  </p>
                  <p className="text-gray-400">
                    {actor} · {new Date(entry.createdAt).toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
