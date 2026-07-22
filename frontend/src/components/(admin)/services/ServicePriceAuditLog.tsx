import { useState } from "react";
import { ChevronDown, ChevronUp, History } from "lucide-react";
import { useFetchAuditLogs } from "@/hooks/useAuditLogs";
import MiniLoader from "../ui/miniLoader";

const FIELD_LABELS: Record<string, string> = {
  "regular.localPrice": "Regular · Local",
  "regular.internationalPrice": "Regular · International",
  "special.localPrice": "Special · Local",
  "special.internationalPrice": "Special · International",
};

// Backend also enforces superadmin-only on this route — the role check here
// just keeps the toggle from ever showing to sales/call reps.
export default function ServicePriceAuditLog({
  serviceId,
  isSuperAdmin,
}: {
  serviceId: string;
  isSuperAdmin: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const { data: logs, isLoading } = useFetchAuditLogs("service", serviceId, isSuperAdmin && expanded);

  if (!isSuperAdmin) return null;

  return (
    <div>
      <button
        type="button"
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-start"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <History className="h-3.5 w-3.5" />
        Price history
        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      {expanded && (
        <div className="mt-2 space-y-2">
          {isLoading && (
            <div className="py-2">
              <MiniLoader></MiniLoader>
            </div>
          )}

          {!isLoading && logs?.length === 0 && (
            <p className="text-xs text-gray-400">No price changes recorded.</p>
          )}

          {!isLoading &&
            logs?.map((entry) => {
              const actor =
                entry.changedBy && typeof entry.changedBy === "object"
                  ? `${entry.changedBy.firstName} ${entry.changedBy.lastName}`
                  : "Unknown admin";

              return (
                <div key={entry._id} className="text-xs bg-gray-50 rounded-md p-2 space-y-1">
                  <p className="text-gray-700">
                    {FIELD_LABELS[entry.field] ?? entry.field}:{" "}
                    <span className="line-through text-gray-400">₦{entry.oldValue}</span>
                    {" → "}
                    <span className="text-brand-start font-medium">₦{entry.newValue}</span>
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
  );
}
