import { useState } from "react";
import { ChevronDown, ChevronUp, History } from "lucide-react";
import { useFetchAuditLogs } from "@/hooks/useAuditLogs";
import MiniLoader from "../../ui/miniLoader";

// Superadmin-only — the route itself also enforces this, this is just so
// sales/call reps never see the toggle at all.
export default function EmailAuditLog({
  bookingId,
  isSuperAdmin,
}: {
  bookingId: string;
  isSuperAdmin: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const { data: logs, isLoading } = useFetchAuditLogs("booking", bookingId, isSuperAdmin && expanded);

  if (!isSuperAdmin) return null;

  return (
    <div className="pt-1">
      <button
        type="button"
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-start"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <History className="h-3.5 w-3.5" />
        Email change history
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
            <p className="text-xs text-gray-400">No email changes recorded.</p>
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
                    <span className="line-through text-gray-400">{entry.oldValue}</span>
                    {" → "}
                    <span className="text-brand-start font-medium">{entry.newValue}</span>
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
